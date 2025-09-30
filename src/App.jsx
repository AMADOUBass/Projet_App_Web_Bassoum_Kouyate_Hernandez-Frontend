import { useState, useEffect } from "react";
import axios from "axios";
import AppRoutes from "./routes/Routes";
import Loader from "./components/Utils/SpinnerLoader";
import styled from "styled-components";

function App() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL_LOCAL}healthCheck/`;

    axios
      .get(apiUrl)
      .then((response) => {
        setStatus("✅ Backend en ligne");
        console.log("Le backend est en ligne:", response.data);
      })
      .catch((error) => {
        setStatus("❌ Erreur de connexion au serveur");
        console.error("Erreur:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="">
      {loading ? <Loader /> : <AppRoutes />}
      {!loading && <Status>{status}</Status>}
    </div>
  );
}

const AppWrapper = styled.div`
 height: 100%;
  width: 100%;
  display: flex;
  align-items: center;     /* centre verticalement */
  justify-content: center; /* centre horizontalement */
  background: #0b1020; 
`;


const Status = styled.p`
  margin-top: 10px;
  font-size: 14px;
  color: #aaa;
`;

export default App;