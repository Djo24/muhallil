"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlanName } from "@/lib/utils";
import { UserProfile } from "@/types";
import { CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const { data: session, update } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch {
      toast.error("Failed to load billing info");
    } finally {
      setLoading(false);
    }
  };

  const plan = userProfile?.plan || "free";
  const planName = getPlanName(plan);
  const documentsUsed = userProfile?.documentsUsed || 0;

  const plans = [
    { id: "free" as const, name: "Free", price: "$0", documents: "3/month" },
    { id: "pro" as const, name: "Pro", price: "$7.99", documents: "30/month" },
    { id: "business" as const, name: "Business", price: "$19.99", documents: "Unlimited" },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") {
      await handleCancelSubscription();
      return;
    }
    setActionLoading(planId);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-checkout", planId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start checkout");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading("portal");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-portal" }),
      });
      if (!res.ok) throw new Error("Portal session failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features.")) return;
    setActionLoading("cancel");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel-subscription" }),
      });
      if (!res.ok) throw new Error("Cancellation failed");
      toast.success("Subscription cancelled");
      await fetchUserProfile();
      await update();
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Billing</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your subscription and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Current Plan
          </CardTitle>
          <CardDescription>You are currently on the {planName} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">{planName}</p>
              <p className="text-sm text-zinc-500">{documentsUsed} documents used this cycle</p>
            </div>
            <Badge variant={plan === "business" ? "success" : plan === "pro" ? "default" : "secondary"} className="capitalize">
              {planName}
            </Badge>
          </div>
          {plan !== "free" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePortal} disabled={actionLoading === "portal"}>
                Manage Billing
              </Button>
              <Button variant="destructive" onClick={handleCancelSubscription} disabled={actionLoading === "cancel"}>
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = p.id === plan;
          return (
            <Card key={p.id} className={`${isCurrent ? "ring-2 ring-indigo-500" : ""}`}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">{p.price}</span>
                  {p.id !== "free" && <span className="text-sm text-zinc-500">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{p.documents} documents</p>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleUpgrade(p.id)}
                    disabled={actionLoading !== null}
                  >
                    {p.id === "free" ? "Downgrade" : "Upgrade"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
