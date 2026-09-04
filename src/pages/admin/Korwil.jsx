import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Search,
  Building2,
  X
} from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../services/api";

const KorwilAdmin = () => {
  const { addToast } = useToast();
  const [korwils, setKorwils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    kampus: "",
    anggota: "",
    urutan: 0,
    is_active: 1
  });

  const fetchKorwils = async () => {
    try {
      setLoading(true);
      const response = await api.get("/korwil/admin");
      setKorwils(response.data);
    } catch (error) {
      console.error("Gagal memuat data korwil:", error);
      addToast("Gagal memuat data Koordinator Wilayah", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKorwils();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      kampus: "",
      anggota: "",
      urutan: korwils.length + 1,
      is_active: 1
    });
    setModalMode("create");
    setSelectedId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name,
      kampus: item.kampus,
      anggota: item.anggota,
      urutan: item.urutan || 0,
      is_active: item.is_active ? 1 : 0
    });
    setModalMode("edit");
    setSelectedId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (modalMode === "create") {
        await api.post("/korwil", formData);
        addToast("Koordinator Wilayah berhasil ditambahkan", "success");
      } else {
        await api.put(`/korwil/${selectedId}`, formData);
        addToast("Koordinator Wilayah berhasil diperbarui", "success");
      }
      setModalOpen(false);
      fetchKorwils();
    } catch (error) {
      console.error("Gagal menyimpan data korwil:", error);
      addToast(error.response?.data?.message || "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus ${name}?`)) return;

    try {
      await api.delete(`/korwil/${id}`);
      addToast("Koordinator Wilayah berhasil dihapus", "success");
      setKorwils(korwils.filter(k => k.id !== id));
    } catch (error) {
      console.error("Gagal menghapus korwil:", error);
      addToast("Gagal menghapus data wilayah", "error");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const updatedStatus = item.is_active ? 0 : 1;
      await api.put(`/korwil/${item.id}`, {
        ...item,
        is_active: updatedStatus
      });
      setKorwils(korwils.map(k => k.id === item.id ? { ...k, is_active: updatedStatus } : k));
      addToast(`Status ${item.name} berhasil diubah!`, "success");
    } catch (error) {
      console.error("Gagal toggle status:", error);
      addToast("Gagal mengubah status", "error");
    }
  };

  const filteredKorwils = korwils.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.kampus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin size={14} />
            Jaringan Daerah & Kampus
          </div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">
            Koordinator Wilayah (Korwil)
          </h1>
          <p className="text-gray-500 font-inter text-sm mt-1">
            Kelola data cabang wilayah, basis kampus, dan jumlah kader aktif yang ditampilkan di halaman publik.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-red-800 text-white px-5 py-2.5 rounded-xl font-inter font-semibold transition-all shadow-md shadow-primary/20 shrink-0"
        >
          <Plus size={18} />
          <span>Tambah Korwil</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari wilayah atau kampus..."
          className="w-full font-inter text-sm text-gray-800 outline-none"
        />
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-inter text-gray-500 text-sm">Memuat data wilayah...</p>
            </div>
          </div>
        ) : filteredKorwils.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-poppins font-semibold text-gray-700 text-base">Belum Ada Data Wilayah</h3>
            <p className="font-inter text-gray-400 text-xs mt-1">
              Klik tombol "Tambah Korwil" di atas untuk menambahkan basis wilayah pertama.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Wilayah</th>
                  <th className="py-4 px-6">Basis Kampus / Lingkup Gerak</th>
                  <th className="py-4 px-6">Kader Aktif</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredKorwils.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-poppins font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {item.urutan || "#"}
                        </span>
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-md">
                      {item.kampus}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full font-medium text-xs">
                        <Users size={12} />
                        {item.anggota}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {item.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit Wilayah"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Wilayah"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-poppins font-bold text-xl text-gray-900">
                  {modalMode === "create" ? "Tambah Koordinator Wilayah" : "Edit Koordinator Wilayah"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nama Koordinator Wilayah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Koordinator Wilayah Pangkajene"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Basis Kampus / Lingkup Gerak *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.kampus}
                    onChange={(e) => setFormData({ ...formData, kampus: e.target.value })}
                    placeholder="Contoh: Mewadahi mahasiswa dari kampus-kampus di area Pangkajene dan sekitarnya."
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Jumlah Kader Aktif *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.anggota}
                      onChange={(e) => setFormData({ ...formData, anggota: e.target.value })}
                      placeholder="Contoh: 120+ Kader Aktif"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nomor Urutan Tampil
                    </label>
                    <input
                      type="number"
                      value={formData.urutan}
                      onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active === 1}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-inter text-gray-700 font-medium">
                      Aktifkan di Halaman Publik
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 font-inter text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-inter text-sm font-semibold transition-all shadow-md shadow-primary/20"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    <span>{saving ? "Menyimpan..." : "Simpan Wilayah"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KorwilAdmin;
