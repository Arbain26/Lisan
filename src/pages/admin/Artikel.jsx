import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Filter, Loader2, FileText, Image as ImageIcon, X } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { getMediaUrl } from "../../services/mediaUrl";

const ARTICLE_CATEGORIES = [
  "Semua Kategori",
  "Opini",
  "Kajian",
  "Leadership",
  "Tokoh",
  "Edukasi",
  "Inspirasi",
  "Dakwah",
  "Lainnya"
];

const Artikel = () => {
  const { data, loading, isSubmitting, addItem, updateItem, deleteItem } = useCRUD("/news");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Opini",
    status: "Published",
    author: "",
    excerpt: "",
    content: "",
    imageFile: null,
  });

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory =
        selectedCategory === "Semua Kategori" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  // Handlers
  const handleOpenAdd = () => {
    setSelectedItem(null);
    setImagePreview(null);
    setFormData({
      title: "",
      category: "Opini",
      status: "Published",
      author: "",
      excerpt: "",
      content: "",
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setImagePreview(item.image_url ? getMediaUrl(item.image_url) : null);
    setFormData({
      title: item.title || "",
      category: item.category || "Opini",
      status: item.status || "Published",
      author: item.author || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("category", formData.category);
    payload.append("status", formData.status);
    payload.append("excerpt", formData.excerpt || "");
    payload.append("content", formData.content || "");
    payload.append("author", formData.author.trim() || "Admin");
    if (formData.imageFile) {
      payload.append("image", formData.imageFile);
    }

    let success = false;
    if (selectedItem) {
      success = await updateItem(selectedItem.id, payload);
    } else {
      success = await addItem(payload);
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      const success = await deleteItem(selectedItem.id);
      if (success) {
        setIsDeleteModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Kelola Artikel</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">
            Kelola publikasi tulisan, opini, kajian, dan wawasan LISAN
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0"
        >
          <Plus size={18} />
          Tambah Artikel
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul artikel atau nama penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-inter text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {ARTICLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState 
            isSearch={searchTerm !== "" || selectedCategory !== "Semua Kategori"} 
            message={searchTerm !== "" || selectedCategory !== "Semua Kategori" ? "Artikel tidak ditemukan" : "Belum ada artikel"}
            subMessage={searchTerm !== "" || selectedCategory !== "Semua Kategori" ? "Tidak ada artikel yang cocok dengan filter pencarian." : "Mulai dengan menambahkan tulisan baru."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Artikel</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={getMediaUrl(item.image_url)}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                              <FileText size={20} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-poppins font-medium text-gray-900 line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-xs font-inter text-gray-500 mt-0.5">
                              Penulis: <span className="font-medium text-gray-700">{item.author || "Admin"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-inter font-medium bg-gray-100 text-gray-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-inter font-medium ${
                          item.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-inter text-gray-600">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : (item.date || "-")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                            title="Edit Artikel"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(item)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            title="Hapus Artikel"
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
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-inter text-gray-500">
                Menampilkan {filteredData.length} artikel
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal Form Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Artikel" : "Tambah Artikel Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Judul */}
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Masukkan judul tulisan / artikel"
            />
          </div>

          {/* Kategori & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Opini">Opini</option>
                <option value="Kajian">Kajian</option>
                <option value="Leadership">Leadership</option>
                <option value="Tokoh">Tokoh</option>
                <option value="Edukasi">Edukasi</option>
                <option value="Inspirasi">Inspirasi</option>
                <option value="Dakwah">Dakwah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-inter font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Published">Published (Tayang)</option>
                <option value="Draft">Draft (Simpan Draf)</option>
              </select>
            </div>
          </div>

          {/* Penulis */}
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Penulis</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Nama penulis (kosongkan untuk default Admin)"
            />
          </div>

          {/* Cover Gambar */}
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Cover Gambar (Opsional)</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[16/9] max-h-48 bg-gray-50 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-xl p-4 cursor-pointer bg-gray-50 hover:bg-red-50/20 transition-all">
                <ImageIcon size={24} className="text-gray-400 mb-1" />
                <span className="text-xs font-inter text-gray-500">Klik untuk unggah gambar cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Ringkasan (Excerpt)</label>
            <textarea
              rows="2"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Ringkasan singkat artikel untuk preview di kartu berita..."
            />
          </div>

          {/* Konten Lengkap */}
          <div className="space-y-1.5">
            <label className="text-sm font-inter font-medium text-gray-700">Konten Lengkap</label>
            <textarea
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Tuliskan isi lengkap artikel di sini..."
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl font-inter font-medium text-white bg-primary hover:bg-red-800 transition-colors flex items-center justify-center shadow-sm shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedItem ? "Perbarui Artikel" : "Simpan Artikel")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
        title="Hapus Artikel?"
        message={`Apakah Anda yakin ingin menghapus artikel "${selectedItem?.title}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default Artikel;
