import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle } from "lucide-react";

const values = [
  "Intelektualitas dan Keilmuan Islam",
  "Kepemimpinan yang Amanah",
  "Gerakan Sosial Nyata",
  "Kebersamaan dan Solidaritas",
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Decorative bg shape */}
            <div
              className="absolute -top-6 -left-6 w-64 h-64 rounded-3xl opacity-10"
              style={{ background: "linear-gradient(135deg, #B91C1C, #F59E0B)" }}
            />
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-white p-8 border border-gray-100">
              <img
                src="/lisan.jpeg"
                alt="Logo LISAN"
                className="w-full h-full object-contain"
              />
            </div>

          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-primary text-xs font-inter font-semibold uppercase tracking-widest">Tentang Kami</span>
            </div>

            <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-dark leading-tight mb-6">
              Lingkar Mahasiswa Islam untuk{" "}
              <span className="text-primary">Perubahan</span>
            </h2>

            <p className="font-inter text-gray-600 text-lg leading-relaxed mb-5">
              <strong className="text-dark font-semibold">LISAN</strong> adalah organisasi mahasiswa Islam yang berkomitmen membangun generasi muda yang cerdas, berakhlak, dan berdaya guna bagi masyarakat.
            </p>
            <p className="font-inter text-gray-500 leading-relaxed mb-8">
              Dengan program kaderisasi, kajian Islam, dan aksi sosial nyata, LISAN hadir sebagai ruang tumbuh bagi mahasiswa yang ingin memberikan dampak positif bagi bangsa dan agama.
            </p>

            {/* Values */}
            <ul className="space-y-3 mb-10">
              {values.map((val) => (
                <li key={val} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-secondary flex-shrink-0" />
                  <span className="text-gray-700 font-inter text-sm">{val}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-4">
              <a
                href="/about"
                className="px-6 py-3 rounded-xl font-poppins font-semibold text-sm text-white transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-primary/30"
                style={{ background: "linear-gradient(135deg, #B91C1C, #991818)" }}
              >
                Pelajari Lebih Lanjut
              </a>
              <a
                href="/structure"
                className="px-6 py-3 rounded-xl font-poppins font-semibold text-sm text-dark border-2 border-gray-200 hover:border-primary hover:text-primary transition-all"
              >
                Lihat Struktur
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
