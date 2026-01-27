import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Header from "@/components/credlytics/Header";
import CardList from "@/components/credlytics/CardList";
import BenefitsList from "@/components/credlytics/BenefitsList";
import CardForm from "@/components/credlytics/CardForm";
import NotificationPanel from "@/components/credlytics/NotificationPanel";
import StatsBar from "@/components/credlytics/StatsBar";

import {
  fetchCardTemplates,
  fetchUserCards,
  fetchUserBenefits,
  fetchNotifications,
  addUserCard,
  deleteUserCard,
  toggleBenefitUsed,
  deleteBenefit,
} from "@/services/credlyticsApi";

const Index = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch card templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["cardTemplates"],
    queryFn: fetchCardTemplates,
  });

  // Fetch user cards
  const { data: userCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["userCards"],
    queryFn: fetchUserCards,
  });

  // Fetch user benefits
  const { data: userBenefits = [], isLoading: benefitsLoading } = useQuery({
    queryKey: ["userBenefits", userCards.map((c) => c.id).join(",")],
    queryFn: () => fetchUserBenefits(userCards),
    enabled: !cardsLoading,
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  // Add card mutation
  const addCardMutation = useMutation({
    mutationFn: ({
      cardTemplateId,
      lastFourDigits,
      color,
    }: {
      cardTemplateId: string;
      lastFourDigits: string;
      color: string;
    }) => addUserCard(cardTemplateId, lastFourDigits, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCards"] });
      queryClient.invalidateQueries({ queryKey: ["userBenefits"] });
      setShowCardForm(false);
      toast.success("Card added successfully! Benefits imported.");
    },
    onError: (error) => {
      toast.error("Failed to add card. Please try again.");
      console.error("Add card error:", error);
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: deleteUserCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCards"] });
      queryClient.invalidateQueries({ queryKey: ["userBenefits"] });
      toast.success("Card deleted successfully.");
    },
    onError: (error) => {
      toast.error("Failed to delete card.");
      console.error("Delete card error:", error);
    },
  });

  // Toggle benefit used mutation
  const toggleBenefitMutation = useMutation({
    mutationFn: ({ id, currentUsed }: { id: string; currentUsed: boolean }) =>
      toggleBenefitUsed(id, currentUsed),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userBenefits"] });
      toast.success(
        variables.currentUsed ? "Benefit marked as unused." : "Benefit marked as used!"
      );
    },
    onError: (error) => {
      toast.error("Failed to update benefit.");
      console.error("Toggle benefit error:", error);
    },
  });

  // Delete benefit mutation
  const deleteBenefitMutation = useMutation({
    mutationFn: deleteBenefit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBenefits"] });
      toast.success("Benefit deleted.");
    },
    onError: (error) => {
      toast.error("Failed to delete benefit.");
      console.error("Delete benefit error:", error);
    },
  });

  // Handlers
  const handleAddCard = (cardTemplateId: string, lastFourDigits: string, color: string) => {
    addCardMutation.mutate({ cardTemplateId, lastFourDigits, color });
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm("Delete this card and all its benefits?")) {
      deleteCardMutation.mutate(id);
    }
  };

  const handleToggleBenefit = (id: string, currentUsed: boolean) => {
    toggleBenefitMutation.mutate({ id, currentUsed });
  };

  const handleDeleteBenefit = (id: string) => {
    if (window.confirm("Delete this benefit?")) {
      deleteBenefitMutation.mutate(id);
    }
  };

  // Calculate stats
  const totalBenefits = userBenefits.length;
  const usedBenefits = userBenefits.filter((b) => b.used).length;
  const potentialSavings = userBenefits
    .filter((b) => !b.used && b.value)
    .reduce((acc, b) => {
      const match = b.value?.match(/\$?([\d,]+)/);
      if (match) {
        return acc + parseInt(match[1].replace(/,/g, ""), 10);
      }
      return acc;
    }, 0);

  const isLoading = templatesLoading || cardsLoading;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          onAddCard={() => setShowCardForm(true)}
          notificationCount={notifications.length}
        />

        <NotificationPanel notifications={notifications} />

        <StatsBar
          totalCards={userCards.length}
          totalBenefits={totalBenefits}
          usedBenefits={usedBenefits}
          potentialSavings={potentialSavings > 0 ? `$${potentialSavings.toLocaleString()}+` : "$0"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CardList
              cards={userCards}
              benefits={userBenefits}
              onDelete={handleDeleteCard}
              isLoading={cardsLoading}
            />
          </div>

          <div className="lg:col-span-2">
            <BenefitsList
              benefits={userBenefits}
              cards={userCards}
              onToggleUsed={handleToggleBenefit}
              onDelete={handleDeleteBenefit}
              isLoading={benefitsLoading}
            />
          </div>
        </div>

        {showCardForm && (
          <CardForm
            templates={templates}
            onClose={() => setShowCardForm(false)}
            onSubmit={handleAddCard}
            isSubmitting={addCardMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
