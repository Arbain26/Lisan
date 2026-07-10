import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, HeartHandshake, Laptop, Megaphone, Folder, Award, Shield, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import api from "../../services/api";
import { getMediaUrl } from "../../services/mediaUrl";

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

const DynamiciCon = ({ name, size = 24, className = "" }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};

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

const MemberCard = ({ member }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center transition-all relative overflow-hidden group"
  >
    {/* Profile image container */}
    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 shadow-md mb-4 overflow-hidden relative">
      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center text-primary font-poppins font-bold text-3xl">
        {member.foto_url ? (
          <img src={getMediaUrl(member.foto_url)} alt={member.nama} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        ) : (
          member.nama.charAt(0)
        )}
      </div>
    </div>
    
    <h3 className="font-poppins font-bold text-gray-900 text-lg leading-snug line-clamp-1">{member.nama}</h3>
    <p className="font-inter text-primary text-xs font-semibold uppercase tracking-wider mt-1 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
      {member.jabatan}
    </p>
  </motion.div>
);

const StructurePage = () => {
  const [depts, setDepts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsRes, staffRes] = await Promise.all([
          api.get("/departemen"),
          api.get("/pengurus")
        ]);
        setDepts(deptsRes.data);
        setStaff(staffRes.data);
      } catch (err) {
        console.error("Error loading structural data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Pengurus Harian (PH) / Core
  const coreMembers = staff.filter(s => !s.departemen_id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="font-inter text-gray-500 text-sm">Memuat Struktur Organisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <PageHeader 
        badge="Kepengurusan" 
        title="Struktur Organisasi" 
        subtitle="Susunan kepengurusan aktif Lingkar Mahasiswa Islam untuk Perubahan (LISAN)" 
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-24">
        
        {/* Pengurus Harian (PH) Section */}
        {coreMembers.length > 0 && (
          <div className="space-y-10">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-poppins font-bold text-3xl text-gray-900">Pengurus Harian Inti</h2>
              <div className="w-12 h-1 bg-primary mx-auto mt-3 rounded-full" />
              <p className="font-inter text-sm text-gray-500 mt-3">
                Pemimpin tertinggi dan pengambil keputusan strategis roda organisasi LISAN
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {coreMembers.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}

        {/* Departments Section */}
        {depts.map(dept => {
          const deptMembers = staff.filter(s => s.departemen_id === dept.id);
          
          return (
            <div key={dept.id} className="space-y-8 pt-8 border-t border-gray-200/60">
              {/* Department Banner Header */}
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 border ${dept.color_theme}`}>
                  <DynamiciCon name={dept.icon} size={36} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <h3 className="font-poppins font-bold text-2xl md:text-3xl text-gray-900">{dept.nama}</h3>
                  <p className="font-inter text-gray-600 leading-relaxed text-sm md:text-base">
                    {dept.deskripsi}
                  </p>
                  
                  {Array.isArray(dept.program_unggulan) && dept.program_unggulan.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {dept.program_unggulan.map((prog, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 text-xs font-inter font-medium rounded-full text-gray-700">
                          {prog}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Department Members */}
              {deptMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {deptMembers.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white/40 border border-dashed border-gray-200 rounded-2xl">
                  <p className="font-inter text-xs text-gray-400">Belum ada anggota terdaftar di departemen ini.</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer Navigation */}
        <div className="pt-12 border-t border-gray-200 flex justify-between items-center max-w-4xl mx-auto">
          <a href="/about" className="text-gray-500 hover:text-primary font-inter font-medium transition-colors">
            ← Tentang LISAN
          </a>
          <a href="/departemen" className="inline-flex items-center gap-2 text-primary font-inter font-semibold hover:text-red-800 transition-colors">
            Departemen & Program Kerja <ArrowRight size={16} />
          </a>
        </div>
      </main>
    </div>
  );
};

export default StructurePage;
