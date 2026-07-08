import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select, Logo } from '../../components/common';
import { Role } from '../../types';
import { ShieldCheck, HelpCircle, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, addToast, currentUser } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('SUPER_ADMIN');
  const [selectedHospital, setSelectedHospital] = useState('hosp-1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hospitalsList = [
    { value: 'hosp-1', label: 'Metro General District Hospital' },
    { value: 'hosp-2', label: 'Valley Community Health Center (CHC)' },
    { value: 'hosp-3', label: 'Sunset Primary Health Center (PHC)' },
    { value: 'hosp-4', label: 'Apex Cardiac & Specialty Clinic' }
  ];

  const handleRoleSelection = (selectedRole: Role) => {
    setRole(selectedRole);
    // Autofill demo accounts
    if (selectedRole === 'SUPER_ADMIN') {
      setEmail('director.rajesh@healthsync.gov');
    } else if (selectedRole === 'DISTRICT_ADMIN') {
      setEmail('priya.district@healthsync.gov');
    } else {
      setEmail('admin.metro@healthsync.org');
    }
    setPassword('demo1234');
  };

  // Redirect if already logged in — use replace to avoid back-button loops
  React.useEffect(() => {
    if (currentUser) {
      navigate('/welcome', { replace: true });
    }
  }, [currentUser]); // intentionally omit navigate to avoid stale closure issues

  // Run initial auto-fill on boot
  React.useEffect(() => {
    document.title = "HealthSync AI | Login";
    handleRoleSelection('SUPER_ADMIN');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all security parameters.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password, role, role === 'HOSPITAL_ADMIN' ? selectedHospital : undefined);
      if (success) {
        navigate('/welcome', { replace: true });
      } else {
        setError('Authentication failed. Verify credentials.');
      }
    } catch (err: any) {
      console.error("Login failure:", err);
      const errMsg = err.response?.data?.message || err.message || 'Network sync failure. Try again.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background visual graphics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-fluentMd hover:opacity-90 transition-opacity">
            <Logo size={24} className="text-white" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            HealthSync AI
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            AI-Driven Health Center &amp; Supply Chain Management
          </p>
        </div>

        {/* Login Form Container */}
        <Card variant="acrylic" className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Role Select Buttons */}
            <div>
              <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Access Level Authorization
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['SUPER_ADMIN', 'DISTRICT_ADMIN', 'HOSPITAL_ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelection(r)}
                    className={`rounded-md border p-2 text-center text-xs font-semibold transition-all duration-150 ${
                      role === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'DISTRICT_ADMIN' ? 'District' : 'Hospital'}
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials Fields */}
            <div className="space-y-3.5">
              <Input
                label="Security Access Email"
                type="email"
                placeholder="email@healthsync.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <div className="relative">
                <Input
                  label="Access Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Hospital Selector for Hospital Admin */}
            {role === 'HOSPITAL_ADMIN' && (
              <Select
                label="Designated Health Facility"
                options={hospitalsList}
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
              />
            )}

            {/* Actions Links */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground select-none">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary/20" />
                Keep token active
              </label>
              <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                Reset Key
              </Link>
            </div>

            {/* Submit Auth */}
            <Button
              type="submit"
              className="w-full shadow-md font-bold mt-2 hover:fluent-shadow-lg active:scale-95"
              isLoading={isLoading}
            >
              Authorize Credentials
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-1">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create Account
              </Link>
            </div>

            {/* Google OAuth Section */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 font-bold active:scale-95 shadow-sm"
              onClick={() => addToast('Google OAuth Authentication portal is ready to connect.', 'info')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Workspace
            </Button>
          </form>
        </Card>

        {/* Demo Accounts Quick Fill Help Card */}
        <Card className="bg-muted/10 border-border/50 p-4">
          <div className="flex gap-2.5 text-xs">
            <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground/80 mb-1 flex items-center gap-1">
                Demo Accounts Configured
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Auth profiles are preloaded. Select an Access Level button to auto-fill the mock directory and click **Authorize Credentials** to log in.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
