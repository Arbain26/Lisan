import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Newspaper, FileText, CalendarDays, ImageIcon, HeartHandshake, Users, MessageSquare, ArrowUpRight, Plus } from "lucide-react";

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
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
    fetchStats();
  }, []);

  const stats = [
    { title: "Total Berita", value: loadingStats ? "..." : dashboardStats.berita, icon: Newspaper, color: "text-blue-500", bg: "bg-blue-500/10", trend: "Live" },
    { title: "Total Program", value: loadingStats ? "..." : dashboardStats.program, icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Live" },
    { title: "Foto Galeri", value: loadingStats ? "..." : dashboardStats.galeri, icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Live" },
    { title: "Total Relawan", value: loadingStats ? "..." : dashboardStats.relawan, icon: Users, color: "text-secondary", bg: "bg-secondary/10", trend: "Live" },
    { title: "Pesan Masuk", value: loadingStats ? "..." : dashboardStats.pesan, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10", trend: "Live" },
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
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
              <span className="flex items-center gap-1 text-xs font-inter font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                {stat.trend}
                <ArrowUpRight size={12} />
              </span>
            </div>
            <h3 className="text-gray-500 font-inter text-sm mb-1">{stat.title}</h3>
            <div className="text-3xl font-poppins font-bold text-gray-900">{stat.value}</div>
          </motion.div>
        ))}
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
