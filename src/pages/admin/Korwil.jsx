import { useState } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import { useKorwil } from "@/hooks/useKorwil";
import { KorwilTable } from "@/components/admin/korwil/KorwilTable";
import { KorwilModal } from "@/components/admin/korwil/KorwilModal";

/**
 * Halaman Manajemen Koordinator Wilayah (Admin)
 * Direfaktor mengikuti arsitektur modular & batas baris Handbook Clean Code v2.0
 */
const KorwilAdmin = () => {
  const {
    filteredKorwils,
    loading,
    saving,
    searchTerm,
    setSearchTerm,
    createKorwil,
    updateKorwil,
    deleteKorwil,
    toggleKorwilStatus,
  } = useKorwil();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedKorwil, setSelectedKorwil] = useState(null);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedKorwil({
      name: "",
      kampus: "",
      anggota: "",
      urutan: filteredKorwils.length + 1,
      is_active: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode("edit");
    setSelectedKorwil(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    const success =
      modalMode === "create"
        ? await createKorwil(formData)
        : await updateKorwil(selectedKorwil.id, formData);

    if (success) {
      setIsModalOpen(false);
    }
  };

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
          type="button"
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

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <KorwilTable
          items={filteredKorwils}
          isLoading={loading}
          onEdit={handleOpenEdit}
          onDelete={deleteKorwil}
          onToggleStatus={toggleKorwilStatus}
        />
      </div>

      {/* Modal Dialog */}
      <KorwilModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedKorwil}
        isSaving={saving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default KorwilAdmin;
