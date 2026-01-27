import { TrendingUp, CreditCard, Gift, CheckCircle2 } from "lucide-react";

interface StatsBarProps {
  totalCards: number;
  totalBenefits: number;
  usedBenefits: number;
  potentialSavings: string;
}

const StatsBar = ({ totalCards, totalBenefits, usedBenefits, potentialSavings }: StatsBarProps) => {
  const stats = [
    {
      label: "Cards",
      value: totalCards,
      icon: CreditCard,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Benefits",
      value: totalBenefits,
      icon: Gift,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Used",
      value: usedBenefits,
      icon: CheckCircle2,
      color: "text-category-cashback",
      bgColor: "bg-category-cashback/10",
    },
    {
      label: "Potential Value",
      value: potentialSavings,
      icon: TrendingUp,
      color: "text-category-other",
      bgColor: "bg-category-other/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card rounded-xl p-4 flex items-center gap-3"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
