import { useState, useMemo } from "react";
import { Search, MailOpen, Mail, Trash2, Loader2, Eye } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/ToastProvider";

const Pesan = () => {
  const { data, loading, isSubmitting, updateItem, deleteItem } = useCRUD("/pesan");
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleToggleRead = async (item) => {
    await updateItem(item.id, { isRead: !item.isRead });
    addToast(`Pesan ditandai sebagai ${!item.isRead ? 'sudah dibaca' : 'belum dibaca'}`, 'success');
  };

  const handleOpenDetail = async (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
    // If the message is unread, automatically mark it as read
    if (!item.isRead) {
      await updateItem(item.id, { isRead: true });
    }
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.id);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Pesan & Permohonan Darah</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Kotak masuk pesan dan permohonan bantuan donor darah</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari pengirim atau subjek..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState isSearch={searchTerm !== ""} message={searchTerm !== "" ? "Pesan tidak ditemukan" : "Kotak Masuk Kosong"} subMessage={searchTerm !== "" ? `Tidak ada hasil untuk "${searchTerm}"` : "Belum ada pesan dari pengunjung website."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Pengirim</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Subjek</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 font-inter font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors group ${!item.isRead ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`font-poppins text-gray-900 ${!item.isRead ? 'font-bold' : 'font-medium'}`}>{item.name}</div>
                        <div className="text-xs font-inter text-gray-500 mt-0.5">{item.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-inter text-gray-700 line-clamp-1 ${!item.isRead ? 'font-semibold' : ''}`}>
                          {item.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-inter text-gray-600">{item.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenDetail(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Lihat Detail Pesan">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleToggleRead(item)} className="p-2 text-gray-400 hover:text-secondary hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title={item.isRead ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}>
                            {item.isRead ? <Mail size={16} /> : <MailOpen size={16} />}
                          </button>
                          <button onClick={() => handleOpenDelete(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Hapus Pesan">
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
              <span className="text-sm font-inter text-gray-500">Menampilkan {filteredData.length} data</span>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Pesan & Permohonan">
        {selectedItem && (
          <div className="space-y-5 font-inter text-sm text-gray-700">
            {/* Status & Action */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Pengirim / Kontak</span>
                <h4 className="font-poppins font-semibold text-gray-900 text-base mt-0.5">{selectedItem.name}</h4>
                <p className="text-xs text-gray-500">{selectedItem.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${selectedItem.isRead ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {selectedItem.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
              </span>
            </div>

            {/* Date */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tanggal Diterima</span>
              <p className="mt-0.5 text-gray-900 font-medium">{selectedItem.date}</p>
            </div>

            {/* Subject */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Subjek</span>
              <p className="mt-0.5 text-gray-900 font-semibold">{selectedItem.subject}</p>
            </div>

            {/* Message Body */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Rincian / Isi Pesan</span>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed text-gray-800 font-mono text-xs select-all">
                {selectedItem.message}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleOpenDelete(selectedItem)}
                className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-primary font-inter font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 size={16} /> Hapus Pesan
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-inter font-medium rounded-xl transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isSubmitting} title="Hapus Pesan?" message={`Apakah Anda yakin ingin menghapus pesan dari "${selectedItem?.name}"?`} />
    </div>
  );
};

export default Pesan;
