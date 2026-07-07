import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select } from '../../components/common';
import { Role } from '../../types';
import { Activity, ShieldCheck, HelpCircle, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Run initial auto-fill on boot
  React.useEffect(() => {
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
      const success = await login(email, role, role === 'HOSPITAL_ADMIN' ? selectedHospital : undefined);
      if (success) {
        if (role === 'SUPER_ADMIN') navigate('/dashboard/super');
        else if (role === 'DISTRICT_ADMIN') navigate('/dashboard/district');
        else navigate('/dashboard/hospital');
      } else {
        setError('Authentication failed. Verify role security tokens.');
      }
    } catch (err) {
      setError('Network sync failure. Try again.');
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
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-fluentMd">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            HealthSync AI
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Clinical Command & Supply Ledger Console
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
              
              <Input
                label="Access Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
