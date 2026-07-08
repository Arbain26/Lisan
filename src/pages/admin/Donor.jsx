import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";

const initialDonor = [
  { id: 1, eventName: "Donor Darah Rutin Ramadhan", location: "RSUD Nene Mallomo", targetBags: 150, achievedBags: 120, status: "Berjalan", date: "24 Apr 2026" },
  { id: 2, eventName: "Aksi Donor Darah Pemuda", location: "Alun-Alun Pangkajene", targetBags: 100, achievedBags: 115, status: "Selesai", date: "10 Mar 2026" },
];

const Donor = () => {
  const { data, loading, isSubmitting, addItem, updateItem, deleteItem } = useCRUD("lisan_donor_data", initialDonor);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    eventName: "",
    location: "",
    targetBags: 0,
    achievedBags: 0,
    status: "Terjadwal",
  });

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ eventName: "", location: "", targetBags: 0, achievedBags: 0, status: "Terjadwal" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({ eventName: item.eventName, location: item.location, targetBags: item.targetBags, achievedBags: item.achievedBags, status: item.status });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName.trim()) return;

    const payload = {
      ...formData,
      date: selectedItem ? selectedItem.date : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    if (selectedItem) {
      await updateItem(selectedItem.id, payload);
    } else {
      await addItem(payload);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.id);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Kelola Lingkar Donor</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Manajemen kegiatan Lingkar Donor Sidrap</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
          <Plus size={18} /> Tambah Kegiatan
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari kegiatan donor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState isSearch={searchTerm !== ""} message={searchTerm !== "" ? "Kegiatan tidak ditemukan" : "Belum ada kegiatan"} subMessage={searchTerm !== "" ? `Tidak ada hasil untuk "${searchTerm}"` : "Mulai dengan menambahkan kegiatan donor darah."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Nama Kegiatan</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Pencapaian</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-poppins font-medium text-gray-900">{item.eventName}</div>
                        <div className="text-xs font-inter text-gray-500 mt-0.5">{item.date}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min((item.achievedBags / (item.targetBags || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-inter text-gray-600">{item.achievedBags}/{item.targetBags}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-inter font-medium ${
                          item.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : item.status === "Berjalan" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>{item.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"><Edit2 size={16} /></button>
                          <button onClick={() => handleOpenDelete(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Kegiatan" : "Tambah Kegiatan"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Nama Kegiatan</label>
            <input type="text" required value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Lokasi</label>
            <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Target Kantong</label>
              <input type="number" min="0" required value={formData.targetBags} onChange={(e) => setFormData({ ...formData, targetBags: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Kantong Terkumpul</label>
              <input type="number" min="0" required value={formData.achievedBags} onChange={(e) => setFormData({ ...formData, achievedBags: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Status Kegiatan</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="Terjadwal">Terjadwal</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isSubmitting} title="Hapus Kegiatan?" message={`Apakah Anda yakin ingin menghapus kegiatan "${selectedItem?.eventName}"?`} />
    </div>
  );
};

export default Donor;
