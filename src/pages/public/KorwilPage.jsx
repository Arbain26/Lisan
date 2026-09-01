import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";

const KorwilPage = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKorwil = async () => {
      try {
        const response = await api.get("/korwil");
        setRegions(response.data);
      } catch (err) {
        console.error("Gagal memuat koordinator wilayah:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKorwil();
  }, []);

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-gray-400 font-inter text-sm">Memuat basis wilayah...</p>
          </div>
        ) : (
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
        )}

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
