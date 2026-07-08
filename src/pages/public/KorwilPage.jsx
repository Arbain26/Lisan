import { motion } from "framer-motion";
import { Map, MapPin, Users, ArrowRight } from "lucide-react";

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

const KorwilPage = () => {
  const regions = [
    {
      id: 1,
      name: "Koordinator Wilayah Pangkajene",
      kampus: "Mewadahi mahasiswa dari kampus-kampus di area Pangkajene dan sekitarnya.",
      anggota: "120+ Kader Aktif"
    },
    {
      id: 2,
      name: "Koordinator Wilayah Rappang",
      kampus: "Basis pergerakan utama untuk institusi pendidikan tinggi di wilayah utara Sidrap.",
      anggota: "85+ Kader Aktif"
    },
    {
      id: 3,
      name: "Koordinator Wilayah Makassar",
      kampus: "Wadah silaturahmi dan pembinaan bagi mahasiswa asal Sidrap yang menempuh pendidikan di Kota Makassar.",
      anggota: "200+ Kader Aktif"
    },
    {
      id: 4,
      name: "Koordinator Wilayah Parepare",
      kampus: "Mengoordinasikan kegiatan dan kajian bagi kader LISAN yang tersebar di wilayah Parepare.",
      anggota: "90+ Kader Aktif"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Jaringan" 
        title="Koordinator Wilayah" 
        subtitle="Jaringan pergerakan LISAN yang tersebar di berbagai daerah dan kampus" 
      />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-primary mb-6">
            <Map size={40} />
          </div>
          <h2 className="text-3xl font-poppins font-bold text-dark mb-4">Sebaran Jaringan Kader</h2>
          <p className="font-inter text-gray-600 text-lg">
            Guna memastikan efektivitas pembinaan dan pergerakan, LISAN membentuk struktur Koordinator Wilayah (Korwil). Korwil bertugas menjadi jembatan informasi dan penggerak program di tingkat daerah atau regional kampus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regions.map((region, i) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-red-100"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <MapPin size={80} className="text-primary" />
              </div>
              
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary border border-gray-100 group-hover:bg-red-50 transition-colors">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-bold text-dark">{region.name}</h3>
                </div>
              </div>
              
              <p className="font-inter text-gray-600 mb-6 relative z-10 leading-relaxed">
                {region.kampus}
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 font-inter text-sm text-gray-700 relative z-10 group-hover:bg-white group-hover:border-red-100 transition-colors">
                <Users size={16} className="text-secondary" />
                {region.anggota}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-200 flex justify-center items-center"
        >
          <a href="/departemen" className="text-gray-500 hover:text-primary font-inter font-medium transition-colors">
            ← Kembali ke Departemen
          </a>
        </motion.div>
      </main>
    </div>
  );
};

export default KorwilPage;
