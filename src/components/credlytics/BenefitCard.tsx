import { UserBenefitWithCard, getCategoryInfo } from "@/types/credlytics";
import { Check, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BenefitCardProps {
  benefit: UserBenefitWithCard;
  onToggleUsed: (id: string, currentUsed: boolean) => void;
  onDelete: (id: string) => void;
}

const BenefitCard = ({ benefit, onToggleUsed, onDelete }: BenefitCardProps) => {
  const categoryInfo = getCategoryInfo(benefit.category);

  const getBenefitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ongoing: "Ongoing",
      annual: "Annual",
      monthly: "Monthly",
      limited: "Limited",
    };
    return labels[type] || "Ongoing";
  };

  return (
    <div
      className={`group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 hover-lift ${
        benefit.used ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="text-2xl flex-shrink-0">{categoryInfo.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${benefit.used ? "line-through text-muted-foreground" : ""}`}>
              {benefit.title}
            </h4>
            {!benefit.is_custom && (
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            )}
          </div>

          {/* Card name */}
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: benefit.card_color }}
            />
            {benefit.card_name || "Unknown Card"}
          </p>

          {/* Description */}
          {benefit.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {benefit.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-2">
            <span className={`category-badge ${categoryInfo.colorClass}`}>
              {categoryInfo.label}
            </span>
            <span className="category-badge bg-secondary text-secondary-foreground border-0">
              {getBenefitTypeLabel(benefit.benefit_type)}
            </span>
            {benefit.value && (
              <span className="category-badge bg-primary/10 text-primary border-primary/20">
                {benefit.value}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-lg ${
              benefit.used
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            onClick={() => onToggleUsed(benefit.id, benefit.used)}
            title={benefit.used ? "Mark as unused" : "Mark as used"}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
            onClick={() => onDelete(benefit.id)}
            title="Delete benefit"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Used indicator */}
      {benefit.used && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            <Check className="w-3 h-3" />
            Used
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitCard;
