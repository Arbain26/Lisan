import { useState } from "react";
import { Plus, Trash2, Loader2, ImagePlus } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { getMediaUrl } from "../../services/mediaUrl";

const Galeri = () => {
  const { data, loading, isSubmitting, addItem, deleteItem } = useCRUD("/gallery");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    src: "",
    imageFile: null,
  });

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ title: "", src: "", imageFile: null });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageFile) return;

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("image", formData.imageFile);

    await addItem(payload, true);
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
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Kelola Galeri</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Kelola dokumentasi foto kegiatan LISAN</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
          <Plus size={18} /> Unggah Foto
        </button>
      </div>

      <div className="relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <EmptyState message="Galeri Kosong" subMessage="Silakan unggah foto dokumentasi kegiatan." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img src={getMediaUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleOpenDelete(item)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform transform scale-90 group-hover:scale-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-inter font-semibold text-sm text-gray-900 truncate">{item.title}</h3>
                  <p className="text-xs font-inter text-gray-500 mt-1">{new Date(item.date_taken).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Unggah Foto Galeri">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Unggah Foto</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                required={!formData.src}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, src: reader.result, imageFile: file });
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
              />
            </div>
            {formData.src && (
              <div className="mt-3 relative h-32 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={formData.src} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Judul Kegiatan</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Masukkan judul foto" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unggah"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isSubmitting} title="Hapus Foto?" message={`Apakah Anda yakin ingin menghapus foto "${selectedItem?.title}"?`} />
    </div>
  );
};

export default Galeri;
