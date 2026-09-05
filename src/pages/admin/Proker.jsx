import React, { useState, useEffect, useMemo } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Calendar, 
  UserCheck, 
  Activity, 
  TrendingUp,
  Clock,
  Check,
  RefreshCw,
  BellRing,
  Image,
  Camera,
  Edit,
  Trash,
  Plus,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import api from "../../services/api";
import { useToast } from "../../components/ui/ToastProvider";
import { getMediaUrl } from "../../services/mediaUrl";

const Proker = () => {
  const toast = useToast();
  
  // Tabs: 'list', 'dashboard', 'notifications'
  const [activeTab, setActiveTab] = useState("list");
  
  const [prokers, setProkers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025/2026");
  const [statusFilter, setStatusFilter] = useState("");
  const [indicatorFilter, setIndicatorFilter] = useState("");
  
  // Expanded rows map
  const [expandedRows, setExpandedRows] = useState({});
  
  // Upload States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadYear, setUploadYear] = useState("2025/2026");
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Execution Proof modal states
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofProkerId, setProofProkerId] = useState(null);
  const [proofScheduleId, setProofScheduleId] = useState(null);
  const [proofNotes, setProofNotes] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);

  // Manual Schedule action modal states
  const [isSchedActionModalOpen, setIsSchedActionModalOpen] = useState(false);
  const [schedActionType, setSchedActionType] = useState(""); // "add" or "edit"
  const [actionProkerId, setActionProkerId] = useState(null);
  const [actionScheduleId, setActionScheduleId] = useState(null);
  const [actionMonth, setActionMonth] = useState("");
  const [actionDateValue, setActionDateValue] = useState("");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prokerRes, dashRes, notifRes, filesRes] = await Promise.all([
        api.get("/proker", { params: { status: statusFilter, tahun: selectedYear } }),
        api.get("/proker/dashboard", { params: { tahun: selectedYear } }),
        api.get("/proker/notifications"),
        api.get("/proker/files")
      ]);

      if (prokerRes?.data) setProkers(prokerRes.data);
      if (dashRes?.data) setDashboardData(dashRes.data);
      if (notifRes?.data) setNotifications(notifRes.data);
      if (filesRes?.data) setUploadedFiles(filesRes.data);
    } catch (error) {
      console.error("Error fetching proker data:", error);
      toast.error("Gagal mengambil data Program Kerja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllData();
      toast.success("Data berhasil disegarkan");
    } catch (error) {
      toast.error("Gagal menyegarkan data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/proker/template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_proker.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template Excel berhasil diunduh");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh template Excel");
    }
  };

  const handleDownloadUploadedFile = async (file) => {
    try {
      const response = await api.get(`/proker/files/${file.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.original_name || "matriks_proker.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`File "${file.original_name}" berhasil diunduh`);
    } catch (error) {
      console.error("Download error:", error);
      if (file.file_path) {
        window.open(getMediaUrl(file.file_path), "_blank");
      } else {
        toast.error("Gagal mengunduh file matriks");
      }
    }
  };

  const handleExportProkerData = () => {
    if (!prokers || prokers.length === 0) {
      toast.error("Belum ada data program kerja untuk diekspor");
      return;
    }

    const months = [
      'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari',
      'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli'
    ];

    // Multi-level hierarchical header matrix matching the web layout and standard matrix format
    const headerRows = [
      [
        'No', 'Kode', 'Program Kerja / Kegiatan', 'Penanggung Jawab', 
        'Bulan Perencanaan', '', '', '', '', '', '', '', '', '', '', '', 
        'Status Kerja', 'Progres Realisasi', 'Keterangan Terlaksana', 'Keterangan Tidak Terlaksana'
      ],
      [
        '', '', '', '', 
        'Semester Ganjil', '', '', '', '', '', 
        'Semester Genap', '', '', '', '', '', 
        '', '', '', ''
      ],
      [
        '', '', '', '', 
        'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari',
        'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
        '', '', '', ''
      ]
    ];

    const dataRows = prokers.map((p, idx) => {
      const monthValues = months.map(m => {
        const scheds = (p.schedules || []).filter(s => s.bulan && s.bulan.toLowerCase() === m.toLowerCase());
        return scheds.map(s => s.tanggal).filter(Boolean).join(', ');
      });

      const progresPercent = typeof p.progres === 'number' ? `${Math.round(p.progres)}%` : '0%';

      return [
        idx + 1,
        p.kode || `PRK-${String(idx + 1).padStart(3, '0')}`,
        p.kegiatan || p.nama_kegiatan || '',
        p.penanggung_jawab || '',
        ...monthValues,
        p.status || 'Belum Mulai',
        progresPercent,
        p.keterangan_terlaksana || '',
        p.keterangan_tidak_terlaksana || ''
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows]);

    // Merges for multi-tier matrix header
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },  // No
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },  // Kode
      { s: { r: 0, c: 2 }, e: { r: 2, c: 2 } },  // Program Kerja / Kegiatan
      { s: { r: 0, c: 3 }, e: { r: 2, c: 3 } },  // Penanggung Jawab
      { s: { r: 0, c: 4 }, e: { r: 0, c: 15 } }, // Bulan Perencanaan (12 bulan)
      { s: { r: 1, c: 4 }, e: { r: 1, c: 9 } },  // Semester Ganjil (Agustus - Januari)
      { s: { r: 1, c: 10 }, e: { r: 1, c: 15 } },// Semester Genap (Februari - Juli)
      { s: { r: 0, c: 16 }, e: { r: 2, c: 16 } }, // Status Kerja
      { s: { r: 0, c: 17 }, e: { r: 2, c: 17 } }, // Progres Realisasi
      { s: { r: 0, c: 18 }, e: { r: 2, c: 18 } }, // Keterangan Terlaksana
      { s: { r: 0, c: 19 }, e: { r: 2, c: 19 } }  // Keterangan Tidak Terlaksana
    ];

    // Lebar kolom rapi & lapang
    ws['!cols'] = [
      { wch: 6 },   // No
      { wch: 14 },  // Kode
      { wch: 40 },  // Program Kerja / Kegiatan
      { wch: 35 },  // Penanggung Jawab
      // 12 Bulan Perencanaan
      { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
      { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
      { wch: 18 },  // Status Kerja
      { wch: 18 },  // Progres Realisasi
      { wch: 40 },  // Keterangan Terlaksana
      { wch: 40 }   // Keterangan Tidak Terlaksana
    ];

    // Tinggi baris rapi
    const rowHeights = [
      { hpt: 28 }, // Baris header 1
      { hpt: 22 }, // Baris header 2
      { hpt: 22 }  // Baris header 3
    ];
    for (let i = 0; i < dataRows.length; i++) {
      rowHeights.push({ hpt: 24 });
    }
    ws['!rows'] = rowHeights;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriks Proker");
    const cleanYear = (selectedYear || "2025-2026").replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(wb, `Matriks_Program_Kerja_LISAN_${cleanYear}.xlsx`);
    toast.success("Data matriks proker berhasil diekspor ke Excel dengan format rapi");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadErrors([]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Pilih file Excel terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("tahun_kepengurusan", uploadYear);

    setUploading(true);
    setUploadErrors([]);

    try {
      const res = await api.post("/proker/upload", formData);
      
      toast.success(res.data.message || "File Excel berhasil diunggah");
      setUploadFile(null);
      setIsUploadModalOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.data?.errors) {
        setUploadErrors(error.response.data.errors);
        toast.error("Terdapat kesalahan format data di dalam file Excel");
      } else {
        const errorDetail = error.response?.data?.error;
        const errorMessage = error.response?.data?.message || "Gagal mengunggah file Excel";
        toast.error(errorDetail ? `${errorMessage}: ${errorDetail}` : errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const updateLocalProkerSchedule = (prokerId, scheduleId, status, keterangan, foto_url, responseData) => {
    setProkers(prev => prev.map(p => {
      if (p.id === prokerId) {
        const updatedSchedules = p.schedules.map(s => {
          if (s.id === scheduleId) {
            return { ...s, status, keterangan, foto_url };
          }
          return s;
        });
        return {
          ...p,
          progres: responseData.progres,
          status: responseData.status,
          indicator: responseData.indicator,
          schedules: updatedSchedules
        };
      }
      return p;
    }));
  };

  const handleCycleStatus = async (prokerId, scheduleId, currentStatus) => {
    if (currentStatus === "Terlaksana") {
      if (!window.confirm("Mengubah status dari 'Terlaksana' akan menghapus laporan catatan dan foto dokumentasi kegiatan ini. Apakah Anda yakin?")) {
        return;
      }
    }

    const statuses = ["Belum Mulai", "Terlaksana", "Tidak Terlaksana"];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    if (nextStatus === "Terlaksana") {
      const proker = prokers.find(p => p.id === prokerId);
      const sched = proker?.schedules.find(s => s.id === scheduleId);
      
      setProofProkerId(prokerId);
      setProofScheduleId(scheduleId);
      setProofNotes(sched?.keterangan || "");
      setProofImage(null);
      setProofImagePreview(sched?.foto_url ? getMediaUrl(sched.foto_url) : null);
      setIsProofModalOpen(true);
      return;
    }

    try {
      const response = await api.put(`/proker/${prokerId}/schedule/${scheduleId}`, {
        status: nextStatus
      });

      updateLocalProkerSchedule(prokerId, scheduleId, nextStatus, null, null, response.data);

      // Refresh dashboard & notifications
      const dashRes = await api.get("/proker/dashboard", { params: { tahun: selectedYear } });
      setDashboardData(dashRes.data);
      const notifRes = await api.get("/proker/notifications");
      setNotifications(notifRes.data);

      toast.success(`Agenda berhasil diubah menjadi: ${nextStatus}`);
    } catch (error) {
      console.error("Error updating schedule status:", error);
      toast.error("Gagal mengubah status agenda");
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProof(true);

    const formData = new FormData();
    formData.append("status", "Terlaksana");
    formData.append("keterangan", proofNotes);
    if (proofImage) {
      formData.append("image", proofImage);
    }

    try {
      const response = await api.put(`/proker/${proofProkerId}/schedule/${proofScheduleId}`, formData);

      const updatedSched = response.data.schedule;
      updateLocalProkerSchedule(
        proofProkerId,
        proofScheduleId,
        "Terlaksana",
        updatedSched.keterangan,
        updatedSched.foto_url,
        response.data
      );

      // Refresh dashboard & notifications
      const dashRes = await api.get("/proker/dashboard", { params: { tahun: selectedYear } });
      setDashboardData(dashRes.data);
      const notifRes = await api.get("/proker/notifications");
      setNotifications(notifRes.data);

      toast.success("Dokumentasi kegiatan berhasil diunggah!");
      setIsProofModalOpen(false);
    } catch (error) {
      console.error("Error uploading proof of execution:", error);
      toast.error(error.response?.data?.message || "Gagal mengunggah dokumentasi");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleAddDatePrompt = (prokerId, month) => {
    setActionProkerId(prokerId);
    setActionMonth(month);
    setSchedActionType("add");
    setActionDateValue("");
    setIsSchedActionModalOpen(true);
  };

  const handleEditDatePrompt = (prokerId, scheduleId, currentVal) => {
    setActionProkerId(prokerId);
    setActionScheduleId(scheduleId);
    setSchedActionType("edit");
    setActionDateValue(currentVal);
    setIsSchedActionModalOpen(true);
  };

  const handleDeleteDateConfirm = async (prokerId, scheduleId, dateVal) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jadwal tanggal "${dateVal}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/proker/${prokerId}/schedule/${scheduleId}`);

      // Update local state by removing the deleted schedule item
      setProkers(prev => prev.map(p => {
        if (p.id === prokerId) {
          const updatedSchedules = p.schedules.filter(s => s.id !== scheduleId);
          return {
            ...p,
            progres: response.data.progres,
            status: response.data.status,
            indicator: response.data.indicator,
            schedules: updatedSchedules
          };
        }
        return p;
      }));

      // Refresh dashboard & notifications
      const dashRes = await api.get("/proker/dashboard", { params: { tahun: selectedYear } });
      setDashboardData(dashRes.data);
      const notifRes = await api.get("/proker/notifications");
      setNotifications(notifRes.data);

      toast.success("Jadwal berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Gagal menghapus jadwal");
    }
  };

  const handleSchedActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionDateValue.trim()) return;

    try {
      if (schedActionType === "add") {
        const response = await api.post(`/proker/${actionProkerId}/schedule`, {
          bulan: actionMonth,
          tanggal: actionDateValue
        });

        // Add to local state
        setProkers(prev => prev.map(p => {
          if (p.id === actionProkerId) {
            return {
              ...p,
              progres: response.data.progres,
              status: response.data.status,
              indicator: response.data.indicator,
              schedules: [...p.schedules, response.data.schedule]
            };
          }
          return p;
        }));

        toast.success("Jadwal berhasil ditambahkan!");
      } else {
        const response = await api.put(`/proker/${actionProkerId}/schedule/${actionScheduleId}/reschedule`, {
          tanggal: actionDateValue
        });

        // Update local state
        setProkers(prev => prev.map(p => {
          if (p.id === actionProkerId) {
            const updatedSchedules = p.schedules.map(s => {
              if (s.id === actionScheduleId) {
                return response.data.schedule;
              }
              return s;
            });
            return {
              ...p,
              progres: response.data.progres,
              status: response.data.status,
              indicator: response.data.indicator,
              schedules: updatedSchedules
            };
          }
          return p;
        }));

        toast.success("Jadwal berhasil diubah!");
      }

      // Refresh dashboard & notifications
      const dashRes = await api.get("/proker/dashboard", { params: { tahun: selectedYear } });
      setDashboardData(dashRes.data);
      const notifRes = await api.get("/proker/notifications");
      setNotifications(notifRes.data);

      setIsSchedActionModalOpen(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan jadwal");
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.post(`/proker/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Peringatan ditandai sebagai dibaca");
      
      // Refresh sidebar notifications if needed (handled by layout hook or simple state update)
    } catch (error) {
      console.error(error);
      toast.error("Gagal menandai peringatan sebagai dibaca");
    }
  };

  // Filter & Search Logic
  const filteredProkers = useMemo(() => {
    return prokers.filter(p => {
      const matchSearch = 
        p.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.penanggung_jawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchIndicator = indicatorFilter ? p.indicator === indicatorFilter : true;
      
      return matchSearch && matchIndicator;
    });
  }, [prokers, searchTerm, indicatorFilter]);

  const monthsOrder = [
    'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari',
    'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli'
  ];

  // Helper to render indicator colors
  const renderIndicator = (indicator) => {
    switch (indicator) {
      case 'green':
        return <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>;
      case 'yellow':
        return <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>;
      case 'red':
        return <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>;
      default:
        return <span className="h-3 w-3 rounded-full bg-gray-400 block"></span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-dark to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-poppins font-extrabold tracking-tight">Monitoring Program Kerja (Proker)</h1>
            <p className="text-gray-300 font-inter text-sm max-w-xl">
              Unggah file Excel Matriks Kerja Anda, sistem akan secara otomatis memvalidasi, menyusun timeline, memetakan penanggung jawab, serta mendeteksi keterlambatan realisasi secara real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-2xl font-inter font-medium text-sm transition-all"
              title="Unduh format template Excel untuk diisi"
            >
              <Download size={18} />
              Unduh Template
            </button>
            <button
              onClick={handleExportProkerData}
              className="flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-500/30 px-4 py-2.5 rounded-2xl font-inter font-medium text-sm transition-all shadow-md shadow-emerald-950/20"
              title="Unduh seluruh data program kerja dan matriks yang ada ke Excel"
            >
              <FileDown size={18} />
              Ekspor Data Excel
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-5 py-2.5 rounded-2xl font-inter font-semibold text-sm transition-all shadow-lg shadow-primary/30"
            >
              <Upload size={18} />
              Upload Matriks Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Period selection */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1.5 self-start">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2.5 rounded-lg text-sm font-inter font-medium transition-all ${
              activeTab === "list" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Matriks & Daftar Proker
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 rounded-lg text-sm font-inter font-medium transition-all ${
              activeTab === "dashboard" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Statistik Monitoring
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-5 py-2.5 rounded-lg text-sm font-inter font-medium transition-all flex items-center gap-2 ${
              activeTab === "notifications" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Peringatan & Deviasi
            {notifications.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
            <span className="text-xs font-inter font-semibold text-gray-500 uppercase">Tahun Kepengurusan:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-sm font-inter font-bold text-gray-800 focus:outline-none"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
              <option value="2027/2028">2027/2028</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="font-inter text-gray-500 text-sm">Mengevaluasi dan memuat data Program Kerja...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: LIST MATRIKS */}
          {activeTab === "list" && (
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              {dashboardData && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-gray-500 font-inter text-xs font-medium mb-1">Total Proker</span>
                    <span className="text-3xl font-poppins font-bold text-gray-800">{dashboardData.stats.total}</span>
                    <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div className="bg-emerald-50/20 p-5 rounded-2xl shadow-sm border border-emerald-100/50 flex flex-col">
                    <span className="text-emerald-600 font-inter text-xs font-semibold mb-1">Proker Selesai</span>
                    <span className="text-3xl font-poppins font-bold text-emerald-700">{dashboardData.stats.completed}</span>
                    <div className="mt-2 w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${dashboardData.stats.total > 0 ? (dashboardData.stats.completed / dashboardData.stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-blue-50/20 p-5 rounded-2xl shadow-sm border border-blue-100/50 flex flex-col">
                    <span className="text-blue-600 font-inter text-xs font-semibold mb-1">Sedang Berjalan</span>
                    <span className="text-3xl font-poppins font-bold text-blue-700">{dashboardData.stats.running}</span>
                    <div className="mt-2 w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${dashboardData.stats.total > 0 ? (dashboardData.stats.running / dashboardData.stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-amber-50/20 p-5 rounded-2xl shadow-sm border border-amber-100/50 flex flex-col">
                    <span className="text-amber-600 font-inter text-xs font-semibold mb-1">Belum Mulai</span>
                    <span className="text-3xl font-poppins font-bold text-amber-700">{dashboardData.stats.notStarted}</span>
                    <div className="mt-2 w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${dashboardData.stats.total > 0 ? (dashboardData.stats.notStarted / dashboardData.stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-rose-50/20 p-5 rounded-2xl shadow-sm border border-rose-100/50 flex flex-col col-span-2 lg:col-span-1">
                    <span className="text-rose-600 font-inter text-xs font-semibold mb-1">Terlambat / Deviasi</span>
                    <span className="text-3xl font-poppins font-bold text-rose-700">{dashboardData.stats.delayed}</span>
                    <div className="mt-2 w-full bg-rose-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${dashboardData.stats.total > 0 ? (dashboardData.stats.delayed / dashboardData.stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Banner if there are any alerts */}
              {notifications.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="font-inter text-sm font-semibold text-amber-800">Perhatian: Sistem Mendeteksi Kendala Pelaksanaan Proker</p>
                      <p className="font-inter text-xs text-amber-600">Ada {notifications.length} program kerja yang menyimpang dari Matriks Kerja (terlambat atau tidak terlaksana sesuai jadwal).</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("notifications")} 
                    className="bg-amber-600 hover:bg-amber-700 text-white font-inter text-xs font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    Lihat Kendala
                  </button>
                </div>
              )}

              {/* Filters Panel */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col lg:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari Proker berdasarkan kode, nama kegiatan, atau penanggung jawab..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 w-full sm:w-auto">
                    <span className="text-xs font-inter font-semibold text-gray-500 uppercase">Indikator:</span>
                    <select
                      value={indicatorFilter}
                      onChange={(e) => setIndicatorFilter(e.target.value)}
                      className="bg-transparent text-sm font-inter font-bold text-gray-700 focus:outline-none"
                    >
                      <option value="">Semua Indikator</option>
                      <option value="green">🟢 Sesuai Jadwal</option>
                      <option value="yellow">🟡 Berpotensi Terlambat</option>
                      <option value="red">🔴 Terlambat / Deviasi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Uploaded Files History Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-poppins font-bold text-sm text-gray-800 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-500" size={18} />
                  Riwayat Dokumen Matriks Terunggah
                </h3>
                {uploadedFiles.length === 0 ? (
                  <p className="text-xs text-gray-400 font-inter italic">Belum ada file matriks yang diunggah.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="p-3 border border-gray-200 rounded-xl flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                            <FileSpreadsheet size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-gray-700 truncate" title={file.original_name}>
                              {file.original_name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {(file.file_size / 1024).toFixed(1)} KB • {new Date(file.uploaded_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadUploadedFile(file)}
                          className="p-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title={`Unduh Dokumen: ${file.original_name}`}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table List */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                {filteredProkers.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100">
                      <FileSpreadsheet size={28} />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-gray-800">Program Kerja Tidak Ditemukan</h3>
                      <p className="font-inter text-sm text-gray-500 max-w-sm mt-1">
                        {searchTerm ? `Tidak ditemukan data untuk pencarian "${searchTerm}"` : "Belum ada Program Kerja di tahun kepengurusan ini. Silakan unggah file Excel."}
                      </p>
                    </div>
                    {searchTerm && (
                      <button 
                        onClick={() => { setSearchTerm(""); setIndicatorFilter(""); }} 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-inter text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-inter font-semibold text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 w-12 text-center">Status</th>
                          <th className="px-6 py-4 w-24">Kode</th>
                          <th className="px-6 py-4">Nama Kegiatan</th>
                          <th className="px-6 py-4">Penanggung Jawab</th>
                          <th className="px-6 py-4 w-48">Progres Realisasi</th>
                          <th className="px-6 py-4 w-28">Status Kerja</th>
                          <th className="px-6 py-4 w-16 text-center">Detil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-inter">
                        {filteredProkers.map((p) => {
                          const isExpanded = !!expandedRows[p.id];
                          return (
                            <React.Fragment key={p.id}>
                              <tr 
                                onClick={() => toggleRow(p.id)}
                                className={`cursor-pointer hover:bg-gray-50/50 transition-colors ${isExpanded ? "bg-gray-50/30" : ""}`}
                              >
                                <td className="px-6 py-5 text-center">
                                  <div className="flex items-center justify-center">
                                    {renderIndicator(p.indicator)}
                                  </div>
                                </td>
                                <td className="px-6 py-5 font-bold text-gray-800 text-sm">
                                  {p.kode}
                                </td>
                                <td className="px-6 py-5 font-poppins font-semibold text-gray-900 text-sm">
                                  {p.kegiatan}
                                </td>
                                <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold font-poppins">
                                      {p.penanggung_jawab.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate max-w-[200px]" title={p.penanggung_jawab}>
                                      {p.penanggung_jawab}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                      <span className="text-gray-500">{p.schedules.filter(s => s.status === 'Terlaksana').length} / {p.schedules.length} Kegiatan</span>
                                      <span className={p.progres === 100 ? "text-emerald-600" : "text-gray-700"}>
                                        {Math.round(p.progres)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          p.progres === 100 
                                            ? "bg-emerald-500" 
                                            : p.indicator === 'red' 
                                            ? "bg-rose-500" 
                                            : p.indicator === 'yellow' 
                                            ? "bg-amber-500" 
                                            : "bg-blue-500"
                                        }`}
                                        style={{ width: `${p.progres}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                    p.status === 'Selesai'
                                      ? "bg-emerald-100 text-emerald-700"
                                      : p.status === 'Terlambat'
                                      ? "bg-rose-100 text-rose-700"
                                      : p.status === 'Belum Mulai'
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <button className="text-gray-400 hover:text-gray-800">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded Row: Matriks Kerja Detail */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={7} className="px-8 py-6 bg-gray-50/50 border-t border-b border-gray-100">
                                    <div className="space-y-6">
                                      {/* Header details */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200/60 pb-3 gap-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                                          <Calendar size={14} className="text-primary" />
                                          <span>Matriks Kerja Bulanan (Klik tanggal untuk memperbarui progres realisasi)</span>
                                        </div>
                                        <div className="flex gap-4 text-xs font-semibold text-gray-600">
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-3.5 h-3.5 bg-white border border-gray-300 rounded-md block"></span>
                                            <span>Belum Mulai</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-3.5 h-3.5 bg-emerald-100 border border-emerald-300 rounded-md block"></span>
                                            <span>Terlaksana</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-3.5 h-3.5 bg-rose-100 border border-rose-300 rounded-md block"></span>
                                            <span>Tidak Terlaksana</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Monthly Scheduler Grid */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {monthsOrder.map(month => {
                                          const monthSchedules = p.schedules.filter(s => s.bulan.toLowerCase() === month.toLowerCase());
                                          return (
                                            <div key={month} className="bg-white rounded-xl p-4 border border-gray-200/60 flex flex-col min-h-[100px] shadow-sm">
                                              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                                <span className="font-poppins font-bold text-xs text-gray-800 uppercase tracking-wider">
                                                  {month}
                                                </span>
                                                <button
                                                  onClick={() => handleAddDatePrompt(p.id, month)}
                                                  className="p-1 hover:bg-gray-100 text-primary hover:text-red-700 rounded-md transition-colors"
                                                  title={`Tambah Jadwal Bulan ${month}`}
                                                >
                                                  <Plus size={12} />
                                                </button>
                                              </div>
                                              <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                                                {monthSchedules.length === 0 ? (
                                                  <span className="text-[10px] text-gray-400 font-medium italic mt-2">Tidak ada jadwal</span>
                                                ) : (
                                                  monthSchedules.map(sched => (
                                                    <div 
                                                      key={sched.id}
                                                      className="relative w-full group/btn"
                                                    >
                                                      <button
                                                        onClick={() => handleCycleStatus(p.id, sched.id, sched.status)}
                                                        className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all select-none text-left w-full flex items-center justify-between pr-8 ${
                                                          sched.status === 'Terlaksana'
                                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                                                            : sched.status === 'Tidak Terlaksana'
                                                            ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/70"
                                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                        }`}
                                                      >
                                                        <span className="truncate max-w-[80%]" title={sched.tanggal}>{sched.tanggal}</span>
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                          {sched.status === 'Terlaksana' && sched.foto_url && (
                                                            <Image size={10} className="text-emerald-500 shrink-0" />
                                                          )}
                                                          {sched.status === 'Terlaksana' && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                                                          {sched.status === 'Tidak Terlaksana' && <XCircle size={12} className="text-rose-600 shrink-0" />}
                                                          {sched.status === 'Belum Mulai' && <Clock size={12} className="text-gray-400 shrink-0" />}
                                                        </div>
                                                      </button>
                                                      
                                                      {/* Floating Action Menu for Scheduling & Proof */}
                                                      <div className="absolute right-8 top-1/2 -translate-y-1/2 items-center gap-1 hidden group-hover/btn:flex transition-all z-10 bg-white border border-gray-150 p-0.5 rounded-md shadow-md">
                                                        {sched.status === 'Terlaksana' && (
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setProofProkerId(p.id);
                                                              setProofScheduleId(sched.id);
                                                              setProofNotes(sched.keterangan || "");
                                                              setProofImage(null);
                                                              setProofImagePreview(sched.foto_url ? getMediaUrl(sched.foto_url) : null);
                                                              setIsProofModalOpen(true);
                                                            }}
                                                            className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                                            title="Edit Bukti Pelaksanaan"
                                                          >
                                                            <Camera size={11} />
                                                          </button>
                                                        )}
                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditDatePrompt(p.id, sched.id, sched.tanggal);
                                                          }}
                                                          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
                                                          title="Ubah Tanggal"
                                                        >
                                                          <Edit size={11} />
                                                        </button>
                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDateConfirm(p.id, sched.id, sched.tanggal);
                                                          }}
                                                          className="p-0.5 text-rose-600 hover:bg-rose-50 rounded"
                                                          title="Hapus Jadwal"
                                                        >
                                                          <Trash size={11} />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Remarks / Comments */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200/60">
                                        <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                                          <h4 className="font-poppins font-bold text-xs text-emerald-800 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                            Keterangan Terlaksana
                                          </h4>
                                          <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                            {p.keterangan_terlaksana || <span className="italic text-gray-400">Tidak ada keterangan yang tercatat di file Excel.</span>}
                                          </p>
                                        </div>

                                        <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
                                          <h4 className="font-poppins font-bold text-xs text-rose-800 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                            <XCircle size={14} className="text-rose-600" />
                                            Keterangan Tidak Terlaksana
                                          </h4>
                                          <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                            {p.keterangan_tidak_terlaksana || <span className="italic text-gray-400">Tidak ada keterangan yang tercatat di file Excel.</span>}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DASHBOARD STATS */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Metric Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-poppins font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">Ringkasan Kesehatan Matriks</h3>
                
                {dashboardData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Selesai 100%</p>
                          <p className="text-lg font-bold text-gray-900">{dashboardData.stats.completed} Proker</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full">
                        {dashboardData.stats.total > 0 ? Math.round((dashboardData.stats.completed / dashboardData.stats.total) * 100) : 0}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Sedang Berjalan</p>
                          <p className="text-lg font-bold text-gray-900">{dashboardData.stats.running} Proker</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-full">
                        {dashboardData.stats.total > 0 ? Math.round((dashboardData.stats.running / dashboardData.stats.total) * 100) : 0}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Belum Berjalan</p>
                          <p className="text-lg font-bold text-gray-900">{dashboardData.stats.notStarted} Proker</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-full">
                        {dashboardData.stats.total > 0 ? Math.round((dashboardData.stats.notStarted / dashboardData.stats.total) * 100) : 0}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Terlambat / Deviasi</p>
                          <p className="text-lg font-bold text-rose-800">{dashboardData.stats.delayed} Proker</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-rose-100/50 px-2.5 py-1 rounded-full">
                        {dashboardData.stats.total > 0 ? Math.round((dashboardData.stats.delayed / dashboardData.stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Columns: Target vs Realisasi Monthly Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-poppins font-bold text-lg text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Beban Matriks & Capaian Bulanan
                  </h3>
                  <span className="text-xs font-inter text-gray-500 font-medium">Semester Ganjil & Genap</span>
                </div>

                {dashboardData && (
                  <div className="flex-1 flex flex-col justify-between min-h-[300px]">
                    <div className="grid grid-cols-12 gap-2 h-64 items-end pt-6 px-2">
                      {dashboardData.chartData.map((item, idx) => {
                        const maxVal = Math.max(...dashboardData.chartData.map(c => Math.max(c.target, c.realisasi)), 1);
                        const targetHeight = (item.target / maxVal) * 100;
                        const realisasiHeight = (item.realisasi / maxVal) * 100;
                        
                        return (
                          <div key={idx} className="col-span-1 flex flex-col items-center h-full group relative">
                            {/* Hover values tooltip */}
                            <div className="absolute bottom-full mb-2 bg-slate-900 text-white rounded-lg p-2 text-[10px] hidden group-hover:block z-20 pointer-events-none w-20 text-center font-inter shadow-xl">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-blue-300">Tgt: {item.target}</p>
                              <p className="text-emerald-300">Real: {item.realisasi}</p>
                            </div>

                            {/* Bar pair container */}
                            <div className="w-full flex items-end justify-center gap-1 h-full pb-2">
                              {/* Target Bar */}
                              <div 
                                className="w-2.5 sm:w-3.5 bg-blue-400/30 group-hover:bg-blue-400 rounded-t-sm transition-all"
                                style={{ height: `${targetHeight}%` }}
                                title={`Target: ${item.target}`}
                              />
                              {/* Realisasi Bar */}
                              <div 
                                className={`w-2.5 sm:w-3.5 rounded-t-sm transition-all ${
                                  item.realisasi >= item.target && item.target > 0
                                    ? "bg-emerald-500 group-hover:bg-emerald-600"
                                    : "bg-rose-400 group-hover:bg-rose-500"
                                }`}
                                style={{ height: `${realisasiHeight}%` }}
                                title={`Realisasi: ${item.realisasi}`}
                              />
                            </div>

                            {/* Label */}
                            <span className="text-[9px] font-bold text-gray-400 font-inter rotate-45 origin-left translate-x-2 mt-1 whitespace-nowrap">
                              {item.name.slice(0, 3)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-100 mt-6 pt-4 flex justify-center gap-6 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 bg-blue-300 rounded-md block"></span>
                        <span className="text-gray-600">Target Direncana</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 bg-emerald-500 rounded-md block"></span>
                        <span className="text-gray-600">Terealisasi</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS / WARNINGS */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-lg text-gray-900">Peringatan Keterlambatan Kerja</h3>
                    <p className="font-inter text-xs text-gray-500">Notifikasi otomatis dari monitoring engine yang mendeteksi deviasi jadwal Proker.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full shrink-0">
                  {notifications.length} Unresolved Alerts
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-gray-800">Semua Berjalan Lancar!</h4>
                    <p className="font-inter text-sm text-gray-500 max-w-sm mt-1">
                      Tidak ada program kerja yang terlambat, meleset dari target, atau melewati tenggat waktu saat ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-rose-50/20 border border-rose-100/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl self-start">
                            <AlertTriangle size={20} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-inter text-sm text-gray-800 font-semibold leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{notif.type.toUpperCase().replace('_', ' ')}</span>
                              <span>•</span>
                              <span>PJ: {notif.penanggung_jawab}</span>
                              <span>•</span>
                              <span>Waktu terdeteksi: {new Date(notif.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleMarkNotificationRead(notif.id)}
                          className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-inter text-xs font-bold transition-all self-end sm:self-center shrink-0"
                        >
                          <Check size={14} />
                          Tandai Selesai
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* UPLOAD EXCEL MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative z-10 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-poppins font-extrabold text-xl text-gray-900">Upload Matriks Proker</h3>
                  <button 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-gray-400 hover:text-gray-700 text-sm font-semibold p-1"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-gray-700">Tahun Kepengurusan</label>
                    <select
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                    >
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                      <option value="2027/2028">2027/2028</option>
                    </select>
                    <p className="text-[11px] text-gray-400 font-medium">Matriks data yang diunggah akan disesuaikan dengan tahun kepengurusan yang dipilih.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-gray-700">File Excel Matriks Kerja</label>
                    <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-2xl p-6 text-center transition-all bg-gray-50 flex flex-col items-center justify-center gap-3 relative cursor-pointer group">
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="p-3 bg-white text-gray-400 group-hover:text-primary rounded-2xl shadow-sm border border-gray-100 transition-colors">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div>
                        <p className="font-inter text-xs text-gray-700 font-semibold">
                          {uploadFile ? uploadFile.name : "Seret file ke sini atau cari dari folder"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Hanya format .xlsx atau .xls dengan ukuran maksimal 10MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Upload errors list if any */}
                  {uploadErrors.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 max-h-40 overflow-y-auto">
                      <p className="font-inter text-xs font-bold text-rose-800">Gagal mengunggah. Terdapat kesalahan format pada baris:</p>
                      <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-1 font-medium">
                        {uploadErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 rounded-xl font-inter font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !uploadFile}
                      className="flex-1 px-4 py-3 rounded-xl font-inter font-bold text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Proses & Import
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL PROOF OF EXECUTION UPLOAD MODAL */}
      <AnimatePresence>
        {isProofModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProofModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative z-10 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-poppins font-extrabold text-xl text-gray-900 flex items-center gap-2">
                    <Camera className="text-primary" size={22} />
                    Dokumentasi Kegiatan Terlaksana
                  </h3>
                  <button 
                    onClick={() => setIsProofModalOpen(false)}
                    className="text-gray-400 hover:text-gray-700 text-sm font-semibold p-1"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <form onSubmit={handleProofSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-gray-700">Laporan / Keterangan Pelaksanaan</label>
                    <textarea
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      placeholder="Masukkan catatan pelaksanaan kegiatan (misal: Kegiatan yasinan dihadiri 20 kader dan berjalan khidmat...)"
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-gray-700">Foto Dokumentasi (Bukti Pelaksanaan)</label>
                    
                    {proofImagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2 group max-h-[350px]">
                        <img 
                          src={proofImagePreview} 
                          alt="Preview Bukti" 
                          className="w-full h-auto max-h-[330px] object-contain rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProofImage(null);
                            setProofImagePreview(null);
                          }}
                          className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-lg"
                          title="Hapus Foto"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-2xl p-6 text-center transition-all bg-gray-50 flex flex-col items-center justify-center gap-3 relative cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setProofImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProofImagePreview(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="p-3 bg-white text-gray-400 group-hover:text-primary rounded-2xl shadow-sm border border-gray-100 transition-colors">
                          <Image size={24} />
                        </div>
                        <div>
                          <p className="font-inter text-xs text-gray-700 font-semibold">
                            Pilih Foto Dokumentasi
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">Hanya format gambar (JPEG, PNG, WEBP, dll.)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsProofModalOpen(false)}
                      disabled={submittingProof}
                      className="flex-1 px-4 py-3 rounded-xl font-inter font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProof}
                      className="flex-1 px-4 py-3 rounded-xl font-inter font-bold text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                      {submittingProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Simpan Bukti
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD/EDIT MANUAL SCHEDULE DATE MODAL */}
      <AnimatePresence>
        {isSchedActionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSchedActionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 border border-gray-100"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-poppins font-extrabold text-xl text-gray-900 flex items-center gap-2">
                    <Calendar className="text-primary" size={22} />
                    {schedActionType === "add" ? "Tambah Jadwal Baru" : "Ubah Tanggal Jadwal"}
                  </h3>
                  <button 
                    onClick={() => setIsSchedActionModalOpen(false)}
                    className="text-gray-400 hover:text-gray-700 text-sm font-semibold p-1"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <form onSubmit={handleSchedActionSubmit} className="space-y-5">
                  {schedActionType === "add" && (
                    <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                      <span>Bulan Sasaran:</span>
                      <span className="text-primary font-bold">{actionMonth}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-inter font-bold text-gray-700">Tanggal / Agenda Jadwal</label>
                    <input
                      type="text"
                      value={actionDateValue}
                      onChange={(e) => setActionDateValue(e.target.value)}
                      placeholder="Masukkan tanggal atau info (misal: 12, 18, atau Akhir Bulan)"
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl px-4 py-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                      required
                      autoFocus
                    />
                    <p className="text-[10px] text-gray-400 font-medium">Bisa diisi angka tanggal saja (misal: 15) atau teks keterangan (misal: Minggu ke-2).</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsSchedActionModalOpen(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-inter font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 rounded-xl font-inter font-bold text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
                    >
                      <Check size={16} />
                      Simpan Jadwal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Proker;
