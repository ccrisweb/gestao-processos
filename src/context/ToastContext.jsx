import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    // Clear timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now() + Math.random();
      const toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const success = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );
  const error = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );
  const warning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );
  const info = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
