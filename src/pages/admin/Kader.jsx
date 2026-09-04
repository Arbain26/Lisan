import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Download, Upload, FileSpreadsheet, Loader2, Users, GraduationCap, School, BookOpen } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import * as XLSX from 'xlsx';
import api from "../../services/api";
import { useToast } from "../../components/ui/ToastProvider";

const JENJANG_OPTIONS = ['PAKET FILSAFAT', 'LOGIKA', 'PENDALAMAN'];

const jenjangColor = (jenjang) => {
  const j = (jenjang || '').toUpperCase();
  if (j.includes('FILSAFAT'))  return 'bg-purple-50 text-purple-700';
  if (j.includes('LOGIKA'))    return 'bg-blue-50 text-blue-700';
  if (j.includes('PENDALAMAN')) return 'bg-emerald-50 text-emerald-700';
  return 'bg-gray-100 text-gray-600';
};

const Kader = () => {
  const { data, loading, isSubmitting, addItem, updateItem, deleteItem, refreshData } = useCRUD("/kader");
  const toast = useToast();

  const [searchTerm, setSearchTerm]             = useState("");
  const [filterAngkatan, setFilterAngkatan]     = useState("");
  const [filterJenjang, setFilterJenjang]       = useState("");
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem]         = useState(null);

  const emptyForm = { nama: "", angkatan: "", kampus: "", alamat: "", jenjang_kaderisasi: "", semester: "", status: "" };
  const [formData, setFormData] = useState(emptyForm);

  // Statistics
  const stats = useMemo(() => {
    const total         = data.length;
    const uniqueKampus  = new Set(data.map(k => k.kampus?.toLowerCase()).filter(Boolean)).size;
    const uniqueAngkatan = new Set(data.map(k => k.angkatan?.toLowerCase()).filter(Boolean)).size;
    const uniqueJenjang = new Set(data.map(k => k.jenjang_kaderisasi?.toLowerCase()).filter(Boolean)).size;
    return { total, uniqueKampus, uniqueAngkatan, uniqueJenjang };
  }, [data]);

  // Filter options
  const uniqueAngkatan = useMemo(() => {
    const list = [...new Set(data.map(i => i.angkatan).filter(Boolean))];
    return list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data]);

  const uniqueJenjang = useMemo(() => {
    return [...new Set(data.map(i => i.jenjang_kaderisasi).filter(Boolean))].sort();
  }, [data]);

  // Filtered table data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (item.nama || '').toLowerCase().includes(q) ||
        (item.kampus || '').toLowerCase().includes(q) ||
        (item.angkatan || '').toLowerCase().includes(q) ||
        (item.jenjang_kaderisasi || '').toLowerCase().includes(q);
      const matchAngkatan = !filterAngkatan || item.angkatan === filterAngkatan;
      const matchJenjang  = !filterJenjang  || item.jenjang_kaderisasi === filterJenjang;
      return matchSearch && matchAngkatan && matchJenjang;
    });
  }, [data, searchTerm, filterAngkatan, filterJenjang]);

  // Handlers
  const handleOpenAdd = () => { setSelectedItem(null); setFormData(emptyForm); setIsModalOpen(true); };
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      nama: item.nama || "", angkatan: item.angkatan || "", kampus: item.kampus || "",
      alamat: item.alamat || "", jenjang_kaderisasi: item.jenjang_kaderisasi || "",
      semester: item.semester || "", status: item.status || "",
    });
    setIsModalOpen(true);
  };
  const handleOpenDelete = (item) => { setSelectedItem(item); setIsDeleteModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.angkatan.trim() || !formData.kampus.trim()) return;
    if (selectedItem) { await updateItem(selectedItem.id, formData); }
    else              { await addItem(formData); }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) { await deleteItem(selectedItem.id); setIsDeleteModalOpen(false); }
  };

  // ── Excel Import: baca SEMUA sheet sekaligus ────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });

        // Helper: parse satu sheet → array of kader objects
        const parseSheet = (ws, sheetName) => {
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          if (!rows.length) return [];

          // Cari baris header (yang mengandung kata 'nama')
          let hIdx = -1;
          let headers = [];
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].join('').toLowerCase().includes('nama')) {
              hIdx = i;
              headers = rows[i].map(h => (typeof h === 'string' ? h.toLowerCase().replace(/[^a-z0-9]/g, '') : ''));
              break;
            }
          }
          if (hIdx === -1) return [];

          // Map kolom berdasarkan header
          const c = { nama: -1, angkatan: -1, kampus: -1, alamat: -1, jenjang: -1, semester: -1, status: -1 };
          headers.forEach((h, i) => {
            if (!h) return;
            if      (c.nama     < 0 && (h.includes('nama') || h.includes('name')))                                c.nama     = i;
            else if (c.angkatan < 0 && (h.includes('angkatan') || h.includes('lis') || h.includes('generasi'))) c.angkatan = i;
            else if (c.kampus   < 0 && (h.includes('kampus') || h.includes('universitas') ||
                                        h.includes('institusi') || h.includes('instansi') ||
                                        h.includes('sekolah')))                                                   c.kampus   = i;
            else if (c.alamat   < 0 && h.includes('alamat'))                                                     c.alamat   = i;
            else if (c.jenjang  < 0 && (h.includes('jenjang') || h.includes('kaderisasi') ||
                                        h.includes('paket') || h.includes('level')))                             c.jenjang  = i;
            else if (c.semester < 0 && (h.includes('semester') || h.includes('sem')))                           c.semester = i;
            else if (c.status   < 0 && h.includes('status'))                                                     c.status   = i;
          });

          // Jika tidak ada kolom angkatan → pakai nama sheet sebagai angkatan
          const fallbackAngkatan = c.angkatan < 0 ? sheetName.trim() : null;

          const result = [];
          for (let i = hIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row.length || !row.some(cell => cell)) continue;
            const nama = c.nama >= 0 ? String(row[c.nama] || '').trim() : '';
            if (!nama) continue;
            result.push({
              nama,
              angkatan:           fallbackAngkatan ?? String(row[c.angkatan] || '').trim(),
              kampus:             c.kampus   >= 0 ? String(row[c.kampus]   || '').trim() : '',
              alamat:             c.alamat   >= 0 ? String(row[c.alamat]   || '').trim() : '',
              jenjang_kaderisasi: c.jenjang  >= 0 ? String(row[c.jenjang]  || '').trim().toUpperCase() : '',
              semester:           c.semester >= 0 ? String(row[c.semester] || '').trim() : '',
              status:             c.status   >= 0 ? String(row[c.status]   || '').trim() : '',
            });
          }
          return result;
        };

        // 1. Baca SEMUA sheet dalam workbook
        const rawData = [];
        for (const sheetName of wb.SheetNames) {
          const parsed = parseSheet(wb.Sheets[sheetName], sheetName);
          console.info(`Sheet "${sheetName}": ${parsed.length} baris ditemukan`);
          rawData.push(...parsed);
        }

        if (rawData.length === 0) {
          toast.warning(`Tidak ada data di ${wb.SheetNames.length} sheet. Pastikan ada kolom NAMA.`);
          e.target.value = '';
          return;
        }

        // 2. Deduplikasi dalam file (nama + angkatan)
        const seen = new Set();
        const inFileDupes = [];
        const uniqueData = [];
        for (const item of rawData) {
          const key = item.nama.toLowerCase() + '||' + item.angkatan.toLowerCase();
          if (seen.has(key)) { inFileDupes.push(item.nama); }
          else { seen.add(key); uniqueData.push(item); }
        }

        // 3. Kirim ke backend /kader/bulk sekaligus
        const response = await api.post('/kader/bulk', { items: uniqueData });
        const { inserted, skipped, skippedDetails } = response.data;

        // 4. Tampilkan hasil
        const info = `(${wb.SheetNames.length} sheet, ${rawData.length} baris)`;
        const totalSkipped = skipped + inFileDupes.length;
        if (inserted > 0 && totalSkipped === 0) {
          toast.success(`Berhasil mengimpor ${inserted} kader ${info}`);
        } else if (inserted > 0) {
          toast.success(`${inserted} diimpor, ${totalSkipped} dilewati ${info}`);
        } else {
          toast.warning(`Tidak ada data baru. Semua ${totalSkipped} data sudah ada di database.`);
        }
        if (skippedDetails?.length > 0) console.info('Dilewati (sudah di DB):', skippedDetails);
        if (inFileDupes.length > 0)     console.info('Dilewati (duplikat file):', inFileDupes);

        await refreshData();
      } catch (error) {
        console.error('Error import Excel:', error);
        const msg = error.response?.data?.message || error.message || 'Gagal mengimpor file. Pastikan format sesuai.';
        toast.error(msg);
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      toast.error('Tidak ada data kader untuk diunduh');
      return;
    }
    const rows = data.map((k, idx) => ({
      'No': idx + 1,
      'Nama': k.nama || '',
      'Angkatan': k.angkatan || '',
      'Kampus': k.kampus || '',
      'Alamat': k.alamat || '',
      'Jenjang Kaderisasi': k.jenjang || '',
      'Semester': k.semester || '',
      'Status': k.status || 'Aktif'
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Database Kader');
    XLSX.writeFile(wb, `Data_Kader_LISAN_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Data kader berhasil diunduh ke Excel');
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Nama': 'Ahmad Fauzan',
        'Angkatan': 'LISAN 2025',
        'Kampus': 'Universitas Hasanuddin',
        'Alamat': 'Jl. Perintis Kemerdekaan',
        'Jenjang Kaderisasi': 'PAKET FILSAFAT',
        'Semester': 'Semester 3',
        'Status': 'Aktif'
      },
      {
        'Nama': 'Nur Hidayah',
        'Angkatan': 'LISAN 2024',
        'Kampus': 'UIN Alauddin Makassar',
        'Alamat': 'Samata, Gowa',
        'Jenjang Kaderisasi': 'LOGIKA',
        'Semester': 'Semester 5',
        'Status': 'Aktif'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Kader');
    XLSX.writeFile(wb, 'template_import_kader.xlsx');
    toast.success('Template Excel Kader berhasil diunduh');
  };

  // Render
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Database Kader</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Kelola data pembinaan kader LISAN secara manual atau via Excel</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleDownloadTemplate} 
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2.5 rounded-xl font-inter font-medium text-sm transition-colors"
            title="Unduh format template Excel kader"
          >
            <FileSpreadsheet size={17} className="text-gray-500" /> Template Excel
          </button>
          <button 
            onClick={handleExportExcel} 
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-inter font-medium text-sm transition-colors"
            title="Unduh seluruh data kader ke file Excel"
          >
            <Download size={17} className="text-emerald-600" /> Unduh Data Excel
          </button>
          <label className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2.5 rounded-xl font-inter font-medium text-sm transition-colors cursor-pointer">
            <Upload size={17} className="text-gray-500" /> Import Excel
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium text-sm transition-colors shadow-sm shadow-primary/20 shrink-0">
            <Plus size={17} /> Tambah Kader
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Total Kader</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl"><School size={24} /></div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Kampus</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.uniqueKampus}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl"><GraduationCap size={24} /></div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Total Angkatan</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.uniqueAngkatan}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl"><BookOpen size={24} /></div>
          <div>
            <p className="text-xs text-gray-400 font-inter font-bold uppercase tracking-wider">Jenjang</p>
            <h3 className="text-2xl font-poppins font-extrabold text-gray-800 mt-0.5">{stats.uniqueJenjang}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama, kampus, angkatan, atau jenjang..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:min-w-[160px] font-semibold text-gray-700">
            <option value="">Semua Angkatan</option>
            {uniqueAngkatan.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterJenjang} onChange={(e) => setFilterJenjang(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:min-w-[180px] font-semibold text-gray-700">
            <option value="">Semua Jenjang</option>
            {uniqueJenjang.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            isSearch={!!(searchTerm || filterAngkatan || filterJenjang)}
            message="Data kader tidak ditemukan"
            subMessage="Gunakan kata kunci lain atau bersihkan filter."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-inter font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 text-center w-12">No</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">Angkatan</th>
                    <th className="px-6 py-4">Kampus</th>
                    <th className="px-6 py-4">Jenjang Kaderisasi</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-inter text-sm">
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold text-xs">{item.angkatan}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">{item.kampus}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${jenjangColor(item.jenjang_kaderisasi)}`}>
                          {item.jenjang_kaderisasi || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold text-xs">Sem. {item.semester || '-'}</span>
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
              Menampilkan {filteredData.length} dari {data.length} data kader
            </div>
          </>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Data Kader" : "Tambah Kader Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4 font-semibold">
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Angkatan <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="Cth: LIS 5" value={formData.angkatan}
                onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Kampus <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="Cth: UNISAN" value={formData.kampus}
                onChange={(e) => setFormData({ ...formData, kampus: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Jenjang Kaderisasi</label>
              <select value={formData.jenjang_kaderisasi} onChange={(e) => setFormData({ ...formData, jenjang_kaderisasi: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-700">
                <option value="">-- Pilih Jenjang --</option>
                {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Semester</label>
              <input type="text" placeholder="Cth: III atau 3" value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Alamat</label>
            <input type="text" placeholder="Alamat tempat tinggal (opsional)" value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Status</label>
            <input type="text" placeholder="Cth: Aktif / Alumni (opsional)" value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-inter font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Kader"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
        title="Hapus Data Kader?"
        message={`Apakah Anda yakin ingin menghapus data kader "${selectedItem?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default Kader;
