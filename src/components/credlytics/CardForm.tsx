import { useState, useMemo } from "react";
import { CardTemplateWithBenefits, CARD_COLORS } from "@/types/credlytics";
import { X, Search, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CardFormProps {
  templates: CardTemplateWithBenefits[];
  onClose: () => void;
  onSubmit: (cardTemplateId: string, lastFourDigits: string, color: string) => void;
  isSubmitting: boolean;
}

const CardForm = ({ templates, onClose, onSubmit, isSubmitting }: CardFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplateWithBenefits | null>(null);
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0].value);
  const [country, setCountry] = useState<"all" | "US" | "IN">("all");

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = country === "all" || t.country === country;
      return matchesSearch && matchesCountry;
    });
  }, [templates, searchTerm, country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    onSubmit(selectedTemplate.id, lastFourDigits, selectedColor);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Add Credit Card
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Search and select card */}
          {!selectedTemplate ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for your card..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-0"
                />
              </div>

              {/* Country filter */}
              <Tabs value={country} onValueChange={(v) => setCountry(v as "all" | "US" | "IN")}>
                <TabsList className="grid w-full grid-cols-3 bg-secondary">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="US">🇺🇸 US</TabsTrigger>
                  <TabsTrigger value="IN">🇮🇳 India</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Card list */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-2">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No cards found. Try a different search.
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template)}
                        className="w-full p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left flex items-center gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.issuer} • {template.benefits.length} benefits •{" "}
                            {template.country === "IN" ? "₹" : "$"}
                            {template.annual_fee.toLocaleString()} annual fee
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-primary">Select →</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            /* Step 2: Customize card */
            <>
              {/* Selected card preview */}
              <div
                className="p-5 rounded-xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}88)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                <div className="relative">
                  <p className="text-white font-bold">{selectedTemplate.name}</p>
                  <p className="text-white/70 text-sm">{selectedTemplate.issuer}</p>
                  <p className="text-white/50 text-xs mt-2">
                    {selectedTemplate.benefits.length} benefits will be imported
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change
                </Button>
              </div>

              {/* Last 4 digits */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last 4 digits (optional)
                </label>
                <Input
                  type="text"
                  placeholder="1234"
                  maxLength={4}
                  value={lastFourDigits}
                  onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ""))}
                  className="bg-secondary border-0 w-32"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium mb-3">Card color</label>
                <div className="flex flex-wrap gap-3">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center ${
                        selectedColor === color.value
                          ? "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {selectedColor === color.value && (
                        <Check className="w-5 h-5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Card"}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardForm;
