import { promises as fs } from "node:fs";
import path from "node:path";

import { simpleParser } from "mailparser";

import { env, hasMicrosoftMail } from "@/lib/env";
import type { InboundMail } from "@/lib/types";
import { normalizeReferences } from "@/lib/utils";

function firstAddress(
  input?: unknown,
) {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] ?? null;
  if (typeof input === "object" && "value" in input) {
    const withValue = input as {
      value?: Array<{ address?: string; name?: string }>;
    };
    return withValue.value?.[0] ?? null;
  }
  return null;
}

async function getMicrosoftAccessToken() {
  if (!hasMicrosoftMail) {
    throw new Error("Microsoft mail integration is not configured.");
  }

  const response = await fetch(
    `https://login.microsoftonline.com/${env.M365_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.M365_CLIENT_ID!,
        client_secret: env.M365_CLIENT_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Microsoft token: ${response.status}`);
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

async function fetchMicrosoftAttachments(
  token: string,
  messageId: string,
): Promise<InboundMail["attachments"]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      env.M365_SHARED_MAILBOX,
    )}/messages/${messageId}/attachments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) return [];

  const payload = (await response.json()) as {
    value: Array<{
      name: string;
      contentType?: string;
      size?: number;
      contentBytes?: string;
    }>;
  };

  return payload.value
    .filter((attachment) => attachment.name)
    .map((attachment) => ({
      fileName: attachment.name,
      mimeType: attachment.contentType ?? null,
      sizeBytes: attachment.size ?? 0,
      content: attachment.contentBytes
        ? Buffer.from(attachment.contentBytes, "base64")
        : undefined,
    }));
}

async function readMicrosoftInbox(): Promise<InboundMail[]> {
  const token = await getMicrosoftAccessToken();
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      env.M365_SHARED_MAILBOX,
    )}/mailFolders/inbox/messages?$orderby=receivedDateTime%20desc&$top=25&$select=id,subject,body,bodyPreview,receivedDateTime,internetMessageId,inReplyTo,from,toRecipients`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: 'outlook.body-content-type="text"',
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch inbox: ${response.status}`);
  }

  const payload = (await response.json()) as {
    value: Array<{
      id: string;
      subject: string;
      body?: { content?: string };
      bodyPreview?: string;
      receivedDateTime: string;
      internetMessageId?: string;
      inReplyTo?: string;
      from?: {
        emailAddress?: { address?: string; name?: string };
      };
      toRecipients?: Array<{
        emailAddress?: { address?: string };
      }>;
    }>;
  };

  return Promise.all(
    payload.value.map(async (message) => ({
      messageId: message.internetMessageId ?? `graph-${message.id}`,
      inReplyTo: message.inReplyTo,
      references: normalizeReferences(message.inReplyTo),
      fromEmail: message.from?.emailAddress?.address ?? "unknown@unknown.local",
      fromName: message.from?.emailAddress?.name ?? null,
      toEmail:
        message.toRecipients?.[0]?.emailAddress?.address ??
        env.M365_SHARED_MAILBOX,
      subject: message.subject ?? "Untitled ticket",
      text: message.body?.content ?? message.bodyPreview ?? "",
      html: null,
      receivedAt: new Date(message.receivedDateTime),
      attachments: await fetchMicrosoftAttachments(token, message.id),
    })),
  );
}

async function readFixtureInbox(): Promise<InboundMail[]> {
  const fixtureDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    env.MAIL_FIXTURE_DIR,
  );
  const files = await fs.readdir(fixtureDir).catch(() => []);

  const messages = await Promise.all(
    files
      .filter((file) => file.endsWith(".eml"))
      .sort()
      .map(async (file) => {
        const raw = await fs.readFile(path.join(fixtureDir, file));
        const parsed = await simpleParser(raw);
        const fromAddress = firstAddress(parsed.from);
        const toAddress = firstAddress(parsed.to);

        return {
          messageId:
            parsed.messageId ?? `<${file.replace(/\.eml$/i, "")}@fixtures.local>`,
          inReplyTo: parsed.inReplyTo ?? null,
          references: normalizeReferences(
            Array.isArray(parsed.references)
              ? parsed.references.join(" ")
              : (parsed.references ?? ""),
          ),
          fromEmail: fromAddress?.address ?? "unknown@fixture.local",
          fromName: fromAddress?.name ?? null,
          toEmail: toAddress?.address ?? env.M365_SHARED_MAILBOX,
          subject: parsed.subject ?? "Fixture ticket",
          text: parsed.text ?? "",
          html: parsed.html ? String(parsed.html) : null,
          receivedAt: parsed.date ?? new Date(),
          attachments: parsed.attachments.map((attachment) => ({
            fileName: attachment.filename ?? "attachment.bin",
            mimeType: attachment.contentType,
            sizeBytes: attachment.size ?? 0,
            content: attachment.content,
          })),
        } satisfies InboundMail;
      }),
  );

  return messages;
}

export async function readInboxMessages() {
  return env.MAIL_SYNC_MODE === "microsoft"
    ? readMicrosoftInbox()
    : readFixtureInbox();
}

export async function sendTicketReply(input: {
  to: string;
  subject: string;
  bodyText: string;
}) {
  if (!hasMicrosoftMail) {
    return { delivered: false, mode: "noop" as const };
  }

  const token = await getMicrosoftAccessToken();
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      env.M365_SHARED_MAILBOX,
    )}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: input.subject,
          body: {
            contentType: "Text",
            content: input.bodyText,
          },
          toRecipients: [
            {
              emailAddress: {
                address: input.to,
              },
            },
          ],
        },
        saveToSentItems: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to send mail: ${response.status}`);
  }

  return { delivered: true, mode: "microsoft" as const };
}

export async function sendSystemMail(input: {
  to: string;
  subject: string;
  bodyText: string;
}) {
  return sendTicketReply(input);
}
