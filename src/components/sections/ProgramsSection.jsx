import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import useFetch from "../../hooks/useFetch";

const ProgramCard = ({ program, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${program.color_theme || 'from-primary to-red-600'}`} />

      {/* Card content */}
      <div className="p-8">
        {/* Icon / Logo */}
        <div
          className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 overflow-hidden"
        >
          <img src="/lisan.jpeg" alt="Logo Program" className="w-full h-full object-contain p-2" />
        </div>

        <h3 className="font-poppins font-bold text-xl text-dark mb-3 group-hover:text-primary transition-colors duration-300">
          {program.name}
        </h3>
        <p className="font-inter text-gray-500 text-sm leading-relaxed mb-6">
          {program.description}
        </p>

        <button className="flex items-center gap-2 text-sm font-semibold font-inter text-primary group-hover:gap-3 transition-all duration-300">
          Pelajari Lebih <ArrowRight size={15} />
        </button>
      </div>

      {/* Hover background glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${program.color_theme || 'from-primary to-red-600'} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
      />
    </motion.div>
  );
};

const ProgramsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { data: programs, loading } = useFetch("/programs");

  return (
    <section id="programs" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-inter font-semibold uppercase tracking-widest">Program Unggulan</span>
          </div>
          <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-dark mb-4 leading-tight">
            Program & Kegiatan{" "}
            <span className="text-primary">LISAN</span>
          </h2>
          <p className="font-inter text-gray-500 leading-relaxed">
            Kami menghadirkan program-program strategis yang dirancang untuk membentuk mahasiswa Muslim yang cerdas, berkarakter, dan berdampak.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton Loaders
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse h-80">
                <div className="h-1.5 bg-gray-200 w-full" />
                <div className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 mb-6" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : programs.length > 0 ? (
            programs.slice(0, 4).map((program, i) => (
              <ProgramCard key={program.id} program={program} index={i} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-inter">
              Belum ada program yang tersedia.
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="/programs"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
            style={{ background: "linear-gradient(135deg, #B91C1C, #991818)" }}
          >
            Lihat Semua Program
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramsSection;
