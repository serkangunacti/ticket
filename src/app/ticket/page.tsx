import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Table2 } from "lucide-react";

import { SectionLabel } from "@/components/ticket-ui";

const capabilities = [
  {
    title: "Mail-first akış",
    body: "Müşteri yalnızca destek adresine mail atar. Talep otomatik ticket olarak açılır ve aynı zincir içinde devam eder.",
    icon: Mail,
  },
  {
    title: "Tenant bazlı görünürlük",
    body: "Tüm talepler tek panelde toplanır; ama tenant, domain ve tarih bazında ayrı filtrelenebilir.",
    icon: ShieldCheck,
  },
  {
    title: "Export ve raporlama",
    body: "Excel ve PDF çıktıları ile aylık müşteri raporlarını doğrudan panelden hazırlayabilirsiniz.",
    icon: Table2,
  },
];

const flow = [
  {
    no: "01",
    title: "Mail gelir",
    body: "Müşteri `destek@uptexx.com` adresine mail gönderir.",
  },
  {
    no: "02",
    title: "Ticket açılır",
    body: "Gönderen domain tenant ile eşleşir ve kayıt otomatik oluşur.",
  },
  {
    no: "03",
    title: "Süreç izlenir",
    body: "Durum, öncelik, iç not, çözüm zamanı ve rapor alanları panelden yönetilir.",
  },
  {
    no: "04",
    title: "Aynı zincir devam eder",
    body: "Müşterinin aynı mail zincirine verdiği cevaplar yeni ticket açmadan mevcut kayda eklenir.",
  },
];

const detailItems = [
  "Ticket no, müşteri, tenant, konu ve açılış zamanı tek satırda görünür.",
  "İlk müdahale zamanı, çözüm zamanı ve çözüm notu kayıt altına alınır.",
  "İç not ile müşteriye giden yanıt birbirinden ayrılır.",
  "Tenant, domain, öncelik ve tarih aralığına göre filtreli export alınır.",
];

export default function TicketLandingPage() {
  const ctaClass =
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5";

  return (
    <main className="bg-[#f6f8fb] text-[#08192f]">
      <section className="grain-overlay relative overflow-hidden bg-[linear-gradient(180deg,#061426_0%,#0b1f3b_68%,#f6f8fb_68%,#f6f8fb_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(143,233,255,0.18),_transparent_55%)]" />
          <div className="absolute left-[-5rem] top-24 h-80 w-80 rounded-full bg-[#05c7f2]/10 blur-3xl" />
          <div className="absolute right-[-7rem] top-32 h-96 w-96 rounded-full bg-[#4b82ff]/8 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-6 pb-20 pt-6 lg:px-10">
          <header className="flex items-center justify-between py-4">
            <div>
              <p className="font-heading text-2xl font-semibold tracking-[0.14em] text-white">
                UPTEXX
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#9fdfff]">
                Support Desk
              </p>
            </div>

            <Link
              href="/ticket/login"
              className="rounded-full border border-white/16 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Yönetim Girişi
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-4xl">
              <SectionLabel>Uptexx Destek Merkezi</SectionLabel>
              <h1 className="font-heading mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                Destek maillerini panelde toplayın, süreci düzenli yönetin.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#d5e7f8] md:text-xl">
                `destek@uptexx.com` adresine gelen talepler otomatik ticket&apos;a dönüşür.
                Aynı mail zinciri korunur, tenant bazlı filtreleme yapılır, export ile
                aylık müşteri raporu hazırlanır.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/ticket/login"
                  className={`${ctaClass} bg-[#05c7f2] text-[#061426] hover:bg-[#7ee9ff]`}
                >
                  Yönetim paneline gir
                </Link>
                <a
                  href="#overview"
                  className={`${ctaClass} border border-white/16 bg-white/6 text-white hover:bg-white/10`}
                >
                  Sistemi incele
                </a>
              </div>

              <div className="mt-12 grid max-w-3xl gap-6 border-t border-white/10 pt-6 sm:grid-cols-3">
                <div>
                  <p className="font-heading text-3xl font-semibold text-white">Mail-first</p>
                  <p className="mt-2 text-sm leading-7 text-[#cfe2f5]">
                    Portal zorunlu olmadan ticket açılışı.
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-semibold text-white">Tenant filtreli</p>
                  <p className="mt-2 text-sm leading-7 text-[#cfe2f5]">
                    Domain ve müşteri bazlı ayrılmış görünürlük.
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-semibold text-white">Export hazır</p>
                  <p className="mt-2 text-sm leading-7 text-[#cfe2f5]">
                    Excel ve PDF ile hızlı dönem raporu.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                Süreç görünümü
              </p>

              <div className="mt-6 space-y-6">
                {flow.slice(0, 3).map((item) => (
                  <div key={item.no} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                    <p className="font-heading text-3xl font-semibold text-[#8fe9ff]">
                      {item.no}
                    </p>
                    <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#d6e7f8]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="overview"
        className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10"
      >
        <div>
          <SectionLabel>Genel Bakış</SectionLabel>
          <h2 className="font-heading mt-6 text-4xl font-semibold tracking-tight text-[#08192f] md:text-5xl">
            Uptexx ana akışına uyumlu, sade ama operasyonel bir destek yüzeyi.
          </h2>
        </div>

        <div className="grid gap-6 border-t border-[rgba(8,25,47,0.12)] pt-6 md:grid-cols-3 md:border-t-0 md:pt-0">
          {capabilities.map((item) => (
            <div key={item.title} className="border-b border-[rgba(8,25,47,0.08)] pb-6 md:border-b-0 md:pb-0">
              <item.icon className="h-6 w-6 text-[#0d5f86]" />
              <h3 className="font-heading mt-6 text-2xl font-semibold tracking-tight text-[#08192f]">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#526982]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(8,25,47,0.08)] bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div>
            <SectionLabel>Nasıl Çalışır</SectionLabel>
            <h2 className="font-heading mt-6 text-4xl font-semibold tracking-tight text-[#08192f] md:text-5xl">
              Mail gelir, ticket oluşur, aynı zincirde çözülür.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#526982]">
              Müşteri tarafında ekstra eğitim veya portal zorunluluğu olmadan, iç ekip için
              izlenebilir ve raporlanabilir bir süreç kurulur.
            </p>
          </div>

          <div className="grid gap-0 border-t border-[rgba(8,25,47,0.08)] lg:border-t-0">
            {flow.map((item) => (
              <div
                key={item.no}
                className="grid gap-4 border-b border-[rgba(8,25,47,0.08)] py-6 md:grid-cols-[88px_1fr]"
              >
                <p className="font-heading text-3xl font-semibold text-[#0d5f86]">{item.no}</p>
                <div>
                  <h3 className="font-heading text-2xl font-semibold tracking-tight text-[#08192f]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-[#526982]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div>
          <SectionLabel>Operasyon Kontrolü</SectionLabel>
          <h2 className="font-heading mt-6 text-4xl font-semibold tracking-tight text-[#08192f] md:text-5xl">
            Ticket sürecini sadece görmek için değil, kayıt altına almak için tasarlandı.
          </h2>

          <div className="mt-8 space-y-5">
            {detailItems.map((item) => (
              <div key={item} className="flex items-start gap-4 border-b border-[rgba(8,25,47,0.08)] pb-5 last:border-b-0 last:pb-0">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0d5f86]" />
                <p className="text-base leading-8 text-[#526982]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-[linear-gradient(180deg,#08192f_0%,#12325a_100%)] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fe9ff]">
            Raporlama
          </p>
          <h2 className="font-heading mt-6 text-4xl font-semibold tracking-tight">
            Müşteriye yazışma ekranı değil, net operasyon çıktısı sunun.
          </h2>
          <p className="mt-6 text-base leading-8 text-[#d8e8f8]">
            Tenant, domain, öncelik ve tarih aralığına göre filtrelenen kayıtlar üzerinden
            aylık rapor hazırlanır. Aynı veri seti hem detay takibi hem export için kullanılır.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              "Tenant bazında açılan ve kapanan kayıtları ayırın.",
              "İlk müdahale ve çözüm sürelerini dönemsel olarak izleyin.",
              "Excel ve PDF çıktıları ile müşteriye düzenli görünürlük sağlayın.",
            ].map((item) => (
              <div key={item} className="border-t border-white/10 pt-4 text-sm leading-7 text-[#d8e8f8]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(8,25,47,0.08)] bg-[#eef4f9]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
          <div>
            <p className="font-heading text-3xl font-semibold tracking-tight text-[#08192f]">
              Ticket paneli hazır. Şimdi iç operasyonu tek yerden yönetin.
            </p>
            <p className="mt-2 text-base text-[#5a6d85]">
              Giriş yaparak ticket listesi, tenant filtreleri ve export ekranını kullanabilirsiniz.
            </p>
          </div>

          <Link
            href="/ticket/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#08192f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2342]"
          >
            Yönetim paneline geç <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
