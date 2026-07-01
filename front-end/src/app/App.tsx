import { useState } from "react";
import type { AppUser, AuthMode, Screen } from "../types/app";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<AppUser | null>(null);

  const goAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setScreen("auth");
  };

  const handleLogin = (nextUser: AppUser) => {
    setUser(nextUser);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("landing");
  };

  if (screen === "landing") return <LandingPage onNav={goAuth} />;
  if (screen === "auth") return <AuthPage mode={authMode} onModeChange={setAuthMode} onBack={() => setScreen("landing")} onLogin={handleLogin} />;
  if (screen === "dashboard" && user) return <DashboardPage user={user} onLogout={handleLogout} />;
  return null;
}
