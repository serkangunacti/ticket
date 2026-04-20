import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  LayoutDashboard,
  LineChart,
  MapPin,
  Minus,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { AnimatedStatValue } from "@/components/animated-stat-value";
import { FaqAccordion } from "@/components/faq-accordion";
import { SectionLabel } from "@/components/ticket-ui";

export const metadata: Metadata = {
  title: "Uptexx Ticket | Kurumsal Destek Platformu",
  description:
    "Uptexx Ticket; tenant bazlı görünürlük, ekip yönetimi, audit log ve raporlama sağlayan kurumsal ticket platformudur.",
};

/* ------------------------------------------------------------------ */
/*  DATA                                                              */
/* ------------------------------------------------------------------ */

const navItems = [
  { href: "#paketler", label: "Paketler" },
  { href: "#urun", label: "Ürün" },
  { href: "#neden", label: "Neden" },
  { href: "#sss", label: "SSS" },
];

const footerQuickLinks = [
  ...navItems,
  { href: "/ticket/login", label: "Yönetim Girişi" },
  { href: "https://www.uptexx.com", label: "uptexx.com" },
];

const footerPlatformLinks = [
  "Ticket yönetimi ve önceliklendirme",
  "Tenant ve domain görünürlüğü",
  "Rol bazlı ekip yönetimi",
  "Audit log ve aktivite izi",
  "PDF ve Excel export",
];

const footerOffices = [
  {
    label: "Merkez Ofis",
    value:
      "Cumhuriyet Mah. Kazım Karabekir Cad. No:2/28 61800 Beşikdüzü/Trabzon",
  },
  {
    label: "İstanbul Şube",
    value:
      "Fatih Sultan Mehmet Mah. Depoyolu Sk. No:16 İç Kapı No:58, One Block Plaza 34774 Ümraniye/İstanbul",
  },
];

const integrationPills = [
  "Multi-tenant görünürlük",
  "Audit log",
  "Rol bazlı ekip akışı",
  "PDF & Excel export",
];

const proofMetrics = [
  {
    value: "Multi-tenant",
    label: "Her müşteri hesabını ayrı yönetin",
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

const heroPreviewMetrics = [
  { value: 12, label: "aktif tenant" },
  { value: 418, label: "açık ticket" },
  { value: 8, label: "ilk yanıt", suffix: " dk" },
];

/* ---- #urun ---- */

const productFeatures = [
  {
    icon: LayoutDashboard,
    title: "Ticket Yönetimi",
    description:
      "Tüm destek taleplerini tek panelden oluşturun, takip edin ve sonuçlandırın. Durum, öncelik ve kategori bazlı filtreleme ile operasyonu düzenli tutun.",
    highlights: [
      "Talep oluşturma ve atama",
      "Durum ve öncelik takibi",
      "Konu bazlı arama ve sıralama",
    ],
  },
  {
    icon: Building2,
    title: "Multi-Tenant Yapı",
    description:
      "Her müşteri hesabını bağımsız bir tenant olarak yönetin. Domain eşleşmesi ile ticket akışını doğru hesaba otomatik yönlendirin.",
    highlights: [
      "Tenant izolasyonu",
      "Domain eşleşmesi",
      "Müşteri bazlı görünürlük",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Ekip ve Rol Yönetimi",
    description:
      "Owner, manager ve agent rolleriyle ekibinizi ölçeklendirin. Davet bazlı katılım ve yetki kontrollü erişim ile güvenli çalışma ortamı kurun.",
    highlights: [
      "3 farklı rol seviyesi",
      "Davet akışı",
      "Yetki bazlı erişim",
    ],
  },
  {
    icon: BarChart3,
    title: "Dashboard ve Analitik",
    description:
      "Ticket hacmi, yanıt süreleri ve ekip performansını tek ekranda izleyin. Trend analizi ile operasyon ritmini görünür kılın.",
    highlights: [
      "Ticket hacmi trendi",
      "İlk yanıt süresi",
      "Ekip performansı",
    ],
  },
  {
    icon: Database,
    title: "Export ve Raporlama",
    description:
      "PDF ve Excel formatında dönemsel raporlar oluşturun. Müşteriye hazır çıktılarla hizmet kalitesini belgelendirin.",
    highlights: [
      "PDF ve Excel export",
      "Dönemsel raporlar",
      "Müşteriye hazır çıktı",
    ],
  },
  {
    icon: LineChart,
    title: "Audit ve İzlenebilirlik",
    description:
      "Panelde yapılan tüm kritik değişiklikleri kayıt altında tutun. Aktivite izi ve zaman damgası ile tam izlenebilirlik sağlayın.",
    highlights: ["Audit log", "Aktivite izi", "Zaman damgası"],
  },
];

/* ---- #neden ---- */

const reasons = [
  {
    title: "Kolay Başlangıç",
    body: "Hızlı kurulum süreci ve standart onboarding ile destek operasyonunuzu kısa sürede başlatın.",
    icon: Zap,
  },
  {
    title: "Ölçeklenebilir Yapı",
    body: "Tenant ve ekip sayınız arttıkça yapı genişler; paket geçişleri kesintisiz yapılır.",
    icon: TrendingUp,
  },
  {
    title: "Operasyon Görünürlüğü",
    body: "Dashboard ve metriklerle destek operasyonunun ritmini tek panelden izleyin.",
    icon: LayoutDashboard,
  },
  {
    title: "Müşteri Güveni",
    body: "PDF ve Excel export ile hizmet kalitesini müşteriye düzenli raporlarla gösterin.",
    icon: BarChart3,
  },
  {
    title: "Ekip Verimliliği",
    body: "Rol yapısı ve atama otomasyonu sayesinde ekibiniz daha hızlı ve düzenli çalışır.",
    icon: Users,
  },
  {
    title: "Kurumsal Uyum",
    body: "Audit log, veri izolasyonu ve erişim kontrolü ile kurumsal gereksinimleri karşılayın.",
    icon: ShieldCheck,
  },
];

/* ---- #paketler ---- */

const tierHeaders = [
  {
    name: "Starter",
    eyebrow: "Başlangıç",
    description: "İlk ticket düzenini kuran ekipler için",
    highlight: false,
    cta: "Starter için iletişime geçin",
  },
  {
    name: "Growth",
    eyebrow: "Büyüme",
    description: "Büyüyen ekipler için tam donanımlı yapı",
    highlight: true,
    cta: "Growth için iletişime geçin",
  },
  {
    name: "Enterprise",
    eyebrow: "Kurumsal",
    description: "Yüksek hacimli operasyonlar için özel plan",
    highlight: false,
    cta: "Enterprise için iletişime geçin",
  },
];

const comparisonCategories = [
  {
    category: "Kapasite",
    rows: [
      { feature: "Yönetici hesabı", values: ["3", "12", "Sınırsız"] },
      { feature: "Tenant alanı", values: ["5", "Sınırsız", "Sınırsız"] },
      {
        feature: "Onboarding",
        values: ["Standard", "Kurulum desteği", "Özel plan"],
      },
    ],
  },
  {
    category: "Özellikler",
    rows: [
      { feature: "Ticket yönetimi", values: [true, true, true] },
      {
        feature: "Durum ve öncelik yönetimi",
        values: [true, true, true],
      },
      { feature: "PDF ve Excel export", values: [true, true, true] },
      {
        feature: "Tenant ve domain eşleşmesi",
        values: ["Temel", "Gelişmiş", "Gelişmiş"],
      },
      { feature: "Ekip rolleri", values: [false, true, true] },
      { feature: "Gelişmiş filtreler", values: [false, true, true] },
      { feature: "Audit log", values: [false, true, true] },
      { feature: "Çoklu ekip yapısı", values: [false, false, true] },
      {
        feature: "Özel onboarding planı",
        values: [false, false, true],
      },
    ],
  },
];

/* ---- #sss ---- */

const faqs = [
  {
    question: "Uptexx Ticket hangi ekipler için uygun?",
    answer:
      "İç IT ekipleri, MSP yapıları, dış destek hizmeti veren ajanslar ve birden fazla müşteri hesabını yöneten operasyon takımları için uygundur.",
  },
  {
    question: "Tenant yapısı ne anlama geliyor?",
    answer:
      "Tenant, her müşteri hesabını bağımsız bir birim olarak yönetmenizi sağlayan izolasyon katmanıdır. Domain eşleşmesi ile ticket akışı doğru hesaba yönlendirilir ve veri ayrışması sağlanır.",
  },
  {
    question: "Hangi raporlama formatları destekleniyor?",
    answer:
      "Tenant, domain, tarih ve öncelik bazlı filtrelerle veri daraltılır; panel üzerinden PDF ve Excel formatlarında export alınarak aylık görünürlük üretilir.",
  },
  {
    question: "Ekip rolleri nasıl çalışıyor?",
    answer:
      "Panelde owner, manager ve agent olmak üzere üç ana rol bulunur. Her rol farklı yetkilere sahiptir ve davet akışı ile ekip üyeleri sisteme dahil edilir.",
  },
  {
    question: "Audit log ne kadar detaylıdır?",
    answer:
      "Panelde yapılan tüm kritik işlemler — ticket durum değişiklikleri, atamalar, ayar güncellemeleri — zaman damgası ve kullanıcı bilgisiyle kayıt altında tutulur.",
  },
  {
    question: "Kurulum süreci nasıl işliyor?",
    answer:
      "Paket seçiminize göre standard, guided veya özel onboarding sunulur. Tenant yapılandırması, ekip davetleri ve ilk ayarlar birlikte tamamlanır.",
  },
  {
    question: "Üst paketlere geçiş yapılabilir mi?",
    answer:
      "Evet. Mevcut yapınız ve verileriniz korunarak üst pakete geçiş yapılabilir. Geçiş sürecinde kesinti yaşanmaz.",
  },
  {
    question: "Veri güvenliği nasıl sağlanıyor?",
    answer:
      "Tüm veriler şifreli bağlantılar üzerinden iletilir. Tenant bazlı izolasyon, rol tabanlı erişim kontrolü ve audit log ile güvenlik katmanlı olarak yapılandırılır.",
  },
];

/* ---- hero cockpit ---- */

const chartBars = [42, 58, 70, 88, 76, 96];
const chartLabels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];
const chartLinePath = "M10,92 L48,78 L86,66 L124,40 L162,55 L210,24";
const chartAreaPath =
  "M10,92 L48,78 L86,66 L124,40 L162,55 L210,24 L210,110 L10,110 Z";
const chartLineDots = [
  { x: 10, y: 92 },
  { x: 48, y: 78 },
  { x: 86, y: 66 },
  { x: 124, y: 40 },
  { x: 162, y: 55 },
  { x: 210, y: 24 },
];
const pipelineItems = [
  { label: "Gelen talep", value: 146, width: 88 },
  { label: "Otomatik açılan", value: 138, width: 77 },
  { label: "Yanıtlanan", value: 124, width: 66 },
  { label: "Exportlanan", value: 6, width: 55, padStart: 2 },
];
const heroSignalColumns = [
  [
    "TICKET_SYNC",
    "THREAD_MATCH",
    "TENANT_ROUTE",
    "QUEUE_SIGNAL",
    "SLA_WINDOW",
    "EXPORT_READY",
    "01:14 UTC",
  ],
  [
    "OWNER_ACTIVE",
    "MANAGER_READY",
    "AGENT_ONLINE",
    "AUDIT_TRACE",
    "DOMAIN_MAP",
    "FIRST_REPLY 08M",
    "02 10 10",
  ],
  [
    "STATUS_OPEN",
    "STATUS_WAITING",
    "STATUS_RESOLVED",
    "PDF_EXPORT",
    "XLSX_EXPORT",
    "REPORT_BATCH",
    "03:21 UTC",
  ],
  [
    "PRIORITY_HIGH",
    "QUEUE_BALANCE",
    "TICKET_LINK",
    "AUTO_ASSIGN",
    "FILTER_STACK",
    "CUSTOM_VIEW",
    "04 01 11",
  ],
  [
    "TENANT_A",
    "TENANT_B",
    "TENANT_C",
    "TENANT_D",
    "GO_LIVE",
    "OPS_PANEL",
    "05:08 UTC",
  ],
  [
    "THREAD_INDEX",
    "SIGNAL_LOCK",
    "ACCESS_ROLE",
    "AGENT_SHIFT",
    "ROUTE_READY",
    "AUDIT_OK",
    "06 11 00",
  ],
];

/* ------------------------------------------------------------------ */
/*  COMPARISON TABLE CELL RENDERER                                    */
/* ------------------------------------------------------------------ */

function CellValue({
  value,
  highlight,
}: {
  value: boolean | string;
  highlight: boolean;
}) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1b5a4a]/60 text-emerald-400">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04] text-[#526070]">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span
      className={`text-sm font-medium ${highlight ? "text-white" : "text-[#d7e5ef]"}`}
    >
      {value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE COMPONENT                                                    */
/* ------------------------------------------------------------------ */

export default function TicketLandingPage() {
  return (
    <main
      data-ticket-landing
      className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#0a1725_0%,#0c1c2c_30%,#102338_68%,#0c1928_100%)] text-white"
    >
      {/* ── ambient background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[48rem] bg-[radial-gradient(circle_at_16%_0%,rgba(85,211,244,0.22),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(36,93,255,0.24),transparent_26%),radial-gradient(circle_at_50%_24%,rgba(13,127,199,0.14),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.01)_100%)]" />
      </div>

      <div className="relative">
        {/* ━━━━━━━━━━━━━━━━ STICKY HEADER ━━━━━━━━━━━━━━━━ */}
        <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0a1725]/92 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="flex items-center justify-between gap-4 py-3">
              <Link
                href="/ticket"
                className="flex shrink-0 items-center"
                aria-label="Uptexx Ticket anasayfa"
              >
                <span className="rounded-[18px] border border-white/12 bg-white/10 px-3 py-1.5 shadow-lg backdrop-blur-xl">
                  <Image
                    src="/uptexxlogo.png"
                    alt="Uptexx Logo"
                    width={128}
                    height={44}
                    className="h-8 w-auto"
                    priority
                  />
                </span>
              </Link>

              <nav className="hidden items-center gap-1 lg:flex">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-[#d7e4ef] transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <Link
                href="/ticket/login"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#7fdcf7]/28 bg-[linear-gradient(135deg,#16314d_0%,#1a4771_55%,#2e6dba_100%)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:border-[#8fe9ff]/42"
              >
                Yönetim Girişi
              </Link>
            </div>

            {/* mobile nav row */}
            <nav className="ticket-scroll-strip -mx-1 flex gap-1 overflow-x-auto pb-2 lg:hidden">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-white/8 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-[#d7e4ef] transition hover:bg-white/[0.1]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* ━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━ */}
        <section className="relative overflow-hidden text-white">
          <div className="ticket-ambient-grid grain-overlay pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute inset-0">
            <div className="ticket-orb absolute left-[-5rem] top-[4.5rem] h-72 w-72 rounded-full bg-[#55d3f4]/16 blur-3xl" />
            <div className="ticket-orb absolute right-[-6rem] top-10 h-96 w-96 rounded-full bg-[#245dff]/18 blur-3xl" />
            <div className="ticket-orb absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full bg-[#0f7fc7]/14 blur-3xl" />
          </div>

          <div className="ticket-signal-field pointer-events-none absolute inset-y-0 right-0 hidden w-[60%] overflow-hidden lg:block">
            <div className="ticket-signal-plane absolute inset-0">
              {heroSignalColumns.map((column, index) => (
                <div
                  key={`signal-column-${index}`}
                  className="ticket-signal-column"
                  style={{
                    left: `${6 + index * 15}%`,
                    animationDelay: `${index * -2.8}s`,
                    animationDuration: `${18 + index * 2}s`,
                  }}
                >
                  {[...column, ...column, ...column].map(
                    (item, itemIndex) => (
                      <span key={`${item}-${itemIndex}`}>{item}</span>
                    ),
                  )}
                </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-[38%] bg-[linear-gradient(90deg,#07111d_0%,rgba(7,17,29,0.88)_42%,transparent_100%)]" />
          </div>

          <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:pt-6">
              <div className="max-w-2xl">
                <SectionLabel className="ticket-reveal border-white/12 bg-white/8 text-[#8fe9ff]">
                  B2B Ticket Platformu
                </SectionLabel>

                <h1
                  className="ticket-reveal mt-6 max-w-2xl text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.2rem] lg:text-[3rem]"
                  style={{ animationDelay: "120ms" }}
                >
                  Kurumsal destek operasyonunuzu
                  <span className="mt-1 block bg-[linear-gradient(90deg,#9ae9ff_0%,#74cfff_52%,#ffffff_100%)] bg-clip-text text-transparent">
                    tek merkezden yönetin.
                  </span>
                </h1>

                <p
                  className="ticket-reveal mt-5 max-w-xl text-[0.94rem] leading-7 text-[#cad9e7]"
                  style={{ animationDelay: "200ms" }}
                >
                  Uptexx Ticket; tenant bazlı görünürlük, ekip yönetimi, audit
                  log ve dönemsel export akışını tek platformda toplar. İç IT
                  ekiplerinden MSP yapılarına kadar geniş bir kullanım alanı
                  sunar.
                </p>

                <div
                  className="ticket-reveal mt-7 flex flex-col gap-3 sm:flex-row"
                  style={{ animationDelay: "280ms" }}
                >
                  <a
                    href="#paketler"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#79dcf7] px-5 py-2.5 text-sm font-semibold text-[#08131f] transition hover:-translate-y-0.5 hover:bg-[#94e6fb]"
                  >
                    Paketleri incele <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.uptexx.com/iletisim"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#2c4a68] bg-[#10253f]/88 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:border-[#67d7f5]/38 hover:bg-[#15314f]"
                  >
                    İletişime geç <ChevronRight className="h-4 w-4" />
                  </a>
                </div>

                <div
                  className="ticket-reveal mt-6 flex flex-wrap gap-2"
                  style={{ animationDelay: "340ms" }}
                >
                  {integrationPills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-[#d7e4ef] backdrop-blur-lg"
                    >
                      {pill}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {proofMetrics.map((metric, index) => (
                    <div
                      key={metric.value}
                      className="ticket-reveal rounded-2xl border border-white/10 bg-white/6 p-4 shadow-md backdrop-blur-lg"
                      style={{
                        animationDelay: `${420 + index * 70}ms`,
                      }}
                    >
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#8fe9ff]">
                        görünür değer
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                        {metric.value}
                      </p>
                      <p className="mt-1.5 text-xs leading-5 text-[#bdd0e0]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* cockpit preview */}
              <div className="relative mx-auto w-full max-w-[34rem]">
                <div className="ticket-float absolute -left-2 top-8 hidden rounded-full border border-[#9ae9ff]/30 bg-[#0d2943]/90 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#9ae9ff] shadow-lg lg:block">
                  hızlı kurulum akışı
                </div>
                <div className="ticket-float-delayed absolute -right-3 top-[6rem] hidden rounded-full border border-white/14 bg-white/12 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white shadow-lg lg:block">
                  multi-tenant yapı
                </div>

                <div
                  className="ticket-reveal relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,32,51,0.94)_0%,rgba(17,39,63,0.92)_54%,rgba(27,62,102,0.92)_100%)] p-4 shadow-[0_40px_120px_rgba(4,12,22,0.45)] backdrop-blur-xl lg:p-5"
                  style={{ animationDelay: "220ms" }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(121,220,247,0.16),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(50,99,255,0.18),_transparent_32%)]" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                        platform görünümü
                      </p>
                      <p className="mt-1.5 text-lg font-semibold tracking-tight text-white">
                        Uptexx Ticket cockpit
                      </p>
                    </div>
                    <div className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold text-[#d6e7f5]">
                      Growth paketi
                    </div>
                  </div>

                  <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
                    {heroPreviewMetrics.map((item, index) => (
                      <div
                        key={item.label}
                        className="ticket-preview-metric rounded-2xl border border-white/8 bg-white/[0.07] p-3 backdrop-blur-md"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#8fe9ff]">
                          {item.label}
                        </p>
                        <AnimatedStatValue
                          value={item.value}
                          suffix={item.suffix}
                          duration={1500 + index * 180}
                          className="ticket-stat-number mt-2 block text-[1.6rem] font-semibold tracking-tight text-white"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-3 grid gap-3 lg:grid-cols-[1.18fr_0.82fr]">
                    <div className="rounded-2xl border border-white/8 bg-[#102235]/74 p-3">
                      <div className="flex items-center justify-between text-xs text-[#b7cada]">
                        <span className="font-semibold text-white">
                          Aylık ticket hacmi
                        </span>
                        <span>Son 6 dönem</span>
                      </div>

                      <div className="relative mt-4 h-44 overflow-hidden rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-3">
                        <div className="absolute inset-x-3 bottom-3 top-7 flex items-end gap-2">
                          {chartBars.map((bar, index) => (
                            <div
                              key={chartLabels[index]}
                              className="ticket-bar flex-1"
                            >
                              <span
                                className="block w-full rounded-[14px_14px_8px_8px] bg-[linear-gradient(180deg,#8be6ff_0%,#46bde5_42%,#245dff_100%)] shadow-[0_12px_30px_rgba(36,93,255,0.2)]"
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
                          className="pointer-events-none absolute inset-x-3 top-8 h-[100px] w-[calc(100%-1.5rem)]"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient
                              id="ticket-chart-area-gradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="rgba(143, 233, 255, 0.28)"
                              />
                              <stop
                                offset="100%"
                                stopColor="rgba(143, 233, 255, 0.02)"
                              />
                            </linearGradient>
                            <linearGradient
                              id="ticket-chart-line-gradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#7bdff8" />
                              <stop offset="58%" stopColor="#dcf7ff" />
                              <stop offset="100%" stopColor="#5caeff" />
                            </linearGradient>
                          </defs>
                          <path
                            d={chartAreaPath}
                            fill="url(#ticket-chart-area-gradient)"
                            className="ticket-chart-area"
                          />
                          <path
                            d={chartLinePath}
                            fill="none"
                            stroke="rgba(143, 233, 255, 0.28)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ticket-chart-line-glow"
                          />
                          <path
                            d={chartLinePath}
                            fill="none"
                            stroke="url(#ticket-chart-line-gradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ticket-chart-line"
                          />
                          <path
                            d={chartLinePath}
                            fill="none"
                            stroke="#dcf7ff"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ticket-chart-line-trace"
                          />
                          {chartLineDots.map((dot, index) => (
                            <circle
                              key={`${dot.x}-${dot.y}`}
                              cx={dot.x}
                              cy={dot.y}
                              r="4"
                              fill="#8fe9ff"
                              className="ticket-chart-node"
                              style={{
                                animationDelay: `${index * 220}ms`,
                              }}
                            />
                          ))}
                        </svg>

                        <div className="absolute inset-x-3 bottom-0 flex justify-between text-[10px] uppercase tracking-[0.22em] text-[#7391ab]">
                          {chartLabels.map((label) => (
                            <span key={label}>{label}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {pipelineItems.map((item, index) => (
                        <div
                          key={item.label}
                          className="ticket-preview-metric rounded-2xl border border-white/8 bg-white/[0.06] p-3"
                          style={{ animationDelay: `${index * 70}ms` }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-[#bdd0e0]">
                              {item.label}
                            </p>
                            <AnimatedStatValue
                              value={item.value}
                              padStart={item.padStart}
                              duration={1400 + index * 160}
                              className="ticket-stat-number text-lg font-semibold tracking-tight text-white"
                            />
                          </div>
                          <div className="ticket-beam mt-2 h-1.5 rounded-full bg-white/8">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#7ce0f9,#245dff)]"
                              style={{ width: `${item.width}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.06] p-3">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                        ekip akışı
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs text-[#d2e1ee]">
                        {["owner", "manager", "agent", "invite", "audit"].map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.06] p-3">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#8fe9ff]">
                        raporlama katmanı
                      </p>
                      <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-[#d2e1ee]">
                        <div>
                          <p className="text-xl font-semibold text-white">
                            2 format
                          </p>
                          <p className="mt-0.5">PDF ve Excel export</p>
                        </div>
                        <div className="rounded-full bg-[#1a4a7c] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#8fe9ff]">
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

        {/* ━━━━━━━━━━━━━━━━ PAKETLER (2nd section) ━━━━━━━━━━━━━━━━ */}
        <section id="paketler" className="border-t border-white/6 py-20 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="ticket-reveal mx-auto max-w-2xl text-center">
              <SectionLabel className="border-white/12 bg-white/[0.04] text-[#8fe9ff]">
                Uptexx Destek Paketleri
              </SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Kurumsal ihtiyaçlara göre netleşen üç destek planı.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9bb4c8]">
                Paketler aynı ürün omurgasını paylaşır. Fark; operasyon hacmi,
                devreye alma modeli ve raporlama derinliğinde oluşur.
              </p>
            </div>

            {/* comparison table */}
            <div className="ticket-reveal mt-12 overflow-x-auto rounded-2xl border border-white/8" style={{ animationDelay: "120ms" }}>
              <div className="min-w-[680px]">
                {/* tier headers */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr]">
                  <div className="border-b border-white/8 p-5" />
                  {tierHeaders.map((tier) => (
                    <div
                      key={tier.name}
                      className={`border-b border-l border-white/8 p-5 text-center ${tier.highlight ? "bg-[#142f4f]" : "bg-white/[0.02]"}`}
                    >
                      {tier.highlight && (
                        <span className="mb-2 inline-block rounded-full border border-[#8fe9ff]/24 bg-[#8fe9ff]/10 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#8fe9ff]">
                          Önerilen
                        </span>
                      )}
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8fe9ff]">
                        {tier.eyebrow}
                      </p>
                      <h3 className="mt-1.5 text-xl font-bold tracking-tight text-white">
                        {tier.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-[#9bb4c8]">
                        {tier.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* category groups */}
                {comparisonCategories.map((cat) => (
                  <div key={cat.category}>
                    <div className="border-b border-white/6 bg-white/[0.03] px-5 py-2.5">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#8fe9ff]">
                        {cat.category}
                      </p>
                    </div>
                    {cat.rows.map((row, rowIndex) => (
                      <div
                        key={row.feature}
                        className={`grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-white/6 ${rowIndex % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                      >
                        <div className="flex items-center px-5 py-3.5 text-sm font-medium text-[#d7e5ef]">
                          {row.feature}
                        </div>
                        {row.values.map((val, colIndex) => (
                          <div
                            key={`${row.feature}-${colIndex}`}
                            className={`flex items-center justify-center border-l border-white/6 px-4 py-3.5 ${tierHeaders[colIndex].highlight ? "bg-[#142f4f]/50" : ""}`}
                          >
                            <CellValue
                              value={val}
                              highlight={tierHeaders[colIndex].highlight}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}

                {/* CTA row */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr]">
                  <div className="p-5" />
                  {tierHeaders.map((tier) => (
                    <div
                      key={`cta-${tier.name}`}
                      className={`border-l border-white/6 p-4 ${tier.highlight ? "bg-[#142f4f]/50" : ""}`}
                    >
                      <a
                        href="https://www.uptexx.com/iletisim"
                        className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                          tier.highlight
                            ? "bg-[linear-gradient(135deg,#8fe9ff_0%,#56cce9_52%,#2b7fda_100%)] text-[#08131f] hover:brightness-105"
                            : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                        }`}
                      >
                        {tier.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ ÜRÜN ━━━━━━━━━━━━━━━━ */}
        <section
          id="urun"
          className="border-t border-white/6 py-20 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="ticket-reveal mx-auto max-w-2xl text-center">
              <SectionLabel className="border-white/12 bg-white/[0.04] text-[#8fe9ff]">
                Ürün Özellikleri
              </SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Destek operasyonunuz için ihtiyaç duyduğunuz her katman tek
                üründe.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9bb4c8]">
                Uptexx Ticket; ticket yönetimi, tenant bazlı görünürlük, ekip
                organizasyonu ve raporlama katmanını birleştirir.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {productFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="ticket-reveal group rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition hover:border-white/14 hover:bg-white/[0.06]"
                  style={{
                    animationDelay: `${100 + index * 70}ms`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0d2a43_0%,#173d62_100%)] text-[#8fe9ff]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#9bb4c8]">
                    {feature.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {feature.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-2 text-xs text-[#b8cade]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#256985]" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ NEDEN ━━━━━━━━━━━━━━━━ */}
        <section
          id="neden"
          className="border-t border-white/6 bg-white/[0.02] py-20 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="ticket-reveal mx-auto max-w-2xl text-center">
              <SectionLabel className="border-white/12 bg-white/[0.04] text-[#8fe9ff]">
                Neden Uptexx Ticket
              </SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Operasyon ekibinin hızını artıran, müşteriye güven veren yapı.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9bb4c8]">
                Uptexx Ticket; kolay başlangıç, ölçeklenebilir yapı ve kurumsal
                uyum ile operasyonunuzu daha güçlü kılar.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reasons.map((reason, index) => (
                <div
                  key={reason.title}
                  className="ticket-reveal flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/14 hover:bg-white/[0.06]"
                  style={{
                    animationDelay: `${100 + index * 70}ms`,
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0d2a43_0%,#173d62_100%)] text-[#8fe9ff]">
                    <reason.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-white">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#9bb4c8]">
                      {reason.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ SSS ━━━━━━━━━━━━━━━━ */}
        <section
          id="sss"
          className="border-t border-white/6 py-20 lg:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="ticket-reveal mx-auto mb-10 max-w-2xl text-center">
              <SectionLabel className="border-white/12 bg-white/[0.04] text-[#8fe9ff]">
                Sık Sorulanlar
              </SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Ürünü değerlendirirken en çok sorulan başlıklar.
              </h2>
            </div>

            <div className="ticket-reveal mx-auto max-w-3xl" style={{ animationDelay: "120ms" }}>
              <FaqAccordion items={faqs} />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ CTA ━━━━━━━━━━━━━━━━ */}
        <section className="pb-20 lg:pb-24">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="ticket-reveal relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#13263c_0%,#1a3a60_55%,#2d71d4_100%)] px-7 py-8 text-white shadow-[0_38px_100px_rgba(8,25,47,0.22)] sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,_rgba(143,233,255,0.28),_transparent_58%)] lg:block" />
              <Image
                src="/uptexxlogo.png"
                alt="Uptexx"
                width={220}
                height={78}
                className="pointer-events-none absolute bottom-8 right-8 hidden w-44 opacity-20 lg:block"
              />

              <div className="relative max-w-2xl">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#9ae9ff]">
                  <Star className="h-4 w-4" />
                  kurumsal ticket platformu
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Uptexx Ticket ile destek operasyonunuzu daha görünür ve daha
                  kontrollü yönetin.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#d3e1ec]">
                  Paket yapısını inceleyin, ihtiyaçlarınıza uygun kurulum
                  modelini birlikte netleştirelim.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://www.uptexx.com/iletisim"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8fe9ff_0%,#56cce9_52%,#2b7fda_100%)] px-5 py-2.5 text-sm font-semibold text-[#08131f] shadow-lg transition hover:-translate-y-0.5"
                  >
                    İletişime geç <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/ticket/login"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#2c4a68] bg-[#10253f]/88 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:border-[#67d7f5]/38 hover:bg-[#15314f]"
                  >
                    Mevcut müşteriyim <Clock3 className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━ */}
        <footer
          className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,rgba(20,35,52,0.58)_0%,rgba(12,23,35,0.96)_100%)]"
          role="contentinfo"
        >
          <div className="ticket-ambient-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_18%_0%,rgba(143,233,255,0.16),transparent_36%),radial-gradient(circle_at_82%_10%,rgba(43,127,218,0.16),transparent_30%)]" />

          <div className="relative mx-auto w-full max-w-7xl px-6 py-14 lg:px-10">
            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.1fr_0.78fr_0.82fr_1.1fr]">
              {/* brand */}
              <div className="space-y-5">
                <a
                  href="https://www.uptexx.com"
                  className="flex w-fit items-center"
                >
                  <span className="rounded-[18px] border border-white/12 bg-white/[0.08] px-3 py-1.5 shadow-lg backdrop-blur-xl">
                    <Image
                      src="/uptexxlogo.png"
                      alt="Uptexx Logo"
                      width={128}
                      height={44}
                      className="h-8 w-auto"
                    />
                  </span>
                </a>

                <p className="max-w-xs text-sm font-medium leading-7 text-[#b8cade]">
                  Uptexx Ticket; ekip organizasyonunu ve müşteri görünürlüğünü
                  tek ürün içinde toplayan kurumsal destek platformudur.
                </p>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.uptexx.com"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-1.5 text-sm font-bold text-[#d7e5ef] transition hover:-translate-y-0.5 hover:border-[#8fe9ff]/34 hover:bg-white/[0.12]"
                  >
                    Kurumsal site
                  </a>
                  <a
                    href="https://www.uptexx.com/iletisim"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#8fe9ff]/20 bg-[#15314f] px-4 py-1.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1b4168]"
                  >
                    İletişim
                  </a>
                </div>
              </div>

              {/* quick links */}
              <div className="space-y-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#a0bdd4]">
                  Sayfa
                </h3>
                <ul className="space-y-2.5">
                  {footerQuickLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-[#d7e5ef] transition hover:text-white"
                      >
                        <span className="h-0.5 w-0 rounded-full bg-[#8fe9ff] transition-all duration-200 group-hover:w-3" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* platform */}
              <div className="space-y-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#a0bdd4]">
                  Platform
                </h3>
                <ul className="space-y-2.5">
                  {footerPlatformLinks.map((item) => (
                    <li
                      key={item}
                      className="text-sm font-medium text-[#b8cade]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* contact */}
              <div className="space-y-4">
                <h3 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-[#a0bdd4]">
                  İletişim
                </h3>

                <div className="space-y-4">
                  {footerOffices.map((office) => (
                    <div
                      key={office.label}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-[#8fe9ff]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="text-sm leading-6">
                        <span className="mb-0.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#d7e5ef]">
                          {office.label}
                        </span>
                        <span className="font-medium text-[#b8cade]">
                          {office.value}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-[#8fe9ff]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <a
                      href="mailto:info@uptexx.com"
                      className="text-sm font-semibold text-[#d7e5ef] transition hover:text-white"
                    >
                      info@uptexx.com
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-[#8fe9ff]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <a
                      href="tel:+905438716131"
                      className="text-sm font-semibold text-[#d7e5ef] transition hover:text-white"
                    >
                      0543 871 61 31
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs font-medium text-[#8ea9bd] sm:flex-row sm:items-center sm:justify-between">
              <p>
                &copy; {new Date().getFullYear()} Uptexx. Tüm hakları
                saklıdır.
              </p>
              <p>
                Uptexx Ticket — kurumsal destek platformu.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
