import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User, Loader2 } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { motion } from "framer-motion";

const NewsDetailPage = () => {
  const { id } = useParams();
  const { data: article, loading, error } = useFetch(`/news/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-2xl font-poppins font-bold text-gray-800 mb-2">Artikel Tidak Ditemukan</h2>
        <p className="text-gray-500 font-inter mb-6">Maaf, artikel yang Anda cari mungkin telah dihapus atau tautannya salah.</p>
        <Link to="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-inter font-medium rounded-xl hover:bg-red-800 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link to="/news" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-inter font-medium mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali
        </Link>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100"
        >
          {/* Header Image */}
          <div className="w-full h-[300px] md:h-[450px] relative">
            <img 
              src={article.image_url ? `http://localhost:5000${article.image_url}` : article.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-inter font-semibold text-white" style={{ background: "rgba(185,28,28,0.9)", backdropFilter: "blur(8px)" }}>
                <Tag size={12} />
                {article.category}
              </span>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12 lg:p-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold text-dark leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-inter text-gray-500 mb-10 pb-10 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <span>
                  {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : article.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-primary" />
                <span>Admin LISAN</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none prose-p:font-inter prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6 prose-headings:font-poppins prose-headings:text-dark prose-headings:font-bold prose-headings:mb-4">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>
          </div>
        </motion.article>

      </div>
    </div>
  );
};

export default NewsDetailPage;
