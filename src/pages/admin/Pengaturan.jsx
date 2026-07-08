import { Save } from "lucide-react";

const Pengaturan = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900">Pengaturan Website</h1>
          <p className="text-sm font-inter text-gray-500 mt-1">Konfigurasi informasi dasar dan tampilan website</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-red-800 text-white px-5 py-2.5 rounded-xl font-inter font-medium transition-colors shadow-sm shadow-primary/20 shrink-0">
          <Save size={18} />
          Simpan Perubahan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-poppins font-semibold text-lg text-gray-900">Informasi Organisasi</h2>
          <p className="text-sm font-inter text-gray-500 mt-1">Atur nama, deskripsi, dan kontak LISAN.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Nama Organisasi</label>
              <input type="text" defaultValue="Lingkar Mahasiswa Islam untuk Perubahan (LISAN)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Email Kontak</label>
              <input type="email" defaultValue="info@lisan.id" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-inter font-medium text-gray-700">Alamat Lengkap</label>
              <textarea rows={3} defaultValue="Jl. Jenderal Sudirman No. 123, Kabupaten Sidenreng Rappang, Sulawesi Selatan" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-poppins font-semibold text-lg text-gray-900">Media Sosial</h2>
          <p className="text-sm font-inter text-gray-500 mt-1">Tautan akun media sosial resmi organisasi.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Instagram</label>
              <input type="text" defaultValue="https://instagram.com/lisan.id" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">Facebook</label>
              <input type="text" defaultValue="https://facebook.com/lisan.id" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-inter font-medium text-gray-700">YouTube</label>
              <input type="text" defaultValue="https://youtube.com/@lisan.id" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
