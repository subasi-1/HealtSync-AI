import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, TrendingUp, Sparkles, Pill, 
  BedDouble, Users, FlaskConical, AlertTriangle, ChevronRight, BarChart3, 
  MapPin, Send, HelpCircle, HeartPulse, Stethoscope, GraduationCap, Github 
} from 'lucide-react';
import { Logo } from '../components/common';

const stats = [
  { value: '98%', label: 'Prediction Accuracy' },
  { value: '45 Min', label: 'Response Time Reduction' },
  { value: '1.2M+', label: 'Medications Tracked' },
  { value: '120+', label: 'Centers Integrated' }
];

const features = [
  {
    icon: Pill,
    title: 'Medicine Supply Intelligence',
    description: 'Predict pharmaceutical stockouts and auto-coordinate reallocations before deficits strike rural centers.',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    icon: BedDouble,
    title: 'Smart Bed Management',
    description: 'Real-time bed tracking across general and ICU wards. Seamlessly dispatch bed clearing and sanitation workflows.',
    color: 'text-teal-500 bg-teal-500/10'
  },
  {
    icon: Users,
    title: 'Doctor & Roster Optimization',
    description: 'Ensure adequate specialist presence. Track attendance logs and dynamically adjust shift schedules during outbreak alerts.',
    color: 'text-indigo-500 bg-indigo-500/10'
  },
  {
    icon: FlaskConical,
    title: 'Laboratory Management',
    description: 'Queue and monitor diagnostic tests. Set flags for critical lab indicators and track chemical reagent levels.',
    color: 'text-purple-500 bg-purple-500/10'
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Alerts Hub',
    description: 'Broadcast high-priority notifications to medical officers. Coordinate cross-facility ambulance routes under triage strain.',
    color: 'text-rose-500 bg-rose-500/10'
  },
  {
    icon: BarChart3,
    title: 'Real-time Health Analytics',
    description: 'Provide state and district offices with granular operational insights, disease outbreak mapping, and audit trails.',
    color: 'text-emerald-500 bg-emerald-500/10'
  }
];

const faqs = [
  {
    q: 'How does the AI Supply Chain Prediction work?',
    a: 'Our platform tracks daily drug utilization metrics at Primary Health Centers (PHCs). Machine learning models analyze these trends along with historical outbreaks to forecast demand and suggest inventory transfers.'
  },
  {
    q: 'Can this platform run offline?',
    a: 'Yes. HealthSync AI features a local sync buffer that retains registry logs offline, synchronizing state directories back to the central database once network connection is recovered.'
  },
  {
    q: 'What is the role of Super Admins vs District Admins?',
    a: 'Super Admins oversee state-level analytics and broad logistics. District Admins manage local center clusters and approve supply transfers. Hospital Admins manage day-to-day internal facility operations.'
  }
];

export const Landing: React.FC = () => {
  React.useEffect(() => {
    document.title = "HealthSync AI | Home";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 ease-in-out select-none"
            aria-label="Go to HealthSync AI Home"
          >
            <Logo size={32} className="transition-transform duration-300" />
            <span className="text-base font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              HealthSync AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link to="/register" className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-fluentSm hover:bg-primary/95 transition-all">
              Enroll Facility <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-30">
          <div className="absolute -top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-[20%] right-[5%] h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <Logo size={42} />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                HealthSync AI
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15] text-foreground">
              AI-Driven Health Center &amp; <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-teal-500 bg-clip-text text-transparent">
                Supply Chain Management
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              An AI-driven Health Center &amp; Supply Chain Management System ensuring zero stockouts, optimized medical staffing, and real-time operational visibility across primary care centers.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link to="/login" className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-fluentLg hover:bg-primary/95 transition-all active:scale-95">
                Launch Command Hub <ChevronRight className="h-4.5 w-4.5" />
              </Link>
              <Link to="/register" className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all active:scale-95">
                Register Node
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-teal-500 opacity-20 blur-xl" />
              <div className="relative rounded-2xl border border-border bg-card/60 p-4 shadow-fluentLg backdrop-blur-md">
                {/* Visual Placeholder for Dashboard Grid */}
                <div className="rounded-xl bg-muted/30 p-4 border border-border/50 space-y-4">
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">District Live Operations Ledger</span>
                    </div>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">Active State</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-background/80 p-3 rounded-lg border border-border/40 space-y-1">
                      <span className="text-[8px] font-semibold text-muted-foreground block">BED CAPACITY</span>
                      <span className="text-sm font-bold text-foreground">84 / 120</span>
                    </div>
                    <div className="bg-background/80 p-3 rounded-lg border border-border/40 space-y-1">
                      <span className="text-[8px] font-semibold text-muted-foreground block">STOCK STATUS</span>
                      <span className="text-sm font-bold text-success">Healthy</span>
                    </div>
                    <div className="bg-background/80 p-3 rounded-lg border border-border/40 space-y-1">
                      <span className="text-[8px] font-semibold text-muted-foreground block">STAFF ACTIVE</span>
                      <span className="text-sm font-bold text-foreground">32 / 45</span>
                    </div>
                  </div>
                  <div className="bg-background/80 p-3 rounded-lg border border-border/40 space-y-2">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Predictive Recommendation</span>
                    <p className="text-[10px] text-foreground leading-normal font-medium">
                      Outbreak threshold reached in District Central. Suggest transferring <strong>1,000 units</strong> of Paracetamol from Valley CHC to Sunset PHC.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-border bg-muted/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-primary">
                  {stat.value}
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The Rural Healthcare Challenge</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Primary Health Centers (PHCs) and Community Health Centers (CHCs) in rural regions suffer from acute supply deficits, lack of real-time clinical dashboards, and unpredictable disease outbreaks. Resources are often stockpiled in urban hospitals while rural patients suffer from stockouts of lifesaving drugs and bed shortages.
          </p>
          <div className="pt-4 border-t border-border/60 max-w-2xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <HeartPulse className="h-4 w-4" /> HealthSync AI bridges this operational gap using smart predictive allocation.
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-20 bg-muted/10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">AI-Powered SaaS Capabilities</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Designed to Vercel/Stripe standards</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-fluentSm hover:shadow-fluentMd hover:border-primary/45 transition-all">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Breakdown (PHCs vs CHCs) */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Strategic Value Across Tiers</h2>
            <p className="text-xs text-muted-foreground">Optimizing resources dynamically based on facility scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PHCs */}
            <div className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-fluentMd">
              <span className="h-7 w-7 inline-flex items-center justify-center rounded bg-teal-500/10 text-teal-600 font-bold text-xs">PHC</span>
              <h3 className="text-base font-bold text-foreground">Primary Health Centers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Typically serving rural sectors with micro-inventories and limited doctors. HealthSync AI provides simple alert triggers, offline registry buffers, and automated stock replenishment requests.
              </p>
              <ul className="text-xs text-foreground/80 space-y-2 pt-2 border-t border-border/40 font-medium">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-500" /> Automated low-stock trigger alerts</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-500" /> Offline check-in and roster logs</li>
              </ul>
            </div>
            {/* CHCs */}
            <div className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-fluentMd">
              <span className="h-7 w-7 inline-flex items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">CHC</span>
              <h3 className="text-base font-bold text-foreground">Community Health Centers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Multi-specialty center clusters with diagnostic labs and critical care capacity. HealthSync AI provides lab queues, patient flow tracking, ward bed maps, and supply transfer shipping tools.
              </p>
              <ul className="text-xs text-foreground/80 space-y-2 pt-2 border-t border-border/40 font-medium">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Integrated lab diagnostics pipeline</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Multi-ward bed occupancy management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Team */}
      <section className="py-20 bg-muted/10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Architected by HealthTech Experts</h2>
            <p className="text-xs text-muted-foreground">Combining robust backend workflows with Vercel UI standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-6">
            <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4 shadow-fluentSm">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Healthcare Lead Architect</h4>
                <p className="text-sm font-bold text-foreground mt-0.5">Dr. Subha Roy</p>
                <p className="text-[11px] text-muted-foreground">Coordinated database schemas & clinical validation workflows.</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4 shadow-fluentSm">
              <div className="h-12 w-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lead Frontend Architect</h4>
                <p className="text-sm font-bold text-foreground mt-0.5">Liza Sahoo</p>
                <p className="text-[11px] text-muted-foreground">Designed fluent glassmorphism system and React widgets.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Clearing up technical queries on HealthSync AI.</p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-6 space-y-2 shadow-fluentSm">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary shrink-0" /> {faq.q}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 ease-in-out select-none"
            aria-label="Go to HealthSync AI Home"
          >
            <Logo size={24} className="transition-transform duration-300" />
            <span className="text-sm font-bold text-foreground">HealthSync AI</span>
          </Link>
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} HealthSync AI. Open Source under MIT License. Hackathon Ready.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Github className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
