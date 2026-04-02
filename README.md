# Uptexx Ticket

Mail-first çalışan, tenant bazlı filtreleme ve raporlama destekli iç kullanım ticket sistemi.

## Özellikler

- `destek@uptexx.com` üzerinden gelen mailleri ticket'a dönüştürme
- Aynı mail thread'i içinde süreç takibi
- Şirket bazlı tenant ayrımı
- Excel ve PDF export
- Tek admin giriş modeli
- TiDB Cloud Starter ile uyumlu veri katmanı

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Ortam değişkenlerini hazırlayın:

```bash
cp .env.example .env.local
```

3. En az şu alanları doldurun:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `DATABASE_URL`

4. İsterseniz fixture modunda mail sync ile başlayın:

```bash
MAIL_SYNC_MODE=fixtures
```

5. Geliştirme sunucusunu açın:

```bash
npm run dev
```

Ardından [http://localhost:3000/ticket](http://localhost:3000/ticket) adresine gidin.

## TiDB / Drizzle

Şema üretmek ve veritabanına göndermek için:

```bash
npm run db:generate
npm run db:push
```

Örnek seed çalıştırmak için:

```bash
npm run seed
```

## Mail entegrasyonu

İki çalışma modu vardır:

- `fixtures`: `fixtures/mailbox/*.eml` dosyalarını okuyup ticket oluşturur
- `microsoft`: Microsoft 365 shared mailbox üzerinden inbox okur

Microsoft modu için şu alanları tanımlayın:

- `M365_TENANT_ID`
- `M365_CLIENT_ID`
- `M365_CLIENT_SECRET`
- `M365_SHARED_MAILBOX`

## Testler

```bash
npm run lint
npm run test
```
