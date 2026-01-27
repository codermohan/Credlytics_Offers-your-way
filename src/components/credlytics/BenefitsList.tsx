import { UserBenefitWithCard, getCategoryInfo, BENEFIT_CATEGORIES, UserCardWithTemplate } from "@/types/credlytics";
import BenefitCard from "./BenefitCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Filter } from "lucide-react";

interface BenefitsListProps {
  benefits: UserBenefitWithCard[];
  cards: UserCardWithTemplate[];
  onToggleUsed: (id: string, currentUsed: boolean) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const BenefitsList = ({
  benefits,
  cards,
  onToggleUsed,
  onDelete,
  isLoading,
}: BenefitsListProps) => {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCard, setFilterCard] = useState("all");
  const [showUsed, setShowUsed] = useState(true);

  const filteredBenefits = benefits.filter((benefit) => {
    if (filterCategory !== "all" && benefit.category !== filterCategory) return false;
    if (filterCard !== "all" && benefit.user_card_id !== filterCard) return false;
    if (!showUsed && benefit.used) return false;
    return true;
  });

  const groupedBenefits = filteredBenefits.reduce((acc, benefit) => {
    const category = benefit.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(benefit);
    return acc;
  }, {} as Record<string, UserBenefitWithCard[]>);

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent" />
          Benefits
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent" />
          Benefits
        </h2>
        <span className="text-sm text-muted-foreground">
          {filteredBenefits.length} benefit{filteredBenefits.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilterCategory("all")}
            className="rounded-full text-xs"
          >
            All
          </Button>
          {BENEFIT_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={filterCategory === cat.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilterCategory(cat.value)}
              className="rounded-full text-xs"
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Card filter and show used toggle */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCard} onValueChange={setFilterCard}>
              <SelectTrigger className="w-[180px] h-9 bg-secondary border-0 rounded-lg">
                <SelectValue placeholder="All cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cards</SelectItem>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.nickname || card.template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-used"
              checked={showUsed}
              onCheckedChange={setShowUsed}
            />
            <Label htmlFor="show-used" className="text-sm text-muted-foreground cursor-pointer">
              Show used benefits
            </Label>
          </div>
        </div>
      </div>

      {/* Benefits list */}
      {Object.keys(groupedBenefits).length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <Gift className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">
            {cards.length === 0
              ? "Add a card to see benefits"
              : "No benefits match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {BENEFIT_CATEGORIES.map((category) => {
            const categoryBenefits = groupedBenefits[category.value];
            if (!categoryBenefits || categoryBenefits.length === 0) return null;

            const categoryInfo = getCategoryInfo(category.value);

            return (
              <div key={category.value}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <span>{categoryInfo.icon}</span>
                  {categoryInfo.label}
                  <span className="text-xs font-normal">({categoryBenefits.length})</span>
                </h3>
                <div className="grid gap-3">
                  {categoryBenefits.map((benefit) => (
                    <BenefitCard
                      key={benefit.id}
                      benefit={benefit}
                      onToggleUsed={onToggleUsed}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BenefitsList;
