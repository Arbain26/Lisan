import { SearchX, PackageOpen } from "lucide-react";

const EmptyState = ({ isSearch = false, message = "Belum ada data", subMessage = "Silakan tambah data baru." }) => {
  return (
    <div className="p-10 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {isSearch ? (
          <SearchX size={32} className="text-gray-300" />
        ) : (
          <PackageOpen size={32} className="text-gray-300" />
        )}
      </div>
      <h3 className="font-poppins font-medium text-gray-900 mb-1">{message}</h3>
      <p className="font-inter text-sm text-gray-500">{subMessage}</p>
    </div>
  );
};

export default EmptyState;
