import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #B91C1C 40%, #991818 70%, #450a0a 100%)" }}
      />
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10 bg-secondary" />
      {/* Gold grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(245,158,11,0.8) 1px, transparent 0)", backgroundSize: "40px 40px" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.5)" }}
          >
            <Sparkles size={14} className="text-secondary" />
            <span className="text-secondary text-xs font-inter font-semibold uppercase tracking-widest">Bergabunglah Bersama Kami</span>
          </div>

          <h2 className="font-poppins font-bold text-5xl sm:text-6xl text-white mb-6 leading-tight">
            Be Part of{" "}
            <span
              style={{ background: "linear-gradient(135deg, #F59E0B, #fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              The Change
            </span>
          </h2>

          <p className="font-inter text-red-100 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Jadilah bagian dari gerakan mahasiswa Islam yang nyata. Bersama LISAN, kamu bisa tumbuh, berdampak, dan meninggalkan jejak perubahan bagi bangsa dan agama.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/join"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-poppins font-bold text-dark transition-all duration-300 hover:-translate-y-1 shadow-2xl hover:shadow-secondary/50 text-lg"
              style={{ background: "linear-gradient(135deg, #F59E0B, #d97706)" }}
            >
              Join LISAN Today
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/about"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-poppins font-semibold text-white transition-all duration-300 hover:-translate-y-1 text-lg"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
