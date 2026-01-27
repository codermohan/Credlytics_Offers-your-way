import { UserCardWithTemplate, UserBenefitWithCard } from "@/types/credlytics";
import { Trash2, CreditCard as CardIcon, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardListProps {
  cards: UserCardWithTemplate[];
  benefits: UserBenefitWithCard[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const CardList = ({ cards, benefits, onDelete, isLoading }: CardListProps) => {
  const getCardBenefitsCount = (cardId: string) => {
    return benefits.filter((b) => b.user_card_id === cardId).length;
  };

  const getUnusedBenefitsCount = (cardId: string) => {
    return benefits.filter((b) => b.user_card_id === cardId && !b.used).length;
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CardIcon className="w-5 h-5 text-primary" />
          My Cards
        </h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CardIcon className="w-5 h-5 text-primary" />
        My Cards
        {cards.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({cards.length})
          </span>
        )}
      </h2>

      <div className="space-y-4 stagger-children">
        {cards.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <CardIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No cards added yet</p>
            <p className="text-sm text-muted-foreground/70">
              Click "Add Card" to get started and unlock all benefits!
            </p>
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="group relative hover-lift rounded-xl overflow-hidden"
            >
              {/* Credit Card Visual */}
              <div
                className="p-5 rounded-xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}88)`,
                }}
              >
                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                
                {/* Chip icon */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center">
                    <div className="w-6 h-4 border border-yellow-700/30 rounded-sm" />
                  </div>
                  <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                </div>

                {/* Card number */}
                <div className="text-white/90 font-mono text-sm tracking-widest mb-4">
                  •••• •••• •••• {card.last_four_digits || '••••'}
                </div>

                {/* Card details */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {card.nickname || card.template.name}
                    </p>
                    <p className="text-white/70 text-xs">{card.template.issuer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">
                      {card.template.network || ''}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white rounded-lg"
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Card stats */}
              <div className="mt-3 flex gap-4 px-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Benefits: </span>
                  <span className="font-semibold text-foreground">
                    {getCardBenefitsCount(card.id)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Unused: </span>
                  <span className="font-semibold text-primary">
                    {getUnusedBenefitsCount(card.id)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Fee: </span>
                  <span className="font-semibold text-foreground">
                    {card.template.country === 'IN' ? '₹' : '$'}
                    {card.template.annual_fee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CardList;
