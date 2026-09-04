import { motion } from "framer-motion";
import { ZoomIn, Calendar } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { getMediaUrl } from "../services/mediaUrl";

import PageHeader from "../components/ui/PageHeader";

const GalleryPage = () => {
  const { data: galleryImages, loading } = useFetch("/gallery");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Dokumentasi" 
        title="Galeri LISAN" 
        subtitle="Dokumentasi foto kegiatan dan momen berharga LISAN" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`bg-gray-200 rounded-2xl animate-pulse ${i % 3 === 0 ? 'row-span-2' : ''}`} />
            ))}
          </div>
        ) : galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3]"
              >
                <img
                  src={getMediaUrl(img.image_url)}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                    <h3 className="text-white font-poppins font-bold text-lg mb-1">{img.title}</h3>
                    <div className="flex items-center gap-2 text-gray-300 font-inter text-xs">
                      <Calendar size={12} />
                      {new Date(img.date_taken).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-2">Belum Ada Foto</h3>
            <p className="text-gray-500 font-inter">Koleksi galeri sedang dipersiapkan.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GalleryPage;
