import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Logo } from '../../components/common';
import { ShieldCheck, ArrowLeft, HeartHandshake } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Logo size={24} className="text-white" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Registry Success
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            HealthSync AI SaaS Console
          </p>
        </div>

        <Card variant="acrylic" className="p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <p className="text-base font-bold text-foreground">Facility Request Enrolled</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your clinical node registration has been successfully cataloged. District operations supervisors will verify and activate your facility context.
          </p>
          <div className="pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Authorization Console
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default RegistrationSuccess;
