import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  CalendarDays,
  Image as ImageIcon,
  HeartHandshake,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  MonitorPlay,
  Building2,
  MapPin,
  Droplets,
  Heart,
  Phone,
  ArrowRight,
  Clock
} from "lucide-react";

const sidebarGroups = [
  {
    title: "Menu Utama",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    ]
  },
  {
    title: "Profil & Struktur",
    links: [
      { icon: Building2, label: "Kelola Profil", path: "/admin/profil" },
      { icon: MapPin, label: "Koordinator Wilayah", path: "/admin/korwil" },
      { icon: Users, label: "Struktur & Divisi", path: "/admin/struktur" },
    ]
  },
  {
    title: "Media & Publikasi",
    links: [
      { icon: Newspaper, label: "Kelola Berita", path: "/admin/berita" },
      { icon: FileText, label: "Kelola Artikel", path: "/admin/artikel" },
      { icon: ImageIcon, label: "Kelola Galeri", path: "/admin/galeri" },
    ]
  },
  {
    title: "Program & Sosial",
    links: [
      { icon: CalendarDays, label: "Kelola Program", path: "/admin/program" },
      { icon: CalendarDays, label: "Monitoring Proker", path: "/admin/proker" },
      { icon: HeartHandshake, label: "Lingkar Donor", path: "/admin/donor" },
    ]
  },
  {
    title: "Interaksi & Anggota",
    links: [
      { icon: Users, label: "Data Relawan", path: "/admin/relawan" },
      { icon: Users, label: "Daftar Kader", path: "/admin/kader" },
      { icon: MessageSquare, label: "Pesan Kontak", path: "/admin/pesan" },
    ]
  },
  {
    title: "Sistem",
    links: [
      { icon: MonitorPlay, label: "Kelola Slider", path: "/admin/hero" },
      { icon: Settings, label: "Pengaturan & Navbar", path: "/admin/pengaturan" },
    ]
  }
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Notification state specifically for blood requests
  const [bloodCount, setBloodCount] = useState(0);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Poll for emergency blood request notifications
  useEffect(() => {
    const fetchBloodNotifications = async () => {
      try {
        const response = await api.get('/pesan/blood-notifications');
        setBloodCount(response.data.count || 0);
        setBloodRequests(response.data.requests || []);
      } catch (error) {
        console.error('Failed to fetch blood notifications', error);
      }
    };

    fetchBloodNotifications();
    // Poll every 25 seconds for real-time responsiveness
    const interval = setInterval(fetchBloodNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen max-h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen max-h-screen bg-dark text-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
        }}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden border border-white/10">
              <img src="/lisan.jpeg" alt="Logo LISAN" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-poppins font-bold text-lg leading-none tracking-wide">LISAN Admin</div>
              <div className="font-inter text-[10px] text-secondary mt-1 uppercase tracking-widest">Dashboard Panel</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {sidebarGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  const isPesanMenu = link.path === "/admin/pesan";

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-transparent text-white border-l-4 border-primary"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          size={20}
                          className={`transition-colors shrink-0 ${
                            isActive ? "text-secondary" : "group-hover:text-gray-300"
                          }`}
                        />
                        <span className="font-inter font-medium text-sm truncate">{link.label}</span>
                      </div>

                      {/* Red Blood Request Badge exclusively on Pesan Kontak */}
                      {isPesanMenu && bloodCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-inter font-bold tracking-tight animate-pulse shadow-sm shadow-red-500/50">
                          <Droplets size={10} className="fill-white" />
                          {bloodCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 border border-transparent rounded-xl transition-all duration-200 font-inter font-medium text-sm group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Exclusive Blood Request Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setIsBellOpen(!isBellOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${
                  bloodCount > 0
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                title={bloodCount > 0 ? `${bloodCount} Permohonan Butuh Darah Baru!` : "Tidak ada permohonan darah"}
              >
                <Bell size={20} className={bloodCount > 0 ? "animate-bounce" : ""} />
                
                {bloodCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                    {bloodCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              <AnimatePresence>
                {isBellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Popover Header */}
                    <div className="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets size={18} className="fill-white" />
                        <h4 className="font-poppins font-bold text-sm">Permohonan Butuh Darah</h4>
                      </div>
                      <span className="text-[11px] font-inter font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                        {bloodCount} Mendesak
                      </span>
                    </div>

                    {/* Popover Content */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                      {bloodRequests.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Heart size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="font-inter text-sm font-medium">Tidak ada permohonan darah aktif</p>
                          <p className="font-inter text-xs text-gray-400 mt-1">Semua permintaan darah telah ditangani.</p>
                        </div>
                      ) : (
                        bloodRequests.map((req) => (
                          <div
                            key={req.id}
                            className="p-4 hover:bg-red-50/40 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-poppins font-bold text-xs border border-red-200">
                                  Golongan {req.bloodType}
                                </span>
                                <h5 className="font-poppins font-bold text-sm text-gray-900 mt-1">
                                  Pasien: {req.patientName}
                                </h5>
                              </div>
                              <span className="text-[10px] font-inter text-gray-400 flex items-center gap-1 shrink-0">
                                <Clock size={10} />
                                {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>

                            <div className="text-xs font-inter text-gray-600 space-y-0.5">
                              <p><span className="text-gray-400">Rumah Sakit:</span> {req.hospital}</p>
                              <p><span className="text-gray-400">Kebutuhan:</span> {req.quantity} ({req.reason})</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center gap-2">
                              {req.phone && (
                                <a
                                  href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-inter text-xs font-semibold transition-colors"
                                >
                                  <Phone size={12} />
                                  WhatsApp
                                </a>
                              )}
                              <Link
                                to="/admin/pesan"
                                onClick={() => setIsBellOpen(false)}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-inter text-xs font-semibold transition-colors"
                              >
                                Tinjau
                                <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Popover Footer */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                      <Link
                        to="/admin/pesan"
                        onClick={() => setIsBellOpen(false)}
                        className="font-inter text-xs font-semibold text-primary hover:text-red-800 transition-colors"
                      >
                        Buka Kotak Masuk Permohonan Darah &rarr;
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-poppins font-semibold text-gray-800">{user?.name}</div>
                <div className="text-xs font-inter text-gray-500">{user?.email}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-poppins font-bold shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
