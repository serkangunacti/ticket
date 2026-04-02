import { normalizeReferences } from "@/lib/utils";

export function extractTicketCode(subject: string) {
  const match = subject.match(/\[#(UPX-\d+)\]/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function collectThreadCandidates(input: {
  inReplyTo?: string | null;
  references?: string[] | string | null;
  subject: string;
}) {
  const referenceList = Array.isArray(input.references)
    ? input.references
    : normalizeReferences(input.references);

  return {
    messageIds: [input.inReplyTo, ...referenceList].filter(Boolean) as string[],
    ticketCode: extractTicketCode(input.subject),
  };
}
