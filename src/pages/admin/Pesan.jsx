import { useState, useMemo } from "react";
import { Search, MailOpen, Mail, Trash2, Loader2, Eye, Phone, MapPin, Heart, Hospital, MessageSquare } from "lucide-react";
import useCRUD from "../../hooks/useCRUD";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/ToastProvider";

// Helper to parse blood request details from structured message text
const parseBloodRequest = (messageText) => {
  const lines = messageText.split('\n');
  const details = {
    bloodType: "O",
    patientName: "-",
    quantity: "-",
    hospital: "-",
    patientAddress: "-",
    reason: "-",
    phone: ""
  };
  
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      
      if (key === 'Golongan Darah') details.bloodType = value;
      else if (key === 'Nama Pasien') details.patientName = value;
      else if (key === 'Jumlah yang Dibutuhkan') details.quantity = value;
      else if (key === 'Tempat Perawatan') details.hospital = value;
      else if (key === 'Alamat Pasien') details.patientAddress = value;
      else if (key === 'Keperluan') details.reason = value;
      else if (key === 'Kontak Pemohon') details.phone = value;
    }
  });
  return details;
};

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

  // Check if message is a blood request
  const isBloodRequest = (message) => {
    return message && message.startsWith("--- PERMOHONAN BUTUH DARAH ---");
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
                        <div className="flex items-center gap-2">
                          {isBloodRequest(item.message) && (
                            <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-semibold font-inter px-2 py-0.5 rounded-full border border-red-200">BUTUH DARAH</span>
                          )}
                          <div className={`text-sm font-inter text-gray-700 line-clamp-1 ${!item.isRead ? 'font-semibold' : ''}`}>
                            {item.subject}
                          </div>
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
        {selectedItem && (() => {
          const isBlood = isBloodRequest(selectedItem.message);
          const bloodDetails = isBlood ? parseBloodRequest(selectedItem.message) : null;

          return (
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

              {/* Message Body (Render as beautiful card if it's a blood request) */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">
                  {isBlood ? "Kartu Permohonan Darah" : "Isi Pesan"}
                </span>

                {isBlood ? (
                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 space-y-4">
                    {/* Blood Drop & Patient Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-poppins font-black text-2xl shadow-md shadow-red-600/25 border-2 border-white select-all">
                        {bloodDetails.bloodType}
                      </div>
                      <div>
                        <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full">BUTUH DARAH</span>
                        <h4 className="font-poppins font-bold text-gray-900 text-lg mt-1">Pasien: {bloodDetails.patientName}</h4>
                      </div>
                    </div>

                    {/* Patient & Request Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-red-100/50 pt-4 text-xs leading-relaxed text-gray-700">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 font-medium">Jumlah yang Dibutuhkan</span>
                        <p className="font-bold text-gray-900">{bloodDetails.quantity}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-400 font-medium flex items-center gap-1"><Hospital size={12} className="text-red-500" /> Tempat Perawatan</span>
                        <p className="font-semibold text-gray-900">{bloodDetails.hospital}</p>
                      </div>
                      <div className="space-y-0.5 sm:col-span-2">
                        <span className="text-gray-400 font-medium flex items-center gap-1"><MapPin size={12} className="text-red-500" /> Alamat Pasien</span>
                        <p className="font-medium text-gray-900">{bloodDetails.patientAddress}</p>
                      </div>
                      <div className="space-y-0.5 sm:col-span-2">
                        <span className="text-gray-400 font-medium flex items-center gap-1"><Heart size={12} className="text-red-500" /> Keperluan / Diagnosis</span>
                        <p className="font-medium text-gray-900">{bloodDetails.reason}</p>
                      </div>
                    </div>

                    {/* Contact Action */}
                    {bloodDetails.phone && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-red-100/50">
                        <a
                          href={`tel:${bloodDetails.phone.replace(/[^\d+]/g, "")}`}
                          className="inline-flex items-center justify-center gap-1.5 text-xs text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-colors font-medium"
                        >
                          <Phone size={13} /> Hubungi Telepon ({bloodDetails.phone})
                        </a>
                        <a
                          href={`https://wa.me/${(() => {
                            let p = bloodDetails.phone.replace(/[^\d]/g, "");
                            return p.startsWith("0") ? "62" + p.slice(1) : p;
                          })()}?text=${encodeURIComponent("Assalamu'alaikum warahmatullahi wabarakatuh, kami dari lingkar donor darah sidrap, dapat informasi bahwa butuhki darah kak")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors font-medium"
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed text-gray-800 font-inter">
                    {selectedItem.message}
                  </div>
                )}
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
          );
        })()}
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isSubmitting} title="Hapus Pesan?" message={`Apakah Anda yakin ingin menghapus pesan dari "${selectedItem?.name}"?`} />
    </div>
  );
};

export default Pesan;
