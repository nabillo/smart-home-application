import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import UsersPage from './pages/UsersPage';
import AccessManagementPage from './pages/AccessManagementPage';
import HomeSelectionPage from './pages/HomeSelectionPage';
import HomePage from './pages/HomePage';
import { useAuthStore } from './store/authStore';

function App() {
  const { token } = useAuthStore();

  return (
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/*" element={token ? <DashboardLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/homes" replace />} />
          <Route path="homes" element={<HomeSelectionPage />} />
          <Route path="homes/:homeId/*" element={<HomePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="access-management" element={<AccessManagementPage />} />
        </Route>
      </Routes>
  );
}

export default App;
