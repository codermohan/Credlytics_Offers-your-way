import { CreditCard, Plus, Gift, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAddCard: () => void;
  notificationCount: number;
}

const Header = ({ onAddCard, notificationCount }: HeaderProps) => {
  return (
    <header className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Credlytics</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track & maximize your card benefits
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {notificationCount > 0 && (
            <div className="relative">
              <Button variant="secondary" size="icon" className="rounded-xl">
                <Bell className="w-5 h-5" />
              </Button>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold pulse-glow">
                {notificationCount}
              </span>
            </div>
          )}
          
          <Button
            onClick={onAddCard}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-4 py-2 rounded-xl transition-all duration-200 glow-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Card</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
