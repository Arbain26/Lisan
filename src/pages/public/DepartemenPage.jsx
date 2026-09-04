import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, HeartHandshake, Laptop, Megaphone, Folder, Award, Shield, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import api from "../../services/api";

const iconMap = {
  Users: Users,
  BookOpen: BookOpen,
  HeartHandshake: HeartHandshake,
  Laptop: Laptop,
  Megaphone: Megaphone,
  Folder: Folder,
  Award: Award,
  Shield: Shield
};

const DynamiciCon = ({ name, size = 32, className = "" }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};

import PageHeader from "../../components/ui/PageHeader";
import { Skeleton } from "../../components/ui/Skeleton";

const DepartemenPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departemen");
        setDepartments(response.data);
      } catch (err) {
        console.error("Error loading departments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        badge="Struktur" 
        title="Departemen & Bidang" 
        subtitle="Mengenal divisi kerja yang menjadi mesin penggerak roda organisasi LISAN" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-4 w-full">
                  <Skeleton className="h-7 w-64 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-inter text-gray-500">Belum ada departemen terdaftar saat ini.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {departments.map((dept) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border ${dept.color_theme}`}>
                  <DynamiciCon name={dept.icon} size={32} />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-poppins font-bold text-dark mb-4">{dept.nama}</h2>
                  <p className="font-inter text-gray-600 text-lg leading-relaxed mb-8">
                    {dept.deskripsi}
                  </p>
                  
                  {Array.isArray(dept.program_unggulan) && dept.program_unggulan.length > 0 && (
                    <>
                      <h4 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Program Unggulan:
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {dept.program_unggulan.map((prog, idx) => (
                          <span key={idx} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-inter text-gray-700">
                            {prog}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center max-w-4xl mx-auto"
        >
          <a href="/structure" className="text-gray-500 hover:text-primary font-inter font-medium transition-colors">
            ← Struktur Pengurus
          </a>
          <a href="/koordinator-wilayah" className="inline-flex items-center gap-2 text-primary font-inter font-semibold hover:text-red-800 transition-colors">
            Koordinator Wilayah <ArrowRight size={16} />
          </a>
        </motion.div>
      </main>
    </div>
  );
};

export default DepartemenPage;
