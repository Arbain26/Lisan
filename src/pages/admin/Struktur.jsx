import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Users, BookOpen, HeartHandshake, Laptop, Megaphone, Folder, Award, Shield, HelpCircle } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";

// Map available icon string names to components
const iconMap = {
  Users: Users,
  BookOpen: BookOpen,
  HeartHandshake: HeartHandshake,
  Laptop: Laptop,
  Megaphone: Megaphone,
  Folder: Folder,
  Award: Award,
  Shield: Shield
};

const iconOptions = [
  { value: "Users", label: "Users / Kaderisasi" },
  { value: "BookOpen", label: "Book / Kajian & Keilmuan" },
  { value: "HeartHandshake", label: "Heart / Sosial Masyarakat" },
  { value: "Megaphone", label: "Megaphone / Media & Humas" },
  { value: "Laptop", label: "Laptop / Kewirausahaan & IT" },
  { value: "Folder", label: "Folder / Administrasi" },
  { value: "Award", label: "Award / Prestasi & Bakat" },
  { value: "Shield", label: "Shield / Advokasi" }
];

const colorOptions = [
  { value: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Hijau (Emerald)" },
  { value: "bg-blue-50 text-blue-600 border-blue-100", label: "Biru" },
  { value: "bg-red-50 text-red-600 border-red-100", label: "Merah" },
  { value: "bg-amber-50 text-amber-600 border-amber-100", label: "Oranye (Amber)" },
  { value: "bg-purple-50 text-purple-600 border-purple-100", label: "Ungu" },
  { value: "bg-indigo-50 text-indigo-600 border-indigo-100", label: "Nila (Indigo)" },
  { value: "bg-rose-50 text-rose-600 border-rose-100", label: "Merah Jambu (Rose)" }
];

const DynamiciCon = ({ name, size = 20, className = "" }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
};

const Struktur = () => {
  const [activeTab, setActiveTab] = useState("pengurus"); // "pengurus" or "departemen"
  const [searchTerm, setSearchTerm] = useState("");

  // CRUD Hooks
  const {
    data: depts,
    loading: deptsLoading,
    isSubmitting: deptsSubmitting,
    addItem: addDept,
    updateItem: updateDept,
    deleteItem: deleteDept
  } = useCRUD("/departemen");

  const {
    data: staff,
    loading: staffLoading,
    isSubmitting: staffSubmitting,
    addItem: addStaff,
    updateItem: updateStaff,
    deleteItem: deleteStaff
  } = useCRUD("/pengurus");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [deptFormData, setDeptFormData] = useState({
    nama: "",
    icon: "Users",
    color_theme: "bg-emerald-50 text-emerald-600 border-emerald-100",
    deskripsi: "",
    programsInput: "" // comma separated helper
  });

  const [staffFormData, setStaffFormData] = useState({
    nama: "",
    jabatan: "",
    departemen_id: "",
    urutan: 0,
    imageFile: null
  });

  // Filtered lists
  const filteredDepts = useMemo(() => {
    return depts.filter(d => d.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [depts, searchTerm]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nama_departemen && s.nama_departemen.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [staff, searchTerm]);

  // Handlers for Departemen
  const handleOpenAddDept = () => {
    setSelectedItem(null);
    setDeptFormData({
      nama: "",
      icon: "Users",
      color_theme: "bg-emerald-50 text-emerald-600 border-emerald-100",
      deskripsi: "",
      programsInput: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditDept = (dept) => {
    setSelectedItem(dept);
    setDeptFormData({
      nama: dept.nama,
      icon: dept.icon,
      color_theme: dept.color_theme,
      deskripsi: dept.deskripsi,
      programsInput: Array.isArray(dept.program_unggulan) ? dept.program_unggulan.join(", ") : ""
    });
    setIsModalOpen(true);
  };

  // Handlers for Pengurus
  const handleOpenAddStaff = () => {
    setSelectedItem(null);
    setStaffFormData({
      nama: "",
      jabatan: "",
      departemen_id: "",
      urutan: staff.length + 1,
      imageFile: null
    });
    setIsModalOpen(true);
  };

  const handleOpenEditStaff = (member) => {
    setSelectedItem(member);
    setStaffFormData({
      nama: member.nama,
      jabatan: member.jabatan,
      departemen_id: member.departemen_id || "",
      urutan: member.urutan || 0,
      imageFile: null
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    let success = false;
    if (activeTab === "departemen") {
      success = await deleteDept(selectedItem.id);
    } else {
      success = await deleteStaff(selectedItem.id);
    }

    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "departemen") {
      if (!deptFormData.nama.trim()) return;
      
      const payload = {
        nama: deptFormData.nama,
        icon: deptFormData.icon,
        color_theme: deptFormData.color_theme,
        deskripsi: deptFormData.deskripsi,
        program_unggulan: deptFormData.programsInput.split(",").map(p => p.trim()).filter(Boolean)
      };

      let success;
      if (selectedItem) {
        success = await updateDept(selectedItem.id, payload);
      } else {
        success = await addDept(payload);
      }
      if (success) setIsModalOpen(false);

    } else {
      if (!staffFormData.nama.trim() || !staffFormData.jabatan.trim()) return;

      const payload = new FormData();
      payload.append("nama", staffFormData.nama);
      payload.append("jabatan", staffFormData.jabatan);
      payload.append("departemen_id", staffFormData.departemen_id || "");
      payload.append("urutan", staffFormData.urutan);
      if (staffFormData.imageFile) {
        payload.append("image", staffFormData.imageFile);
      }

      let success;
      if (selectedItem) {
        success = await updateStaff(selectedItem.id, payload);
      } else {
        success = await addStaff(payload);
      }
      if (success) setIsModalOpen(false);
    }
  };

  const currentLoading = activeTab === "departemen" ? deptsLoading : staffLoading;
  const currentSubmitting = activeTab === "departemen" ? deptsSubmitting : staffSubmitting;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Kelola Struktur & Divisi</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Mengelola pengurus organisasi dan bidang departemen LISAN</p>
        </div>
        <button
          onClick={activeTab === "departemen" ? handleOpenAddDept : handleOpenAddStaff}
          className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0"
        >
          <Plus size={18} />
          {activeTab === "departemen" ? "Tambah Departemen" : "Tambah Pengurus"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("pengurus"); setSearchTerm(""); }}
          className={`px-6 py-3 font-poppins font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === "pengurus"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Struktur Pengurus
        </button>
        <button
          onClick={() => { setActiveTab("departemen"); setSearchTerm(""); }}
          className={`px-6 py-3 font-poppins font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === "departemen"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Departemen / Divisi
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === "departemen" ? "Cari nama departemen..." : "Cari nama, jabatan, atau departemen..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {currentLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : activeTab === "departemen" ? (
          // DEPARTEMEN TAB TABLE
          filteredDepts.length === 0 ? (
            <EmptyState
              isSearch={searchTerm !== ""}
              message={searchTerm !== "" ? "Departemen tidak ditemukan" : "Belum ada departemen"}
              subMessage={searchTerm !== "" ? `Tidak ada hasil untuk "${searchTerm}"` : "Mulai dengan menambahkan departemen baru."}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Departemen</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Icon & Tema</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Program Unggulan</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDepts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-poppins font-medium text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl border flex items-center justify-center ${item.color_theme}`}>
                            <DynamiciCon name={item.icon} size={18} />
                          </div>
                          <span className="text-xs text-gray-500 font-inter font-semibold">{item.icon}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-500 max-w-xs truncate" title={item.deskripsi}>
                        {item.deskripsi}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.program_unggulan) && item.program_unggulan.map((prog, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-inter rounded-md border border-gray-200">
                              {prog}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditDept(item)}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Hapus"
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
          )
        ) : (
          // PENGURUS TAB TABLE
          filteredStaff.length === 0 ? (
            <EmptyState
              isSearch={searchTerm !== ""}
              message={searchTerm !== "" ? "Pengurus tidak ditemukan" : "Belum ada pengurus"}
              subMessage={searchTerm !== "" ? `Tidak ada hasil untuk "${searchTerm}"` : "Mulai dengan menambahkan pengurus baru."}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Foto</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Jabatan</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Departemen</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Urutan Tampil</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400 font-poppins font-bold text-sm">
                          {item.foto_url ? (
                            <img src={`http://localhost:5000${item.foto_url}`} alt={item.nama} className="w-full h-full object-cover" />
                          ) : (
                            item.nama.charAt(0)
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-poppins font-medium text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.jabatan}</td>
                      <td className="px-6 py-4 text-sm font-inter">
                        {item.nama_departemen ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {item.nama_departemen}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            Pengurus Harian (PH)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600 font-semibold">{item.urutan}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditStaff(item)}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Hapus"
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
          )
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          activeTab === "departemen"
            ? selectedItem ? "Edit Departemen" : "Tambah Departemen"
            : selectedItem ? "Edit Pengurus" : "Tambah Pengurus"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "departemen" ? (
            // DEPARTEMEN FORM FIELDS
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-inter font-medium text-gray-700">Nama Departemen</label>
                <input
                  type="text"
                  required
                  value={deptFormData.nama}
                  onChange={(e) => setDeptFormData({ ...deptFormData, nama: e.target.value })}
                  placeholder="Contoh: Departemen Media & Komunikasi"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-inter font-medium text-gray-700">Icon Representatif</label>
                  <select
                    value={deptFormData.icon}
                    onChange={(e) => setDeptFormData({ ...deptFormData, icon: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-inter font-medium text-gray-700">Tema Warna</label>
                  <select
                    value={deptFormData.color_theme}
                    onChange={(e) => setDeptFormData({ ...deptFormData, color_theme: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {colorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-inter font-medium text-gray-700">Deskripsi Divisi</label>
                <textarea
                  rows="3"
                  required
                  value={deptFormData.deskripsi}
                  onChange={(e) => setDeptFormData({ ...deptFormData, deskripsi: e.target.value })}
                  placeholder="Tuliskan fokus kerja dan tanggung jawab dari departemen ini..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-inter font-medium text-gray-700">Program Unggulan (Pisahkan dengan Koma)</label>
                <input
                  type="text"
                  value={deptFormData.programsInput}
                  onChange={(e) => setDeptFormData({ ...deptFormData, programsInput: e.target.value })}
                  placeholder="Contoh: Upgrading Pengurus, Mentoring Rutin, Kaderisasi Raya"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </>
          ) : (
            // PENGURUS FORM FIELDS
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-inter font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={staffFormData.nama}
                  onChange={(e) => setStaffFormData({ ...staffFormData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap pengurus"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-inter font-medium text-gray-700">Jabatan</label>
                <input
                  type="text"
                  required
                  value={staffFormData.jabatan}
                  onChange={(e) => setStaffFormData({ ...staffFormData, jabatan: e.target.value })}
                  placeholder="Contoh: Ketua Umum, Kepala Departemen, Staff Ahli"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-inter font-medium text-gray-700">Departemen / Divisi</label>
                  <select
                    value={staffFormData.departemen_id}
                    onChange={(e) => setStaffFormData({ ...staffFormData, departemen_id: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Pengurus Harian (PH) / Inti</option>
                    {depts.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-inter font-medium text-gray-700">Urutan Tampil (Sort Index)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={staffFormData.urutan}
                    onChange={(e) => setStaffFormData({ ...staffFormData, urutan: parseInt(e.target.value) || 0 })}
                    placeholder="Semakin kecil tampil di atas"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-inter font-medium text-gray-700">Foto Resmi (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStaffFormData({ ...staffFormData, imageFile: e.target.files[0] })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={currentSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={currentSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors shadow-sm shadow-primary/20 flex items-center justify-center"
            >
              {currentSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={currentSubmitting}
        title={activeTab === "departemen" ? "Hapus Departemen?" : "Hapus Pengurus?"}
        message={
          activeTab === "departemen"
            ? `Apakah Anda yakin ingin menghapus departemen "${selectedItem?.nama}"? Menghapus departemen akan melepaskan afiliasi semua pengurus di dalamnya.`
            : `Apakah Anda yakin ingin menghapus pengurus "${selectedItem?.nama}"? Tindakan ini tidak dapat dibatalkan.`
        }
      />
    </div>
  );
};

export default Struktur;
