import { motion } from "framer-motion";
import { Heart, MapPin, Droplets, Calendar } from "lucide-react";
import useFetch from "../hooks/useFetch";

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

const DonorPage = () => {
  const { data: donors, loading } = useFetch("/community/donors");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Aksi Sosial" 
        title="Lingkar Donor Sidrap" 
        subtitle="Daftar pahlawan kemanusiaan yang mendonorkan darahnya untuk masyarakat" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div>
              <h2 className="font-poppins font-bold text-3xl text-dark mb-3">Jadilah Pendonor</h2>
              <p className="text-gray-500 font-inter max-w-2xl">
                Setetes darah Anda bisa menyelamatkan nyawa mereka yang membutuhkan. Daftarkan diri Anda sebagai bagian dari Lingkar Donor Sidrap.
              </p>
            </div>
            <button className="px-8 py-4 bg-primary text-white rounded-xl font-poppins font-semibold shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 flex-shrink-0">
              Daftar Sekarang
            </button>
          </div>
        </div>

        <h3 className="font-poppins font-bold text-2xl text-dark mb-8 flex items-center gap-3">
          <Heart className="text-primary" /> Daftar Pendonor Aktif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : donors.length > 0 ? (
            donors.filter(d => d.status === 'Aktif').map((donor, i) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full opacity-50 pointer-events-none" />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-primary font-poppins font-bold text-lg border border-red-200">
                      {donor.blood_type}
                    </div>
                    <div>
                      <h4 className="font-poppins font-semibold text-gray-900">{donor.name}</h4>
                      <span className="text-xs font-inter font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Pendonor Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 font-inter text-sm text-gray-600 relative z-10">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {donor.location || "Sidenreng Rappang"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-gray-400" />
                    Donor Terakhir: {donor.last_donation ? new Date(donor.last_donation).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : "Belum Pernah"}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🩸</div>
              <h3 className="text-xl font-poppins font-bold text-gray-900 mb-2">Belum Ada Data</h3>
              <p className="text-gray-500 font-inter">Data pendonor belum tersedia saat ini.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DonorPage;
