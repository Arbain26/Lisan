import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ZoomIn } from "lucide-react";
import useFetch from "../../hooks/useFetch";

const GallerySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { data: galleryImages, loading } = useFetch("/gallery");

  return (
    <section id="gallery" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-inter font-semibold uppercase tracking-widest">Galeri Kegiatan</span>
          </div>
          <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-dark mb-4">
            Momen <span className="text-primary">Bersama</span>
          </h2>
          <p className="font-inter text-gray-500">
            Dokumentasi perjalanan dan kegiatan LISAN dalam membangun generasi yang berdampak.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loaders
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl animate-pulse aspect-[4/3]" />
            ))
          ) : galleryImages.length > 0 ? (
            galleryImages.slice(0, 6).map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3]"
              >
                <img
                  src={`http://localhost:5000${img.image_url}`}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                  <span className="text-white font-inter font-medium text-sm truncate">{img.title}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-inter">
              Belum ada foto galeri.
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center mt-12"
        >
          <a
            href="/gallery"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border-2 border-gray-300 font-poppins font-semibold text-sm text-dark hover:border-primary hover:text-primary transition-all"
          >
            Lihat Semua Galeri
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;
