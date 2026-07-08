import { motion } from "framer-motion";
import { Target, Compass, CheckCircle2, ArrowRight } from "lucide-react";

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

const VisiMisiPage = () => {
  const misiItems = [
    "Menyelenggarakan pembinaan karakter Islami yang berkelanjutan bagi mahasiswa.",
    "Membangun kapasitas kepemimpinan dan manajerial kader melalui pelatihan terstruktur.",
    "Berperan aktif dalam memberikan solusi terhadap isu-isu sosial kemasyarakatan.",
    "Memperluas jaringan kerja sama dengan berbagai instansi dan elemen masyarakat.",
    "Menjadikan organisasi sebagai wadah inovasi dan pengembangan potensi pemuda."
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Visi & Misi" 
        title="Arah Perjuangan Kami" 
        subtitle="Fondasi utama yang memandu setiap langkah dan program organisasi" 
      />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Visi Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
              <Compass size={250} className="text-primary" />
            </div>
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-primary mb-6">
              <Compass size={32} />
            </div>
            
            <h2 className="text-3xl font-poppins font-bold text-dark mb-6">Visi LISAN</h2>
            
            <p className="font-inter text-lg text-gray-700 leading-relaxed font-medium">
              "Terwujudnya generasi mahasiswa Muslim yang berkarakter, memiliki integritas tinggi, cerdas secara intelektual dan spiritual, serta mampu menjadi penggerak perubahan positif (Agent of Change) bagi masyarakat Sidenreng Rappang dan Indonesia."
            </p>
          </motion.div>

          {/* Misi Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-secondary mb-6">
              <Target size={32} />
            </div>
            
            <h2 className="text-3xl font-poppins font-bold text-dark mb-6">Misi LISAN</h2>
            
            <ul className="space-y-4">
              {misiItems.map((misi, index) => (
                <li key={index} className="flex items-start gap-4 font-inter text-gray-600">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                  <span className="leading-relaxed">{misi}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center"
        >
          <a href="/sejarah" className="text-gray-500 hover:text-primary font-inter font-medium transition-colors">
            ← Kembali ke Sejarah
          </a>
          <a href="/nilai-organisasi" className="inline-flex items-center gap-2 text-primary font-inter font-semibold hover:text-red-800 transition-colors">
            Lanjut ke Nilai Organisasi <ArrowRight size={16} />
          </a>
        </motion.div>
      </main>
    </div>
  );
};

export default VisiMisiPage;
