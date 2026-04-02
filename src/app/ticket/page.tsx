import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Table2,
} from "lucide-react";

import { SectionLabel, Surface } from "@/components/ticket-ui";

const features = [
  {
    title: "Mail-first ticket akışı",
    body: "Müşteri sadece destek adresine mail atar. Sistem thread yapısını koruyarak ticket oluşturur ve aynı başlıkta süreci sürdürür.",
    icon: Mail,
  },
  {
    title: "Tenant bazlı ayrım",
    body: "Her müşteri şirket ayrı tenant olarak tutulur. Tüm ticket'lar tek ekranda birleşir ama rapor ve filtre mantığı tenant bazlı çalışır.",
    icon: ShieldCheck,
  },
  {
    title: "Excel ve PDF rapor",
    body: "Aylık dönemlerde filtreli export alarak müşteriye operasyon raporu sunabilirsiniz.",
    icon: Table2,
  },
];

const workflowSteps = [
  "Müşteri destek@uptexx.com adresine mail gönderir.",
  "Gönderen domain tenant ile eşleşir, ticket otomatik açılır.",
  "Siz panelden ilk müdahaleyi yapar, çözüm notunu işlersiniz.",
  "Giden yanıt müşteriye mail olarak gider ve konu başlığı ticket kodunu taşır.",
  "Müşteri aynı mail üzerinden cevap verdiğinde süreç aynı ticket üzerinde devam eder.",
];

const reportItems = [
  "Tenant bazında açılan, çözülen ve bekleyen kayıtları ayrı izleyin.",
  "Öncelik, durum, tarih aralığı ve domain kırılımıyla rapor alın.",
  "Excel export ile aylık müşteri raporunu birkaç saniyede hazırlayın.",
  "PDF özet ile yönetim sunumları için kısa, net dönem çıktısı üretin.",
];

const controlItems = [
  "Ticket no, tenant, müşteri, konu ve geliş zamanı tek satırda görünür.",
  "İlk müdahale zamanı, çözüm zamanı ve çözüm notu kayıt altındadır.",
  "İç not ve müşteriye giden yanıt birbirinden ayrılır.",
  "Aynı panel üzerinden filtre, export ve detay inceleme birlikte yapılır.",
];

export default function TicketLandingPage() {
  const primaryCtaClass =
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(5,199,242,0.16),_transparent_22%),linear-gradient(180deg,#061426_0%,#0d2342_34%,#f8fbff_34%,#f8fbff_100%)] text-white">
      <section className="grain-overlay relative overflow-hidden">
        <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-6 pb-16 pt-6 lg:px-10">
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
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Yönetim Girişi
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl">
              <SectionLabel>Uptexx Destek Merkezi</SectionLabel>
              <h1 className="font-heading mt-6 text-5xl leading-[0.95] font-semibold tracking-tight text-white md:text-7xl">
                Müşteri maillerini takip etmek yerine süreci tek panelden yönetin.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d7e9fb] md:text-xl">
                destek@uptexx.com adresine gelen talepler otomatik ticket&apos;a
                dönüşür. Tenant filtresi, aylık export ve aynı mail zinciri içinde
                devam eden yanıt akışı ile destek operasyonu sadeleşir.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/ticket/login"
                  className={`${primaryCtaClass} bg-[#05c7f2] text-[#061426] hover:bg-[#7ee9ff]`}
                >
                  Yönetim paneline gir
                </Link>
                <a
                  href="#system"
                  className={`${primaryCtaClass} bg-[#05c7f2] text-[#061426] hover:bg-[#7ee9ff]`}
                >
                  Sistemi incele
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl gap-4 border-t border-white/10 pt-6 text-sm text-[#d7e9fb] sm:grid-cols-3">
                <div>
                  <p className="font-heading text-2xl font-semibold text-white">Mail-first</p>
                  <p className="mt-2 leading-7">Portal zorunluluğu olmadan müşteriden ticket toplama.</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-semibold text-white">Tenant filtreli</p>
                  <p className="mt-2 leading-7">Her müşteriyi ayrı kırılımla raporlayabilen yapı.</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-semibold text-white">Export hazır</p>
                  <p className="mt-2 leading-7">Excel ve PDF çıktıları ile aylık operasyon özeti.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-8 hidden h-40 w-40 rounded-full bg-[#05c7f2]/25 blur-3xl lg:block" />
              <div className="absolute right-0 top-1/3 hidden h-52 w-52 rounded-full bg-[#4b82ff]/15 blur-3xl lg:block" />
              <Surface className="relative overflow-hidden border-white/10 bg-white/[0.07] p-0 text-white backdrop-blur-md">
                <div className="soft-grid p-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#8fe9ff]">
                        Live overview
                      </p>
                      <h2 className="mt-2 font-heading text-3xl font-semibold">
                        Operasyon görünümü
                      </h2>
                    </div>
                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                      Aktif akış
                    </span>
                  </div>

                  <div className="mt-8 grid gap-4">
                    <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#8fe9ff]">Yeni gelen</span>
                        <span className="text-white">[#UPX-1048]</span>
                      </div>
                      <p className="font-heading text-2xl font-semibold text-white">
                        Mailden ticket açıldı
                      </p>
                      <p className="text-sm leading-7 text-[#dcecff]">
                        konu: Giriş ekranında hata alıyoruz
                      </p>
                      <div className="grid gap-2 text-sm text-[#c0d8ee] sm:grid-cols-2">
                        <span>tenant: Acme Teknoloji</span>
                        <span>durum: open</span>
                        <span>öncelik: high</span>
                        <span>kanal: email</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Müşteri maili tenant domainine göre eşlenir",
                        "Aynı thread içinde gelen cevaplar ticket geçmişine eklenir",
                        "Tek panelden iç not, yanıt ve export alınır",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                        >
                          <CheckCircle2 className="mt-1 h-5 w-5 text-[#8fe9ff]" />
                          <p className="text-sm leading-7 text-[#ecf6ff]">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </div>
      </section>

      <section
        id="system"
        className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 text-[#08192f] lg:grid-cols-3 lg:px-10"
      >
        {features.map((feature) => (
          <Surface key={feature.title} className="bg-white">
            <feature.icon className="h-6 w-6 text-[#0d2342]" />
            <h3 className="font-heading mt-8 text-2xl font-semibold tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-4 text-base leading-8 text-[#4f627a]">{feature.body}</p>
          </Surface>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <Surface className="bg-[linear-gradient(145deg,#07192f_0%,#12325a_100%)] text-white">
          <SectionLabel>Çalışma Mantığı</SectionLabel>
          <h3 className="font-heading mt-6 text-4xl font-semibold tracking-tight">
            Mail at, ticket oluşsun, aynı zincirde kapanışa kadar ilerlesin.
          </h3>
          <p className="mt-6 text-base leading-8 text-[#d8e8f8]">
            Müşteri tarafı için ekstra portal adımı zorunlu değil. Dilerseniz
            yönetim paneli üzerinden filtrelenmiş tenant raporlarıyla aylık
            görünürlük sağlarsınız.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#a9c4df]">
            Bu yapı özellikle az kişiyle yürütülen teknik operasyonlarda dağınık
            mail kutularını tek akışta toplamak için tasarlandı.
          </p>
        </Surface>

        <Surface className="grid gap-4 bg-white p-0">
          {workflowSteps.map((step) => (
            <div
              key={step}
              className="border-b border-[color:var(--line)] px-8 py-6 text-base leading-8 text-[#08192f] last:border-b-0"
            >
              {step}
            </div>
          ))}
        </Surface>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-24 text-[#08192f] lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <Surface className="bg-white">
          <SectionLabel>Operasyon Kontrolü</SectionLabel>
          <h3 className="font-heading mt-6 text-4xl font-semibold tracking-tight text-[#08192f]">
            Destek sürecini sadece görmek değil, kayıt altına almak için tasarlandı.
          </h3>
          <div className="mt-8 space-y-5">
            {controlItems.map((item) => (
              <div key={item} className="flex items-start gap-4 border-b border-[color:var(--line)] pb-5 last:border-b-0 last:pb-0">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#0d5f86]" />
                <p className="text-base leading-8 text-[#50657f]">{item}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)]">
          <SectionLabel>Raporlama</SectionLabel>
          <h3 className="font-heading mt-6 text-4xl font-semibold tracking-tight text-[#08192f]">
            Müşteri görüşmelerini değil, operasyon verisini paylaşın.
          </h3>
          <p className="mt-6 text-base leading-8 text-[#50657f]">
            Aylık rapor hazırlarken farklı ekranlardan veri toplamanıza gerek kalmaz.
            Aynı panelden filtreler, export alır ve dönem özetini üretirsiniz.
          </p>
          <div className="mt-8 space-y-4">
            {reportItems.map((item) => (
              <div key={item} className="rounded-[24px] border border-[color:var(--line)] bg-white/80 px-5 py-4 text-sm leading-7 text-[#314963]">
                {item}
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <section className="border-t border-[color:var(--line)] bg-[#eef5fb]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
          <div>
            <p className="font-heading text-3xl font-semibold tracking-tight text-[#08192f]">
              Ticket paneli hazır. Şimdi iç operasyonu tek yerden yönetin.
            </p>
            <p className="mt-2 text-base text-[#5a6d85]">
              Giriş yaparak tenant filtreleri, ticket detayları ve export ekranını
              kullanabilirsiniz.
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
