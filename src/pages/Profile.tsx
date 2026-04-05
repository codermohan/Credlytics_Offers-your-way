import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreditCard, User, Mail, LogOut, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserSubscription {
  tier: "free" | "premium" | "pro";
  status: "active" | "inactive" | "canceled" | "past_due" | "trialing";
  expires_at: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  stripe_subscription_id?: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [billingActionLoading, setBillingActionLoading] = useState<"checkout" | "portal" | null>(null);

  const upgradeUrl = import.meta.env.VITE_BILLING_UPGRADE_URL;
  const portalUrl = import.meta.env.VITE_BILLING_PORTAL_URL;

  const parseFunctionUrl = (response: unknown): string | null => {
    if (typeof response !== "object" || response === null || !("url" in response)) return null;
    const rawUrl = (response as { url: unknown }).url;
    return typeof rawUrl === "string" && rawUrl.length > 0 ? rawUrl : null;
  };

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const loadSubscription = useCallback(async () => {
    if (!user) return;

    setSubscriptionLoading(true);
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("tier, status, expires_at, current_period_end, cancel_at_period_end, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load subscription:", error);
      setSubscription(null);
      setSubscriptionLoading(false);
      return;
    }

    if (!data) {
      setSubscription({
        tier: "free",
        status: "active",
        expires_at: null,
      });
    } else {
      setSubscription(data as UserSubscription);
    }
    setSubscriptionLoading(false);
  }, [user]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  useEffect(() => {
    const billingState = new URLSearchParams(location.search).get("billing");
    if (!billingState) return;

    if (billingState === "success") {
      toast.success("Payment successful. Syncing your subscription...");
      void loadSubscription();
    } else if (billingState === "cancel") {
      toast.message("Checkout canceled.");
    } else if (billingState === "portal") {
      void loadSubscription();
    }

    navigate("/profile", { replace: true });
  }, [location.search, loadSubscription, navigate]);

  const handleStartCheckout = async () => {
    if (!user) {
      toast.error("You must be signed in to upgrade.");
      return;
    }

    setBillingActionLoading("checkout");
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { tier: "premium" },
    });

    if (error) {
      console.error("Checkout session error:", error);
      if (upgradeUrl) {
        window.location.assign(upgradeUrl);
        return;
      }
      toast.error("Could not start checkout. Configure Stripe function secrets.");
      setBillingActionLoading(null);
      return;
    }

    const url = parseFunctionUrl(data);
    if (!url) {
      if (upgradeUrl) {
        window.location.assign(upgradeUrl);
        return;
      }
      toast.error("Checkout URL was not returned by billing function.");
      setBillingActionLoading(null);
      return;
    }

    window.location.assign(url);
  };

  const handleManageBilling = async () => {
    if (!user) {
      toast.error("You must be signed in to manage billing.");
      return;
    }

    setBillingActionLoading("portal");
    const { data, error } = await supabase.functions.invoke("create-billing-portal-session");

    if (error) {
      console.error("Billing portal error:", error);
      if (portalUrl) {
        window.location.assign(portalUrl);
        return;
      }
      toast.error("Could not open billing portal.");
      setBillingActionLoading(null);
      return;
    }

    const url = parseFunctionUrl(data);
    if (!url) {
      if (portalUrl) {
        window.location.assign(portalUrl);
        return;
      }
      toast.error("Billing portal URL was not returned.");
      setBillingActionLoading(null);
      return;
    }

    window.location.assign(url);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    toast.success("Signed out successfully");
  };

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isPremium = subscription?.tier === "premium" || subscription?.tier === "pro";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  <span className="gradient-text">Profile Settings</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          {/* Profile Card */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{fullName || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-secondary border-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 bg-secondary border-0 opacity-50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Account Actions
              </CardTitle>
              <CardDescription>
                Manage your account and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                <div>
                  <h4 className="font-semibold">Change Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your password to keep your account secure
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate("/forgot-password")}>
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div>
                  <h4 className="font-semibold text-destructive">Sign Out</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your plan and daily deals access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionLoading ? (
                <p className="text-sm text-muted-foreground">Loading subscription...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-secondary">
                      <p className="text-xs text-muted-foreground mb-1">Tier</p>
                      <p className="font-semibold capitalize">{subscription?.tier ?? "free"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className="font-semibold capitalize">{subscription?.status ?? "active"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary">
                      <p className="text-xs text-muted-foreground mb-1">Expires</p>
                      <p className="font-semibold">
                        {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "No expiry"}
                      </p>
                    </div>
                  </div>

                  {!isPremium ? (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
                      <p className="text-sm">
                        Upgrade to Premium to unlock full Daily Deals and personalized offer recommendations.
                      </p>
                      <Button
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent"
                        onClick={handleStartCheckout}
                        disabled={billingActionLoading !== null}
                      >
                        {billingActionLoading === "checkout" ? "Opening Checkout..." : "Upgrade to Premium"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        If Stripe checkout function is not configured yet, set <code>VITE_BILLING_UPGRADE_URL</code> as fallback.
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={handleManageBilling}
                      disabled={billingActionLoading !== null}
                    >
                      {billingActionLoading === "portal" ? "Opening Billing Portal..." : "Manage Billing"}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onClick={() => void loadSubscription()}
                    disabled={subscriptionLoading}
                  >
                    {subscriptionLoading ? "Refreshing..." : "Refresh Subscription"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-semibold">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Email Verified</p>
                  <p className="font-semibold">
                    {user?.email_confirmed_at ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
