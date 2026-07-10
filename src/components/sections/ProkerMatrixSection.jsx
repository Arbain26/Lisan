import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  Search,
  X,
  User,
  Info,
  Loader2
} from "lucide-react";
import axios from "axios";

const ProkerMatrixSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  
  const [prokers, setProkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2025/2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [indicatorFilter, setIndicatorFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  // Public proof modal state
  const [selectedSched, setSelectedSched] = useState(null);
  const [selectedProkerName, setSelectedProkerName] = useState("");

  const monthsOrder = ['Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli'];

  const fetchPublicProkers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/proker/public", {
        params: { tahun: selectedYear }
      });
      setProkers(response.data);
    } catch (error) {
      console.error("Error fetching public prokers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProkers();
  }, [selectedYear]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProkers = prokers.filter(p => {
    const matchesSearch = 
      p.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.penanggung_jawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesIndicator = indicatorFilter ? p.indicator === indicatorFilter : true;
    return matchesSearch && matchesIndicator;
  });

  const renderIndicator = (color) => {
    const config = {
      green: { bg: "bg-emerald-500", text: "Sesuai Target", ping: "bg-emerald-400" },
      yellow: { bg: "bg-amber-500", text: "Perlu Perhatian", ping: "bg-amber-400" },
      red: { bg: "bg-rose-500", text: "Terlambat / Deviasi", ping: "bg-rose-400" }
    };
    const c = config[color] || config.green;
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${c.bg}`}></span>
        </span>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{c.text}</span>
      </div>
    );
  };

  return (
    <section ref={ref} className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 text-xs font-inter font-semibold uppercase tracking-widest">Akuntabilitas & Transparansi</span>
          </div>
          <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-dark mb-4 leading-tight">
            Matriks & Progres Realisasi <span className="text-primary">Kegiatan</span>
          </h2>
          <p className="font-inter text-gray-500 leading-relaxed">
            Pantau dan ikuti pelaksanaan program kerja LISAN secara real-time. Transparansi bukti pelaksanaan kegiatan untuk menjamin amanah organisasi.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-150 flex flex-col md:flex-row gap-4 mb-8 shadow-sm">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari program kerja, kode, atau penanggung jawab..."
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-inter font-semibold text-gray-700 focus:outline-none shadow-sm"
            >
              <option value="2025/2026">Tahun: 2025/2026</option>
              <option value="2026/2027">Tahun: 2026/2027</option>
              <option value="2027/2028">Tahun: 2027/2028</option>
            </select>

            <select
              value={indicatorFilter}
              onChange={(e) => setIndicatorFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-inter font-semibold text-gray-700 focus:outline-none shadow-sm"
            >
              <option value="">Semua Indikator</option>
              <option value="green">🟢 Sesuai Jadwal</option>
              <option value="yellow">🟡 Perlu Perhatian</option>
              <option value="red">🔴 Terlambat</option>
            </select>
          </div>
        </div>

        {/* Matrix List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-inter text-gray-500 font-medium">Memuat data realisasi kegiatan...</p>
            </div>
          ) : filteredProkers.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="text-4xl">📊</div>
              <h3 className="font-poppins font-bold text-gray-800 text-lg">Tidak ada data ditemukan</h3>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">Coba ubah kata kunci pencarian atau ganti filter tahun kepengurusan.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-150">
              {filteredProkers.map((p) => {
                const isExpanded = !!expandedRows[p.id];
                return (
                  <div key={p.id} className="transition-colors hover:bg-gray-50/20">
                    {/* Row Header */}
                    <div 
                      onClick={() => toggleRow(p.id)}
                      className="px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <span className="text-[11px] font-bold font-inter px-2 py-0.5 rounded bg-gray-100 text-gray-600 tracking-wide border border-gray-200">
                            {p.kode}
                          </span>
                          {renderIndicator(p.indicator)}
                        </div>
                        <h3 className="font-poppins font-bold text-lg text-gray-900 truncate">
                          {p.kegiatan}
                        </h3>
                        <p className="text-xs text-gray-500 font-inter font-medium flex items-center gap-1 mt-1">
                          <User size={13} className="text-primary" />
                          <span>PJ: {p.penanggung_jawab}</span>
                        </p>
                      </div>

                      <div className="w-full lg:w-72 shrink-0 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold font-inter text-gray-500">
                          <span>Realisasi: {p.schedules.filter(s => s.status === 'Terlaksana').length} / {p.schedules.length} Kegiatan</span>
                          <span className={p.progres === 100 ? "text-emerald-600 font-extrabold" : "text-gray-800"}>
                            {Math.round(p.progres)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              p.progres === 100 
                                ? "bg-emerald-500" 
                                : p.indicator === 'red' 
                                ? "bg-rose-500" 
                                : p.indicator === 'yellow' 
                                ? "bg-amber-500" 
                                : "bg-primary"
                            }`}
                            style={{ width: `${p.progres}%` }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 flex justify-end">
                        <button className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200/50">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Grid */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-gray-50/50 border-t border-gray-100 pt-5">
                        <div className="space-y-5">
                          <p className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-primary" />
                            Timeline Matriks Kerja (Klik tanggal dengan simbol gambar <ImageIcon size={10} className="inline text-emerald-500" /> untuk melihat bukti dokumentasi pelaksanaan)
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                            {monthsOrder.map(month => {
                              const monthSchedules = p.schedules.filter(s => s.bulan.toLowerCase() === month.toLowerCase());
                              return (
                                <div key={month} className="bg-white rounded-2xl p-3.5 border border-gray-200/60 shadow-sm min-h-[90px] flex flex-col">
                                  <span className="font-poppins font-bold text-[11px] text-gray-400 border-b border-gray-100 pb-1.5 mb-2 block uppercase tracking-wider">
                                    {month}
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 flex-grow content-start">
                                    {monthSchedules.length === 0 ? (
                                      <span className="text-[10px] text-gray-400 italic font-medium mt-1">Tidak ada jadwal</span>
                                    ) : (
                                      monthSchedules.map(sched => {
                                        const isCompleted = sched.status === 'Terlaksana';
                                        const isFailed = sched.status === 'Tidak Terlaksana';
                                        const hasProof = !!sched.foto_url || !!sched.keterangan;

                                        return (
                                          <button
                                            key={sched.id}
                                            disabled={!isCompleted || !hasProof}
                                            onClick={() => {
                                              if (isCompleted && hasProof) {
                                                setSelectedSched(sched);
                                                setSelectedProkerName(p.kegiatan);
                                              }
                                            }}
                                            className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all text-left w-full flex items-center justify-between ${
                                              isCompleted
                                                ? "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100"
                                                : isFailed
                                                ? "bg-rose-50 text-rose-800 border-rose-100"
                                                : "bg-gray-50 text-gray-500 border-gray-100"
                                            } ${isCompleted && hasProof ? 'cursor-pointer hover:-translate-y-[1px]' : 'cursor-default'}`}
                                          >
                                            <span className="truncate max-w-[80%]">{sched.tanggal}</span>
                                            <div className="flex items-center gap-0.5">
                                              {isCompleted && hasProof && <ImageIcon size={10} className="text-emerald-500 mr-0.5" />}
                                              {isCompleted && <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />}
                                              {isFailed && <XCircle size={11} className="text-rose-600 shrink-0" />}
                                              {!isCompleted && !isFailed && <Clock size={11} className="text-gray-300 shrink-0" />}
                                            </div>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DOKUMENTASI PROOF MODAL */}
      <AnimatePresence>
        {selectedSched && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSched(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-gray-100 w-full max-w-lg"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <span className="text-[10px] font-bold font-inter bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    KEGIATAN TERLAKSANA
                  </span>
                  <h4 className="font-poppins font-extrabold text-gray-900 mt-1.5 leading-snug">
                    {selectedProkerName}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedSched(null)}
                  className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 border border-gray-200 rounded-full transition-all shrink-0 ml-4 shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5">
                {/* Photo */}
                {selectedSched.foto_url ? (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video shadow-inner bg-gray-50 flex items-center justify-center">
                    <img 
                      src={`http://localhost:5000${selectedSched.foto_url}`} 
                      alt="Dokumentasi Pelaksanaan" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 border-dashed text-gray-400 flex flex-col items-center gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs font-semibold">Foto dokumentasi tidak diunggah</span>
                  </div>
                )}

                {/* Notes details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Info size={14} className="text-primary" />
                    <span>Laporan Pelaksanaan ({selectedSched.bulan} - {selectedSched.tanggal})</span>
                  </div>
                  <div className="bg-emerald-50/30 border border-emerald-100/60 p-4 rounded-2xl">
                    <p className="text-sm font-inter text-gray-700 leading-relaxed font-semibold">
                      {selectedSched.keterangan || "Tidak ada keterangan catatan pelaksanaan yang ditambahkan."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedSched(null)}
                  className="px-5 py-2.5 rounded-xl font-inter font-bold text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Tutup Laporan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProkerMatrixSection;
