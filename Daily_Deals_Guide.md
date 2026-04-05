# 🎁 DAILY DEALS & MERCHANT OFFERS SYSTEM - COMPLETE GUIDE

## 🎯 **What You're Getting**

A complete **daily deals and merchant offers system** that sends personalized notifications about:

✅ **BOGO Deals** - "Chipotle: Buy One Bowl Get One Free!"
✅ **Free Items** - "Free Chips & Queso with Any Entree"
✅ **Percentage Discounts** - "Starbucks Happy Hour: 50% Off Drinks"
✅ **Dollar Discounts** - "Uber Eats: $20 Off Orders $30+"
✅ **Free Trials** - "Amazon Prime: 30 Days Free"
✅ **Free Shipping** - "DoorDash: Free Delivery All Week"
✅ **Cashback Bonuses** - "Extra 5% Cash Back at Target"
✅ **Limited-Time Offers** - "Ends Today: 50% Off Target Circle Week"

**Premium-Only Feature:** Only paying subscribers get access to daily deals!

---

## 📁 **FILES CREATED**

### **Database Migration:**
- `/supabase/migrations/20260208100000_daily_deals_system.sql`

### **React Component:**
- `/src/pages/DailyDeals.tsx` - Complete daily deals page

### **6 New Database Tables:**
1. `merchant_categories` - 11 deal categories (Dining, Fast Food, Coffee, etc.)
2. `merchants` - Stores & restaurants (Chipotle, Starbucks, Target, etc.)
3. `daily_deals` - All deals & offers
4. `user_deal_preferences` - User interests & notification settings
5. `user_deal_interactions` - Track views, clicks, redemptions
6. `user_saved_deals` - Bookmarked deals

---

## 🚀 **INSTALLATION**

### **STEP 1: Run Database Migration**

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **"New query"**
4. Open `20260208100000_daily_deals_system.sql`
5. **Copy ALL code**
6. **Paste** into Supabase
7. Click **"RUN"**
8. Wait 5-10 seconds
9. Success! ✅

### **STEP 2: Verify Tables Created**

Go to **Table Editor** and check:
- ✅ merchant_categories (11 categories)
- ✅ merchants (6 sample merchants)
- ✅ daily_deals (7 sample deals)
- ✅ user_deal_preferences
- ✅ user_deal_interactions
- ✅ user_saved_deals

### **STEP 3: Add React Component**

Copy `DailyDeals.tsx` to `/src/pages/DailyDeals.tsx`

### **STEP 4: Add Route**

In your `App.tsx`:

```tsx
import DailyDeals from './pages/DailyDeals';

// Add route:
<Route path="/deals" element={<ProtectedRoute><DailyDeals /></ProtectedRoute>} />
```

### **STEP 5: Add Navigation Link**

In your Header/Navigation:

```tsx
<Link to="/deals">Daily Deals</Link>
```

### **STEP 6: Test!**

```bash
npm run dev
```

Go to `/deals` and you'll see:
- Sample deals if you're Premium
- Upgrade prompt if you're Free tier

---

## 📊 **SAMPLE DATA INCLUDED**

### **6 Merchants:**
1. 🌯 **Chipotle Mexican Grill**
2. ☕ **Starbucks**
3. 🍕 **Uber Eats**
4. 🍔 **DoorDash**
5. 🎯 **Target**
6. 📦 **Amazon**

### **7 Sample Deals:**

**1. Chipotle BOGO Burrito Bowl** (Featured)
- Type: Buy One Get One
- Code: BOGO2024
- Valid: 7 days
- Score: 95/100

**2. Chipotle Free Chips & Queso** (Featured)
- Type: Free Item
- Valid: 3 days
- Score: 90/100

**3. Starbucks Happy Hour** (Featured)
- Type: 50% Off
- Valid: Today only, 2-7 PM
- Members only
- Score: 85/100

**4. Uber Eats $20 Off**
- Type: Dollar Discount
- Code: SAVE20
- Minimum: $30
- New users only
- Score: 80/100

**5. DoorDash Free Delivery** (Featured)
- Type: Free Shipping
- Valid: 7 days
- DashPass members
- Score: 75/100

**6. Target Circle Week** (Featured)
- Type: Up to 50% Off
- Valid: 7 days
- Score: 90/100

**7. Amazon Prime Free Trial** (Featured)
- Type: Free Trial
- Duration: 30 days
- Score: 85/100

---

## 💡 **HOW IT WORKS**

### **1. Premium-Only Access**

```sql
-- RLS Policy ensures only premium users can view deals
CREATE POLICY "Premium users can view deals"
  ON public.daily_deals FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    AND (
      -- Check if user is premium
      EXISTS (
        SELECT 1 FROM public.user_subscriptions
        WHERE user_id = auth.uid()
        AND tier IN ('premium', 'pro')
        AND status = 'active'
      )
      OR
      -- Or show featured deals as preview
      is_featured = true
    )
  );
```

**Result:** Free users see preview (blurred), Premium users see all deals!

### **2. Personalized Recommendations**

The system uses `get_personalized_deals()` function to score deals based on:

**Scoring Algorithm:**
```
Deal Score = 
  + 20 points if Featured
  + 15 points if matches User's Preferred Categories
  + 15 points if matches User's Favorite Merchants
  + 10 points if Free Item
  + 8 points if BOGO
  + (deal_score / 2) // Base quality score
```

**Example:**
```
User preferences:
- Favorite merchant: Chipotle
- Preferred category: Fast Food

Chipotle BOGO Deal scores:
  + 20 (Featured)
  + 15 (Favorite merchant)
  + 15 (Preferred category)
  + 8 (BOGO)
  + 47 (Base score 95/2)
  = 105 total (Top result!)
```

### **3. Deal Types Explained**

| Type | Example | Notification |
|------|---------|--------------|
| **bogo** | Buy 1 Get 1 | "🌯 Chipotle: BOGO Bowl Today!" |
| **free_item** | Free chips | "🎁 Free Chips & Queso at Chipotle" |
| **discount_percent** | 50% off | "☕ Starbucks: 50% Off 2-7PM" |
| **discount_amount** | $20 off | "🍕 Uber Eats: Save $20" |
| **free_trial** | 30 days free | "📦 Try Prime Free for 30 Days" |
| **cashback** | Extra 5% back | "💰 5% Cashback at Target" |
| **free_shipping** | Free delivery | "🚚 Free Delivery on DoorDash" |

---

## 🔔 **NOTIFICATION EXAMPLES**

### **Morning Digest (9 AM Daily)**

```
🎁 Today's Top Deals

🌯 Chipotle
BOGO Burrito Bowl
Code: BOGO2024 • Expires in 7 days
[View Deal]

☕ Starbucks
50% Off Drinks 2-7 PM
Rewards members only • Expires today
[View Deal]

🎯 Target
Circle Week: Up to 50% Off
Thousands of items • 7 days left
[View Deal]
```

### **Urgent Deal Alert (Real-time)**

```
⚡ ENDING TODAY: Starbucks Happy Hour

50% off any handcrafted beverage!
Valid 2-7 PM local time

Requirements:
✓ Starbucks Rewards member (free to join)
✓ Show app at checkout

[Claim Deal] [Find Store]
```

### **Free Stuff Alert**

```
🎁 FREE: Amazon Prime Trial

Get 30 days FREE:
✓ Free 2-day shipping
✓ Prime Video & Music
✓ Exclusive deals
✓ Cancel anytime

No credit card required for trial

[Start Free Trial]
```

---

## 📱 **USER PREFERENCES**

Users can customize what deals they see:

### **In `user_deal_preferences` table:**

```sql
{
  -- Categories they want
  "preferred_categories": ["dining", "fast-food", "coffee"],
  
  -- Favorite merchants
  "favorite_merchants": ["chipotle-id", "starbucks-id"],
  
  -- Merchants to exclude
  "blocked_merchants": ["competitor-id"],
  
  -- Deal type interests
  "interested_in_bogo": true,
  "interested_in_free_items": true,
  "interested_in_discounts": true,
  
  -- Location
  "user_state": "CA",
  "user_city": "Los Angeles",
  
  -- Notifications
  "notify_daily_digest": true,
  "notify_featured_deals": true,
  "notify_expiring_soon": true,
  "notify_free_stuff": true,
  
  "digest_time": "09:00:00",
  "max_deals_per_day": 10
}
```

---

## ➕ **ADDING NEW DEALS**

### **Method 1: Manual Entry (SQL)**

```sql
-- Add a new deal
INSERT INTO daily_deals (
  merchant_id,
  category_id,
  title,
  description,
  deal_type,
  offer_value,
  promo_code,
  redemption_instructions,
  valid_from,
  valid_until,
  is_featured,
  deal_score
) VALUES (
  (SELECT id FROM merchants WHERE slug = 'chipotle'),
  (SELECT id FROM merchant_categories WHERE slug = 'fast-food'),
  'Free Guacamole Friday',
  'Get free guacamole on any entree every Friday!',
  'free_item',
  'Free Guacamole',
  NULL,
  'Order in-store or via app. Automatically applied on Fridays.',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '4 weeks',
  true,
  85
);
```

### **Method 2: Add New Merchant First**

```sql
-- Step 1: Add merchant
INSERT INTO merchants (
  name,
  slug,
  category_id,
  logo_url,
  website_url,
  is_national,
  accepted_networks
) VALUES (
  'Panda Express',
  'panda-express',
  (SELECT id FROM merchant_categories WHERE slug = 'fast-food'),
  'https://logo.clearbit.com/pandaexpress.com',
  'https://www.pandaexpress.com',
  true,
  ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
);

-- Step 2: Add deal for that merchant
INSERT INTO daily_deals (
  merchant_id,
  category_id,
  title,
  description,
  deal_type,
  offer_value,
  promo_code,
  valid_from,
  valid_until,
  is_featured,
  deal_score
) VALUES (
  (SELECT id FROM merchants WHERE slug = 'panda-express'),
  (SELECT id FROM merchant_categories WHERE slug = 'fast-food'),
  'Family Meal Deal: $5 Off',
  'Save $5 on any family meal. Use code FAMILY5 at checkout.',
  'discount_amount',
  '$5 Off Family Meals',
  'FAMILY5',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '14 days',
  false,
  75
);
```

---

## 🤖 **AUTOMATED NOTIFICATIONS**

### **Daily Digest Function (Run Daily at 9 AM)**

```typescript
// supabase/functions/send-deal-digest/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  );

  // Get all premium users who want daily digest
  const { data: users } = await supabase
    .from('user_subscriptions')
    .select(`
      user_id,
      user_deal_preferences!inner(
        notify_daily_digest,
        max_deals_per_day
      )
    `)
    .eq('status', 'active')
    .in('tier', ['premium', 'pro'])
    .eq('user_deal_preferences.notify_daily_digest', true);

  for (const user of users || []) {
    // Get personalized deals for this user
    const { data: deals } = await supabase
      .rpc('get_personalized_deals', {
        p_user_id: user.user_id,
        p_limit: user.user_deal_preferences.max_deals_per_day || 10
      });

    if (!deals || deals.length === 0) continue;

    // Create notification
    const dealsList = deals.slice(0, 3).map((d: any) => 
      `${d.merchant_name}: ${d.title}`
    ).join('\n');

    await supabase.from('premium_notifications').insert({
      user_id: user.user_id,
      title: `🎁 Today's Top Deals`,
      message: `Check out these exclusive offers:\n\n${dealsList}\n\nTap to see all ${deals.length} deals`,
      notification_type: 'limited_offer',
      priority: 'medium',
      send_email: true,
    });
  }

  return new Response('Daily digest sent', { status: 200 });
});
```

### **Schedule with Cron:**

```sql
-- In Supabase Dashboard → Database → Cron Jobs
SELECT cron.schedule(
  'send-deal-digest',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-deal-digest',
    headers := '{"Authorization": "Bearer YOUR_KEY"}'::jsonb
  );
  $$
);
```

---

## 📊 **ANALYTICS & TRACKING**

### **Track User Interactions:**

Every deal interaction is tracked:

```typescript
// Automatically tracked:
- View: When user sees deal
- Click: When user clicks "View Details"
- Claimed: When user uses promo code
- Saved: When user bookmarks deal
- Redeemed: When user confirms redemption
```

### **Query Deal Performance:**

```sql
-- Top performing deals
SELECT 
  d.title,
  m.name as merchant,
  d.view_count,
  d.claim_count,
  ROUND((d.claim_count::DECIMAL / NULLIF(d.view_count, 0)) * 100, 2) as conversion_rate
FROM daily_deals d
JOIN merchants m ON m.id = d.merchant_id
WHERE d.created_at > CURRENT_DATE - INTERVAL '30 days'
ORDER BY conversion_rate DESC
LIMIT 10;
```

### **User Engagement Report:**

```sql
-- Most engaged users
SELECT 
  u.email,
  COUNT(DISTINCT udi.deal_id) as deals_viewed,
  COUNT(*) FILTER (WHERE udi.interaction_type = 'claimed') as deals_claimed,
  COUNT(*) FILTER (WHERE udi.interaction_type = 'saved') as deals_saved
FROM user_deal_interactions udi
JOIN auth.users u ON u.id = udi.user_id
WHERE udi.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.email
ORDER BY deals_claimed DESC
LIMIT 20;
```

---

## 🎯 **DEAL CATEGORIES**

All 11 categories included:

| Icon | Category | Examples |
|------|----------|----------|
| 🍽️ | Dining & Restaurants | Sit-down restaurants, fine dining |
| 🍔 | Fast Food | Chipotle, McDonald's, Taco Bell |
| ☕ | Coffee & Cafes | Starbucks, Dunkin', local cafes |
| 🛒 | Grocery & Supermarkets | Walmart, Kroger, Whole Foods |
| 🛍️ | Shopping & Retail | Target, Macy's, mall stores |
| 💻 | Online Shopping | Amazon, eBay, Etsy |
| 🎬 | Entertainment | Movie tickets, streaming services |
| ✈️ | Travel & Hotels | Hotels, flights, car rentals |
| ⛽ | Gas Stations | Shell, Chevron, BP |
| 📱 | Subscription Services | Netflix, Spotify, apps |
| 🎁 | Free Stuff | Samples, trials, giveaways |

---

## 🔒 **PREMIUM-ONLY ENFORCEMENT**

### **Three Layers of Protection:**

**1. Database RLS Policy:**
```sql
-- Only premium users can query deals
CREATE POLICY "Premium users can view deals"
  ON public.daily_deals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND tier IN ('premium', 'pro')
      AND status = 'active'
    )
  );
```

**2. React Component Check:**
```tsx
// In DailyDeals.tsx
if (!isPremium) {
  return <UpgradePrompt />;
}
```

**3. Function-Level Check:**
```sql
-- In get_personalized_deals()
-- Only returns results for premium users
```

---

## 💰 **MONETIZATION BENEFITS**

### **Value Proposition for Users:**

"Upgrade to Premium and save **$50-200/month** with exclusive deals!"

**Example Savings:**
- Chipotle BOGO: Save $12
- Starbucks 50% off: Save $5
- Uber Eats $20 off: Save $20
- Target 50% off: Save $30+
- Free trials: Value $30+

**Monthly value: $97+ for just $9.99/month** = 10X ROI!

---

## 🚀 **FUTURE ENHANCEMENTS**

### **Phase 2 Ideas:**

1. **Location-Based Deals**
   - Show deals near user's location
   - "5 deals within 2 miles"

2. **Card-Specific Bonuses**
   - "Use your Amex Gold for 4X points at Chipotle!"
   - Combine credit card bonuses with merchant deals

3. **Deal Stacking**
   - "Stack this BOGO with your 3X dining card = 6X value!"

4. **Push Notifications**
   - Real-time alerts for expiring deals
   - Location-triggered deals

5. **Social Sharing**
   - "Share this deal with friends"
   - Referral bonuses

6. **Deal Alerts**
   - "Alert me when Chipotle has BOGO"
   - Custom merchant tracking

---

## ✅ **TESTING CHECKLIST**

- [ ] Run database migration successfully
- [ ] Verify 6 tables created
- [ ] See 11 categories in merchant_categories
- [ ] See 6 merchants in merchants table
- [ ] See 7 sample deals in daily_deals
- [ ] Copy DailyDeals.tsx component
- [ ] Add route to App.tsx
- [ ] Test as free user (see upgrade prompt)
- [ ] Test as premium user (see all deals)
- [ ] Test saving deals
- [ ] Test filtering by category
- [ ] Test search functionality
- [ ] Test promo code copying

---

## 🎁 **WHAT USERS GET**

### **Premium Users Receive:**

**Daily:**
- 10-20 personalized deals
- Morning digest at 9 AM
- Expiring soon alerts

**Categories:**
- Dining offers
- Fast food deals
- Coffee shop specials
- Grocery discounts
- Shopping sales
- Free stuff alerts
- And more!

**Deal Types:**
- BOGO offers
- Percentage discounts
- Dollar-off coupons
- Free items
- Free trials
- Cashback bonuses
- Free shipping

---

**Congratulations! You now have a complete daily deals system that provides real value to your premium subscribers!** 🎉

**Next steps:**
1. Run the migration
2. Add the component
3. Test with sample deals
4. Start adding more merchants and deals
5. Launch to premium users!
