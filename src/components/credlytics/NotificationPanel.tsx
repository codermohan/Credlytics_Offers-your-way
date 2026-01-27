import { Tables } from "@/integrations/supabase/types";
import { Bell, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPanelProps {
  notifications: Tables<"user_notifications">[];
}

const NotificationPanel = ({ notifications }: NotificationPanelProps) => {
  if (notifications.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 border-l-4 border-destructive animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-destructive" />
        <h2 className="text-lg font-bold">Active Notifications</h2>
        <span className="ml-2 px-2 py-0.5 bg-destructive/20 text-destructive rounded-full text-sm font-semibold pulse-glow">
          {notifications.length}
        </span>
      </div>
      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              notif.notification_type === "urgent"
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-amber-500/10 border border-amber-500/20"
            }`}
          >
            <AlertCircle
              className={`w-4 h-4 flex-shrink-0 ${
                notif.notification_type === "urgent"
                  ? "text-destructive"
                  : "text-amber-500"
              }`}
            />
            <span className="text-sm flex-1">{notif.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
