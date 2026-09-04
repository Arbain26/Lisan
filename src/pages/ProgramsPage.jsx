import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import useFetch from "../hooks/useFetch";

import PageHeader from "../components/ui/PageHeader";

const ProgramsPage = () => {
  const { data: programs, loading } = useFetch("/programs");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Program Kerja" 
        title="Program & Kegiatan" 
        subtitle="Seluruh program unggulan dan kegiatan LISAN" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse h-80">
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
            programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${program.color_theme || 'from-primary to-red-600'}`} />

                {/* Card content */}
                <div className="p-8 flex flex-col flex-grow z-10 relative">
                  {/* Icon / Logo */}
                  <div
                    className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm overflow-hidden"
                  >
                    <img src="/lisan.jpeg" alt="Logo Program" className="w-full h-full object-contain p-2" />
                  </div>

                  <h3 className="font-poppins font-bold text-xl text-dark mb-3 group-hover:text-primary transition-colors duration-300">
                    {program.name}
                  </h3>
                  <p className="font-inter text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                    {program.description}
                  </p>

                  <button className="flex items-center gap-2 text-sm font-semibold font-inter text-primary group-hover:gap-3 transition-all duration-300 mt-auto w-max">
                    Pelajari Lebih <ArrowRight size={15} />
                  </button>
                </div>
                
                {/* Hover background glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${program.color_theme || 'from-primary to-red-600'} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-2">Belum Ada Program</h3>
              <p className="text-gray-500 font-inter">Program kerja belum tersedia saat ini.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramsPage;
