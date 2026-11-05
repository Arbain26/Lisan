import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

const INITIAL_FORM_STATE = {
  name: "",
  kampus: "",
  anggota: "",
  urutan: 0,
  is_active: 1,
};

/**
 * Komponen Modal Create & Edit Koordinator Wilayah
 * Standar acuan: Handbook Section 4.1 & Section 11.3
 */
export function KorwilModal({
  isOpen,
  mode = "create",
  initialData = null,
  isSaving = false,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name || "",
        kampus: initialData.kampus || "",
        anggota: initialData.anggota || "",
        urutan: initialData.urutan || 0,
        is_active: initialData.is_active ? 1 : 0,
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [initialData, mode, isOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-poppins font-bold text-xl text-gray-900">
                {mode === "create" ? "Tambah Koordinator Wilayah" : "Edit Koordinator Wilayah"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Modal"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Koordinator Wilayah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, kampus: e.target.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, anggota: e.target.value }))}
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, urutan: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))
                    }
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
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-inter text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-inter text-sm font-semibold transition-all shadow-md shadow-primary/20"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  <span>{isSaving ? "Menyimpan..." : "Simpan Wilayah"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

