import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Target, ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";

const SejarahPage = () => {
  const [sejarahText, setSejarahText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSejarah = async () => {
      try {
        const response = await api.get("/settings");
        if (response.data && response.data.sejarah) {
          setSejarahText(response.data.sejarah);
        }
      } catch (err) {
        console.error("Gagal memuat sejarah:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSejarah();
  }, []);

  const paragraphs = sejarahText
    ? sejarahText.split("\n\n").filter(p => p.trim() !== "")
    : [];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        badge="Sejarah" 
        title="Rekam Jejak LISAN" 
        subtitle="Mengenal awal mula dan perjalanan panjang perjuangan organisasi" 
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-400 font-inter text-sm">Memuat rekam jejak sejarah...</p>
          </div>
        ) : (
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
            
            {paragraphs.length > 0 ? (
              paragraphs.map((para, index) => {
                // Beri aksen card pada paragraf kedua atau ketiga jika ada
                if (index === 2) {
                  return (
                    <div key={index} className="my-12 p-8 bg-red-50 rounded-3xl border border-red-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Target size={120} className="text-primary" />
                      </div>
                      <h3 className="text-2xl font-poppins font-bold text-dark mb-4 relative z-10">Tonggak Bersejarah</h3>
                      <p className="relative z-10 whitespace-pre-line m-0">
                        {para}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={index} className={`whitespace-pre-line ${index === 0 ? "text-xl text-gray-800 font-medium mb-8" : "mb-6"}`}>
                    {para}
                  </p>
                );
              })
            ) : (
              <p className="text-gray-500 italic">Konten sejarah belum diisi oleh pengurus.</p>
            )}
          </motion.div>
        )}

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
