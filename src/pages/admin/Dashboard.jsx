import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Newspaper, 
  FileText, 
  CalendarDays, 
  ImageIcon, 
  HeartHandshake, 
  Users, 
  MessageSquare, 
  ArrowUpRight, 
  Plus, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Bell,
  Droplets,
  Heart,
  Phone,
  ArrowRight,
  Hospital,
  AlertCircle
} from "lucide-react";

import { useState, useEffect } from "react";
import api from "../../services/api";

const recentActivities = [
  { id: 1, action: "Menambahkan berita baru", target: "LISAN Sukses Gelar Summit 2026", time: "2 jam yang lalu", type: "berita" },
  { id: 2, action: "Mengunggah 5 foto ke", target: "Galeri Donor Darah", time: "5 jam yang lalu", type: "galeri" },
  { id: 3, action: "Memperbarui status program", target: "Kajian Rutin Mingguan", time: "Kemarin, 14:30", type: "program" },
  { id: 4, action: "Menerima pesan baru dari", target: "Budi Santoso", time: "Kemarin, 09:15", type: "pesan" },
  { id: 5, action: "Menambahkan relawan", target: "Siti Aminah", time: "2 hari yang lalu", type: "relawan" },
];

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    berita: 0,
    program: 0,
    galeri: 0,
    relawan: 0,
    pesan: 0,
    proker: 0,
    urgentBloodRequests: [],
    urgentBloodCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [prokerStats, setProkerStats] = useState(null);
  const [prokerAlerts, setProkerAlerts] = useState([]);
  const [loadingProker, setLoadingProker] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchProkerDashboard = async () => {
      try {
        const statsRes = await api.get('/proker/dashboard');
        setProkerStats(statsRes.data.stats);
        
        const alertsRes = await api.get('/proker/notifications');
        setProkerAlerts(alertsRes.data.slice(0, 3)); // show top 3 alerts
      } catch (error) {
        console.error("Failed to fetch proker dashboard in main admin dashboard", error);
      } finally {
        setLoadingProker(false);
      }
    };

    fetchStats();
    fetchProkerDashboard();
  }, []);

  const stats = [
    { title: "Total Berita", value: loadingStats ? "..." : dashboardStats.berita, icon: Newspaper, color: "text-blue-500", bg: "bg-blue-500/10", trend: "Live" },
    { title: "Program Kerja (Proker)", value: loadingStats ? "..." : dashboardStats.proker, icon: CalendarDays, color: "text-rose-500", bg: "bg-rose-500/10", trend: "Live" },
    { title: "Total Program", value: loadingStats ? "..." : dashboardStats.program, icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Live" },
    { title: "Foto Galeri", value: loadingStats ? "..." : dashboardStats.galeri, icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Live" },
    { 
      title: "Total Relawan", 
      value: loadingStats ? "..." : dashboardStats.relawan, 
      icon: Users, 
      color: "text-secondary", 
      bg: "bg-secondary/10", 
      trend: "Live" 
    },
    { 
      title: "Pesan Masuk", 
      value: loadingStats ? "..." : dashboardStats.pesan, 
      urgentBadge: dashboardStats.urgentBloodCount > 0 ? `${dashboardStats.urgentBloodCount} Butuh Darah` : null,
      icon: MessageSquare, 
      color: dashboardStats.urgentBloodCount > 0 ? "text-red-600" : "text-primary", 
      bg: dashboardStats.urgentBloodCount > 0 ? "bg-red-50" : "bg-primary/10", 
      trend: dashboardStats.urgentBloodCount > 0 ? "Mendesak" : "Live" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-2">
              Selamat datang kembali, Admin! 👋
            </h1>
            <p className="text-gray-500 font-inter">
              Berikut adalah ringkasan aktivitas dan performa website LISAN hari ini.
            </p>
          </div>
          <Link to="/admin/berita" className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-5 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
            <Plus size={18} />
            Buat Post Baru
          </Link>
        </div>
      </div>

      {/* Emergency Blood Request Alert Banner - ONLY SHOWN WHEN BLOOD REQUESTS EXIST */}
      {dashboardStats.urgentBloodCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-600/20 border border-red-500 relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          {/* Banner Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/20">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                <Droplets size={26} className="text-white fill-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-red-700 font-inter font-bold text-[11px] uppercase tracking-wider shadow-sm">
                    Mendesak
                  </span>
                  <span className="text-xs font-inter text-red-100 font-medium">
                    Notifikasi Darah LISAN
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-poppins font-bold text-white mt-1">
                  Ada {dashboardStats.urgentBloodCount} Permohonan Butuh Darah Baru!
                </h2>
              </div>
            </div>

            <Link
              to="/admin/pesan"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-700 hover:bg-red-50 px-5 py-2.5 rounded-xl font-inter font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 self-start md:self-auto"
            >
              <span>Buka Kotak Masuk</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* List of Urgent Blood Requests */}
          <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardStats.urgentBloodRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-3 py-1 rounded-xl bg-white text-red-700 font-poppins font-black text-sm shadow-sm">
                      Golongan {req.bloodType}
                    </span>
                    <span className="text-[11px] font-inter text-red-100">
                      {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-poppins font-bold text-base text-white">
                      Pasien: {req.patientName}
                    </h3>
                    <p className="font-inter text-xs text-red-100 mt-0.5">
                      Jumlah: <span className="font-bold text-white">{req.quantity}</span> ({req.reason})
                    </p>
                  </div>

                  <div className="text-xs font-inter text-red-100 space-y-1 pt-1 border-t border-white/10">
                    <p className="flex items-center gap-1.5">
                      <Hospital size={12} className="shrink-0 text-white" />
                      <span className="truncate">{req.hospital}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} className="shrink-0 text-white" />
                      <span className="truncate">{req.name} ({req.phone})</span>
                    </p>
                  </div>
                </div>

                {/* Direct Action Button to WhatsApp */}
                {req.phone && (
                  <a
                    href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-inter font-bold text-xs transition-colors shadow-sm"
                  >
                    <Phone size={13} />
                    Hubungi Pemohon via WA
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.urgentBadge ? (
                <span className="flex items-center gap-1 text-[11px] font-inter font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                  <Droplets size={10} className="fill-red-700" />
                  {stat.urgentBadge}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-inter font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  {stat.trend}
                  <ArrowUpRight size={12} />
                </span>
              )}
            </div>
            <h3 className="text-gray-500 font-inter text-xs mb-1">{stat.title}</h3>
            <div className="text-2xl font-poppins font-bold text-gray-900 mt-auto">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Proker Monitoring Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proker Status Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-poppins font-bold text-lg text-gray-900">Kesehatan Program Kerja (Proker)</h2>
              <Link to="/admin/proker" className="text-sm font-inter text-primary hover:text-red-800 font-medium transition-colors">
                Kelola Matriks Proker &rarr;
              </Link>
            </div>
            {loadingProker ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : prokerStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium font-inter mb-1">Total Proker</p>
                  <p className="text-2xl font-bold font-poppins text-gray-800">{prokerStats.total}</p>
                </div>
                <div className="p-4 bg-emerald-50 text-center rounded-xl border border-emerald-100/50">
                  <p className="text-xs text-emerald-600 font-semibold font-inter mb-1">Selesai</p>
                  <p className="text-2xl font-bold font-poppins text-emerald-700">{prokerStats.completed}</p>
                </div>
                <div className="p-4 bg-blue-50 text-center rounded-xl border border-blue-100/50">
                  <p className="text-xs text-blue-600 font-semibold font-inter mb-1">Berjalan</p>
                  <p className="text-2xl font-bold font-poppins text-blue-700">{prokerStats.running}</p>
                </div>
                <div className="p-4 bg-rose-50 text-center rounded-xl border border-rose-100/50">
                  <p className="text-xs text-rose-600 font-semibold font-inter mb-1">Terlambat</p>
                  <p className="text-2xl font-bold font-poppins text-rose-700">{prokerStats.delayed}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-inter italic py-4">Belum ada data Program Kerja. Unggah melalui menu Kelola Matriks Proker.</p>
            )}
          </div>
          {prokerStats && prokerStats.total > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
                <span>Rasio Capaian Target Organisasi</span>
                <span>{Math.round((prokerStats.completed / prokerStats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${(prokerStats.completed / prokerStats.total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Proker Critical Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                Peringatan Kendala
              </h2>
              {prokerAlerts.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              )}
            </div>
            {loadingProker ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : prokerAlerts.length > 0 ? (
              <div className="space-y-3">
                {prokerAlerts.map(alert => (
                  <div key={alert.id} className="p-3 bg-rose-50/30 border border-rose-100 rounded-xl flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 font-medium font-inter line-clamp-2 leading-relaxed" title={alert.message}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-xs font-semibold text-gray-500">Semua target berjalan aman</p>
              </div>
            )}
          </div>
          <Link to="/admin/proker" className="mt-4 text-xs font-semibold text-center text-primary hover:text-red-800 transition-colors pt-3 border-t border-gray-100 block">
            Lihat Semua Peringatan &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-poppins font-bold text-lg text-gray-900">Aktivitas Terbaru</h2>
            <Link to="/admin/berita" className="text-sm font-inter text-primary hover:text-red-800 font-medium transition-colors">
              Lihat Semua
            </Link>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-6">
              {recentActivities.map((activity, i) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Timeline line */}
                  {i !== recentActivities.length - 1 && (
                    <div className="absolute top-8 left-4 bottom-[-24px] w-0.5 bg-gray-100" />
                  )}
                  
                  {/* Dot */}
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  
                  {/* Content */}
                  <div>
                    <p className="font-inter text-sm text-gray-600">
                      {activity.action} <span className="font-medium text-gray-900">{activity.target}</span>
                    </p>
                    <p className="font-inter text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links / Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-poppins font-bold text-lg text-gray-900 mb-6">Status Sistem</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-inter text-sm font-medium text-gray-700">Database</span>
              </div>
              <span className="font-inter text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Normal</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-inter text-sm font-medium text-gray-700">Storage Server</span>
              </div>
              <span className="font-inter text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Normal</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-inter text-sm font-medium text-gray-700">Web Analytics</span>
              </div>
              <span className="font-inter text-xs text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">Syncing</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-poppins font-semibold text-sm text-gray-900 mb-4">Akses Cepat</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/berita" className="p-3 bg-gray-50 hover:bg-red-50 hover:text-primary text-gray-600 rounded-xl font-inter text-xs font-medium transition-colors text-center border border-gray-100 block">
                Kelola Berita
              </Link>
              <Link to="/admin/relawan" className="p-3 bg-gray-50 hover:bg-amber-50 hover:text-secondary text-gray-600 rounded-xl font-inter text-xs font-medium transition-colors text-center border border-gray-100 block">
                Data Relawan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
