import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  LayoutDashboard,
  LineChart,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import { SectionLabel, Surface } from "@/components/ticket-ui";

export const metadata: Metadata = {
  title: "Uptexx Ticket | Mail-First SaaS Ticket Platformu",
  description:
    "Uptexx Ticket, paylaşımlı mailbox'tan otomatik ticket açılışı, tenant bazlı görünürlük, ekip yönetimi ve raporlama sağlayan kurumsal SaaS ticket platformudur.",
};

const navItems = [
  { href: "#urun", label: "Ürün" },
  { href: "#neden", label: "Neden" },
  { href: "#paketler", label: "Paketler" },
  { href: "#sss", label: "SSS" },
];

const integrationPills = [
  "Shared mailbox sync",
  "Multi-tenant görünürlük",
  "Audit log",
  "Excel + PDF export",
  "Rol bazlı ekip akışı",
];

const proofMetrics = [
  {
    value: "Mail-first",
    label: "Portal zorunluluğu olmadan ticket süreci",
  },
  {
    value: "3 rol",
    label: "owner, manager ve agent akışı",
  },
  {
    value: "PDF + Excel",
    label: "müşteri raporlarını tek panelden üret",
  },
];

const capabilityCards = [
  {
    title: "Paylaşımlı mailbox'tan otomatik ticket",
    body: "Müşteri klasik e-posta alışkanlığını korur; sistem yeni talebi otomatik açar ve konu başlığını aynı thread içinde takip eder.",
    icon: Mail,
  },
  {
    title: "Tenant ve domain bazlı ayrışma",
    body: "Her müşteri hesabını ayrı tenant mantığında yönetin; domain eşleşmesiyle ticket akışını temiz, izlenebilir ve düzenli tutun.",
    icon: Building2,
  },
  {
    title: "Ekip rolleri ve davet akışı",
    body: "Owner, manager ve agent rolleriyle operasyonu ölçeklendirin; ekip üyelerini davet ederek tek üründe ortak çalışma düzeni kurun.",
    icon: ShieldCheck,
  },
  {
    title: "Export ve audit katmanı",
    body: "Aylık görünürlük için PDF ve Excel export alın, audit log ile panelde yapılan kritik değişiklikleri kayıt altında tutun.",
    icon: Database,
  },
];

const commercializationPoints = [
  {
    title: "Kurulum netliği",
    body: "Mailbox, tenant ve ekip hacmine göre yapıyı kolayca planlayın; büyüme aşamalarını net biçimde görün.",
    width: "76%",
  },
  {
    title: "Operasyon görünürlüğü",
    body: "Dashboard, yanıt süresi ve ticket hacmi sayesinde destek operasyonunun ritmi tek ekranda izlenir.",
    width: "88%",
  },
  {
    title: "Raporlama gücü",
    body: "PDF ve Excel export katmanı, operasyon verisini düzenli müşteri görünürlüğüne dönüştürür.",
    width: "82%",
  },
];

const packageTiers = [
  {
    name: "Starter",
    capacity: "1 mailbox • 3 yönetici • 5 tenant",
    summary: "İlk müşteri operasyonunu ürünleştirmek isteyen ekipler için kompakt başlangıç kurgusu.",
    highlight: false,
    features: [
      "Mail-first ticket akışı",
      "Temel tenant ve domain eşleşmesi",
      "Ticket listesi, öncelik ve durum yönetimi",
      "Excel ve PDF export",
      "Kurulum yönlendirmesi",
    ],
  },
  {
    name: "Growth",
    capacity: "Çoklu mailbox • 12 yönetici • sınırsız tenant görünürlüğü",
    summary: "Birden fazla müşteriyi tek operasyon merkeziyle yöneten büyüyen destek ekipleri için.",
    highlight: true,
    features: [
      "Owner, manager ve agent rol yapısı",
      "Gelişmiş tenant filtreleri ve mailbox senaryoları",
      "Audit log ve ekip aktivite görünürlüğü",
      "Aylık raporlama ve export akışı",
      "Onboarding ve canlıya geçiş desteği",
    ],
  },
  {
    name: "Scale",
    capacity: "Yüksek hacim kurgu • özel onboarding • çok ekipli operasyon",
    summary: "Kurumsal destek, MSP veya iç IT tarafında daha yoğun ticket hacmiyle çalışan yapılar için.",
    highlight: false,
    features: [
      "Yüksek hacimli tenant ve ekip planlaması",
      "Çoklu kurulum ve geçiş checklist'i",
      "Rol bazlı çalışma modelinin genişletilmesi",
      "Operasyon raporlarının süreçlere yerleştirilmesi",
      "Uptexx ile canlıya geçiş workshop'u",
    ],
  },
];

const faqs = [
  {
    question: "Müşteri portalı olmadan ticket süreci gerçekten yönetilebilir mi?",
    answer:
      "Evet. Uptexx Ticket, e-posta thread'ini koruyarak ticket açılışı ve geri dönüş sürecini panelden izler. Böylece müşteri alıştığı mail deneyimini bırakmadan süreç yönetilebilir.",
  },
  {
    question: "Ürün hangi ekipler için uygun?",
    answer:
      "İç IT ekipleri, MSP yapıları, dış destek hizmeti veren ajanslar ve birden fazla müşteri hesabını yöneten operasyon takımları için uygundur.",
  },
  {
    question: "Raporlama ve müşteri görünürlüğü nasıl sağlanıyor?",
    answer:
      "Tenant, domain, tarih ve öncelik bazlı filtrelerle veri daraltılır; panel üzerinden PDF ve Excel export alınarak aylık görünürlük üretilir.",
  },
  {
    question: "Ekibimi nasıl dahil ederim?",
    answer:
      "Panelde rol bazlı davet akışı bulunur. Owner, manager ve agent rolleriyle ekibi aynı ürün içinde organize edip erişimleri kontrollü biçimde açabilirsiniz.",
  },
];

const chartBars = [42, 58, 70, 88, 76, 96];
const chartLabels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];
const pipelineItems = [
  { label: "Gelen mail", value: "146" },
  { label: "Otomatik açılan", value: "138" },
  { label: "Yanıtlanan", value: "124" },
  { label: "Exportlanan", value: "06" },
];

export default function TicketLandingPage() {
  return (
    <main className="bg-[#f4f7fb] text-[#16202a]">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#07111d_0%,#0d1b2d_52%,#133158_100%)] text-white">
        <div className="ticket-ambient-grid grain-overlay pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-0">
          <div className="ticket-orb absolute left-[-5rem] top-[4.5rem] h-72 w-72 rounded-full bg-[#55d3f4]/16 blur-3xl" />
          <div className="ticket-orb absolute right-[-6rem] top-10 h-96 w-96 rounded-full bg-[#245dff]/18 blur-3xl" />
          <div className="ticket-orb absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full bg-[#0f7fc7]/14 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-6 lg:px-10 lg:pb-28">
          <header className="ticket-reveal flex items-center justify-between gap-6 py-4">
            <Link href="/ticket" className="flex items-center gap-4" aria-label="Uptexx Ticket anasayfa">
              <span className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-2 shadow-[0_20px_60px_rgba(8,25,47,0.22)] backdrop-blur-xl">
                <Image
                  src="/uptexxlogo.png"
                  alt="Uptexx Logo"
                  width={164}
                  height={58}
                  className="h-10 w-auto"
                  priority
                />
              </span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-[#b3cbde] sm:block">
                Ticket SaaS
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm text-[#b3cbde] xl:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="#paketler"
                className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12 sm:inline-flex"
              >
                Paketler
              </a>
              <Link
                href="/ticket/login"
                className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#08131f] transition hover:-translate-y-0.5"
              >
                Yönetim Girişi
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:pt-16">
            <div className="max-w-3xl">
              <SectionLabel className="ticket-reveal border-white/12 bg-white/8 text-[#8fe9ff]">
                B2B SaaS Ticket Platformu
              </SectionLabel>

              <h1
                className="ticket-reveal mt-7 max-w-4xl text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-[3.8rem] lg:text-[5.3rem]"
                style={{ animationDelay: "120ms" }}
              >
                Kurumsal destek operasyonunuzu
                <span className="mt-2 block bg-[linear-gradient(90deg,#9ae9ff_0%,#74cfff_52%,#ffffff_100%)] bg-clip-text text-transparent">
                  tek merkezden yönetin.
                </span>
              </h1>

              <p
                className="ticket-reveal mt-7 max-w-2xl text-base leading-8 text-[#cad9e7] md:text-lg"
                style={{ animationDelay: "200ms" }}
              >
                Uptexx Ticket; paylaşımlı mailbox&apos;tan otomatik ticket açılışı,
                tenant bazlı görünürlük, ekip yönetimi, audit log ve dönemsel export
                akışını tek platformda toplar. İç IT ekipleri, MSP yapıları ve dış
                destek veren operasyon takımları için düzenli, izlenebilir ve
                ölçeklenebilir bir çalışma alanı sunar.
              </p>

              <div
                className="ticket-reveal mt-8 flex flex-col gap-4 sm:flex-row"
                style={{ animationDelay: "280ms" }}
              >
                <a
                  href="#paketler"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#79dcf7] px-6 py-3 text-sm font-semibold text-[#08131f] transition hover:-translate-y-0.5 hover:bg-[#94e6fb]"
                >
                  Paketleri incele <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://www.uptexx.com/iletisim"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white px-6 py-3 text-sm font-semibold text-[#08131f] shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f1f7fb] hover:text-[#08131f]"
                >
                  İletişime geç <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div
                className="ticket-reveal mt-7 flex flex-wrap gap-3"
                style={{ animationDelay: "340ms" }}
              >
                {integrationPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-[#d7e4ef] backdrop-blur-lg"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofMetrics.map((metric, index) => (
                  <div
                    key={metric.value}
                    className="ticket-reveal rounded-[24px] border border-white/10 bg-white/6 p-4 shadow-[0_14px_36px_rgba(8,25,47,0.16)] backdrop-blur-lg"
                    style={{ animationDelay: `${420 + index * 70}ms` }}
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#8fe9ff]">
                      görünür değer
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#bdd0e0]">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[36rem]">
              <div className="ticket-float absolute -left-2 top-8 hidden rounded-full border border-[#9ae9ff]/30 bg-[#0d2943]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#9ae9ff] shadow-[0_18px_40px_rgba(8,25,47,0.18)] lg:block">
                hızlı kurulum akışı
              </div>
              <div className="ticket-float-delayed absolute -right-3 top-[6.5rem] hidden rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_40px_rgba(8,25,47,0.18)] lg:block">
                multi-tenant yapı
              </div>

              <div className="ticket-reveal relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,24,40,0.96)_0%,rgba(12,29,47,0.94)_54%,rgba(18,48,84,0.94)_100%)] p-5 shadow-[0_40px_120px_rgba(4,12,22,0.45)] backdrop-blur-xl lg:p-6" style={{ animationDelay: "220ms" }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(121,220,247,0.16),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(50,99,255,0.18),_transparent_32%)]" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                      platform görünümü
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                      Uptexx Ticket cockpit
                    </p>
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-[#d6e7f5]">
                    Growth paketi
                  </div>
                </div>

                <div className="relative mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    { value: "12", label: "aktif tenant" },
                    { value: "418", label: "açık ticket" },
                    { value: "8 dk", label: "ilk yanıt" },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-md"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8fe9ff]">
                        {item.label}
                      </p>
                      <p className="mt-3 text-[1.9rem] font-semibold tracking-tight text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-4 grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
                  <div className="rounded-[28px] border border-white/8 bg-[#091422]/78 p-4">
                    <div className="flex items-center justify-between text-sm text-[#b7cada]">
                      <span className="font-semibold text-white">Aylık ticket hacmi</span>
                      <span>Son 6 dönem</span>
                    </div>

                    <div className="relative mt-5 h-52 overflow-hidden rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_100%)] p-4">
                      <div className="absolute inset-x-4 bottom-4 top-8 flex items-end gap-3">
                        {chartBars.map((bar, index) => (
                          <div key={chartLabels[index]} className="ticket-bar flex-1">
                            <span
                              className="block w-full rounded-[18px_18px_10px_10px] bg-[linear-gradient(180deg,#8be6ff_0%,#46bde5_42%,#245dff_100%)] shadow-[0_12px_30px_rgba(36,93,255,0.2)]"
                              style={{
                                height: `${bar}%`,
                                animationDelay: `${index * 90}ms`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <svg
                        viewBox="0 0 240 110"
                        className="pointer-events-none absolute inset-x-4 top-10 h-[120px] w-[calc(100%-2rem)]"
                        aria-hidden="true"
                      >
                        <polyline
                          fill="none"
                          stroke="rgba(143, 233, 255, 0.28)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="10,92 48,78 86,66 124,40 162,55 210,24"
                        />
                        <polyline
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="10,92 48,78 86,66 124,40 162,55 210,24"
                        />
                      </svg>

                      <div className="absolute inset-x-4 bottom-0 flex justify-between text-[11px] uppercase tracking-[0.22em] text-[#7391ab]">
                        {chartLabels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pipelineItems.map((item, index) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-[#bdd0e0]">{item.label}</p>
                          <p className="text-xl font-semibold tracking-tight text-white">{item.value}</p>
                        </div>
                        <div className="ticket-beam mt-3 h-2 rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#7ce0f9,#245dff)]"
                            style={{ width: `${88 - index * 11}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                      ekip akışı
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#d2e1ee]">
                      {[
                        "owner",
                        "manager",
                        "agent",
                        "invite",
                        "audit",
                      ].map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                      raporlama katmanı
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[#d2e1ee]">
                      <div>
                        <p className="text-2xl font-semibold text-white">2 format</p>
                        <p className="mt-1">PDF ve Excel export</p>
                      </div>
                      <div className="rounded-full bg-[#113153] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8fe9ff]">
                        rapor hazır
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="urun" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="ticket-reveal max-w-xl">
            <SectionLabel className="border-[#d7e7ef] bg-[#edf7fb] text-[#256985]">
              Ürün Anlatısı
            </SectionLabel>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#16202a] md:text-[3.3rem] md:leading-[1.02]">
              Dağınık destek operasyonunu tek platformda toplayan net ürün yapısı.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#5f738c] md:text-lg">
              Uptexx Ticket; mail-first akış, tenant bazlı görünürlük, ekip yönetimi ve
              raporlama katmanını tek anlatıda birleştirir. Böylece destek operasyonu
              hem içeride düzenli yürür hem de müşteriye karşı daha şeffaf görünür.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {capabilityCards.map((card, index) => (
              <Surface
                key={card.title}
                className="ticket-reveal p-6"
                style={{ animationDelay: `${120 + index * 70}ms` } as React.CSSProperties}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#e6f7fc_0%,#dfe9fb_100%)] text-[#143b67]">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[1.3rem] font-semibold tracking-tight text-[#16202a]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#607285]">{card.body}</p>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      <section id="neden" className="border-y border-[rgba(15,23,42,0.08)] bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-10">
          <Surface className="ticket-reveal overflow-hidden rounded-[30px] border-none bg-[linear-gradient(180deg,#081321_0%,#122840_100%)] p-7 text-white shadow-[0_32px_90px_rgba(7,17,29,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <SectionLabel className="border-white/12 bg-white/8 text-[#8fe9ff]">
                  Analitik katman
                </SectionLabel>
                <h3 className="mt-5 text-3xl font-semibold tracking-tight">
                  Günlük operasyonu ve müşteri görünürlüğünü aynı anda izleyin.
                </h3>
              </div>

              <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#c9d8e5]">
                operasyon + ekip + rapor
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-4">
                {[
                  {
                    label: "Tenant başına görünürlük",
                    value: "Ayrışmış müşteri akışı",
                  },
                  {
                    label: "İlk yanıt takibi",
                    value: "Operasyon temposu görünür",
                  },
                  {
                    label: "Aylık export",
                    value: "Rapor çıktısı müşteriye hazır",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-white/[0.05] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8fe9ff]">
                      {item.label}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[26px] border border-white/8 bg-white/[0.05] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Kullanım yoğunluğu matrisi</p>
                    <p className="mt-1 text-sm text-[#b9ccdc]">
                      Ekiplerin en sık kullandığı katmanları tek sahnede görün
                    </p>
                  </div>
                  <LineChart className="h-5 w-5 text-[#8fe9ff]" />
                </div>

                <div className="mt-6 space-y-4">
                  {commercializationPoints.map((item) => (
                    <div key={item.title}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-[#8fe9ff]">aktif</p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#b9ccdc]">{item.body}</p>
                      <div className="ticket-beam mt-3 h-2 rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#74d2ee,#245dff)]"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Surface>

          <div className="ticket-reveal flex flex-col justify-center">
            <SectionLabel className="border-[#d7e7ef] bg-[#edf7fb] text-[#256985]">
              Neden Uptexx Ticket
            </SectionLabel>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#16202a] md:text-4xl">
              Operasyon ekibinin hızını artıran, müşteriye güven veren yapı.
            </h2>
            <div className="mt-8 space-y-5">
              {[
                {
                  title: "Mail-first alışkanlık korunur",
                  body: "Müşteriyi yeni bir portala taşımadan ticket süreci yönetilir; e-posta alışkanlığı korunur.",
                  icon: Zap,
                },
                {
                  title: "Çok kiracılı kurgu nettir",
                  body: "Tenant ve domain mantığı, ürünün kime ve nasıl ölçekleneceğini açık biçimde gösterir.",
                  icon: LayoutDashboard,
                },
                {
                  title: "Raporu doğrudan müşteriye taşırsınız",
                  body: "Export ve audit katmanı, hizmet kalitesini görünür ve sözleşmeye bağlanabilir hâle getirir.",
                  icon: BarChart3,
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-[24px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_12px_30px_rgba(8,25,47,0.04)] backdrop-blur-xl">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#e8f6fb_0%,#dfe9fb_100%)] text-[#143b67]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#16202a]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#607285]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="paketler" className="relative overflow-hidden bg-[linear-gradient(180deg,#08121f_0%,#0f2238_100%)] py-24 text-white">
        <div className="ticket-ambient-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="ticket-reveal mx-auto max-w-3xl text-center">
            <SectionLabel className="border-white/12 bg-white/8 text-[#8fe9ff]">
              Paketler
            </SectionLabel>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white md:text-[3.35rem] md:leading-[1.02]">
              İhtiyaca göre ölçeklenen Uptexx Ticket paketleri.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#bed0df] md:text-lg">
              Paketler mailbox, tenant ve ekip hacmine göre örneklendirilmiştir. Uygun
              kurulum planı ihtiyaç analizi ile birlikte netleştirilir.
            </p>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {packageTiers.map((tier, index) => (
              <article
                key={tier.name}
                className={`ticket-reveal relative overflow-hidden rounded-[30px] border p-7 shadow-[0_28px_80px_rgba(4,12,22,0.22)] backdrop-blur-xl ${
                  tier.highlight
                    ? "border-[#8fe9ff]/36 bg-[linear-gradient(180deg,rgba(121,220,247,0.12)_0%,rgba(14,31,49,0.96)_18%,rgba(10,24,40,0.98)_100%)]"
                    : "border-white/10 bg-white/[0.05]"
                }`}
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                {tier.highlight ? (
                  <div className="absolute right-5 top-5 rounded-full bg-[#8fe9ff] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#08131f]">
                    en çok tercih edilen
                  </div>
                ) : null}

                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                  {tier.name}
                </p>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                  {tier.capacity}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#c7d7e4]">{tier.summary}</p>

                <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-[#dbe7f0]">
                      <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#8fe9ff]" />
                      <span className="leading-6">{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://www.uptexx.com/iletisim"
                  className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                    tier.highlight
                      ? "bg-[#8fe9ff] text-[#08131f]"
                      : "border border-white/16 bg-white text-[#08131f] shadow-[0_10px_30px_rgba(0,0,0,0.14)] hover:bg-[#f2f7fb] hover:text-[#08131f]"
                  }`}
                >
                  Detayları konuşalım <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sss" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="ticket-reveal max-w-xl">
            <SectionLabel className="border-[#d7e7ef] bg-[#edf7fb] text-[#256985]">
              Sık Sorulanlar
            </SectionLabel>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#16202a] md:text-4xl">
              Ürünü değerlendirirken en çok sorulan başlıklar.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#607285]">
              Bu bölüm, sayfaya gelen müşterinin ürünün nasıl konumlandığını hızlıca
              anlaması için doğrudan karar anına hizmet eder.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => (
              <Surface
                key={item.question}
                className="ticket-reveal p-6"
                style={{ animationDelay: `${120 + index * 70}ms` } as React.CSSProperties}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#e8f6fb_0%,#dfe9fb_100%)] text-[#143b67]">
                    <Sparkles className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#16202a]">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#607285]">{item.answer}</p>
                  </div>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="ticket-reveal relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0a1624_0%,#112846_55%,#1a5cc8_100%)] px-7 py-8 text-white shadow-[0_38px_100px_rgba(8,25,47,0.22)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,_rgba(143,233,255,0.28),_transparent_58%)] lg:block" />
            <Image
              src="/uptexxlogo.png"
              alt="Uptexx"
              width={220}
              height={78}
              className="pointer-events-none absolute bottom-8 right-8 hidden w-44 opacity-20 lg:block"
            />

            <div className="relative max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#9ae9ff]">
                <Star className="h-4 w-4" />
                kurumsal ticket platformu
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Uptexx Ticket ile destek operasyonunuzu daha görünür ve daha kontrollü yönetin.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#d3e1ec]">
                Paket yapısını inceleyin, ihtiyaçlarınıza uygun kurulum modelini birlikte
                netleştirelim. Mevcut müşteriler için giriş akışı aynı sayfada korunur.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="https://www.uptexx.com/iletisim"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#08131f] transition hover:-translate-y-0.5"
                >
                  İletişime geç <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/ticket/login"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white px-6 py-3 text-sm font-semibold text-[#08131f] shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f2f7fb] hover:text-[#08131f]"
                >
                  Mevcut müşteriyim <Clock3 className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
