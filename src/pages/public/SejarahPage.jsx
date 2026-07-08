import { motion } from "framer-motion";
import { History, Target, ArrowRight } from "lucide-react";

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

const SejarahPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        badge="Sejarah" 
        title="Rekam Jejak LISAN" 
        subtitle="Mengenal awal mula dan perjalanan panjang perjuangan organisasi" 
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-lg prose-red max-w-none font-inter text-gray-600 leading-relaxed"
        >
          <div className="flex items-center gap-4 mb-8 text-primary">
            <History size={32} />
            <h2 className="text-3xl font-poppins font-bold text-dark m-0">Awal Mula Pergerakan</h2>
          </div>
          
          <p className="text-xl text-gray-800 font-medium mb-8">
            Berawal dari kepedulian mendalam terhadap dinamika mahasiswa dan pemuda di Kabupaten Sidenreng Rappang, sekelompok mahasiswa Muslim berkumpul untuk menyatukan visi dalam sebuah pergerakan intelektual dan spiritual.
          </p>

          <p>
            Lingkar Mahasiswa Islam untuk Perubahan (LISAN) didirikan dengan semangat untuk memberikan kontribusi nyata bagi masyarakat. Di tengah arus modernisasi yang bergerak cepat, LISAN hadir sebagai wadah pembinaan yang fokus pada pengembangan karakter, integritas, dan kapasitas kepemimpinan mahasiswa berlandaskan nilai-nilai Islam.
          </p>

          <p>
            Pada masa-masa awalnya, organisasi ini bermula dari kelompok-kelompok kajian kecil (halaqah) di kampus-kampus lokal. Diskusi-diskusi intensif mengenai peran mahasiswa sebagai <i>Agent of Change</i> dan <i>Iron Stock</i> mendorong para pendiri untuk melembagakan gerakan ini agar dapat memberikan dampak yang lebih luas dan terstruktur.
          </p>

          <div className="my-12 p-8 bg-red-50 rounded-3xl border border-red-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Target size={120} className="text-primary" />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-dark mb-4 relative z-10">Tonggak Bersejarah</h3>
            <p className="relative z-10">
              Deklarasi berdirinya LISAN menjadi momentum penting penyatuan berbagai elemen mahasiswa Muslim Sidrap. Sejak saat itu, LISAN mulai aktif menyelenggarakan berbagai program mulai dari kaderisasi, kajian strategis, hingga aksi sosial dan kemanusiaan yang manfaatnya langsung dirasakan oleh masyarakat.
            </p>
          </div>

          <p>
            Hingga hari ini, LISAN terus berkembang dan melebarkan sayapnya. Organisasi ini tidak hanya menjadi tempat berkumpul, melainkan sebuah "laboratorium kepemimpinan" yang telah melahirkan banyak alumni sukses dan berpengaruh di berbagai bidang profesi. Perjalanan panjang LISAN adalah bukti nyata dari konsistensi perjuangan pemuda yang memegang teguh idealisme dan kebersamaan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center"
        >
          <a href="/about" className="text-gray-500 hover:text-primary font-inter font-medium transition-colors">
            ← Kembali ke Profil
          </a>
          <a href="/visi-misi" className="inline-flex items-center gap-2 text-primary font-inter font-semibold hover:text-red-800 transition-colors">
            Lanjut ke Visi & Misi <ArrowRight size={16} />
          </a>
        </motion.div>
      </main>
    </div>
  );
};

export default SejarahPage;
