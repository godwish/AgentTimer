import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Setup from './pages/Setup';
import { api } from './api';

function ProtectedRoute({ children }) {
  const token = Cookies.get('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function MainLayout() {
  const { t } = useTranslation();

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '1.5rem 2rem' }}>
        <div style={{ flex: 1 }}></div>
        <div className="header-title" style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
          {t('app_title')}
        </div>
        <div style={{ flex: 1 }}></div>
      </header>
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    api.checkStatus().then(res => {
      setNeedsSetup(res.needsSetup);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={needsSetup ? <Setup /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={needsSetup ? <Navigate to="/setup" replace /> : <Login />} />
        <Route path="/" element={
          needsSetup ? <Navigate to="/setup" replace /> : (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
