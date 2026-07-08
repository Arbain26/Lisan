import { Link } from "react-router-dom";
import { Share2, Globe, Send, Link as LinkIcon, MapPin, Phone, Mail, Heart } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "About LISAN", path: "/about" },
    { label: "Organization Structure", path: "/structure" },
    { label: "Programs", path: "/programs" },
    { label: "Lingkar Donor Sidrap", path: "/donor" },
    { label: "News & Articles", path: "/news" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
    { label: "Join Member", path: "/join" },
  ];

  const socials = [
    { icon: <Share2 size={18} />, href: "#", label: "Facebook" },
    { icon: <Globe size={18} />, href: "#", label: "Instagram" },
    { icon: <Send size={18} />, href: "#", label: "Twitter" },
    { icon: <LinkIcon size={18} />, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-dark text-white">
      {/* Top Accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden border border-white/10">
                <img src="/lisan.jpeg" alt="Logo LISAN" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white font-poppins font-bold text-xl leading-none">LISAN</div>
                <div className="text-secondary text-xs font-inter leading-none mt-1">Lingkar Mahasiswa Islam untuk Perubahan</div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm font-inter leading-relaxed mb-6">
              Building intellectual, progressive, and Islamic generations for a better and more just future Indonesia.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-secondary hover:text-dark flex items-center justify-center text-gray-400 hover:text-dark transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-5 text-sm uppercase tracking-widest text-secondary">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white text-sm font-inter transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-secondary group-hover:w-2 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-white mb-5 text-sm uppercase tracking-widest text-secondary">Media</h4>
            <ul className="space-y-2.5">
              {quickLinks.slice(4).map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white text-sm font-inter transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-secondary group-hover:w-2 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-5 text-sm uppercase tracking-widest text-secondary">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm font-inter leading-relaxed">
                  Jl. Mahasiswa No. 1, Sidenreng Rappang, Sulawesi Selatan, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-secondary flex-shrink-0" />
                <a href="tel:+6281234567890" className="text-gray-400 hover:text-white text-sm font-inter transition-colors">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-secondary flex-shrink-0" />
                <a href="mailto:lisan@email.com" className="text-gray-400 hover:text-white text-sm font-inter transition-colors">
                  lisan@email.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-inter">
            © {new Date().getFullYear()} LISAN — Lingkar Mahasiswa Islam untuk Perubahan. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs font-inter flex items-center gap-1.5">
            Made with <Heart size={12} className="text-primary" /> by LISAN Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
