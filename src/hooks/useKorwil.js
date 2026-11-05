import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/services/api";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * Custom Hook untuk memisahkan logika bisnis & state dari UI Korwil
 * Standar acuan: Handbook Section 4.2 & Section 10
 */
export function useKorwil() {
  const { addToast } = useToast();
  const [korwils, setKorwils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchKorwils = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/korwil/admin");
      setKorwils(response.data || []);
    } catch (error) {
      console.error("[FETCH_KORWIL_ERROR]:", error);
      addToast("Gagal memuat data Koordinator Wilayah", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchKorwils();
  }, [fetchKorwils]);

  const createKorwil = async (formData) => {
    setSaving(true);
    try {
      await api.post("/korwil", formData);
      addToast("Koordinator Wilayah berhasil ditambahkan", "success");
      await fetchKorwils();
      return true;
    } catch (error) {
      console.error("[CREATE_KORWIL_ERROR]:", error);
      addToast(error.response?.data?.message || "Gagal menambahkan wilayah", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateKorwil = async (id, formData) => {
    setSaving(true);
    try {
      await api.put(`/korwil/${id}`, formData);
      addToast("Koordinator Wilayah berhasil diperbarui", "success");
      await fetchKorwils();
      return true;
    } catch (error) {
      console.error("[UPDATE_KORWIL_ERROR]:", error);
      addToast(error.response?.data?.message || "Gagal memperbarui wilayah", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteKorwil = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus ${name}?`)) return false;

    try {
      await api.delete(`/korwil/${id}`);
      addToast("Koordinator Wilayah berhasil dihapus", "success");
      setKorwils((prev) => prev.filter((k) => k.id !== id));
      return true;
    } catch (error) {
      console.error("[DELETE_KORWIL_ERROR]:", error);
      addToast("Gagal menghapus data wilayah", "error");
      return false;
    }
  };

  const toggleKorwilStatus = async (item) => {
    const updatedStatus = item.is_active ? 0 : 1;
    try {
      await api.put(`/korwil/${item.id}`, {
        ...item,
        is_active: updatedStatus,
      });
      setKorwils((prev) =>
        prev.map((k) => (k.id === item.id ? { ...k, is_active: updatedStatus } : k))
      );
      addToast(`Status ${item.name} berhasil diubah!`, "success");
      return true;
    } catch (error) {
      console.error("[TOGGLE_KORWIL_STATUS_ERROR]:", error);
      addToast("Gagal mengubah status wilayah", "error");
      return false;
    }
  };

  const filteredKorwils = useMemo(() => {
    if (!searchTerm.trim()) return korwils;
    const term = searchTerm.toLowerCase();
    return korwils.filter(
      (k) =>
        k.name.toLowerCase().includes(term) ||
        k.kampus.toLowerCase().includes(term)
    );
  }, [korwils, searchTerm]);

  return {
    korwils,
    filteredKorwils,
    loading,
    saving,
    searchTerm,
    setSearchTerm,
    createKorwil,
    updateKorwil,
    deleteKorwil,
    toggleKorwilStatus,
    refreshKorwils: fetchKorwils,
  };
}

