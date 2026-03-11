import { Button } from "@/components/ui/button";
import { User, Shield, Wrench, Bell, Palette, Lock } from "lucide-react";

const sections = [
  { icon: User, title: "Profile", desc: "Update your name, email, and profile picture" },
  { icon: Bell, title: "Notifications", desc: "Configure email and push notification preferences" },
  { icon: Lock, title: "Privacy & Security", desc: "Manage password and two-factor authentication" },
  { icon: Palette, title: "Appearance", desc: "Theme and display preferences" },
  { icon: Shield, title: "Role Management", desc: "View your current role and permissions" },
  { icon: Wrench, title: "Advanced", desc: "Data export, account deletion, and API access" },
];

const SettingsPage = () => (
  <div className="container mx-auto px-4 py-8 max-w-2xl">
    <div className="mb-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-foreground mb-2">Settings</h1>
      <p className="text-muted-foreground">Manage your account preferences</p>
    </div>

    <div className="space-y-3">
      {sections.map((s) => (
        <div key={s.title} className="card-premium p-5 flex items-center gap-4 hover-lift animate-fade-in cursor-pointer">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <s.icon className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SettingsPage;
