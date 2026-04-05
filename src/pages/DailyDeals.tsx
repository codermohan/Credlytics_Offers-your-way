import { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Tag,
  TrendingUp,
  Star,
  Bookmark,
  ExternalLink,
  Search,
  Clock,
  Percent,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Deal {
  id: string;
  merchant_name: string;
  merchant_logo: string;
  category_name: string;
  title: string;
  description: string;
  deal_type: string;
  offer_value: string;
  promo_code: string | null;
  redemption_instructions: string;
  valid_until: string | null;
  expires_at: string | null;
  is_featured: boolean;
  deal_score: number;
  relevance_score?: number;
  is_saved?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface PersonalizedDealRow {
  deal_id: string;
  merchant_name: string;
  merchant_logo: string;
  category_name: string;
  title: string;
  description: string;
  deal_type: string;
  offer_value: string;
  promo_code: string | null;
  redemption_instructions: string;
  valid_until: string | null;
  expires_at: string | null;
  is_featured: boolean;
  deal_score: number;
  relevance_score?: number;
}

const DEAL_TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  bogo: { icon: Gift, color: 'from-pink-600 to-rose-600', label: 'BOGO' },
  discount_percent: { icon: Percent, color: 'from-purple-600 to-blue-600', label: 'Discount' },
  discount_amount: { icon: Tag, color: 'from-green-600 to-emerald-600', label: 'Save $$' },
  free_item: { icon: Gift, color: 'from-yellow-600 to-orange-600', label: 'Free Item' },
  free_trial: { icon: Sparkles, color: 'from-cyan-600 to-blue-600', label: 'Free Trial' },
  bonus_points: { icon: TrendingUp, color: 'from-indigo-600 to-purple-600', label: 'Bonus' },
  cashback: { icon: TrendingUp, color: 'from-green-600 to-teal-600', label: 'Cashback' },
  free_shipping: { icon: ShoppingBag, color: 'from-blue-600 to-cyan-600', label: 'Free Ship' },
};

export default function DailyDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkSubscription();
    fetchCategories();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, status, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      const premium = data?.tier && ['premium', 'pro'].includes(data.tier) && 
                     data.status === 'active' &&
                     (!data.expires_at || new Date(data.expires_at) > new Date());

      setIsPremium(premium);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('merchant_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);

      if (!isPremium) {
        setDeals([]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get personalized deals
      const { data: personalizedDeals, error: dealsError } = await supabase
        .rpc('get_personalized_deals', {
          p_user_id: user.id,
          p_limit: 50
        });

      if (dealsError) throw dealsError;

      // Get saved deals
      const { data: savedDeals, error: savedError } = await supabase
        .from('user_saved_deals')
        .select('deal_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      const savedDealIds = new Set(savedDeals?.map(d => d.deal_id) || []);

      // Format deals
      const typedDeals: PersonalizedDealRow[] = (personalizedDeals || []) as PersonalizedDealRow[];

      let formattedDeals: Deal[] = typedDeals.map((deal) => ({
        ...deal,
        is_saved: savedDealIds.has(deal.deal_id),
        id: deal.deal_id,
      }));

      // Apply filters
      if (selectedCategory) {
        formattedDeals = formattedDeals.filter((d) =>
          d.category_name === categories.find(c => c.id === selectedCategory)?.name
        );
      }

      if (showOnlyFeatured) {
        formattedDeals = formattedDeals.filter((d) => d.is_featured);
      }

      if (showOnlySaved) {
        formattedDeals = formattedDeals.filter((d) => d.is_saved);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        formattedDeals = formattedDeals.filter((d) =>
          d.title.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.merchant_name.toLowerCase().includes(query)
        );
      }

      setDeals(formattedDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, [isPremium, selectedCategory, showOnlyFeatured, showOnlySaved, searchQuery, categories]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const toggleSaveDeal = async (dealId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;

      if (deal.is_saved) {
        // Unsave
        const { error } = await supabase
          .from('user_saved_deals')
          .delete()
          .eq('user_id', user.id)
          .eq('deal_id', dealId);

        if (error) throw error;

        toast.success('Deal removed from saved');
      } else {
        // Save
        const { error } = await supabase
          .from('user_saved_deals')
          .insert({
            user_id: user.id,
            deal_id: dealId,
          });

        if (error) throw error;

        toast.success('Deal saved!');
      }

      // Update local state
      setDeals(prev =>
        prev.map(d => d.id === dealId ? { ...d, is_saved: !d.is_saved } : d)
      );
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save deal');
    }
  };

  const trackInteraction = async (dealId: string, type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('track_deal_interaction', {
        p_user_id: user.id,
        p_deal_id: dealId,
        p_interaction_type: type
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleDealClick = (deal: Deal) => {
    trackInteraction(deal.id, 'clicked');
    if (deal.redemption_instructions) {
      // Show redemption modal or redirect
      toast.success('Opening deal details...');
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Gift className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Daily Deals & Offers</h1>
            <p className="text-xl text-slate-400 mb-8">
              Get exclusive access to daily deals, BOGO offers, and free stuff!
            </p>
            
            {/* Preview deals */}
            <div className="mb-8 space-y-4 max-w-2xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                  <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6 blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900/90 backdrop-blur-sm border border-purple-500/50 rounded-lg px-6 py-3">
                      <p className="text-purple-300 font-medium">Premium Only</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/profile"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-lg font-medium transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Premium
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Today's Deals
              </h1>
              <p className="text-slate-400">
                {deals.length} exclusive offers available near you
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  showOnlyFeatured
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                Featured
              </button>
              <button
                onClick={() => setShowOnlySaved(!showOnlySaved)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  showOnlySaved
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals, merchants, or categories..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              All Deals
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Loading today's best deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700">
            <Gift className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No deals found</h3>
            <p className="text-slate-500">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => {
              const dealTypeConfig = DEAL_TYPE_CONFIG[deal.deal_type] || DEAL_TYPE_CONFIG.discount_percent;
              const DealIcon = dealTypeConfig.icon;

              const daysUntilExpiry = deal.valid_until 
                ? Math.ceil((new Date(deal.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={deal.id}
                  className={`group relative rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                    deal.is_featured
                      ? 'bg-gradient-to-br from-yellow-900/20 via-slate-800/60 to-orange-900/20 border-yellow-500/30'
                      : 'bg-slate-800/40 backdrop-blur-sm border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => handleDealClick(deal)}
                >
                  {/* Featured Badge */}
                  {deal.is_featured && (
                    <div className="absolute -top-3 left-4 z-10">
                      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveDeal(deal.id);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800 transition-all"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        deal.is_saved ? 'fill-purple-500 text-purple-500' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  <div className="p-6">
                    {/* Merchant */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${dealTypeConfig.color} flex items-center justify-center`}>
                        <DealIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{deal.merchant_name}</h3>
                        <p className="text-sm text-slate-400">{deal.category_name}</p>
                      </div>
                    </div>

                    {/* Offer */}
                    <div className="mb-4">
                      <h4 className="text-lg font-bold mb-2">{deal.title}</h4>
                      <p className="text-slate-400 text-sm line-clamp-2">{deal.description}</p>
                    </div>

                    {/* Value Badge */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${dealTypeConfig.color} rounded-lg text-sm font-semibold`}>
                        <Tag className="w-4 h-4" />
                        {deal.offer_value}
                      </div>
                    </div>

                    {/* Promo Code */}
                    {deal.promo_code && (
                      <div className="mb-4 p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Promo Code:</p>
                        <div className="flex items-center justify-between">
                          <code className="text-lg font-mono font-bold text-green-400">
                            {deal.promo_code}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(deal.promo_code!);
                              toast.success('Code copied!');
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                      {daysUntilExpiry !== null && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-4 h-4" />
                          {daysUntilExpiry === 0 ? (
                            <span className="text-orange-400">Expires today!</span>
                          ) : daysUntilExpiry === 1 ? (
                            <span className="text-yellow-400">Expires tomorrow</span>
                          ) : (
                            <span>{daysUntilExpiry} days left</span>
                          )}
                        </div>
                      )}
                      <button className="ml-auto flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-all">
                        View Details
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
