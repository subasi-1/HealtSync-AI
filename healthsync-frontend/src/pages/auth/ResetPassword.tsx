import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Logo } from '../../components/common';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

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
            Reset Password
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            HealthSync AI Security Console
          </p>
        </div>

        <Card variant="acrylic" className="p-6 md:p-8">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <KeyRound className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-foreground">Password Reset Complete</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your credentials have been successfully updated. You can now use your new password to authorize session tokens.
              </p>
              <Link to="/login" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                  {error}
                </div>
              )}
              <Input
                label="Choose Operations Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Operations Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full shadow-md font-bold mt-2 hover:fluent-shadow-lg"
                isLoading={isLoading}
              >
                Reset Operations Key
              </Button>

              <div className="text-center pt-1.5">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Cancel and Return
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
export default ResetPassword;
