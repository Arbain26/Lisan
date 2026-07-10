import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import useFetch from "../../hooks/useFetch";
import { getMediaUrl } from "../../services/mediaUrl";

const NewsCard = ({ article, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9] bg-gray-100 shrink-0">
        <img
          src={article.image_url ? getMediaUrl(article.image_url) : article.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Category tag */}
        <div className="absolute top-4 left-4">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-inter font-semibold text-white"
            style={{ background: "rgba(185,28,28,0.9)", backdropFilter: "blur(8px)" }}
          >
            <Tag size={10} />
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-inter mb-3">
          <Calendar size={12} />
          {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : article.date}
        </div>
        <h3 className="font-poppins font-bold text-dark text-lg leading-snug mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-500 font-inter text-sm leading-relaxed mb-5 line-clamp-3 flex-grow">
          {article.excerpt}
        </p>
        <a href={`/news/${article.id}`} className="inline-flex items-center gap-2 text-sm font-semibold font-inter text-primary group-hover:gap-3 transition-all duration-300 mt-auto">
          Baca Selengkapnya <ArrowRight size={14} />
        </a>
      </div>
    </motion.article>
  );
};

const NewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { data: news, loading } = useFetch("/news?status=Published");

  return (
    <section id="news" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-primary text-xs font-inter font-semibold uppercase tracking-widest">Berita Terkini</span>
            </div>
            <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-dark leading-tight">
              News & <span className="text-primary">Artikel</span>
            </h2>
          </div>
          <a
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-dark hover:border-primary hover:text-primary font-poppins font-semibold text-sm transition-all flex-shrink-0"
          >
            Lihat Semua <ArrowRight size={15} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse h-[400px]">
                <div className="h-48 bg-gray-200 w-full" />
                <div className="p-6 space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : news.length > 0 ? (
            news.slice(0, 3).map((article, i) => (
              <NewsCard key={article.id} article={article} index={i} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-inter">
              Belum ada berita yang dipublikasikan.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
