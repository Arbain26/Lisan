import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../services/api";

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

const ContactPage = () => {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  // Fetch settings for contact info
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings");
        setSettings(response.data);
      } catch (err) {
        console.error("Gagal memuat info kontak:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      await api.post("/pesan", formData);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        badge="Hubungi Kami"
        title="Kontak LISAN"
        subtitle="Sampaikan pesan, saran, pertanyaan, atau permohonan kolaborasi kepada kami"
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Side: Contact Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
              <div>
                <h2 className="font-poppins font-bold text-2xl text-gray-900">Hubungi Langsung</h2>
                <p className="font-inter text-sm text-gray-500 mt-2">
                  Gunakan informasi berikut untuk menghubungi sekretariat atau pengurus harian LISAN.
                </p>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 text-sm">Sekretariat Resmi</h4>
                    <p className="font-inter text-sm text-gray-600 mt-1 leading-relaxed">
                      {loadingSettings ? "Memuat alamat..." : settings?.alamat || "Jl. Jenderal Sudirman No. 123, Sidenreng Rappang, Sulawesi Selatan"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 text-sm">Nomor Telepon / WhatsApp</h4>
                    <p className="font-inter text-sm text-gray-600 mt-1">
                      {loadingSettings ? (
                        "Memuat nomor..."
                      ) : (
                        <a href={`tel:${settings?.telepon?.replace(/[^\d+]/g, "") || "+6281234567890"}`} className="hover:text-primary transition-colors font-medium">
                          {settings?.telepon || "+62 812-3456-7890"}
                        </a>
                      )}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/60 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 text-sm">Email Resmi</h4>
                    <p className="font-inter text-sm text-gray-600 mt-1">
                      {loadingSettings ? (
                        "Memuat email..."
                      ) : (
                        <a href={`mailto:${settings?.email || "info@lisan.id"}`} className="hover:text-primary transition-colors font-medium">
                          {settings?.email || "info@lisan.id"}
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder or additional info card */}
            <div className="bg-gradient-to-br from-dark to-slate-900 text-white rounded-3xl p-8 border border-white/5 shadow-sm space-y-4">
              <h4 className="font-poppins font-bold text-lg text-secondary">Jam Operasional Sekretariat</h4>
              <p className="font-inter text-sm text-gray-300 leading-relaxed">
                Kami siap menerima kunjungan langsung atau perwakilan mahasiswa setiap hari **Senin – Sabtu** mulai pukul **09:00 - 17:00 WITA**.
              </p>
            </div>
          </motion.div>

          {/* Right Side: Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm"
          >
            <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-6">Kirim Pesan</h2>

            <AnimatePresence mode="wait">
              {submitStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center text-center py-10 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-gray-900">Pesan Terkirim!</h3>
                  <p className="font-inter text-gray-500 text-sm max-w-sm">
                    Terima kasih telah menghubungi kami. Pesan Anda berhasil dikirim ke kotak masuk admin LISAN. Kami akan segera menghubungi Anda kembali melalui email.
                  </p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-inter font-medium rounded-xl transition-colors text-sm"
                  >
                    Kirim Pesan Lain
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {submitStatus === "error" && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-inter">
                      <AlertCircle size={20} className="shrink-0" />
                      <span>Terjadi kesalahan saat mengirim pesan. Silakan coba beberapa saat lagi.</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-medium text-gray-700">Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-medium text-gray-700">Alamat Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Contoh: nama@domain.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-medium text-gray-700">Subjek Pesan</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Contoh: Kerjasama Event, Pertanyaan Anggota"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-medium text-gray-700">Isi Pesan</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tuliskan pesan lengkap Anda di sini..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-red-800 text-white font-inter font-medium py-3 px-6 rounded-xl transition-all shadow-sm shadow-primary/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-75"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengirim Pesan...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;
