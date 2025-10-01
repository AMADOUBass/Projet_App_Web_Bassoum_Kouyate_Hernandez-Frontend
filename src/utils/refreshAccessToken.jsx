// src/utils/refreshAccessToken.js
export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    console.warn("No refresh token found");
    return null;
  }

  try {
    const response = await fetch(
      "http://localhost:8000/api/auth/token/refresh/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );

    if (!response.ok) throw new Error("Failed to refresh token");

    const data = await response.json();
    localStorage.setItem("access", data.access);
    return data.access;
  } catch (err) {
    console.error("Token refresh error:", err);
    return null;
  }
}
