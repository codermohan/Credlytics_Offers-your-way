import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || "Failed to sign in");
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE – BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex items-center justify-center w-full p-12 text-white">
          <div className="max-w-md space-y-12">
            {/* BRAND HEADER */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <CreditCard className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-5xl font-extrabold tracking-tight">
                  Credlytics 
                </h1>
                <p className="text-xl font-extrabold tracking-tight">
                  Offers your way
                </p>
              </div>
            </div>

            {/* MAIN MESSAGE */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                Maximize Every Card Benefit
              </h2>
              <p className="text-lg text-white/80">
                Track, manage, and never miss a credit card benefit again.
                Your complete benefits companion.
              </p>
            </div>

            {/* FEATURES */}
            <div className="space-y-6 pt-4">
              <div className="flex gap-3">
                <Sparkles className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-semibold">Smart Tracking</h3>
                  <p className="text-sm text-white/70">
                    Automatically track all your card benefits in one place
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Sparkles className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-semibold">Never Miss Benefits</h3>
                  <p className="text-sm text-white/70">
                    Get reminders before benefits expire or reset
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Sparkles className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-semibold">Maximize Savings</h3>
                  <p className="text-sm text-white/70">
                    See how much value you’ve unlocked from your cards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – LOGIN */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* MOBILE BRAND */}
          <div className="lg:hidden flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Credlytics</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Offers your way
            </p>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* EMAIL */}
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary border-0"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex justify-between">
                  <Label>Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary border-0"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-primary font-semibold">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
