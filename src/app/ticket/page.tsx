import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Table2 } from "lucide-react";

import { SectionLabel } from "@/components/ticket-ui";

const capabilities = [
  {
    title: "Mail-first ticket açılışı",
    body: "Müşteri yalnızca destek adresine mail atar. Sistem ticket'ı otomatik açar ve süreç aynı mail zinciri içinde devam eder.",
    icon: Mail,
  },
  {
    title: "Tenant ve domain bazlı görünürlük",
    body: "Tüm talepler tek panelde toplanır; ama tenant, müşteri domaini ve tarih aralığına göre ayrı filtrelenebilir.",
    icon: ShieldCheck,
  },
  {
    title: "Aylık export akışı",
    body: "Excel ve PDF çıktıları ile müşterilere düzenli operasyon raporu sunmak için veri doğrudan panelden alınır.",
    icon: Table2,
  },
];

const workflow = [
  "Müşteri destek@uptexx.com adresine mail gönderir.",
  "Gönderen domain tenant ile eşleşir ve ticket otomatik açılır.",
  "Durum, öncelik, ilk müdahale ve çözüm notları panelden işlenir.",
  "Müşteriye verilen yanıt aynı ticket koduyla mail olarak gider.",
  "Müşteri aynı konu üzerinden cevap verdiğinde süreç yeni ticket açmadan devam eder.",
];

const controlItems = [
  "Ticket no, müşteri, tenant, konu ve açılış zamanı tek görünümde izlenir.",
  "İlk müdahale zamanı, çözüm zamanı ve çözüm notu kaydı tutulur.",
  "İç not ile müşteriye giden yanıt ayrıştırılmış biçimde yönetilir.",
  "Tenant, domain, tarih ve öncelik bazında filtreli export alınır.",
];

export default function TicketLandingPage() {
  return (
    <main className="bg-[#f4f7fb] text-[#16202a]">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b1522_0%,#122133_58%,#f4f7fb_58%,#f4f7fb_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(97,201,255,0.16),_transparent_58%)]" />
          <div className="absolute left-[-6rem] top-20 h-80 w-80 rounded-full bg-[#27b7e5]/10 blur-3xl" />
          <div className="absolute right-[-7rem] top-32 h-96 w-96 rounded-full bg-[#396af1]/10 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col px-6 pb-18 pt-6 lg:px-10">
          <header className="flex items-center justify-between py-4">
            <div>
              <p className="text-2xl font-semibold tracking-[0.12em] text-white">UPTEXX</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#9db7cf]">
                Support Desk
              </p>
            </div>

            <Link
              href="/ticket/login"
              className="rounded-full border border-white/12 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/8"
            >
              Yönetim Girişi
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <SectionLabel className="border-white/14 bg-white/8 text-[#86dfff]">
                Uptexx Ticket
              </SectionLabel>

              <h1 className="mt-6 max-w-3xl text-[2.5rem] font-semibold leading-[1.02] tracking-tight text-white md:text-[3.4rem]">
                Destek maillerini tek panelde yönetin.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#c7d8e7] md:text-lg">
                destek@uptexx.com adresine gelen talepler otomatik ticket&apos;a dönüşür.
                Aynı mail zinciri korunur, tenant bazlı filtreleme yapılır ve dönemsel
                export ile müşteri raporları hazırlanır.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/ticket/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#74d2ee] px-6 py-3 text-sm font-semibold text-[#08131f] transition hover:-translate-y-0.5 hover:bg-[#8ee0f7]"
                >
                  Yönetim paneline gir
                </Link>
                <a
                  href="#overview"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Sistemi incele
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-6 text-sm text-[#9db7cf]">
                <div>
                  <p className="text-2xl font-semibold text-white">Mail-first</p>
                  <p className="mt-2 leading-7">Portal zorunluluğu olmadan ticket akışı.</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">Tenant filtreli</p>
                  <p className="mt-2 leading-7">Müşteri bazında ayrılmış operasyon görünümü.</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">Export hazır</p>
                  <p className="mt-2 leading-7">Excel ve PDF ile düzenli dönem raporu.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[#111c2a]/80 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86dfff]">
                    Canlı görünüm
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">[#UPX-1048]</p>
                </div>
                <span className="rounded-full bg-[#1f3147] px-3 py-1 text-xs font-semibold text-[#a8c8e2]">
                  open
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#86dfff]">Konu</p>
                  <p className="mt-2 text-base leading-7 text-white">
                    Müşteri panelinde giriş sırasında hata alıyoruz
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#86dfff]">tenant</p>
                    <p className="mt-2 text-sm text-[#d4e2ef]">Acme Teknoloji</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#86dfff]">öncelik</p>
                    <p className="mt-2 text-sm text-[#d4e2ef]">high</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#86dfff]">kanal</p>
                    <p className="mt-2 text-sm text-[#d4e2ef]">email</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#86dfff]">ilk işlem</p>
                    <p className="mt-2 text-sm text-[#d4e2ef]">yanıt bekleniyor</p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#86dfff]" />
                    <p className="text-sm leading-7 text-[#d4e2ef]">
                      Aynı thread içinde gelen müşteri yanıtları ticket geçmişine eklenir ve süreç parçalanmaz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="overview"
        className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.84fr_1.16fr] lg:px-10"
      >
        <div>
          <SectionLabel className="border-[#d7e7ef] bg-[#edf7fb] text-[#256985]">
            Genel Bakış
          </SectionLabel>
          <h2 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight text-[#16202a] md:text-4xl">
            Sade giriş yüzeyi, teknik ekip için net operasyon mantığı.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {capabilities.map((item) => (
            <div key={item.title} className="border-t border-[rgba(15,23,42,0.08)] pt-5">
              <item.icon className="h-5 w-5 text-[#256985]" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#16202a]">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-[#607285]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(15,23,42,0.08)] bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
          <div>
            <SectionLabel className="border-[#d7e7ef] bg-[#edf7fb] text-[#256985]">
              Nasıl Çalışır
            </SectionLabel>
            <h2 className="mt-6 max-w-lg text-3xl font-semibold tracking-tight text-[#16202a] md:text-4xl">
              Mail gelir, ticket açılır, aynı kayıtta çözülür.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#607285]">
              Müşteri tarafında ek eğitim gerektirmeden, iç ekip için izlenebilir ve
              raporlanabilir bir destek süreci kurulur.
            </p>
          </div>

          <div className="grid gap-0">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 border-b border-[rgba(15,23,42,0.08)] py-6 md:grid-cols-[72px_1fr]"
              >
                <p className="text-2xl font-semibold text-[#256985]">0{index + 1}</p>
                <p className="text-base leading-8 text-[#334155]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div>
          <SectionLabel className="border-[#d7e7ef] bg-[#edf7fb] text-[#256985]">
            Operasyon Kontrolü
          </SectionLabel>
          <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-[#16202a] md:text-4xl">
            Ticket süreci sadece görünmez, düzenli biçimde kayıt altına alınır.
          </h2>

          <div className="mt-8 space-y-5">
            {controlItems.map((item) => (
              <div key={item} className="flex items-start gap-4 border-b border-[rgba(15,23,42,0.08)] pb-5 last:border-b-0 last:pb-0">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#256985]" />
                <p className="text-base leading-8 text-[#607285]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-[linear-gradient(180deg,#112031_0%,#172a40_100%)] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#86dfff]">
            Raporlama
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            Aylık müşteri raporlarını da aynı panelden çıkarın.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#c9d9e6]">
            Tenant, domain, tarih ve öncelik bazlı filtrelerle aynı veri setinden hem
            operasyon takibi hem de dönem export&apos;u üretirsiniz.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Tenant bazında açılan ve kapanan kayıtları ayırın.",
              "İlk müdahale ve çözüm sürelerini dönemsel izleyin.",
              "Excel ve PDF çıktıları ile düzenli görünürlük sağlayın.",
            ].map((item) => (
              <div key={item} className="border-t border-white/10 pt-4 text-sm leading-7 text-[#c9d9e6]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(15,23,42,0.08)] bg-[#e9f0f5]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-[#16202a]">
              Panel hazır. Şimdi destek operasyonunu içeriden yönetin.
            </p>
            <p className="mt-2 text-base text-[#607285]">
              Giriş yaparak tenant filtreleri, ticket listesi ve export alanını kullanabilirsiniz.
            </p>
          </div>

          <Link
            href="/ticket/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#172a40] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#112031]"
          >
            Yönetim paneline geç <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
