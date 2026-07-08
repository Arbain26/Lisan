import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";

const HeroSlides = () => {
  const { data, loading, isSubmitting, addItem, updateItem, deleteItem } = useCRUD("/hero");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    highlight: "",
    sub: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ title: "", highlight: "", sub: "", image: null });
    setPreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({ 
      title: item.title, 
      highlight: item.highlight, 
      sub: item.sub, 
      image: null 
    });
    setPreview(
      item.image_url.startsWith('http') 
        ? item.image_url 
        : `http://localhost:5000${item.image_url}`
    );
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('highlight', formData.highlight);
    submitData.append('sub', formData.sub);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    if (selectedItem) {
      await updateItem(selectedItem.id, submitData, true);
    } else {
      await addItem(submitData, true);
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
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Kelola Slider Utama</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Atur gambar latar, judul, dan subteks di halaman beranda</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
            <Plus size={18} /> Tambah Slider
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada slide" subMessage="Mulai dengan menambahkan slide pertama." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {data.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-[16/9] relative bg-gray-100 overflow-hidden">
                  <img 
                    src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-poppins font-semibold text-lg text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="text-sm font-inter font-medium text-amber-500 mb-2">{item.highlight}</p>
                  <p className="font-inter text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{item.sub}</p>
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
                    <button onClick={() => handleOpenEdit(item)} className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleOpenDelete(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedItem ? "Edit Slider" : "Tambah Slider"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Gambar Slider</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl relative hover:border-primary/50 transition-colors bg-gray-50 overflow-hidden">
              {preview ? (
                <div className="absolute inset-0 w-full h-full">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <label className="cursor-pointer bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:bg-white transition-colors shadow-sm">
                      Ganti Gambar
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center relative z-10">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-red-800 px-2 py-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload file</span>
                      <input type="file" className="hidden" accept="image/*" required={!selectedItem} onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF max 5MB (Disarankan lanskap 16:9)</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Teks Baris Pertama (Title)</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Cth: Lingkar Mahasiswa Islam" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Teks Sorotan (Highlight Emas)</label>
            <input type="text" required value={formData.highlight} onChange={(e) => setFormData({ ...formData, highlight: e.target.value })} placeholder="Cth: untuk Perubahan" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Deskripsi Subteks (Sub)</label>
            <textarea required value={formData.sub} onChange={(e) => setFormData({ ...formData, sub: e.target.value })} rows={3} placeholder="Penjelasan singkat..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"></textarea>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Slider"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isSubmitting} title="Hapus Slider?" message="Apakah Anda yakin ingin menghapus slider ini? Gambar dan data tidak dapat dikembalikan." />
    </div>
  );
};

export default HeroSlides;
