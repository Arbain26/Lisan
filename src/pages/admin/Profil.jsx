import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  History, 
  Target, 
  Scale, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Shield, 
  BookOpen, 
  HeartHandshake, 
  Lightbulb, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../services/api";

const availableIcons = [
  { name: "Shield", label: "Perisai (Integritas)", Icon: Shield },
  { name: "BookOpen", label: "Buku (Intelektualitas)", Icon: BookOpen },
  { name: "HeartHandshake", label: "Jabat Tangan (Solidaritas)", Icon: HeartHandshake },
  { name: "Lightbulb", label: "Lampu (Inovasi)", Icon: Lightbulb },
  { name: "Scale", label: "Timbangan (Keadilan)", Icon: Scale },
];

const Profil = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [tentang, setTentang] = useState("");
  const [sejarah, setSejarah] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState([]);
  const [nilai, setNilai] = useState([]);

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/settings");
        const data = response.data;

        setTentang(data.tentang_organisasi || "");
        setSejarah(data.sejarah || "");
        setVisi(data.visi || "");
        setMisi(Array.isArray(data.misi) ? data.misi : []);
        setNilai(Array.isArray(data.nilai_organisasi) ? data.nilai_organisasi : []);
      } catch (error) {
        console.error("Gagal memuat profil organisasi:", error);
        addToast("Gagal memuat data profil", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [addToast]);

  // Misi handlers
  const handleAddMisi = () => {
    setMisi([...misi, ""]);
  };

  const handleMisiChange = (index, value) => {
    const updated = [...misi];
    updated[index] = value;
    setMisi(updated);
  };

  const handleRemoveMisi = (index) => {
    setMisi(misi.filter((_, i) => i !== index));
  };

  // Nilai handlers
  const handleAddNilai = () => {
    setNilai([
      ...nilai,
      {
        id: Date.now(),
        title: "",
        desc: "",
        icon: "Shield"
      }
    ]);
  };

  const handleNilaiChange = (index, field, value) => {
    const updated = [...nilai];
    updated[index][field] = value;
    setNilai(updated);
  };

  const handleRemoveNilai = (index) => {
    setNilai(nilai.filter((_, i) => i !== index));
  };

  // Save all profile data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/settings/profile", {
        tentang_organisasi: tentang,
        sejarah,
        visi,
        misi: misi.filter(m => m.trim() !== ""),
        nilai_organisasi: nilai.filter(n => n.title.trim() !== "")
      });

      addToast("Profil organisasi berhasil diperbarui!", "success");
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      addToast(error.response?.data?.message || "Gagal menyimpan perubahan profil", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="font-inter text-gray-500 text-sm">Memuat editor profil...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "about", label: "Tentang LISAN", icon: Building2 },
    { id: "sejarah", label: "Sejarah", icon: History },
    { id: "visi_misi", label: "Visi & Misi", icon: Target },
    { id: "nilai", label: "Nilai Organisasi", icon: Scale },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            Pengelolaan Konten Publik
          </div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">
            Kelola Profil Organisasi
          </h1>
          <p className="text-gray-500 font-inter text-sm mt-1">
            Ubah deskripsi tentang LISAN, sejarah, visi & misi, serta nilai organisasi secara langsung ke halaman publik.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-inter font-semibold transition-all shadow-md shadow-primary/20 shrink-0"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-2xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 py-4 px-5 border-b-2 font-poppins font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-red-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 sm:p-8 rounded-b-2xl border border-t-0 border-gray-100 shadow-sm">
        {/* Tab 1: Tentang LISAN */}
        {activeTab === "about" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block font-poppins font-semibold text-gray-800 mb-2">
                Deskripsi Utama Organisasi (Tentang LISAN)
              </label>
              <p className="text-gray-500 font-inter text-xs mb-3">
                Paragraf ini akan muncul di halaman <b>/about</b> serta pengenalan profil utama organisasi.
              </p>
              <textarea
                rows={8}
                value={tentang}
                onChange={(e) => setTentang(e.target.value)}
                placeholder="Tuliskan narasi lengkap mengenai identitas, latar belakang, dan tujuan LISAN..."
                className="w-full p-4 border border-gray-200 rounded-xl font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none leading-relaxed"
              />
            </div>
          </motion.div>
        )}

        {/* Tab 2: Sejarah */}
        {activeTab === "sejarah" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block font-poppins font-semibold text-gray-800 mb-2">
                Naskah Rekam Jejak & Sejarah Berdirinya LISAN
              </label>
              <p className="text-gray-500 font-inter text-xs mb-3">
                Teks ini akan otomatis ditampilkan pada halaman publik <b>/sejarah</b>. Anda dapat memisahkan paragraf dengan baris baru (Enter).
              </p>
              <textarea
                rows={12}
                value={sejarah}
                onChange={(e) => setSejarah(e.target.value)}
                placeholder="Tuliskan sejarah berdirinya organisasi, tokoh penggerak awal, dan tonggak bersejarah penting..."
                className="w-full p-4 border border-gray-200 rounded-xl font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none leading-relaxed"
              />
            </div>
          </motion.div>
        )}

        {/* Tab 3: Visi & Misi */}
        {activeTab === "visi_misi" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Visi */}
            <div>
              <label className="block font-poppins font-semibold text-gray-800 mb-2">
                Visi Organisasi
              </label>
              <textarea
                rows={3}
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                placeholder="Masukkan visi jangka panjang organisasi LISAN..."
                className="w-full p-4 border border-gray-200 rounded-xl font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* Misi */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-poppins font-semibold text-gray-800">Butir-Butir Misi</h3>
                  <p className="text-gray-500 font-inter text-xs">Poin-poin langkah konkrit pencapaian visi.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMisi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-primary rounded-lg font-inter text-xs font-semibold transition-colors"
                >
                  <Plus size={14} />
                  Tambah Misi
                </button>
              </div>

              <div className="space-y-3">
                {misi.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 font-poppins font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleMisiChange(index, e.target.value)}
                      placeholder={`Butir misi ke-${index + 1}...`}
                      className="flex-1 p-3 border border-gray-200 rounded-xl font-inter text-sm text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMisi(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Hapus butir misi"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {misi.length === 0 && (
                  <p className="text-gray-400 font-inter text-sm italic py-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Belum ada butir misi. Klik tombol "Tambah Misi" di atas.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Nilai Organisasi */}
        {activeTab === "nilai" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-semibold text-gray-800">Kartu Nilai Dasar Organisasi</h3>
                <p className="text-gray-500 font-inter text-xs">Prinsip filosofis yang tampil di halaman <b>/nilai-organisasi</b>.</p>
              </div>
              <button
                type="button"
                onClick={handleAddNilai}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-primary rounded-lg font-inter text-xs font-semibold transition-colors"
              >
                <Plus size={16} />
                Tambah Kartu Nilai
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nilai.map((item, index) => (
                <div key={item.id || index} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-bold text-xs text-primary bg-white px-2.5 py-1 rounded-md border border-gray-200">
                      Nilai #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNilai(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Hapus nilai ini"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Judul Nilai</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleNilaiChange(index, "title", e.target.value)}
                      placeholder="Contoh: Integritas & Moralitas"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-poppins font-semibold text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ikon Tampilan</label>
                    <select
                      value={item.icon || "Shield"}
                      onChange={(e) => handleNilaiChange(index, "icon", e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {availableIcons.map((ic) => (
                        <option key={ic.name} value={ic.name}>{ic.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Penjelasan Nilai</label>
                    <textarea
                      rows={3}
                      value={item.desc}
                      onChange={(e) => handleNilaiChange(index, "desc", e.target.value)}
                      placeholder="Jelaskan makna nilai ini bagi seluruh kader..."
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-inter text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profil;
