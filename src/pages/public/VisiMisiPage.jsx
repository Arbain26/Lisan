import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Compass, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";

const VisiMisiPage = () => {
  const [visi, setVisi] = useState("");
  const [misiItems, setMisiItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisiMisi = async () => {
      try {
        const response = await api.get("/settings");
        if (response.data) {
          if (response.data.visi) setVisi(response.data.visi);
          if (Array.isArray(response.data.misi)) setMisiItems(response.data.misi);
        }
      } catch (err) {
        console.error("Gagal memuat visi dan misi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisiMisi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Visi & Misi" 
        title="Arah Perjuangan Kami" 
        subtitle="Fondasi utama yang memandu setiap langkah dan program organisasi" 
      />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-400 font-inter text-sm">Memuat visi dan misi...</p>
          </div>
        ) : (
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
                "{visi || 'Terwujudnya generasi mahasiswa Muslim yang berkarakter, memiliki integritas tinggi, dan menjadi motor penggerak perubahan.'}"
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
                {misiItems.length === 0 && (
                  <li className="text-gray-400 italic">Belum ada butir misi yang dimasukkan.</li>
                )}
              </ul>
            </motion.div>
            
          </div>
        )}

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
