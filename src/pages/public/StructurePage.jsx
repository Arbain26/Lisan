import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  HeartHandshake, 
  Laptop, 
  Megaphone, 
  Folder, 
  Award, 
  Shield, 
  HelpCircle, 
  ArrowRight, 
  Crown,
  Sparkles,
  X,
  Mail,
  GraduationCap,
  Quote,
  Eye
} from "lucide-react";

const InstagramIcon = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ size = 15, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
import api from "../../services/api";
import { getMediaUrl } from "../../services/mediaUrl";
import PageHeader from "../../components/ui/PageHeader";
import { CardSkeleton } from "../../components/ui/Skeleton";

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

// Urutan hierarki Pengurus Inti: 1. Ketua, 2. Bendahara, 3. Sekretaris, dst.
const getCoreHierarchyRank = (jabatan = "") => {
  const j = (jabatan || "").toLowerCase().trim();
  if (j.includes("ketua umum") || j === "ketua" || j.includes("presiden")) return 1;
  if (j.includes("wakil ketua") || j.includes("waka") || j.includes("wakil presiden")) return 2;
  if (j.includes("bendahara umum") || j.includes("bendahara") || j.includes("bendum")) return 3;
  if (j.includes("wakil bendahara")) return 4;
  if (j.includes("sekretaris umum") || j.includes("sekretaris") || j.includes("sekum")) return 5;
  if (j.includes("wakil sekretaris")) return 6;
  return 10;
};

// Cek apakah jabatan personil di departemen adalah koordinator/pimpinan
const isCoordinator = (jabatan = "") => {
  const j = (jabatan || "").toLowerCase().trim();
  return (
    j.includes("koordinator") ||
    j.includes("ketua") ||
    j.includes("kepala") ||
    j.includes("kabid") ||
    j.includes("pimpinan") ||
    j.includes("lead")
  );
};

// ─── Modal Detail Profil Pengurus ─────────────────────────────────────────────
const ProfileDetailModal = ({ member, onClose }) => {
  if (!member) return null;

  const instagramUrl = member.instagram 
    ? (member.instagram.startsWith("http") ? member.instagram : `https://instagram.com/${member.instagram.replace("@", "")}`) 
    : null;

  const linkedinUrl = member.linkedin 
    ? (member.linkedin.startsWith("http") ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Banner Header */}
        <div className="h-28 bg-gradient-to-r from-primary via-red-700 to-red-900 relative p-4 flex justify-end items-start">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors backdrop-blur-md"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 -mt-14 flex-1 overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl ring-4 ring-white relative overflow-hidden">
              <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-primary font-poppins font-bold text-3xl">
                {member.foto_url ? (
                  <img src={getMediaUrl(member.foto_url)} alt={member.nama} className="w-full h-full object-cover" />
                ) : (
                  member.nama.charAt(0)
                )}
              </div>
            </div>

            {/* Nama & Jabatan */}
            <h3 className="font-poppins font-bold text-2xl text-gray-900 mt-4 leading-tight">
              {member.nama}
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className="px-3.5 py-1 bg-red-50 text-primary border border-red-200/80 font-poppins font-semibold text-xs rounded-full">
                {member.jabatan}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 font-inter font-medium text-xs rounded-full">
                {member.nama_departemen || "Pengurus Inti"}
              </span>
            </div>
          </div>

          {/* Body Information */}
          <div className="mt-6 space-y-4 divide-y divide-gray-100 font-inter">
            {/* Asal Kampus */}
            {member.kampus && (
              <div className="pt-4 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Asal Kampus / Institusi
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {member.kampus}
                  </span>
                </div>
              </div>
            )}

            {/* Bio / Motto */}
            <div className="pt-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Biografi & Motto
              </span>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
                <Quote size={16} className="text-primary/30 mb-1" />
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  {member.bio || "Pengurus aktif dalam mengabdi dan berkontribusi memajukan visi organisasi LISAN."}
                </p>
              </div>
            </div>

            {/* Kontak & Sosial Media */}
            <div className="pt-4 space-y-2.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Kontak & Jejaring Sosial
              </span>

              <div className="flex flex-wrap gap-2.5">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-primary text-xs font-medium transition-all"
                  >
                    <Mail size={15} />
                    <span>{member.email}</span>
                  </a>
                )}

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 text-gray-700 hover:text-pink-600 text-xs font-medium transition-all"
                  >
                    <InstagramIcon size={15} />
                    <span>Instagram</span>
                  </a>
                )}

                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-600 text-xs font-medium transition-all"
                  >
                    <LinkedinIcon size={15} />
                    <span>LinkedIn</span>
                  </a>
                )}

                {!member.email && !member.instagram && !member.linkedin && (
                  <span className="text-xs text-gray-400 italic">Kontak sosial belum ditambahkan.</span>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-inter font-semibold text-xs rounded-xl transition-colors"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── 1. Card Pengurus Inti ───────────────────────────────────────────────────
const CoreMemberCard = ({ member, onClick }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-6 border-2 border-red-100/90 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center relative overflow-hidden group cursor-pointer"
  >
    {/* Avatar Profil */}
    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary via-red-600 to-amber-500 p-0.5 shadow-md mb-4 overflow-hidden relative">
      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center text-primary font-poppins font-bold text-3xl">
        {member.foto_url ? (
          <img src={getMediaUrl(member.foto_url)} alt={member.nama} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        ) : (
          member.nama.charAt(0)
        )}
      </div>
    </div>
    
    <h3 className="font-poppins font-bold text-gray-900 text-lg leading-snug line-clamp-1">
      {member.nama}
    </h3>
    <p className="font-inter text-primary text-xs font-semibold uppercase tracking-wider mt-1 px-3 py-1 bg-red-50 rounded-full border border-red-100">
      {member.jabatan}
    </p>

    {/* Indikator Lihat Profil */}
    <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors">
      <Eye size={13} />
      <span>Lihat Profil</span>
    </div>
  </motion.div>
);

// ─── 2. Card Koordinator Departemen ───────────────────────────────────────────
const CoordinatorCard = ({ member, onClick }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    onClick={onClick}
    className="bg-gradient-to-b from-amber-50/40 via-white to-white rounded-2xl p-6 border-2 border-amber-300/80 shadow-sm hover:shadow-lg flex flex-col items-center text-center transition-all relative overflow-hidden group cursor-pointer"
  >
    {/* Avatar Profil Aksen Emas */}
    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-primary to-amber-600 p-1 shadow-md mb-4 overflow-hidden relative">
      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center text-primary font-poppins font-bold text-3xl">
        {member.foto_url ? (
          <img src={getMediaUrl(member.foto_url)} alt={member.nama} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        ) : (
          member.nama.charAt(0)
        )}
      </div>
    </div>
    
    <h3 className="font-poppins font-bold text-gray-900 text-lg leading-snug line-clamp-1">
      {member.nama}
    </h3>
    <p className="font-inter text-amber-800 text-xs font-bold uppercase tracking-wider mt-1 px-3 py-1 bg-amber-100/70 rounded-full border border-amber-200">
      {member.jabatan}
    </p>

    {/* Indikator Lihat Profil */}
    <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700/80 group-hover:text-amber-800 transition-colors">
      <Eye size={13} />
      <span>Lihat Profil</span>
    </div>
  </motion.div>
);

// ─── 3. Card Anggota Departemen ──────────────────────────────────────────────
const MemberCard = ({ member, onClick }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md flex flex-col items-center text-center transition-all relative overflow-hidden group cursor-pointer"
  >
    {/* Avatar Profil */}
    <div className="w-24 h-24 rounded-full bg-gray-100 p-0.5 shadow-sm mb-4 overflow-hidden relative border border-gray-200">
      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center text-gray-500 font-poppins font-bold text-3xl">
        {member.foto_url ? (
          <img src={getMediaUrl(member.foto_url)} alt={member.nama} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        ) : (
          member.nama.charAt(0)
        )}
      </div>
    </div>
    
    <h3 className="font-poppins font-semibold text-gray-900 text-lg leading-snug line-clamp-1">
      {member.nama}
    </h3>
    <p className="font-inter text-gray-500 text-xs font-medium uppercase tracking-wider mt-1 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
      {member.jabatan || "Anggota"}
    </p>

    {/* Indikator Lihat Profil */}
    <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-primary transition-colors">
      <Eye size={13} />
      <span>Lihat Profil</span>
    </div>
  </motion.div>
);

// ─── Main StructurePage ───────────────────────────────────────────────────────
const StructurePage = () => {
  const [depts, setDepts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

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

  // Filter Pengurus Inti (departemen_id null)
  const rawCoreMembers = staff.filter(s => !s.departemen_id);

  // Sorting Pengurus Inti: Ketua -> Bendahara -> Sekretaris (atau sesuai urutan manual)
  const sortedCoreMembers = [...rawCoreMembers].sort((a, b) => {
    const urutanA = a.urutan || 0;
    const urutanB = b.urutan || 0;

    if (urutanA > 0 && urutanB > 0 && urutanA !== urutanB) {
      return urutanA - urutanB;
    }

    const rankA = getCoreHierarchyRank(a.jabatan);
    const rankB = getCoreHierarchyRank(b.jabatan);
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return urutanA - urutanB || a.id - b.id;
  });

  const isKetua = (jabatan = "") => {
    const j = (jabatan || "").toLowerCase().trim();
    return (j.includes("ketua") || j.includes("presiden")) && !j.includes("wakil");
  };

  const topLeader = sortedCoreMembers.find(m => isKetua(m.jabatan)) || sortedCoreMembers[0];
  const otherCore = sortedCoreMembers.filter(m => m.id !== topLeader?.id);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <PageHeader 
        badge="Kepengurusan" 
        title="Struktur Organisasi" 
        subtitle="Susunan pengurus inti dan pimpinan departemen aktif LISAN" 
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-24">
        
        {loading ? (
          <div className="space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto rounded-lg" />
              <div className="h-4 w-72 bg-gray-200 animate-pulse mx-auto rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ) : (
          <>
            {/* ── 1. Section: Pengurus Inti (Ketua di Atas, Bendahara & Sekretaris di Bawah) ── */}
            {sortedCoreMembers.length > 0 && (
              <div className="space-y-10">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="font-poppins font-bold text-3xl text-gray-900">
                    Pengurus Inti
                  </h2>
                  <div className="w-12 h-1 bg-primary mx-auto mt-3 rounded-full" />
                  <p className="font-inter text-sm text-gray-500 mt-3">
                    Struktur pimpinan inti dan pengambil keputusan strategis roda organisasi LISAN
                  </p>
                </div>
                
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* Tingkat 1: Ketua Paling Atas (Tepat di Tengah) */}
                  {topLeader && (
                    <div className="flex justify-center">
                      <div className="w-full max-w-[280px]">
                        <CoreMemberCard 
                          member={topLeader} 
                          onClick={() => setSelectedMember(topLeader)} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Tingkat 2: Bendahara, Sekretaris, dll. (Berada di Bawah Ketua) */}
                  {otherCore.length > 0 && (
                    <div className="flex justify-center w-full">
                      <div className="flex flex-wrap justify-center gap-6 max-w-4xl w-full">
                        {otherCore.map((member) => (
                          <div key={member.id} className="w-full max-w-[280px]">
                            <CoreMemberCard 
                              member={member} 
                              onClick={() => setSelectedMember(member)} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 2. Section: Departemen & Pembedaan Koordinator vs Anggota ── */}
            {depts.map(dept => {
              const deptMembers = staff.filter(s => s.departemen_id === dept.id);
              
              // Pisahkan koordinator dan anggota
              const coordinators = deptMembers.filter(s => isCoordinator(s.jabatan));
              const regularMembers = deptMembers.filter(s => !isCoordinator(s.jabatan));

              return (
                <div key={dept.id} className="space-y-8 pt-8 border-t border-gray-200/60">
                  {/* Department Banner Header */}
                  <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 border ${dept.color_theme}`}>
                      <DynamiciCon name={dept.icon} size={36} />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-poppins font-bold text-2xl md:text-3xl text-gray-900">
                          {dept.nama}
                        </h3>
                        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-inter">
                          {deptMembers.length} Personil
                        </span>
                      </div>

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

                  {/* Department Personnel Breakdown */}
                  {deptMembers.length === 0 ? (
                    <div className="text-center py-6 bg-white/40 border border-dashed border-gray-200 rounded-2xl">
                      <p className="font-inter text-xs text-gray-400">Belum ada personil terdaftar di departemen ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Barisan Koordinator (Posisi di Tengah) */}
                      {coordinators.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3 max-w-md mx-auto text-center">
                            <div className="flex-1 h-px bg-amber-200/80" />
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/80 shadow-xs">
                              <Crown size={14} className="text-amber-500" />
                              <h4 className="font-poppins font-bold text-xs uppercase tracking-wider text-amber-900">
                                Koordinator Departemen
                              </h4>
                            </div>
                            <div className="flex-1 h-px bg-amber-200/80" />
                          </div>

                          <div className="flex justify-center w-full">
                            <div className="flex flex-wrap justify-center gap-6 max-w-3xl w-full">
                              {coordinators.map(c => (
                                <div key={c.id} className="w-full max-w-[280px]">
                                  <CoordinatorCard 
                                    member={c} 
                                    onClick={() => setSelectedMember(c)} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Barisan Anggota */}
                      {regularMembers.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-gray-600">
                              Anggota Departemen ({regularMembers.length})
                            </h4>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {regularMembers.map(m => (
                              <MemberCard 
                                key={m.id} 
                                member={m} 
                                onClick={() => setSelectedMember(m)} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

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

      {/* Modal Detail Profil Pengurus */}
      <AnimatePresence>
        {selectedMember && (
          <ProfileDetailModal 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StructurePage;
