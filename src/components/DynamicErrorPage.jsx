import { useLocation } from "react-router-dom";

export default function DynamicErrorPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const code = params.get("code") || 404;
  const message =
    params.get("message") || "La page que vous recherchez est introuvable.";

  const titles = {
    401: "401 - Unauthorized 🔒",
    403: "403 - Forbidden 🚫",
    404: "404 - Not Found ❓",
    500: "Erreur inattendue 💥",
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600">
        {titles[code] || "Erreur"}
      </h1>
      <p className="mt-2">{message}</p>
      <button
        onClick={() => window.history.back()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Retour
      </button>
    </div>
  );
}
