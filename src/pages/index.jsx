import { motion } from "framer-motion";

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

const ComingSoon = ({ title, subtitle, badge }) => (
  <div className="min-h-screen flex flex-col">
    <PageHeader title={title} subtitle={subtitle} badge={badge} />
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-24 px-4"
      >
        <div className="text-8xl mb-6">🏗️</div>
        <h2 className="font-poppins font-bold text-2xl text-dark mb-3">Halaman Sedang Dibangun</h2>
        <p className="font-inter text-gray-500 max-w-sm mx-auto">
          Konten lengkap untuk halaman ini akan segera hadir. Terima kasih atas kesabaran Anda.
        </p>
      </motion.div>
    </div>
  </div>
);

import ProgramsPage from './ProgramsPage';
import DonorPage from './DonorPage';
import GalleryPage from './GalleryPage';
import NewsPage from './NewsPage';
import NewsDetailPage from './NewsDetailPage';
import SejarahPage from './public/SejarahPage';
import VisiMisiPage from './public/VisiMisiPage';
import NilaiOrganisasiPage from './public/NilaiOrganisasiPage';
import DepartemenPage from './public/DepartemenPage';
import KorwilPage from './public/KorwilPage';
import StructurePage from './public/StructurePage';
import ContactPage from './public/ContactPage';
import AboutPage from './public/AboutPage';

export { 
  AboutPage,
  GalleryPage, NewsPage, NewsDetailPage, ProgramsPage, DonorPage,
  SejarahPage, VisiMisiPage, NilaiOrganisasiPage, DepartemenPage, KorwilPage,
  StructurePage, ContactPage
};
export const JoinPage = () => <ComingSoon badge="Bergabung" title="Daftar Member" subtitle="Jadilah bagian dari gerakan LISAN" />;
