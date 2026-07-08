import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";

import {
  AboutPage,
  StructurePage,
  ProgramsPage,
  DonorPage,
  NewsPage,
  GalleryPage,
  ContactPage,
  JoinPage,
  SejarahPage,
  VisiMisiPage,
  NilaiOrganisasiPage,
  DepartemenPage,
  KorwilPage,
  NewsDetailPage
} from "./pages/index.jsx";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Berita from "./pages/admin/Berita";
import Artikel from "./pages/admin/Artikel";
import Program from "./pages/admin/Program";
import Galeri from "./pages/admin/Galeri";
import Donor from "./pages/admin/Donor";
import Relawan from "./pages/admin/Relawan";
import Pesan from "./pages/admin/Pesan";
import Pengaturan from "./pages/admin/Pengaturan";
import HeroSlides from "./pages/admin/HeroSlides";
import Struktur from "./pages/admin/Struktur";

// Providers
import { ToastProvider } from "./components/ui/ToastProvider";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* Public Routes with Navbar & Footer */}
            <Route element={<Layout />}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/sejarah" element={<PageTransition><SejarahPage /></PageTransition>} />
              <Route path="/visi-misi" element={<PageTransition><VisiMisiPage /></PageTransition>} />
              <Route path="/nilai-organisasi" element={<PageTransition><NilaiOrganisasiPage /></PageTransition>} />
              
              <Route path="/structure" element={<PageTransition><StructurePage /></PageTransition>} />
              <Route path="/departemen" element={<PageTransition><DepartemenPage /></PageTransition>} />
              <Route path="/koordinator-wilayah" element={<PageTransition><KorwilPage /></PageTransition>} />
              
              <Route path="/programs" element={<PageTransition><ProgramsPage /></PageTransition>} />
              <Route path="/donor" element={<PageTransition><DonorPage /></PageTransition>} />
              <Route path="/news" element={<PageTransition><NewsPage /></PageTransition>} />
              <Route path="/news/:id" element={<PageTransition><NewsDetailPage /></PageTransition>} />
              <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
              <Route path="/join" element={<PageTransition><JoinPage /></PageTransition>} />
            </Route>

            {/* Auth Route */}
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="berita" element={<PageTransition><Berita /></PageTransition>} />
              <Route path="artikel" element={<PageTransition><Artikel /></PageTransition>} />
              <Route path="hero" element={<PageTransition><HeroSlides /></PageTransition>} />
              <Route path="program" element={<PageTransition><Program /></PageTransition>} />
              <Route path="galeri" element={<PageTransition><Galeri /></PageTransition>} />
              <Route path="donor" element={<PageTransition><Donor /></PageTransition>} />
              <Route path="relawan" element={<PageTransition><Relawan /></PageTransition>} />
              <Route path="pesan" element={<PageTransition><Pesan /></PageTransition>} />
              <Route path="struktur" element={<PageTransition><Struktur /></PageTransition>} />
              <Route path="pengaturan" element={<PageTransition><Pengaturan /></PageTransition>} />
            </Route>
            
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
