import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Select } from '../../components/common';
import { Activity, ShieldCheck, ArrowLeft, Hospital } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('PHC');
  const [district, setDistrict] = useState('District-A (Central)');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const facilityTypes = [
    { value: 'PHC', label: 'Primary Health Center (PHC)' },
    { value: 'CHC', label: 'Community Health Center (CHC)' },
    { value: 'District Hospital', label: 'District General Hospital' },
    { value: 'Specialty', label: 'Specialty Care / Research Clinic' }
  ];

  const districtsList = [
    { value: 'District-A (Central)', label: 'District-A (Central Operations)' },
    { value: 'District-B (East)', label: 'District-B (East Operations)' },
    { value: 'District-C (West)', label: 'District-C (West Operations)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Enroll Health Facility
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            HealthSync SaaS Registry Portal
          </p>
        </div>

        <Card variant="acrylic" className="p-6 md:p-8">
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <Hospital className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-foreground">Registration Request Received</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The license `{license}` has been queued for verification. A District Officer will audit the facility details before activating the tenant sandbox.
              </p>
              <Link to="/login" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                Register a new clinical node under state command. System accounts will remain locked until verified by an active District Supervisor.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Chief Administrator Name"
                  placeholder="Dr. Samantha Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Official Email Domain"
                  type="email"
                  placeholder="samantha@health.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Health Center Name"
                  placeholder="East Side Community Clinic"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  required
                />
                <Select
                  label="Facility Grade"
                  options={facilityTypes}
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Administrative Region"
                  options={districtsList}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
                <Input
                  label="Medical License / Registry Code"
                  placeholder="MCI-9988-A"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Choose Operations Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full shadow-md font-bold mt-2 hover:fluent-shadow-lg"
                isLoading={isLoading}
              >
                Enroll Hospital Node
              </Button>

              <div className="text-center pt-1.5">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Authorization Console
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
