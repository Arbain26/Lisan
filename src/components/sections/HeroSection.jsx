import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const fallbackSlides = [
  {
    bg: "https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?w=1920&q=85",
    title: "Lingkar Mahasiswa Islam",
    highlight: "untuk Perubahan",
    sub: "Membangun generasi intelektual, progresif, dan Islami untuk masa depan Indonesia yang lebih baik.",
  }
];

import api from "../../services/api";
import { getMediaUrl } from "../../services/mediaUrl";

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(fallbackSlides);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get('/hero');
        if (response.data && response.data.length > 0) {
          // Format image_url to handle local or absolute URLs
          const formattedSlides = response.data.map(slide => ({
            ...slide,
            bg: slide.image_url.startsWith('http') ? slide.image_url : getMediaUrl(slide.image_url)
          }));
          setSlides(formattedSlides);
        }
      } catch (error) {
        console.error("Failed to fetch hero slides", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollDown = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen min-h-[640px] flex items-center overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].bg})` }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-dark/20" />

      {/* Gold accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, transparent, #F59E0B, transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-inter font-semibold uppercase tracking-widest"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", color: "#F59E0B" }}
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Organisasi Mahasiswa Islam
            </motion.div>

            {/* Title */}
            <h1 className="font-poppins font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-4 text-shadow">
              {slides[current].title}{" "}
              <span
                className="block"
                style={{ background: "linear-gradient(135deg, #F59E0B, #fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                {slides[current].highlight}
              </span>
            </h1>

            <p className="font-inter text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              {slides[current].sub}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); scrollDown(); }}
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-poppins font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                style={{ 
                  background: "linear-gradient(135deg, #B91C1C 0%, #991818 100%)", 
                  boxShadow: "0 10px 30px -5px rgba(185, 28, 28, 0.5)" 
                }}
              >
                Jelajahi Gerakan
                <ArrowRight size={18} />
              </a>

              <Link
                to="/join"
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-poppins font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
                }}
              >
                Daftar Relawan
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Dots */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Buka slide banner nomor ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-9 bg-[#F59E0B] shadow-lg shadow-amber-500/50" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollDown}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
      >
        <span className="text-xs font-inter tracking-widest uppercase">Scroll</span>
        <ChevronDown size={18} />
      </motion.button>
    </section>
  );
};

export default HeroSection;
