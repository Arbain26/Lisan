import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Download, Loader2, Users, GraduationCap, School, Calendar } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import * as XLSX from 'xlsx';
import api from "../../services/api";

const Kader = () => {
  const { data, loading, isSubmitting, addItem, updateItem, deleteItem } = useCRUD("/kader");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    institusi: "",
    angkatan: "",
    tahun: "",
  });

  // Calculate statistics from data
  const stats = useMemo(() => {
    const total = data.length;
    
    // Unique institutions
    const uniqueInstitusiList = [...new Set(data.map(k => k.institusi?.toLowerCase()).filter(Boolean))];
    const totalInstitusi = uniqueInstitusiList.length;

    // Unique generations (angkatan)
    const uniqueAngkatanList = [...new Set(data.map(k => k.angkatan?.toLowerCase()).filter(Boolean))];
    const totalAngkatan = uniqueAngkatanList.length;

    // Latest cohort year
    const years = data.map(k => parseInt(k.tahun)).filter(Boolean);
    const latestYear = years.length > 0 ? Math.max(...years) : "-";

    return { total, totalInstitusi, totalAngkatan, latestYear };
  }, [data]);

  // Extract all unique cohorts (angkatan) from the data to build dynamic filter options
  const uniqueAngkatan = useMemo(() => {
    const list = data.map(item => item.angkatan).filter(Boolean);
    const unique = [...new Set(list)];
    return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data]);

  // Extract all unique years (tahun) from the data to build dynamic filter options
  const uniqueTahun = useMemo(() => {
    const list = data.map(item => item.tahun).filter(Boolean);
    const unique = [...new Set(list)];
    return unique.sort((a, b) => b.localeCompare(a, undefined, { numeric: true })); // Descending years
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = 
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institusi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.angkatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tahun.includes(searchTerm);
        
      const matchAngkatan = filterAngkatan === "" || item.angkatan === filterAngkatan;
      const matchTahun = filterTahun === "" || item.tahun === filterTahun;
      
      return matchSearch && matchAngkatan && matchTahun;
    });
  }, [data, searchTerm, filterAngkatan, filterTahun]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({
      nama: "",
      institusi: "",
      angkatan: "",
      tahun: new Date().getFullYear().toString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      nama: item.nama,
      institusi: item.institusi,
      angkatan: item.angkatan,
      tahun: item.tahun
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.nama.trim() || 
      !formData.institusi.trim() || 
      !formData.angkatan.trim() || 
      !formData.tahun.trim()
    ) return;

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

  // Excel bulk upload functionality
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

        let colMap = { nama: -1, institusi: -1, angkatan: -1, tahun: -1 };

        headers.forEach((h, index) => {
          if (!h) return;
          if (colMap.nama === -1 && (h.includes('nama') || h.includes('name'))) colMap.nama = index;
          else if (colMap.institusi === -1 && (h.includes('institusi') || h.includes('kampus') || h.includes('universitas') || h.includes('lembaga') || h.includes('sekolah') || h.includes('instansi'))) colMap.institusi = index;
          else if (colMap.angkatan === -1 && (h.includes('angkatan') || h.includes('generasi') || h.includes('cohort') || h.includes('ke'))) colMap.angkatan = index;
          else if (colMap.tahun === -1 && (h.includes('tahun') || h.includes('year') || h.includes('masuk'))) colMap.tahun = index;
        });

        const formattedData = [];
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0 || !row.some(cell => cell)) continue;
          
          const namaVal = colMap.nama !== -1 ? row[colMap.nama] : "";
          const institusiVal = colMap.institusi !== -1 ? row[colMap.institusi] : "";
          const angkatanVal = colMap.angkatan !== -1 ? row[colMap.angkatan] : "";
          const tahunVal = colMap.tahun !== -1 ? row[colMap.tahun] : "";

          if (!namaVal || !institusiVal || !angkatanVal || !tahunVal) continue;

          formattedData.push({
            nama: namaVal.toString().trim(),
            institusi: institusiVal.toString().trim(),
            angkatan: angkatanVal.toString().trim(),
            tahun: tahunVal.toString().replace(/\D/g, '')
          });
        }

        if (formattedData.length === 0) {
          alert("Tidak ada data valid yang ditemukan di file Excel. Pastikan kolom Nama, Institusi, Angkatan, dan Tahun terisi.");
          return;
        }

        // Insert database entries sequentially
        let successCount = 0;
        for (const item of formattedData) {
          try {
            await api.post('/kader', item);
            successCount++;
          } catch (err) {
            console.error("Error inserting kader row:", err);
          }
        }
        alert(`Berhasil mengimpor ${successCount} data kader!`);
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
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Database Kader</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Kelola data pembinaan kader LISAN secara manual atau via Excel</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-inter font-medium transition-colors cursor-pointer">
            <Download size={18} className="text-gray-500" /> Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
            <Plus size={18} /> Tambah Kader
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Kader */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Total Kader</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.total}</h3>
          </div>
        </div>

        {/* Total Institusi */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <School size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Total Institusi</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.totalInstitusi}</h3>
          </div>
        </div>

        {/* Total Angkatan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Total Angkatan</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.totalAngkatan}</h3>
          </div>
        </div>

        {/* Tahun Terbaru */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Tahun Terbaru</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.latestYear}</h3>
          </div>
        </div>

      </div>

      {/* Filter and Search Panels */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama kader, institusi, atau angkatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {/* Angkatan Filter */}
          <select 
            value={filterAngkatan} 
            onChange={(e) => setFilterAngkatan(e.target.value)} 
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:min-w-[150px] font-semibold text-gray-700"
          >
            <option value="">Semua Angkatan</option>
            {uniqueAngkatan.map(ang => (
              <option key={ang} value={ang}>Angkatan {ang}</option>
            ))}
          </select>

          {/* Tahun Filter */}
          <select 
            value={filterTahun} 
            onChange={(e) => setFilterTahun(e.target.value)} 
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:min-w-[150px] font-semibold text-gray-700"
          >
            <option value="">Semua Tahun</option>
            {uniqueTahun.map(yr => (
              <option key={yr} value={yr}>Tahun {yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cadre Table / Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState 
            isSearch={searchTerm !== "" || filterAngkatan !== "" || filterTahun !== ""} 
            message="Data kader tidak ditemukan" 
            subMessage="Gunakan pencarian kata kunci lain atau bersihkan filter." 
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-inter font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 text-center w-12">No</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Institusi / Kampus</th>
                    <th className="px-6 py-4">Angkatan</th>
                    <th className="px-6 py-4">Tahun</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-inter text-sm">
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">{item.institusi}</td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold text-xs">
                          {item.angkatan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold text-xs">
                          {item.tahun}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleOpenDelete(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm font-inter text-gray-500">
              Menampilkan {filteredData.length} data kader
            </div>
          </>
        )}
      </div>

      {/* CRUD MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Data Kader" : "Tambah Kader Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4 font-semibold">
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={formData.nama} 
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Institusi / Kampus / Sekolah</label>
            <input 
              type="text" 
              required
              placeholder="Cth: Universitas Hasanuddin"
              value={formData.institusi} 
              onChange={(e) => setFormData({ ...formData, institusi: e.target.value })} 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Angkatan Berapa</label>
              <input 
                type="text" 
                required 
                placeholder="Cth: 27 atau Angkatan 27"
                value={formData.angkatan} 
                onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Tahun Masuk</label>
              <input 
                type="text" 
                required 
                placeholder="Cth: 2024"
                maxLength="4"
                value={formData.tahun} 
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value.replace(/\D/g, "") })} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Kader"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        isDeleting={isSubmitting} 
        title="Hapus Data Kader?" 
        message={`Apakah Anda yakin ingin menghapus data kader "${selectedItem?.nama}"? Tindakan ini akan menghapusnya secara permanen dari database.`} 
      />

    </div>
  );
};

export default Kader;
