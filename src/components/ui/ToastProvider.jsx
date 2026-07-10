import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
  const ctx = useContext(ToastContext);
  // Return convenient shortcut methods so both
  //   addToast("msg", "success")  AND  toast.success("msg")  work
  return {
    addToast: ctx.addToast,
    success: (msg) => ctx.addToast(msg, "success"),
    error: (msg) => ctx.addToast(msg, "error"),
    warning: (msg) => ctx.addToast(msg, "warning"),
    info: (msg) => ctx.addToast(msg, "info"),
  };
};

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    barClass: "bg-emerald-500",
    bg: "bg-white",
    border: "border-emerald-100",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-rose-500",
    barClass: "bg-rose-500",
    bg: "bg-white",
    border: "border-rose-100",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    barClass: "bg-amber-400",
    bg: "bg-white",
    border: "border-amber-100",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    barClass: "bg-blue-500",
    bg: "bg-white",
    border: "border-blue-100",
  },
};

const DURATION = 5000;

const Toast = ({ toast, onRemove }) => {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 ${cfg.bg} p-4 rounded-2xl shadow-xl border ${cfg.border} w-full max-w-sm overflow-hidden`}
      style={{ minWidth: 280 }}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[3px] ${cfg.barClass} rounded-full`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: DURATION / 1000, ease: "linear" }}
      />

      <div className="flex-shrink-0 mt-0.5">
        <Icon size={22} className={cfg.iconClass} />
      </div>

      <p className="flex-1 font-inter text-sm text-gray-800 font-medium leading-snug pr-1">
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5 p-0.5 rounded-full hover:bg-gray-100"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // max 5 toasts
      timers.current[id] = setTimeout(() => removeToast(id), DURATION);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container — bottom-right on desktop, bottom-center on mobile */}
      <div
        className="fixed z-[200] flex flex-col gap-2.5 pointer-events-none"
        style={{
          bottom: "1.25rem",
          right: "1rem",
          left: "1rem",
          alignItems: "flex-end",
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
              <Toast toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
