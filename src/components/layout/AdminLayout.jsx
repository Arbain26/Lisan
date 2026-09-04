import { useState, useEffect } from "react";
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
  Search,
  MonitorPlay,
  Building2,
  MapPin,
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
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/proker/notifications');
        setUnreadNotifications(response.data.length);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-dark text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
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
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-transparent text-white border-l-4 border-primary"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-4 border-transparent"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`transition-colors ${
                          isActive ? "text-secondary" : "group-hover:text-gray-300"
                        }`}
                      />
                      <span className="font-inter font-medium text-sm">{link.label}</span>
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
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link to="/admin/proker" className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors block">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] font-bold rounded-full border border-white flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>

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
