import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Select, Logo } from '../../components/common';
import { ShieldCheck, ArrowLeft, Hospital, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../../services/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('PHC');
  const [district, setDistrict] = useState('District-A (Central)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [license, setLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "HealthSync AI | Register";
  }, []);

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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-transparent', width: 'w-0', textClass: 'text-muted-foreground' };
    if (pass.length < 5) return { label: 'Weak', color: 'bg-destructive', width: 'w-1/3', textClass: 'text-destructive' };
    if (pass.length < 8) return { label: 'Medium', color: 'bg-warning', width: 'w-2/3', textClass: 'text-warning' };
    return { label: 'Strong', color: 'bg-success', width: 'w-full', textClass: 'text-success' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.register({
        fullName: name,
        email,
        username: email.split('@')[0],
        password,
        role: 'HOSPITAL_ADMIN',
        facilityName,
        facilityType,
        district,
        licenseNumber: license
      });
      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error("Register API error: ", err);
      const errMsg = err.response?.data?.message || err.message || 'Registration failed. Try again.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link to="/" className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Logo size={24} className="text-white" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Enroll Health Facility
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            AI-Driven Health Center &amp; Supply Chain Management
          </p>
        </div>

        <Card variant="acrylic" className="p-6 md:p-8">
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success animate-bounce">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-foreground">Registration Successful</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your account has been enrolled. Redirecting to operational login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                  {error}
                </div>
              )}

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Input
                    label="Operations Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span className={strength.textClass}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary/20"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal select-none cursor-pointer">
                  I agree to the HealthSync operations ledger protocols, data sovereignty compliance clauses, and security terms.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full shadow-md font-bold mt-2 hover:fluent-shadow-lg"
                isLoading={isLoading}
              >
                Enroll Hospital Node
              </Button>

              <div className="text-center pt-2 text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
export default Register;
