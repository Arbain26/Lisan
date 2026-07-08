import { useState, useEffect, useCallback } from "react";
import { useToast } from "../components/ui/ToastProvider";
import api from "../services/api";

const useCRUD = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error(`Failed to load data from ${endpoint}`, error);
      addToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }, [endpoint, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addItem = useCallback(async (payload) => {
    setIsSubmitting(true);
    try {
      await api.post(endpoint, payload);
      addToast("Data berhasil ditambahkan", "success");
      await loadData(); // Refresh table
      return true;
    } catch (error) {
      addToast("Gagal menambahkan data", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [endpoint, addToast, loadData]);

  const updateItem = useCallback(async (id, payload) => {
    setIsSubmitting(true);
    try {
      await api.put(`${endpoint}/${id}`, payload);
      addToast("Data berhasil diperbarui", "success");
      await loadData();
      return true;
    } catch (error) {
      addToast("Gagal memperbarui data", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [endpoint, addToast, loadData]);

  const deleteItem = useCallback(async (id) => {
    setIsSubmitting(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      addToast("Data berhasil dihapus", "success");
      await loadData();
      return true;
    } catch (error) {
      addToast("Gagal menghapus data", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [endpoint, addToast, loadData]);

  return {
    data,
    loading,
    isSubmitting,
    addItem,
    updateItem,
    deleteItem,
    refreshData: loadData
  };
};

export default useCRUD;
