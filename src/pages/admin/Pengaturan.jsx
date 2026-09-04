import { useState, useEffect } from "react";
import { Save, Loader2, Sliders, PhoneCall, Check, X, Eye, EyeOff } from "lucide-react";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../services/api";

const menuItemsDefinition = [
  {
    key: "beranda",
    label: "Beranda",
    desc: "Halaman landing utama website",
    isParent: false,
  },
  {
    key: "profil",
    label: "Menu Profil (Induk)",
    desc: "Dropdown menu profil di navbar",
    isParent: true,
    children: [
      { key: "profil_about", label: "Tentang LISAN (/about)", desc: "Identitas organisasi" },
      { key: "profil_sejarah", label: "Sejarah (/sejarah)", desc: "Rekam jejak berdirinya LISAN" },
      { key: "profil_visi_misi", label: "Visi & Misi (/visi-misi)", desc: "Arah perjuangan" },
      { key: "profil_nilai", label: "Nilai Organisasi (/nilai-organisasi)", desc: "Prinsip dasar gerak" },
    ]
  },
  {
    key: "organisasi",
    label: "Menu Organisasi (Induk)",
    desc: "Dropdown struktur organisasi di navbar",
    isParent: true,
    children: [
      { key: "org_structure", label: "Struktur Pengurus (/structure)", desc: "Pengurus aktif" },
      { key: "org_departemen", label: "Departemen / Bidang (/departemen)", desc: "Divisi kerja" },
      { key: "org_korwil", label: "Koordinator Wilayah (/koordinator-wilayah)", desc: "Cabang daerah" },
    ]
  },
  {
    key: "program",
    label: "Menu Program (Induk)",
    desc: "Dropdown program kerja di navbar",
    isParent: true,
    children: [
      { key: "program_kajian", label: "Kajian Islam (/programs#kajian)", desc: "Kajian keislaman" },
      { key: "program_sosial", label: "Aksi Sosial (/programs#sosial)", desc: "Gerakan kepedulian" },
      { key: "program_leadership", label: "Pelatihan Kepemimpinan (/programs#leadership)", desc: "Kaderisasi" },
    ]
  },
  {
    key: "donor",
    label: "Lingkar Donor (/donor)",
    desc: "Program donor darah dan relawan kemanusiaan",
    isParent: false,
  },
  {
    key: "media",
    label: "Menu Media (Induk)",
    desc: "Dropdown publikasi media di navbar",
    isParent: true,
    children: [
      { key: "media_news", label: "Berita & Artikel (/news)", desc: "Kabar dan tulisan" },
      { key: "media_gallery", label: "Galeri Foto (/gallery)", desc: "Dokumentasi visual" },
    ]
  },
  {
    key: "contact",
    label: "Kontak Kami (/contact)",
    desc: "Form aspirasi dan informasi kontak LISAN",
    isParent: false,
  }
];

const ToggleSwitch = ({ checked, onChange, label, desc, isSubmenu = false }) => {
  return (
    <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
      isSubmenu ? "bg-gray-50/70 border border-gray-100 hover:bg-gray-50" : "bg-white border border-gray-200"
    }`}>
      <div className="pr-4">
        <div className="flex items-center gap-2">
          <span className={`font-poppins font-semibold text-sm ${checked ? "text-gray-900" : "text-gray-400 line-through"}`}>
            {label}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            checked ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}>
            {checked ? <Eye size={10} /> : <EyeOff size={10} />}
            {checked ? "Tampil" : "Sembunyi"}
          </span>
        </div>
        {desc && <p className="text-xs font-inter text-gray-400 mt-0.5">{desc}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

const Pengaturan = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("visibility");
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Form State Contact
  const [formData, setFormData] = useState({
    nama_organisasi: "",
    email: "",
    telepon: "",
    alamat: "",
    instagram: "",
    facebook: "",
    youtube: ""
  });

  // Menu Visibility State
  const [menuVisibility, setMenuVisibility] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings");
        const data = response.data;

        setFormData({
          nama_organisasi: data.nama_organisasi || "",
          email: data.email || "",
          telepon: data.telepon || "",
          alamat: data.alamat || "",
          instagram: data.instagram || "",
          facebook: data.facebook || "",
          youtube: data.youtube || ""
        });

        setMenuVisibility(data.menu_visibility || {});
      } catch (error) {
        console.error("Gagal mengambil pengaturan:", error);
        addToast("Gagal memuat pengaturan website", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [addToast]);

  const handleToggleMenu = (key, val) => {
    setMenuVisibility((prev) => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSaveVisibility = async () => {
    setSavingVisibility(true);
    try {
      await api.put("/settings/menu-visibility", {
        menu_visibility: menuVisibility
      });
      addToast("Visibilitas menu navbar berhasil disimpan!", "success");
    } catch (error) {
      console.error("Gagal menyimpan visibilitas menu:", error);
      addToast("Gagal memperbarui menu navbar", "error");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSavingContact(true);

    try {
      await api.put("/settings", formData);
      addToast("Pengaturan kontak website berhasil disimpan", "success");
    } catch (error) {
      console.error("Gagal menyimpan pengaturan:", error);
      addToast(error.response?.data?.message || "Gagal menyimpan perubahan", "error");
    } finally {
      setSavingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="font-inter text-gray-500 text-sm">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">
            Pengaturan Website & Navbar
          </h1>
          <p className="text-sm font-inter text-gray-500 mt-1">
            Atur visibilitas menu di navbar (Aktifkan / Nonaktifkan) serta data kontak organisasi.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-2xl overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("visibility")}
          className={`flex items-center gap-2 py-4 px-5 border-b-2 font-poppins font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "visibility"
              ? "border-primary text-primary bg-red-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Sliders size={18} />
          Visibilitas Menu Navbar (Aktif / Nonaktif)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 py-4 px-5 border-b-2 font-poppins font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "contact"
              ? "border-primary text-primary bg-red-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <PhoneCall size={18} />
          Kontak & Sosial Media
        </button>
      </div>

      {/* Tab 1: Menu Visibility Switchers */}
      {activeTab === "visibility" && (
        <div className="bg-white p-6 sm:p-8 rounded-b-2xl border border-t-0 border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="font-poppins font-bold text-lg text-gray-900">
                Sakelar Tampilan Menu Navbar
              </h2>
              <p className="text-gray-500 font-inter text-xs mt-0.5">
                Pilih menu apa saja yang ingin ditampilkan ke publik. Menu yang dinonaktifkan akan langsung hilang dari navigasi publik.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveVisibility}
              disabled={savingVisibility}
              className="inline-flex items-center gap-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-inter font-semibold text-sm transition-all shadow-md shadow-primary/20 shrink-0"
            >
              {savingVisibility ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{savingVisibility ? "Menyimpan..." : "Simpan Visibilitas Navbar"}</span>
            </button>
          </div>

          <div className="space-y-4">
            {menuItemsDefinition.map((item) => {
              const isChecked = menuVisibility[item.key] !== false; // default true

              return (
                <div key={item.key} className="space-y-2">
                  <ToggleSwitch
                    label={item.label}
                    desc={item.desc}
                    checked={isChecked}
                    onChange={(val) => handleToggleMenu(item.key, val)}
                  />

                  {/* Submenu children */}
                  {item.children && isChecked && (
                    <div className="ml-6 pl-4 border-l-2 border-amber-200/80 space-y-2 pt-1 pb-2">
                      <p className="text-xs font-inter font-medium text-amber-800/80 uppercase tracking-wider">
                        Submenu dari {item.label}:
                      </p>
                      {item.children.map((child) => {
                        const isChildChecked = menuVisibility[child.key] !== false;
                        return (
                          <ToggleSwitch
                            key={child.key}
                            isSubmenu={true}
                            label={child.label}
                            desc={child.desc}
                            checked={isChildChecked}
                            onChange={(val) => handleToggleMenu(child.key, val)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Kontak & Media Sosial */}
      {activeTab === "contact" && (
        <form onSubmit={handleSaveContact} className="bg-white p-6 sm:p-8 rounded-b-2xl border border-t-0 border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="font-poppins font-bold text-lg text-gray-900">
                Informasi Kontak & Organisasi
              </h2>
              <p className="text-gray-500 font-inter text-xs mt-0.5">
                Data kontak ini tampil di footer dan halaman /contact.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingContact}
              className="inline-flex items-center gap-2 bg-primary hover:bg-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-inter font-semibold text-sm transition-all shadow-md shadow-primary/20 shrink-0"
            >
              {savingContact ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{savingContact ? "Menyimpan..." : "Simpan Kontak"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-inter font-semibold text-gray-700">Nama Organisasi</label>
              <input
                type="text"
                required
                value={formData.nama_organisasi}
                onChange={(e) => setFormData({ ...formData, nama_organisasi: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-inter font-semibold text-gray-700">Email Resmi</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-inter font-semibold text-gray-700">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                required
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-inter font-semibold text-gray-700">Instagram URL</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/lisan.id"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-inter font-semibold text-gray-700">Facebook URL</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/lisan.id"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-inter font-semibold text-gray-700">YouTube URL</label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/@lisan.id"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-inter font-semibold text-gray-700">Alamat Kantor Sekretariat</label>
              <textarea
                rows={3}
                required
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-inter text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Pengaturan;
