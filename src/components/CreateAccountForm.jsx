import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

export default function CreateAccountForm() {
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔍 Email validation with debounce
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, email }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setCheckingEmail(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.post("/auth/validate-email/", {
          email,
        });
        setEmailError(res.data.exists ? "Cet email est déjà utilisé." : "");
      } catch (err) {
        const message =
          err.response?.data?.error || "Erreur de validation de l'email.";
        setEmailError(message);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
  };

  // 🔐 Password validation
  const handlePasswordChange = async (e) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));
    setCheckingPassword(true);

    try {
      const res = await axiosInstance.post("/auth/validate-password/", {
        password,
      });
      if (!res.data.valid) {
        const message =
          res.data.error || "Mot de passe invalide selon les critères.";
        setPasswordError(message);
      } else {
        setPasswordError("");
      }
    } catch (error) {
      const message =
        error.response?.data?.error || "Erreur de validation du mot de passe.";
      setPasswordError(message);
    } finally {
      setCheckingPassword(false);
    }
  };

  // 📨 Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError || passwordError || checkingEmail || checkingPassword) {
      toast.error("Corrige les erreurs avant de soumettre.");
      return;
    }

    try {
      await axiosInstance.post("/auth/register/", formData);
      toast.success("✅ Compte créé. En attente de validation par un admin.");
      navigate("/");
    } catch (error) {
      const status = error.response?.status;
      if (status === 400 || status === 409) {
        toast.error(error.response.data?.error || "Erreur de création.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6" noValidate >
      <h2 className="text-xl font-bold">Créer un compte</h2>

      {/* Email Field */}
      <div className="relative">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleEmailChange}
          required
          className={`w-full px-3 py-2 border rounded-md pb-6 ${
            emailError ? "border-red-500" : "border-gray-300"
          }`}
        />
        <span className="absolute right-3 top-2 text-lg">
          {checkingEmail ? (
            <span className="animate-pulse text-gray-400">⏳</span>
          ) : emailError ? (
            <span className="text-red-500">❌</span>
          ) : formData.email ? (
            <span className="text-green-500">✅</span>
          ) : null}
        </span>
        {emailError && (
          <p className="text-red-500 text-sm mt-1">{emailError}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handlePasswordChange}
          required
          className={`w-full px-3 py-2 pr-12 border rounded-md pb-6 ${
            passwordError ? "border-red-500" : "border-gray-300"
          }`}
        />
        <span className="absolute right-8 top-2 text-lg">
          {checkingPassword ? (
            <span className="animate-pulse text-gray-400">⏳</span>
          ) : passwordError ? (
            <span className="text-red-500">❌</span>
          ) : formData.password ? (
            <span className="text-green-500">✅</span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-2 text-gray-600 hover:text-gray-800 text-sm">
          {showPassword ? "🙈" : "👁️"}
        </button>
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={checkingEmail || checkingPassword}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        Créer mon compte
      </button>
    </form>
  );
}
