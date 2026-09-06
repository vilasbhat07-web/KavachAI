import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CopilotProvider } from './context/CopilotContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { VisionPage } from './pages/VisionPage';
import { AgentsPage } from './pages/AgentsPage';
import { SecurityPage } from './pages/SecurityPage';
import { IncidentCenterPage } from './pages/IncidentCenterPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CopilotProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="vision" element={<VisionPage />} />
                    <Route path="agents" element={<AgentsPage />} />
                    <Route path="security" element={<SecurityPage />} />
                    <Route path="incidents" element={<IncidentCenterPage />} />
                    <Route path="incidents/:incidentId" element={<IncidentCenterPage />} />
                    <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                      <Route path="admin" element={<AdminPage />} />
                      <Route path="admin/:module" element={<AdminPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </CopilotProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;