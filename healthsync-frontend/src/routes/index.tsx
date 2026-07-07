import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

// Lazy loading clinical pages for bundle split optimization
const Login = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));

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
  
  if (currentUser.role === 'SUPER_ADMIN') {
    return <Navigate to="/dashboard/super" replace />;
  } else if (currentUser.role === 'DISTRICT_ADMIN') {
    return <Navigate to="/dashboard/district" replace />;
  } else {
    return <Navigate to="/dashboard/hospital" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SkeletonLoader variant="card" className="w-80" /></div>}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SkeletonLoader variant="card" className="w-80" /></div>}>
          <Register />
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SkeletonLoader variant="card" className="w-80" /></div>}>
          <ForgotPassword />
        </Suspense>
      } />

      {/* Main command shell */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomeRedirect />} />
        
        {/* Dashboards */}
        <Route path="dashboard/super" element={
          <Suspense fallback={<LoadingFallback />}>
            <SuperAdminDashboard />
          </Suspense>
        } />
        <Route path="dashboard/district" element={
          <Suspense fallback={<LoadingFallback />}>
            <GovernmentCommandCenter />
          </Suspense>
        } />
        <Route path="dashboard/hospital" element={
          <Suspense fallback={<LoadingFallback />}>
            <HospitalAdminDashboard />
          </Suspense>
        } />

        {/* Clinical Modules */}
        <Route path="inventory" element={
          <Suspense fallback={<LoadingFallback />}>
            <MedicineInventory />
          </Suspense>
        } />
        <Route path="beds" element={
          <Suspense fallback={<LoadingFallback />}>
            <BedManagement />
          </Suspense>
        } />
        <Route path="doctors" element={
          <Suspense fallback={<LoadingFallback />}>
            <DoctorAttendance />
          </Suspense>
        } />
        <Route path="patients" element={
          <Suspense fallback={<LoadingFallback />}>
            <PatientFootfall />
          </Suspense>
        } />
        <Route path="laboratory" element={
          <Suspense fallback={<LoadingFallback />}>
            <LaboratoryManagement />
          </Suspense>
        } />
        
        {/* Operations */}
        <Route path="redistribution" element={
          <Suspense fallback={<LoadingFallback />}>
            <ResourceRedistribution />
          </Suspense>
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
