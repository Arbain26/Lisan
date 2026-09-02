import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Download, Loader2 } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import * as XLSX from 'xlsx';
import api from "../../services/api";

const formatWaNumber = (phone) => {
  if (!phone) return "";
  let clean = phone.toString().replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (!clean.startsWith("62") && clean.length >= 8) {
    clean = "62" + clean;
  }
  return clean;
};

const Relawan = () => {
  const { data, loading, isSubmitting, addItem, updateItem, deleteItem } = useCRUD("/relawan");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodType, setFilterBloodType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    instansi: "",
    daerah: "",
    golongan_darah: "",
    no_hp: "",
    keterangan: "",
  });

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.daerah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.no_hp.includes(searchTerm);
      const matchBlood = filterBloodType === "" || item.golongan_darah === filterBloodType;
      return matchSearch && matchBlood;
    });
  }, [data, searchTerm, filterBloodType]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ nama: "", instansi: "", daerah: "", golongan_darah: "", no_hp: "", keterangan: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      nama: item.nama,
      instansi: item.instansi,
      daerah: item.daerah,
      golongan_darah: item.golongan_darah,
      no_hp: item.no_hp,
      keterangan: item.keterangan || ""
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.instansi.trim() || !formData.daerah.trim() || !formData.golongan_darah.trim() || !formData.no_hp.trim()) return;

    if (selectedItem) {
      await updateItem(selectedItem.id, formData);
    } else {
      await addItem(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteAllConfirm = async () => {
    try {
      await api.delete('/relawan/all');
      setIsDeleteAllModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting all data:", error);
      alert("Gagal menghapus seluruh data.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        
        let headerRowIndex = 0;
        let headers = [];
        for (let i = 0; i < rows.length; i++) {
          const rowStr = rows[i].join("").toLowerCase();
          if (rowStr.includes("nama") || rowStr.includes("name")) {
            headerRowIndex = i;
            headers = rows[i].map(h => typeof h === 'string' ? h.toLowerCase().replace(/[^a-z0-9]/g, '') : '');
            break;
          }
        }

        let colMap = { nama: -1, instansi: -1, daerah: -1, golongan_darah: -1, no_hp: -1, keterangan: -1 };

        headers.forEach((h, index) => {
          if (!h) return;
          if (colMap.nama === -1 && (h.includes('nama') || h.includes('name'))) colMap.nama = index;
          else if (colMap.instansi === -1 && (h.includes('instansi') || h.includes('kelas') || h.includes('kampus') || h.includes('asal') || h.includes('sekolah') || h.includes('fakultas') || h.includes('prodi') || h.includes('jurusan'))) colMap.instansi = index;
          else if (colMap.daerah === -1 && (h.includes('daerah') || h.includes('alamat') || h.includes('domisili') || h.includes('tinggal'))) colMap.daerah = index;
          else if (colMap.golongan_darah === -1 && (h.includes('darah') || h.includes('gol') || h.includes('blood') || h.includes('gd'))) colMap.golongan_darah = index;
          else if (colMap.no_hp === -1 && (h.includes('hp') || h.includes('tel') || h.includes('wa') || h.includes('kontak') || h.includes('hubungi') || h.includes('nomor'))) colMap.no_hp = index;
          else if (colMap.keterangan === -1 && (h.includes('ket') || h.includes('info') || h.includes('catatan'))) colMap.keterangan = index;
        });

        const formattedData = [];
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0 || !row.some(cell => cell)) continue;
          
          const namaVal = colMap.nama !== -1 ? row[colMap.nama] : "";
          if (!namaVal) continue;

          formattedData.push({
            nama: (namaVal || "").toString(),
            instansi: colMap.instansi !== -1 && row[colMap.instansi] ? row[colMap.instansi].toString() : "-",
            daerah: colMap.daerah !== -1 && row[colMap.daerah] ? row[colMap.daerah].toString() : "",
            golongan_darah: colMap.golongan_darah !== -1 && row[colMap.golongan_darah] ? row[colMap.golongan_darah].toString() : "-",
            no_hp: colMap.no_hp !== -1 && row[colMap.no_hp] ? row[colMap.no_hp].toString().replace(/\D/g, '') : "",
            keterangan: colMap.keterangan !== -1 && row[colMap.keterangan] ? row[colMap.keterangan].toString() : "-"
          });
        }

        if (formattedData.length === 0) {
          alert("Tidak ada data valid yang ditemukan di file Excel. Pastikan ada kolom bernama 'Nama'.");
          return;
        }

        const response = await api.post('/relawan/bulk', formattedData);
        alert(response.data.message);
        window.location.reload();
      } catch (error) {
        console.error("Error importing file:", error);
        alert("Gagal mengimpor file Excel. Pastikan format sesuai.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Data Relawan</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Kelola data anggota dan relawan LISAN</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsDeleteAllModalOpen(true)} disabled={data.length === 0} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shrink-0 ${data.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
            <Trash2 size={18} /> Hapus Semua
          </button>
          <label className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-inter font-medium transition-colors cursor-pointer">
            <Download size={18} className="text-gray-500" /> Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
            <Plus size={18} /> Tambah Relawan
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama, daerah, atau nomor hp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <select value={filterBloodType} onChange={(e) => setFilterBloodType(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:min-w-[180px]">
            <option value="">Semua Gol. Darah</option>
            <option value="A">Golongan Darah A</option>
            <option value="B">Golongan Darah B</option>
            <option value="AB">Golongan Darah AB</option>
            <option value="O">Golongan Darah O</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState isSearch={searchTerm !== ""} message={searchTerm !== "" ? "Relawan tidak ditemukan" : "Belum ada data relawan"} subMessage={searchTerm !== "" ? `Tidak ada hasil untuk "${searchTerm}"` : "Mulai dengan menambahkan data relawan."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-center w-12">No</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Instansi/Kelas</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Daerah</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Gol. Darah</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">No HP</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Keterangan</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4 text-sm font-inter text-gray-500 text-center">{index + 1}</td>
                      <td className="px-6 py-4 font-poppins font-medium text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.instansi}</td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.daerah}</td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.golongan_darah}</td>
                      <td className="px-6 py-4 text-sm font-inter">
                        {item.no_hp ? (
                          <a
                            href={`https://wa.me/${formatWaNumber(item.no_hp)}?text=${encodeURIComponent("Assalamu'alaikum warahmatullahi wabarakatuh, kami dari lingkar donor darah sidrap, dapat informasi bahwa butuhki darah kak")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                            title="Buka Chat WhatsApp"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            {item.no_hp}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.keterangan || "-"}</td>
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
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-inter text-gray-500">Menampilkan {filteredData.length} data</span>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Relawan" : "Tambah Relawan"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Instansi / Kelas</label>
            <input type="text" required value={formData.instansi} onChange={(e) => setFormData({ ...formData, instansi: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Cth: UNHAS / TI-A" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Daerah / Alamat</label>
            <input type="text" required value={formData.daerah} onChange={(e) => setFormData({ ...formData, daerah: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Golongan Darah</label>
              <select required value={formData.golongan_darah} onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="">Pilih...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Nomor HP</label>
              <input type="tel" required maxLength="12" value={formData.no_hp} onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, no_hp: numericValue });
              }} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Keterangan (Opsional)</label>
            <textarea value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[80px]" placeholder="Tambahkan catatan jika ada..."></textarea>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Data"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isSubmitting} title="Hapus Data?" message={`Apakah Anda yakin ingin menghapus data relawan "${selectedItem?.nama}"?`} />
      <ConfirmModal isOpen={isDeleteAllModalOpen} onClose={() => setIsDeleteAllModalOpen(false)} onConfirm={handleDeleteAllConfirm} title="Hapus Seluruh Data?" message="PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data relawan? Tindakan ini tidak dapat dibatalkan!" />
    </div>
  );
};

export default Relawan;
