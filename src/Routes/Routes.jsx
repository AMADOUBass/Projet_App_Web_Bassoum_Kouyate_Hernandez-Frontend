// Updated Routes.jsx - Nested routes under /admin
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar.jsx';
import RegisterForm from '../components/Form/RegisterForm.jsx';
import LoginForm from '../components/Form/LoginForm.jsx';
import AdminDashboard from '../components/Admin/AdminDashboard.jsx';
// Placeholder components for new routes
const AddPlayer = () => <div className="p-4">Ajouter un joueur (à implémenter)</div>;
const CreateTeam = () => <div className="p-4">Créer une équipe (à implémenter)</div>;
const UpcomingEvents = () => <div className="p-4">Événements à venir (à implémenter)</div>;
const Matches = () => <div className="p-4">Matches (à implémenter)</div>;
const Stats = () => <div className="p-4">Stats détaillées (à implémenter)</div>;
import StatsBoard from '../components/Admin/StatsBoard.jsx'; 

function Home() {
  return (
    <div className="card">
      <h2>Bienvenue sur MyTeams</h2>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="container flex justify-content-center align-content-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<StatsBoard />} />
            <Route path="add-player" element={<AddPlayer />} />
            <Route path="create-team" element={<CreateTeam />} />
            <Route path="upcoming-events" element={<UpcomingEvents />} />
            <Route path="matches" element={<Matches />} />
            <Route path="stats" element={<Stats />} />
          </Route>
          <Route path="*" element={<div className="card"><h2>404</h2><p>Page non trouvée</p></div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}