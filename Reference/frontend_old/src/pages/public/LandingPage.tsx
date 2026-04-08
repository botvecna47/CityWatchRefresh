import { Shield, ArrowRight, MapPin, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  { icon: MapPin, title: "Report Issues", desc: "Pin civic problems on an interactive map with photos and details" },
  { icon: Users, title: "Community Driven", desc: "Upvote, comment, and track issues that matter to your neighborhood" },
  { icon: BarChart3, title: "Track Progress", desc: "Real-time status updates from report to resolution" },
];

const HomePage = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-emerald-light/30" />
      <div className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Civic Issue Reporting Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Your City, <span className="text-gradient">Your Voice</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Report infrastructure issues, track resolutions, and collaborate with your community to build a better city — one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/reports">
              <Button size="lg" className="rounded-xl px-8 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20">
                Browse Reports <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/submit">
              <Button variant="outline" size="lg" className="rounded-xl px-8 font-semibold border-border hover:bg-muted/50">
                Submit a Report
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="card-premium p-8 text-center hover-lift"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <f.icon className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Stats */}
    <section className="container mx-auto px-4 pb-24">
      <div className="card-premium p-8 md:p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "1,247", label: "Reports Filed" },
            { value: "892", label: "Issues Resolved" },
            { value: "3", label: "City Areas" },
            { value: "98%", label: "Citizen Satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-extrabold text-gradient">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
