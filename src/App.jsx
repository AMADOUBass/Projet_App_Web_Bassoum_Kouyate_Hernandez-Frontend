import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL_LOCAL}healthCheck/`;

    axios
      .get(apiUrl)
      .then((response) => {
        setStatus(response.data); // backend just returns "OK"
        console.log("Le backend est en ligne:", response.data);
      })
      .catch((error) => {
        setStatus("Erreur de connexion au serveur");
        console.error("Il y a une erreur:", error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Backend Status</h1>
      <p>Status: {status}</p>
      {/* make a page en construction */}
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Page en construction 🚧</h2>
        <p>
          Nous travaillons dur pour vous offrir une expérience exceptionnelle.
          Restez à l'écoute !
        </p>
      </div>
    </div>
  );
}

export default App;
