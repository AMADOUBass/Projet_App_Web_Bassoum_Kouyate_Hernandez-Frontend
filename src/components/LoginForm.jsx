import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  // ✨ Focus + shake sur erreur email
  useEffect(() => {
    if (errors.email && emailRef.current) {
      emailRef.current.focus();
      setShakeEmail(true);
      setTimeout(() => setShakeEmail(false), 300);
    }
  }, [errors.email]);

  // ✨ Focus + shake sur erreur mot de passe
  useEffect(() => {
    if (errors.password && passwordRef.current) {
      passwordRef.current.focus();
      setShakePassword(true);
      setTimeout(() => setShakePassword(false), 300);
    }
  }, [errors.password]);

  const extractErrorMessage = (data) => {
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.error) return data.error;
    for (const key in data) {
      const value = data[key];
      if (Array.isArray(value)) return value[0];
      if (typeof value === "string") return value;
    }
    return "Erreur inconnue.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const strictEmailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    const newErrors = { email: "", password: "" };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = "L'adresse courriel est requise.";
      hasError = true;
    } else if (!strictEmailRegex.test(email)) {
      newErrors.email = "Format d'adresse courriel invalide.";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Le mot de passe est requis.";
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await AxiosInstance.post("/auth/token/", { email, password });
      const { access, refresh, role, email: userEmail, id } = res.data;

      if (access && refresh && role) {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        localStorage.setItem("role", role);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("user_id", id);
        onLoginSuccess(access, refresh, role);

        // toast.success("Connexion réussie ✅");

        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "player") navigate("/player-dashboard");
        else navigate("/login");
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      const newErrors = { email: "", password: "" };

      if (status === 400 || status === 401 || status === 403) {
        if (data.email) {
          const msg = Array.isArray(data.email) ? data.email[0] : data.email;
          newErrors.email = msg;
          toast.error(msg);
        }
        if (data.password) {
          const msg = Array.isArray(data.password)
            ? data.password[0]
            : data.password;
          newErrors.password = msg;
          toast.error(msg);
        }
        if (!data.email && !data.password) {
          const fallback = extractErrorMessage(data);
          toast.error(fallback);
        }

        setErrors(newErrors);
        setPassword("");
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
        console.error("Erreur de connexion :", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold">Bienvenue</h1>
      <p className="text-2xl font-bold">Veuillez vous authentifier</p>

      {/* Champ Email */}
      <div className="mb-6">
        <input
          ref={emailRef}
          type="email"
          name="email"
          placeholder="Adresse courriel"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full px-3 pt-2 py-2 border rounded-md transition ${
            errors.email ? "border-red-500" : "border-gray-300"
          } ${shakeEmail ? "animate-shake" : ""}`}
        />
        <p id="email-error" className="text-red-600 text-sm mt-2">
          {errors.email}
        </p>
      </div>

      {/* Champ Mot de passe */}
      <div className="mb-6 relative">
        <input
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: "" }));
          }}
          required
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`w-full px-3 py-2 pb-6 pr-12 border rounded-md transition ${
            errors.password ? "border-red-500" : "border-gray-300"
          } ${shakePassword ? "animate-shake" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2 text-gray-600 hover:text-gray-800 text-lg ">
          {showPassword ? "🙈" : "👁️"}
        </button>
        <p id="password-error" className="text-red-600 text-sm mt-2">
          {errors.password}
        </p>
      </div>

      {/* Boutons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading || errors.email || errors.password}
          className={`w-full bg-blue-500 text-white py-2 rounded-md transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}>
          {loading ? "Connexion..." : "S'authentifier"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/create-account")}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
          S'inscrire
        </button>
      </div>
    </form>
  );
}
