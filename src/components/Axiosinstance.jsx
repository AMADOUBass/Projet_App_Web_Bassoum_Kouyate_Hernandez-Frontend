import axios from "axios";

// const myBaseURL = "http://127.0.0.1:8000/";

const isDevelopment = import.meta.env.DEV === "development";
const myBaseURL = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL_DEPLOY;

const AxiosInstance = axios.create({
  baseURL: myBaseURL,
  timeout: 5000,
  headers: { "Content-Type": "application/json", accept: "application/json" },
});

export default AxiosInstance;
