import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../services/api";

const Pengaturan = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_organisasi: "",
    email: "",
    telepon: "",
    alamat: "",
    instagram: "",
    facebook: "",
    youtube: ""
  });

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings");
        setFormData({
          nama_organisasi: response.data.nama_organisasi || "",
          email: response.data.email || "",
          telepon: response.data.telepon || "",
          alamat: response.data.alamat || "",
          instagram: response.data.instagram || "",
          facebook: response.data.facebook || "",
          youtube: response.data.youtube || ""
        });
      } catch (error) {
        console.error("Gagal mengambil pengaturan:", error);
        addToast("Gagal memuat pengaturan website", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/settings", formData);
      addToast("Pengaturan website berhasil disimpan", "success");
    } catch (error) {
      console.error("Gagal menyimpan pengaturan:", error);
      addToast(error.response?.data?.message || "Gagal menyimpan perubahan", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="font-inter text-gray-500 text-sm">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Pengaturan Website</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Konfigurasi informasi dasar, kontak, dan tautan sosial media LISAN</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-5 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0 disabled:opacity-75"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* Card 1: Informasi Organisasi & Kontak */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-poppins font-semibold text-lg text-gray-900">Informasi Organisasi & Kontak</h2>
          <p className="text-sm font-inter text-gray-500 mt-1">Atur nama organisasi, email, nomor telepon, dan alamat resmi.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Nama Organisasi</label>
              <input
                type="text"
                required
                value={formData.nama_organisasi}
                onChange={(e) => setFormData({ ...formData, nama_organisasi: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Email Kontak</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-inter font-medium text-gray-700">Nomor Telepon (WhatsApp)</label>
              <input
                type="text"
                required
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="Contoh: +62 812-3456-7890"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-inter font-medium text-gray-700">Alamat Lengkap</label>
              <textarea
                rows={3}
                required
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Media Sosial */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-poppins font-semibold text-lg text-gray-900">Media Sosial</h2>
          <p className="text-sm font-inter text-gray-500 mt-1">Tautan akun media sosial resmi organisasi.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Instagram URL</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Facebook URL</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">YouTube URL</label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Pengaturan;
