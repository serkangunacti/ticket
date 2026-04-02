import { describe, expect, it } from "vitest";

import { collectThreadCandidates, extractTicketCode } from "../lib/threading";

describe("threading helpers", () => {
  it("extracts ticket code from subject", () => {
    expect(extractTicketCode("[#UPX-1042] Ticket konusu")).toBe("UPX-1042");
    expect(extractTicketCode("No token")).toBeNull();
  });

  it("collects references and in-reply-to ids", () => {
    const result = collectThreadCandidates({
      inReplyTo: "<abc@example.com>",
      references: "<xyz@example.com> <def@example.com>",
      subject: "[#UPX-2222] Merhaba",
    });

    expect(result.ticketCode).toBe("UPX-2222");
    expect(result.messageIds).toEqual([
      "<abc@example.com>",
      "<xyz@example.com>",
      "<def@example.com>",
    ]);
  });
});
