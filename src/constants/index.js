export const navLinks = [
  {
    label: "Beranda",
    path: "/",
  },
  {
    label: "Profil",
    children: [
      {
        label: "Tentang LISAN",
        path: "/about",
        desc: "Kenali identitas dan perjalanan organisasi",
        icon: "🏛️",
      },
      {
        label: "Sejarah",
        path: "/sejarah",
        desc: "Rekam jejak berdirinya LISAN",
        icon: "📜",
      },
      {
        label: "Visi & Misi",
        path: "/visi-misi",
        desc: "Arah dan tujuan perjuangan kami",
        icon: "🎯",
      },
      {
        label: "Nilai Organisasi",
        path: "/nilai-organisasi",
        desc: "Prinsip yang menjadi fondasi gerak kami",
        icon: "⚖️",
      },
    ],
  },
  {
    label: "Organisasi",
    children: [
      {
        label: "Struktur Pengurus",
        path: "/structure",
        desc: "Susunan kepengurusan LISAN aktif",
        icon: "👥",
      },
      {
        label: "Departemen / Bidang",
        path: "/departemen",
        desc: "Divisi dan unit kerja organisasi",
        icon: "🗂️",
      },
      {
        label: "Koordinator Wilayah",
        path: "/koordinator-wilayah",
        desc: "Perwakilan LISAN di setiap daerah",
        icon: "🗺️",
      },
    ],
  },
  {
    label: "Program",
    children: [
      {
        label: "Kajian Islam",
        path: "/programs#kajian",
        desc: "Forum ilmu dan diskusi keislaman",
        icon: "📖",
      },
      {
        label: "Aksi Sosial",
        path: "/programs#sosial",
        desc: "Gerakan kepedulian untuk masyarakat",
        icon: "🤝",
      },
      {
        label: "Pelatihan Kepemimpinan",
        path: "/programs#leadership",
        desc: "Kaderisasi pemimpin masa depan",
        icon: "🎓",
      },
    ],
  },
  {
    label: "Lingkar Donor",
    children: [
      {
        label: "Tentang Donor",
        path: "/donor",
        desc: "Program donor darah Sidrap",
        icon: "🩸",
      },
      {
        label: "Daftar Relawan",
        path: "/donor#relawan",
        desc: "Bergabung sebagai pendonor aktif",
        icon: "❤️",
      },
      {
        label: "Dokumentasi Kegiatan",
        path: "/donor#dokumentasi",
        desc: "Galeri kegiatan donor LISAN",
        icon: "📷",
      },
    ],
  },
  {
    label: "Media",
    children: [
      {
        label: "Berita",
        path: "/news",
        desc: "Informasi terkini dari LISAN",
        icon: "📰",
      },
      {
        label: "Artikel",
        path: "/news#artikel",
        desc: "Tulisan intelektual anggota LISAN",
        icon: "✍️",
      },
      {
        label: "Galeri Foto",
        path: "/gallery",
        desc: "Dokumentasi foto kegiatan kami",
        icon: "🖼️",
      },
      {
        label: "Video Kegiatan",
        path: "/gallery#video",
        desc: "Liputan video program LISAN",
        icon: "🎥",
      },
    ],
  },
  {
    label: "Kontak",
    path: "/contact",
  },
];

export const stats = [
  { value: 500, suffix: "+", label: "Active Members" },
  { value: 100, suffix: "+", label: "Activities Held" },
  { value: 10, suffix: "+", label: "Regions Covered" },
  { value: 1000, suffix: "+", label: "Social Impact" },
];

export const programs = [
  {
    icon: "🎓",
    title: "Leadership Training",
    description:
      "Intensive leadership development programs to cultivate the next generation of principled and visionary leaders in Indonesia.",
    color: "from-primary to-red-700",
  },
  {
    icon: "📖",
    title: "Kajian Islam",
    description:
      "Regular Islamic studies and discussions that deepen understanding of faith, ethics, and its role in modern society.",
    color: "from-amber-500 to-secondary",
  },
  {
    icon: "🤝",
    title: "Social Movement",
    description:
      "Community-driven initiatives addressing real social problems through empowerment, education, and solidarity.",
    color: "from-emerald-600 to-teal-500",
  },
  {
    icon: "🩸",
    title: "Lingkar Donor Sidrap",
    description:
      "A dedicated blood donor network serving the Sidenreng Rappang community with regular drives and emergency response.",
    color: "from-rose-600 to-pink-500",
  },
];

export const news = [
  {
    id: 1,
    category: "Event",
    title: "LISAN Holds Annual Leadership Summit 2025",
    excerpt:
      "Over 200 members from across 10 regions gathered for an intensive three-day leadership summit focused on developing the next generation of change-makers.",
    date: "April 20, 2025",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
  {
    id: 2,
    category: "Social",
    title: "Lingkar Donor Sidrap Collects 300 Blood Bags",
    excerpt:
      "The annual blood donation drive organized by LISAN successfully collected over 300 blood bags, directly supporting the Sidenreng Rappang regional hospital.",
    date: "April 12, 2025",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&q=80",
  },
  {
    id: 3,
    category: "Kajian",
    title: "Monthly Islamic Forum Discusses Youth & Social Justice",
    excerpt:
      "LISAN's monthly Islamic forum brought together prominent scholars and students to discuss the role of Islamic values in promoting social justice in modern Indonesia.",
    date: "April 5, 2025",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
  },
];

export const galleryImages = [
  { src: "https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?w=600&q=80", alt: "Leadership Training", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80", alt: "Community Event", span: "" },
  { src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80", alt: "Discussion Forum", span: "" },
  { src: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&q=80", alt: "Social Action", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80", alt: "Member Meeting", span: "" },
  { src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80", alt: "Donor Event", span: "" },
];
