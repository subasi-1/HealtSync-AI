import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { LoadingScreen } from '../components/common';
import { Role } from '../types';

// Lazy loading clinical pages for bundle split optimization
const Landing = lazy(() => import('../pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const EmailVerificationSuccess = lazy(() => import('../pages/auth/EmailVerificationSuccess').then(m => ({ default: m.EmailVerificationSuccess })));
const RegistrationSuccess = lazy(() => import('../pages/auth/RegistrationSuccess').then(m => ({ default: m.RegistrationSuccess })));
const Welcome = lazy(() => import('../pages/Welcome').then(m => ({ default: m.Welcome })));

const SuperAdminDashboard = lazy(() => import('../pages/dashboard/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const GovernmentCommandCenter = lazy(() => import('../pages/district/index').then(m => ({ default: m.GovernmentCommandCenter })));
const HospitalAdminDashboard = lazy(() => import('../pages/dashboard/HospitalAdminDashboard').then(m => ({ default: m.HospitalAdminDashboard })));

const MedicineInventory = lazy(() => import('../pages/inventory/index').then(m => ({ default: m.MedicineInventory })));
const BedManagement = lazy(() => import('../pages/beds/index').then(m => ({ default: m.BedManagement })));
const DoctorAttendance = lazy(() => import('../pages/doctors/index').then(m => ({ default: m.DoctorAttendance })));
const PatientFootfall = lazy(() => import('../pages/patients/index').then(m => ({ default: m.PatientFootfall })));
const LaboratoryManagement = lazy(() => import('../pages/laboratory/index').then(m => ({ default: m.LaboratoryManagement })));

const ResourceRedistribution = lazy(() => import('../pages/ResourceRedistribution').then(m => ({ default: m.ResourceRedistribution })));
const AIForecast = lazy(() => import('../pages/AIForecast').then(m => ({ default: m.AIForecast })));
const AlertsCenter = lazy(() => import('../pages/AlertsCenter').then(m => ({ default: m.AlertsCenter })));

const UserProfile = lazy(() => import('../pages/profile/index').then(m => ({ default: m.UserProfile })));
const Settings = lazy(() => import('../pages/settings/index').then(m => ({ default: m.Settings })));
const Reports = lazy(() => import('../pages/reports/index').then(m => ({ default: m.Reports })));

// Loading spinner fallback wrapper
const LoadingFallback = () => (
  <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
      <SkeletonLoader variant="line" className="h-6 w-48" />
      <SkeletonLoader variant="line" className="h-9 w-24" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonLoader variant="card" count={3} />
    </div>
    <CardDummy />
  </div>
);

const CardDummy = () => (
  <div className="animate-pulse border border-border bg-card/65 p-4 rounded-xl space-y-4">
    <div className="h-5 bg-muted/65 rounded w-1/4" />
    <div className="space-y-2">
      <div className="h-10 bg-muted/40 rounded w-full" />
      <div className="h-10 bg-muted/30 rounded w-full" />
      <div className="h-10 bg-muted/20 rounded w-full" />
    </div>
  </div>
);

// Redirect helper based on active user authorization levels
const HomeRedirect: React.FC = () => {
  const { currentUser } = useApp();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  
  return <Navigate to="/welcome" replace />;
};

interface RoleRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={
        currentUser ? (
          <HomeRedirect />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <Landing />
          </Suspense>
        )
      } />

      {/* Authentication */}
      <Route path="/login" element={
        <Suspense fallback={<LoadingScreen />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingScreen />}>
          <Register />
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<LoadingScreen />}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path="/reset-password" element={
        <Suspense fallback={<LoadingScreen />}>
          <ResetPassword />
        </Suspense>
      } />
      <Route path="/email-verified" element={
        <Suspense fallback={<LoadingScreen />}>
          <EmailVerificationSuccess />
        </Suspense>
      } />
      <Route path="/registration-success" element={
        <Suspense fallback={<LoadingScreen />}>
          <RegistrationSuccess />
        </Suspense>
      } />
      <Route path="/welcome" element={
        currentUser ? (
          <Suspense fallback={<LoadingScreen />}>
            <Welcome />
          </Suspense>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Main command shell */}
      <Route path="/" element={<AppLayout />}>
        {/* Dashboards */}
        <Route path="dashboard/super" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="super-admin/dashboard" element={
          <RoleRoute allowedRoles={['SUPER_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminDashboard />
            </Suspense>
          </RoleRoute>
        } />
        <Route path="dashboard/district" element={<Navigate to="/district/dashboard" replace />} />
        <Route path="district/dashboard" element={
          <RoleRoute allowedRoles={['DISTRICT_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <GovernmentCommandCenter />
            </Suspense>
          </RoleRoute>
        } />
        <Route path="dashboard/hospital" element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="hospital/dashboard" element={
          <RoleRoute allowedRoles={['HOSPITAL_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <HospitalAdminDashboard />
            </Suspense>
          </RoleRoute>
        } />

        {/* Clinical Modules */}
        <Route path="inventory" element={
          <RoleRoute allowedRoles={['SUPER_ADMIN', 'DISTRICT_ADMIN', 'HOSPITAL_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <MedicineInventory />
            </Suspense>
          </RoleRoute>
        } />
        <Route path="beds" element={
          <RoleRoute allowedRoles={['HOSPITAL_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <BedManagement />
            </Suspense>
          </RoleRoute>
        } />
        <Route path="doctors" element={
          <RoleRoute allowedRoles={['HOSPITAL_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <DoctorAttendance />
            </Suspense>
          </RoleRoute>
        } />
        <Route path="patients" element={
          <Suspense fallback={<LoadingFallback />}>
            <PatientFootfall />
          </Suspense>
        } />
        <Route path="laboratory" element={
          <RoleRoute allowedRoles={['HOSPITAL_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <LaboratoryManagement />
            </Suspense>
          </RoleRoute>
        } />
        
        {/* Operations */}
        <Route path="redistribution" element={
          <RoleRoute allowedRoles={['SUPER_ADMIN', 'DISTRICT_ADMIN']}>
            <Suspense fallback={<LoadingFallback />}>
              <ResourceRedistribution />
            </Suspense>
          </RoleRoute>
        } />
        <Route path="forecast" element={
          <Suspense fallback={<LoadingFallback />}>
            <AIForecast />
          </Suspense>
        } />
        <Route path="alerts" element={
          <Suspense fallback={<LoadingFallback />}>
            <AlertsCenter />
          </Suspense>
        } />
        
        {/* General */}
        <Route path="profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <UserProfile />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        <Route path="reports" element={
          <Suspense fallback={<LoadingFallback />}>
            <Reports />
          </Suspense>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
