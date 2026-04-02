import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Table2 } from "lucide-react";

import { SectionLabel } from "@/components/ticket-ui";

const capabilities = [
  {
    title: "Mail-first akış",
    body: "Müşteri yalnızca destek adresine mail atar. Talep otomatik ticket olarak açılır ve aynı mail zinciri içinde ilerler.",
    icon: Mail,
  },
  {
    title: "Tenant bazlı filtreleme",
    body: "Tüm talepler tek panelde toplanır; tenant, domain ve tarih kırılımı ile ayrı izlenebilir.",
    icon: ShieldCheck,
  },
  {
    title: "Export hazır raporlama",
    body: "Excel ve PDF çıktılarıyla aylık müşteri özetleri panelden doğrudan hazırlanabilir.",
    icon: Table2,
  },
];

const workflow = [
  "Müşteri destek@uptexx.com adresine mail gönderir.",
  "Gönderen domain ilgili tenant ile eşleşir ve ticket otomatik açılır.",
  "Durum, öncelik, ilk müdahale ve çözüm notu panelden işlenir.",
  "Müşteriye verilen yanıt aynı ticket koduyla mail olarak gider.",
  "Müşteri aynı zincirde cevap verdiğinde süreç yeni kayıt açmadan devam eder.",
];

const controls = [
  "Ticket no, müşteri, tenant, konu ve açılış zamanı tek listede görünür.",
  "İlk müdahale zamanı, çözüm zamanı ve çözüm notu kayıt altında tutulur.",
  "İç not ve müşteriye giden yanıt birbirinden ayrıdır.",
  "Tenant, domain, tarih ve öncelik bazında filtreli export alınır.",
];

export default function TicketLandingPage() {
  const primaryCtaClass =
    "inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5";

  return (
    <main className="overflow-x-hidden bg-[#f5f1ea] text-[#1f2430]">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#102235_0%,#17314a_72%,#f5f1ea_72%,#f5f1ea_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(124,201,224,0.2),_transparent_55%)]" />
          <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#6eb9cb]/10 blur-3xl" />
          <div className="absolute right-[-9rem] top-28 h-96 w-96 rounded-full bg-[#b7c9d8]/10 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col px-6 pb-18 pt-6 lg:px-10">
          <header className="flex items-center justify-between py-4">
            <div>
              <p className="font-heading text-2xl font-semibold tracking-[0.12em] text-white">
                UPTEXX
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#bdd6e6]">
                Support Desk
              </p>
            </div>

            <Link
              href="/ticket/login"
              className="rounded-full border border-white/14 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Yönetim Girişi
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-3xl">
              <SectionLabel>Uptexx Destek Merkezi</SectionLabel>
              <h1 className="font-heading mt-6 text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-5xl xl:text-6xl">
                Destek maillerini düzenli bir operasyon paneline dönüştürün.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#d5e4ef] md:text-lg">
                destek@uptexx.com adresine gelen talepler otomatik ticket&apos;a dönüşür.
                Aynı mail zinciri korunur, tenant bazlı filtreleme yapılır ve dönemsel
                export ile müşteri raporları hazırlanır.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/ticket/login"
                  className={`${primaryCtaClass} bg-[#8dc7d6] text-[#102235] hover:bg-[#a7d7e3]`}
                >
                  Yönetim paneline gir
                </Link>
                <a
                  href="#overview"
                  className={`${primaryCtaClass} border border-white/14 bg-white/6 text-white hover:bg-white/10`}
                >
                  Sistemi incele
                </a>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/6 p-6 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#bdd6e6]">
                Kısa Akış
              </p>
              <div className="mt-5 space-y-5">
                {[
                  {
                    title: "Mail gelir",
                    body: "Talep doğrudan mailden sisteme düşer.",
                  },
                  {
                    title: "Ticket oluşur",
                    body: "Domain ve müşteri bilgisiyle kayıt açılır.",
                  },
                  {
                    title: "Yanıt aynı zincirde sürer",
                    body: "Müşteri aynı konu üzerinden cevap verir.",
                  },
                ].map((item, index) => (
                  <div key={item.title} className="grid gap-2 border-b border-white/10 pb-5 last:border-b-0 last:pb-0 md:grid-cols-[54px_1fr]">
                    <p className="font-heading text-2xl font-semibold text-[#8dc7d6]">
                      0{index + 1}
                    </p>
                    <div>
                      <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-[#d4e3ee]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="overview"
        className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-18 lg:grid-cols-[0.82fr_1.18fr] lg:px-10"
      >
        <div>
          <SectionLabel className="border-[#d7cdbd] bg-[#efe7da] text-[#7d6546]">
            Genel Bakış
          </SectionLabel>
          <h2 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight text-[#1f2430] md:text-4xl">
            Sade bir giriş yüzeyi, güçlü bir operasyon mantığı.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {capabilities.map((item) => (
            <div key={item.title} className="border-t border-[rgba(31,36,48,0.12)] pt-5">
              <item.icon className="h-5 w-5 text-[#7d6546]" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#1f2430]">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-[#5e6675]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(31,36,48,0.08)] bg-[#fbf7f1]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-18 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
          <div>
            <SectionLabel className="border-[#d7cdbd] bg-[#efe7da] text-[#7d6546]">
              Nasıl Çalışır
            </SectionLabel>
            <h2 className="mt-6 max-w-lg text-3xl font-semibold tracking-tight text-[#1f2430] md:text-4xl">
              Mail gelir, ticket açılır, aynı kayıtta çözülür.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#5e6675]">
              Portal zorunluluğu olmadan müşteri tarafı sade kalır; iç ekip tarafında ise
              izlenebilir, filtrelenebilir ve raporlanabilir bir süreç oluşur.
            </p>
          </div>

          <div className="grid gap-0">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 border-b border-[rgba(31,36,48,0.08)] py-6 md:grid-cols-[72px_1fr]"
              >
                <p className="font-heading text-2xl font-semibold text-[#7d6546]">
                  0{index + 1}
                </p>
                <p className="text-base leading-8 text-[#37404e]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-18 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div>
          <SectionLabel className="border-[#d7cdbd] bg-[#efe7da] text-[#7d6546]">
            Operasyon Kontrolü
          </SectionLabel>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-[#1f2430] md:text-4xl">
            Ticket süreci yalnızca görünmez, aynı zamanda düzenli biçimde kayıt altına alınır.
          </h2>

          <div className="mt-8 space-y-5">
            {controls.map((item) => (
              <div key={item} className="flex items-start gap-4 border-b border-[rgba(31,36,48,0.08)] pb-5 last:border-b-0 last:pb-0">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#7d6546]" />
                <p className="text-base leading-8 text-[#5e6675]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-[linear-gradient(180deg,#f0e7d9_0%,#e7dccb_100%)] p-8 text-[#1f2430]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d6546]">
            Raporlama
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-[2rem]">
            Aylık müşteri raporlarını da aynı panelden çıkarın.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#4f5664]">
            Tenant, domain, tarih ve öncelik bazlı filtrelerle çalışıp aynı veri setinden
            hem operasyon takibi hem dönem export&apos;u üretirsiniz.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Tenant bazında açılan ve kapanan kayıtları ayırın.",
              "İlk müdahale ve çözüm sürelerini dönemsel izleyin.",
              "Excel ve PDF çıktıları ile düzenli görünürlük sağlayın.",
            ].map((item) => (
              <div key={item} className="border-t border-black/8 pt-4 text-sm leading-7 text-[#4f5664]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(31,36,48,0.08)] bg-[#efe7da]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-[#1f2430]">
              Panel hazır. Şimdi ticket akışını iç tarafta yönetin.
            </p>
            <p className="mt-2 text-base text-[#5e6675]">
              Giriş yaparak tenant filtreleri, ticket listesi ve export alanını kullanabilirsiniz.
            </p>
          </div>

          <Link
            href="/ticket/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#243142] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2634]"
          >
            Yönetim paneline geç <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
