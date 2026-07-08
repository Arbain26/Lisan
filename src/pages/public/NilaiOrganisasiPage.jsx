import { motion } from "framer-motion";
import { Scale, HeartHandshake, BookOpen, Lightbulb, Shield, ArrowRight } from "lucide-react";

const PageHeader = ({ title, subtitle, badge }) => (
  <div
    className="relative py-32 flex items-center justify-center overflow-hidden"
    style={{ background: "linear-gradient(135deg, #111827 0%, #1a0505 50%, #111827 100%)" }}
  >
    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(245,158,11,0.5) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
    <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-secondary text-xs font-inter font-semibold uppercase tracking-widest">{badge}</span>
        </div>
      )}
      <h1 className="font-poppins font-bold text-4xl sm:text-6xl text-white mb-4">{title}</h1>
      {subtitle && <p className="text-gray-400 font-inter text-lg">{subtitle}</p>}
    </div>
  </div>
);

const NilaiOrganisasiPage = () => {
  const values = [
    {
      title: "Integritas & Akhlak",
      desc: "Menjunjung tinggi kejujuran dan etika moral dalam setiap tindakan dan pengambilan keputusan organisasi.",
      icon: <Shield size={28} />,
      color: "text-emerald-600 bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      title: "Intelektualitas",
      desc: "Mendorong budaya literasi, diskusi, dan berpikir kritis sebagai dasar pengembangan diri kader.",
      icon: <BookOpen size={28} />,
      color: "text-blue-600 bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Kepedulian Sosial",
      desc: "Menjadi garda terdepan dalam merespons isu kemanusiaan dan membantu masyarakat yang membutuhkan.",
      icon: <HeartHandshake size={28} />,
      color: "text-red-600 bg-red-50",
      border: "border-red-100"
    },
    {
      title: "Inovasi Adaptif",
      desc: "Terbuka terhadap perkembangan zaman dan teknologi untuk menciptakan solusi yang relevan.",
      icon: <Lightbulb size={28} />,
      color: "text-amber-600 bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Keadilan & Kesetaraan",
      desc: "Memastikan setiap anggota memiliki ruang tumbuh yang sama tanpa diskriminasi.",
      icon: <Scale size={28} />,
      color: "text-purple-600 bg-purple-50",
      border: "border-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Nilai Organisasi" 
        title="Pilar Pergerakan Kami" 
        subtitle="Prinsip dasar yang menjadi pedoman etika dan operasional seluruh kader LISAN" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border ${val.border}`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${val.color}`}>
                {val.icon}
              </div>
              <h3 className="text-2xl font-poppins font-bold text-dark mb-4">{val.title}</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                {val.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center max-w-3xl mx-auto"
        >
          <a href="/visi-misi" className="text-gray-500 hover:text-primary font-inter font-medium transition-colors">
            ← Kembali ke Visi & Misi
          </a>
          <a href="/structure" className="inline-flex items-center gap-2 text-primary font-inter font-semibold hover:text-red-800 transition-colors">
            Lihat Struktur Organisasi <ArrowRight size={16} />
          </a>
        </motion.div>
      </main>
    </div>
  );
};

export default NilaiOrganisasiPage;
