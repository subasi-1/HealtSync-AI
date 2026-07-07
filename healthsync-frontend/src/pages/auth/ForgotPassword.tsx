import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { Activity, Mail, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Recover Access Keys
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            HealthSync Operational Security Center
          </p>
        </div>

        <Card variant="acrylic" className="p-6 md:p-8">
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-foreground">Recovery Link Dispatched</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If the email `{email}` matches an authorized clinical key in the department ledger, a reset link has been dispatched.
              </p>
              <Link to="/login" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your authorized clinical email. We will scan the directory database and dispatch a cryptographic token recovery link.
              </p>

              <Input
                label="Registered Health Domain Email"
                type="email"
                placeholder="domain@health.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full shadow-md font-bold mt-2 hover:fluent-shadow-lg"
                isLoading={isLoading}
              >
                Dispatch Security Reset Token
              </Button>

              <div className="text-center pt-2">
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
