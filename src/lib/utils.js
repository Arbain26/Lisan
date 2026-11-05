import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan nama class CSS Tailwind secara kondisional & mencegah konflik styling.
 * Standar acuan: Handbook Section 11.1
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format mata uang Rupiah
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal standar Indonesia
 */
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

