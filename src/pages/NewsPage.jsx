import { motion } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
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

const NewsPage = () => {
  const { data: news, loading } = useFetch("/news?status=Published");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Media" 
        title="News & Artikel" 
        subtitle="Berita terkini dan artikel opini dari LISAN" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse h-[400px]">
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
            news.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[16/9] bg-gray-100 shrink-0">
                  <img
                    src={article.image_url ? `http://localhost:5000${article.image_url}` : article.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700"
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
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-2">Belum Ada Berita</h3>
              <p className="text-gray-500 font-inter">Berita dan artikel belum tersedia saat ini.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewsPage;
