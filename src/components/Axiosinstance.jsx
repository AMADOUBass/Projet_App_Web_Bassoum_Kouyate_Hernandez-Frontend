import axios from "axios";
import { toast } from "react-hot-toast";

const isDevelopment = import.meta.env.MODE === "development";
const myBaseURL = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL_DEPLOY;

const AxiosInstance = axios.create({
  baseURL: myBaseURL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// ✅ Inject access token into every request
AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Protéger contre les erreurs réseau (serveur down, pas de réponse)
    if (!error.response) {
      toast.error("💥 Erreur réseau. Vérifiez votre connexion.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message =
      error.response.data?.error ||
      error.response.data?.detail ||
      "Erreur inconnue.";

    const url = (originalRequest.url || "").toLowerCase();

    // ✅ Routes sensibles à ne pas rediriger
    const isLoginRoute = url.includes("auth/token");
    const isRefreshRoute = url.includes("auth/refresh");
    const isMeRoute = url.includes("auth/me");
    const onLoginPage = window.location.pathname === "/login";

    const isSensitiveRoute =
      isLoginRoute || isRefreshRoute || isMeRoute || onLoginPage;
    const shouldRedirect = !isSensitiveRoute;

    console.warn("🔍 Axios Interceptor", {
      url,
      status,
      isLoginRoute,
      isRefreshRoute,
      isMeRoute,
      onLoginPage,
      shouldRedirect,
    });

    // 🚫 Gérer les erreurs de login localement (pas de redirection)
    if (isSensitiveRoute) {
      switch (status) {
        case 400:
          toast.error("⛔ " + message);
          break;
        case 401:
          toast.error("❌ Identifiants invalides.");
          break;
        case 403:
          toast.error("🔒 Accès refusé.");
          break;
        default:
          toast.error("💥 " + message);
          break;
      }
      return Promise.reject(error);
    }

    // 🚨 Redirection pour les erreurs globales
    if ([403, 404, 500].includes(status) && shouldRedirect) {
      const messages = {
        403: "Accès interdit.",
        404: "Ressource introuvable.",
        500: "Erreur serveur. Veuillez réessayer plus tard.",
      };

      // ✅ Optionnel : nettoyer les tokens si accès interdit
      const authErrors = [
        "Authentication credentials were not provided.",
        "Invalid token.",
      ];

      if (status === 403 && authErrors.includes(message)) {
        localStorage.clear();
      }

      const errorMessage = encodeURIComponent(messages[status]);
      window.location.href = `/error?code=${status}&message=${errorMessage}`;
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
