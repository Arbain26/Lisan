import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle, AlertCircle, HeartHandshake } from "lucide-react";
import api from "../../services/api";

const PageHeader = ({ title, subtitle, badge }) => (
  <div
    className="relative py-32 flex items-center justify-center overflow-hidden"
    style={{ background: "linear-gradient(135deg, #111827 0%, #1a0505 50%, #111827 100%)" }}
  >
    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(245,158,11,0.5) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
    <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-xs font-inter font-semibold uppercase tracking-widest">{badge}</span>
        </div>
      )}
      <h1 className="font-poppins font-bold text-4xl sm:text-5xl text-white mb-4">{title}</h1>
      {subtitle && <p className="text-gray-400 font-inter text-md leading-relaxed">{subtitle}</p>}
    </div>
  </div>
);

const ContactPage = () => {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",          // Nama Pemohon / Kontak
    email: "",         // Alamat Email
    phone: "",         // Nomor HP/WhatsApp
    bloodType: "O",    // Golongan Darah
    patientName: "",   // Nama Pasien
    quantity: "1 Kantong", // Jumlah Kantong
    hospital: "",      // Tempat Perawatan
    patientAddress: "",// Alamat Pasien
    reason: ""         // Keperluan
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

    // Construct subject & structured message payload
    const payload = {
      name: formData.name,
      email: formData.email,
      subject: `[Butuh Darah] Golongan ${formData.bloodType} - Pasien: ${formData.patientName}`,
      message: `--- PERMOHONAN BUTUH DARAH ---
Golongan Darah: ${formData.bloodType}
Nama Pasien: ${formData.patientName}
Jumlah yang Dibutuhkan: ${formData.quantity}
Tempat Perawatan: ${formData.hospital}
Alamat Pasien: ${formData.patientAddress}
Keperluan: ${formData.reason}
Kontak Pemohon: ${formData.phone}`
    };

    try {
      await api.post("/pesan", payload);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        bloodType: "O",
        patientName: "",
        quantity: "1 Kantong",
        hospital: "",
        patientAddress: "",
        reason: ""
      });
    } catch (err) {
      console.error("Gagal mengirim permohonan:", err);
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        badge="Layanan Kemanusiaan LISAN"
        title="Butuh Bantuan Darah?"
        subtitle="Lengkapi formulir di bawah ini untuk memohon bantuan donor darah dari Lingkar Donor Sidrap (Relawan LISAN)."
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Side: Contact Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h2 className="font-poppins font-bold text-xl text-gray-900 flex items-center gap-2">
                  <HeartHandshake className="text-primary w-6 h-6 shrink-0" />
                  Hubungi Langsung
                </h2>
                <p className="font-inter text-xs text-gray-500 mt-1 leading-relaxed">
                  Jika permohonan darah bersifat darurat (Emergency), Anda juga dapat menghubungi kontak berikut secara langsung.
                </p>
              </div>

              <div className="space-y-5 border-t border-gray-50 pt-5">
                {/* Phone */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 text-xs uppercase tracking-wider">Kontak Lingkar</h4>
                    <p className="font-inter text-sm text-gray-600 mt-0.5">
                      {loadingSettings ? (
                        "Memuat nomor..."
                      ) : (
                        <a href={`tel:${settings?.telepon?.replace(/[^\d+]/g, "") || "+6281933172687"}`} className="hover:text-primary transition-colors font-semibold">
                          {settings?.telepon || "+62 819-3317-2687"}
                        </a>
                      )}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 text-xs uppercase tracking-wider">Email Resmi</h4>
                    <p className="font-inter text-sm text-gray-600 mt-0.5">
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

                {/* Address */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-gray-900 text-xs uppercase tracking-wider">Sekretariat</h4>
                    <p className="font-inter text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {loadingSettings ? "Memuat alamat..." : settings?.alamat || "Jl. Jenderal Sudirman No. 123, Sidenreng Rappang, Sulawesi Selatan"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Poster Info Card */}
            <div className="bg-gradient-to-br from-dark to-slate-900 text-white rounded-3xl p-6 border border-white/5 shadow-sm space-y-3">
              <h4 className="font-poppins font-bold text-sm text-secondary uppercase tracking-widest">Slogan Layanan</h4>
              <p className="font-poppins font-bold text-lg leading-relaxed">
                "Setetes dari kita nyawa bagi mereka"
              </p>
              <p className="font-inter text-xs text-gray-300 leading-relaxed">
                Lingkar Donor Darah Sidenreng Rappang merupakan wadah aksi sosial kemanusiaan mahasiswa LISAN untuk membantu sesama yang membutuhkan darah di Sidrap.
              </p>
            </div>
          </motion.div>

          {/* Right Side: Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm"
          >
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h2 className="font-poppins font-bold text-2xl text-gray-900">Formulir Permohonan Darah</h2>
              <p className="text-xs font-inter text-gray-500 mt-1">Lengkapi kolom di bawah ini dengan informasi pasien yang valid.</p>
            </div>

            <AnimatePresence mode="wait">
              {submitStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center text-center py-8 space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-poppins font-bold text-lg text-gray-900">Permohonan Terkirim!</h3>
                  <p className="font-inter text-gray-500 text-sm max-w-md">
                    Permohonan bantuan darah Anda berhasil dikirim ke admin LISAN. Kami akan segera membagikan info kebutuhan darah ini ke grup relawan kami.
                  </p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="mt-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-inter font-medium rounded-xl transition-colors text-sm"
                  >
                    Kirim Permohonan Lain
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {submitStatus === "error" && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-inter">
                      <AlertCircle size={20} className="shrink-0" />
                      <span>Terjadi kesalahan saat mengirim permohonan. Silakan coba kembali.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Golongan Darah */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Golongan Darah</label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                      >
                        <option value="O">Golongan Darah O</option>
                        <option value="A">Golongan Darah A</option>
                        <option value="B">Golongan Darah B</option>
                        <option value="AB">Golongan Darah AB</option>
                      </select>
                    </div>

                    {/* Nama Pasien */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Nama Pasien</label>
                      <input
                        type="text"
                        name="patientName"
                        required
                        value={formData.patientName}
                        onChange={handleInputChange}
                        placeholder="Contoh: Winda"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Jumlah yang Dibutuhkan */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Jumlah yang Dibutuhkan</label>
                      <input
                        type="text"
                        name="quantity"
                        required
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="Contoh: 1 Kantong"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Tempat Perawatan */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Tempat Perawatan (Rumah Sakit)</label>
                      <input
                        type="text"
                        name="hospital"
                        required
                        value={formData.hospital}
                        onChange={handleInputChange}
                        placeholder="Contoh: RS. Nene' Mallomo"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Alamat Pasien */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Alamat Pasien / Wilayah</label>
                      <input
                        type="text"
                        name="patientAddress"
                        required
                        value={formData.patientAddress}
                        onChange={handleInputChange}
                        placeholder="Contoh: Pangkajene"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Keperluan */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Keperluan (Diagnosis/Alasan)</label>
                      <input
                        type="text"
                        name="reason"
                        required
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Contoh: Hb Rendah, Operasi Caesar"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Nama Pemohon / Kontak Person */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Nama Pemohon (Kontak Penanggungjawab)</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama Anda"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Nomor HP/WhatsApp Pemohon */}
                    <div className="space-y-1">
                      <label className="text-xs font-inter font-medium text-gray-700">Nomor Telepon / WhatsApp Pemohon</label>
                      <input
                        type="text"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 0819-3317-2687"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Email Pemohon */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-inter font-medium text-gray-700">Alamat Email Pemohon</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Contoh: pemohon@domain.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
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
                        Mengirim Permohonan...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Kirim Permohonan Darah
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
