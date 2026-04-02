import { closeDb } from "@/lib/db";
import { createTenant, ingestInboundMail } from "@/lib/data";

async function main() {
  const tenant = await createTenant({
    name: "Acme Lojistik",
    supportAddress: "destek@uptexx.com",
    domains: ["acme.com.tr"],
    adminEmail: "seed@uptexx.com",
  });

  await ingestInboundMail({
    messageId: "<seed-message-1@acme.com.tr>",
    fromEmail: "selin.yilmaz@acme.com.tr",
    fromName: "Selin Yılmaz",
    toEmail: "destek@uptexx.com",
    subject: "Seed ticket",
    text: "Bu seed komutu ile oluşturulmuş örnek ticket kaydıdır.",
    receivedAt: new Date(),
    attachments: [],
  });

  console.log(`Seeded tenant: ${tenant.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });
