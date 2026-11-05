import { MapPin, Users, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

/**
 * Komponen Tabel Daftar Koordinator Wilayah
 * Memenuhi 3 State Tampilan UI: Loading State, Empty State, Data State
 * Standar acuan: Handbook Section 4.1 & Section 11.3
 */
export function KorwilTable({
  items = [],
  isLoading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  // 1. Loading State (Shimmer Skeleton per Handbook Section 11.3)
  if (isLoading) {
    return <TableSkeleton rows={4} columns={5} className="py-2" />;
  }

  // 2. Empty State
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
        <h3 className="font-poppins font-semibold text-gray-700 text-base">Belum Ada Data Wilayah</h3>
        <p className="font-inter text-gray-400 text-xs mt-1">
          Klik tombol &quot;Tambah Korwil&quot; di atas untuk menambahkan basis wilayah pertama.
        </p>
      </div>
    );
  }

  // 3. Data State
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-inter text-sm">
        <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
          <tr>
            <th className="py-4 px-6">Wilayah</th>
            <th className="py-4 px-6">Basis Kampus / Lingkup Gerak</th>
            <th className="py-4 px-6">Kader Aktif</th>
            <th className="py-4 px-6 text-center">Status</th>
            <th className="py-4 px-6 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-4 px-6 font-poppins font-semibold text-gray-900">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {item.urutan || "#"}
                  </span>
                  {item.name}
                </div>
              </td>
              <td className="py-4 px-6 text-gray-600 max-w-md">{item.kampus}</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full font-medium text-xs">
                  <Users size={12} />
                  {item.anggota}
                </span>
              </td>
              <td className="py-4 px-6 text-center">
                <button
                  type="button"
                  onClick={() => onToggleStatus(item)}
                  aria-label={`Ubah status ${item.name}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    item.is_active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {item.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {item.is_active ? "Aktif" : "Nonaktif"}
                </button>
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={`Edit wilayah ${item.name}`}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id, item.name)}
                    aria-label={`Hapus wilayah ${item.name}`}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  );
}

