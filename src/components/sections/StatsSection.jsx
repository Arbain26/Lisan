import { useRef, useEffect, useState } from "react";
import { useInView, motion } from "framer-motion";
import { stats } from "../../constants";
import { Users, CalendarCheck, MapPin } from "lucide-react";

const useCounter = (target, isInView, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return count;
};

const icons = [
  <Users size={32} strokeWidth={1.5} />,
  <CalendarCheck size={32} strokeWidth={1.5} />,
  <MapPin size={32} strokeWidth={1.5} />
];

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Left Aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-primary text-xs font-inter font-semibold uppercase tracking-widest">Dampak Kami</span>
            </div>
            <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-dark leading-tight">
              Aksi Nyata, <br className="hidden sm:block" />
              <span className="text-primary">Bukan Sekadar Angka</span>
            </h2>
          </div>
          <p className="text-gray-500 font-inter md:max-w-sm">
            Lebih dari satu dekade bergerak bersama, LISAN telah memberikan dampak nyata bagi mahasiswa dan masyarakat.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 - Large Primary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 bg-primary rounded-[2rem] p-8 sm:p-10 text-white relative overflow-hidden group shadow-lg shadow-primary/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-8">
                {icons[0]}
              </div>
              <div>
                <h3 className="font-poppins font-bold text-6xl sm:text-7xl mb-2">
                  {useCounter(stats[0].value, isInView)}{stats[0].suffix}
                </h3>
                <p className="font-inter text-red-100 text-lg sm:text-xl font-medium">{stats[0].label}</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - White */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500 group flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              {icons[1]}
            </div>
            <div>
              <h3 className="font-poppins font-bold text-5xl text-dark mb-2">
                {useCounter(stats[1].value, isInView)}{stats[1].suffix}
              </h3>
              <p className="font-inter text-gray-500 font-medium">{stats[1].label}</p>
            </div>
          </motion.div>

          {/* Card 3 - White */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500 group flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              {icons[2]}
            </div>
            <div>
              <h3 className="font-poppins font-bold text-5xl text-dark mb-2">
                {useCounter(stats[2].value, isInView)}{stats[2].suffix}
              </h3>
              <p className="font-inter text-gray-500 font-medium">{stats[2].label}</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default StatsSection;
