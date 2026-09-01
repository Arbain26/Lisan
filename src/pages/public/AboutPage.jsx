import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, History, Target, Scale, Users, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";

const AboutPage = () => {
  const [tentang, setTentang] = useState("");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await api.get("/settings");
        if (response.data) {
          setSettings(response.data);
          setTentang(response.data.tentang_organisasi || "");
        }
      } catch (err) {
        console.error("Gagal memuat profil organisasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const quickLinks = [
    { title: "Rekam Jejak Sejarah", desc: "Awal mula berdirinya LISAN di Sidrap", path: "/sejarah", icon: History, color: "text-red-600 bg-red-50" },
    { title: "Visi & Misi", desc: "Arah dan komitmen perjuangan kader", path: "/visi-misi", icon: Target, color: "text-amber-600 bg-amber-50" },
    { title: "Nilai Organisasi", desc: "Prinsip dasar moral dan keilmuan", path: "/nilai-organisasi", icon: Scale, color: "text-purple-600 bg-purple-50" },
    { title: "Struktur Pengurus", desc: "Jajaran pengurus harian dan bidang", path: "/structure", icon: Users, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Tentang Kami" 
        title="Mengenal LISAN" 
        subtitle="Identitas, idealisme, dan gerakan pemuda Islam untuk kemaslahatan umat" 
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-16">
        {/* Main About Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center">
              <Building2 size={26} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary font-inter">Profil Identitas</span>
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">
                {settings?.nama_organisasi || "Lingkar Mahasiswa Islam untuk Perubahan"}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="font-inter text-gray-700 text-lg sm:text-xl leading-relaxed whitespace-pre-line">
              {tentang || "Lingkar Mahasiswa Islam untuk Perubahan (LISAN) adalah organisasi pergerakan mahasiswa Islam independen yang berpusat di Kabupaten Sidenreng Rappang."}
            </div>
          )}
        </motion.div>

        {/* Quick Profile Cards */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-poppins font-bold text-gray-900">Jelajahi Profil Lebih Dalam</h3>
            <p className="text-gray-500 font-inter text-sm mt-1">Pilih topik yang ingin Anda ketahui lebih lanjut mengenai organisasi kami.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="block h-full bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${item.color}`}>
                      <Icon size={26} />
                    </div>
                    <h4 className="font-poppins font-bold text-lg text-gray-900 group-hover:text-primary transition-colors flex items-center justify-between">
                      {item.title}
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                    </h4>
                    <p className="font-inter text-xs text-gray-500 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
