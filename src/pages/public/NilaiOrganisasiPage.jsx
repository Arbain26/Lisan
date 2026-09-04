import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, HeartHandshake, BookOpen, Lightbulb, Shield, ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";

const iconMap = {
  Shield: { icon: <Shield size={28} />, color: "text-emerald-600 bg-emerald-50", border: "border-emerald-100" },
  BookOpen: { icon: <BookOpen size={28} />, color: "text-blue-600 bg-blue-50", border: "border-blue-100" },
  HeartHandshake: { icon: <HeartHandshake size={28} />, color: "text-red-600 bg-red-50", border: "border-red-100" },
  Lightbulb: { icon: <Lightbulb size={28} />, color: "text-amber-600 bg-amber-50", border: "border-amber-100" },
  Scale: { icon: <Scale size={28} />, color: "text-purple-600 bg-purple-50", border: "border-purple-100" },
};

const NilaiOrganisasiPage = () => {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValues = async () => {
      try {
        const response = await api.get("/settings");
        if (response.data && Array.isArray(response.data.nilai_organisasi)) {
          setValues(response.data.nilai_organisasi);
        }
      } catch (err) {
        console.error("Gagal memuat nilai organisasi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Nilai Organisasi" 
        title="Pilar Pergerakan Kami" 
        subtitle="Prinsip dasar yang menjadi pedoman etika dan operasional seluruh kader LISAN" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-400 font-inter text-sm">Memuat pilar nilai organisasi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((val, i) => {
              const meta = iconMap[val.icon] || iconMap.Shield;
              return (
                <motion.div
                  key={val.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border ${meta.border}`}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <h3 className="text-2xl font-poppins font-bold text-dark mb-4">{val.title}</h3>
                  <p className="font-inter text-gray-600 leading-relaxed">
                    {val.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

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
