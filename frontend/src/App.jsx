import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RegisterCompanyPage from './pages/RegisterCompanyPage'; // IMPORT REGISTRATION PAGE

// Import modular pages
import DashboardOverview from './pages/DashboardOverview';
import TendersPage from './pages/TendersPage';
import OrganisationPage from './pages/OrganisationPage';
import UsersDashboard from './pages/UsersDashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import MembersTablePage from './pages/MembersTablePage';
import ActivateWorkspacePage from './pages/ActivateWorkspacePage';

import UserProfilePage from './pages/UserProfilePage';
import { Users, FolderOpen } from 'lucide-react';
import NotFoundPage from './pages/NotFoundPage';
export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: 'var(--color-app-card)',
            color: 'var(--color-app-text)',
            border: '1px solid var(--color-app-border)',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
          },
        }}
      />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Register Company Onboarding Wizard */}
        <Route path="/register-company" element={<RegisterCompanyPage />} />
        
        {/* Workspace Activation Endpoint */}
        <Route path="/activate-workspace" element={<ActivateWorkspacePage />} />
        
        {/* Layout Shell wrapping top-level clean paths */}
        <Route element={<DashboardPage />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/tenders" element={<TendersPage />} />
          <Route path="/organisation" element={<OrganisationPage />} />
          <Route path="/users" element={<UsersDashboard />} />
          <Route path="/users/members" element={<MembersTablePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/crm" element={<PlaceholderPage icon={Users} title="CRM Pipeline" description="Client relationship management is currently under development. You will be able to track leads and past awards soon." />} />
          <Route path="/documents" element={<PlaceholderPage icon={FolderOpen} title="Compliance Vault" description="Securely store and manage your KRA, CR12, and AGPO certificates with automated expiry reminders." />} />
        </Route>

        {/* Catch-All 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
