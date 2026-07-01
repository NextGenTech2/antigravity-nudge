# Anti-Dopamine Food Craving Intercept App

An agentic, behavioral-science-backed web application designed to help users break impulsive food-ordering habits. By intercepting cravings with a realistic "fake delivery" simulation, the app diverts cognitive bandwidth, calms the nervous system, and visualizes immediate financial savings.

---

## 🧠 The Psychological Mechanism
Impulsive food cravings typically last between **10 to 15 minutes**. When a user feels the urge to order fast food, they open this app, browse a massive selection of restaurants, and place a "fake order." 

Instead of spending real money, the cost of the order is redirected to their **Saved Money** balance, and a realistic delivery simulation begins. The app locks them out of browsing and guides them through active cognitive interventions during the critical craving window.

---

## 🚀 Key Features

### 1. Multi-Currency Global Readiness & Geolocation
* **Segmented Currency Selector**: Instantly switch between Indian Rupees (₹), US Dollars ($), and British Pounds (£). Changing currency dynamically scales gamification calculations (such as level-up thresholds, milestone targets, opportunity cost ledgers, and dopamine slider scales).
* **Automated Defaults & Custom Mapping**: Selecting a currency automatically links to a default simulation city (New York for USD, London for GBP, Bengaluru for INR). Users can override defaults by choosing from a list of 11 preset global cities or inputting custom parameters.
* **OSM Nominatim Geolocation Auto-Detection**: Geocodes the device using the browser GPS API and reverse-geocodes it via OpenStreetMap's Nominatim API to extract your exact city name and map a real 1.5km delivery path from your actual neighborhood coordinates on a Leaflet map.

### 2. Flat Search & Cravings Feed
* **Search-to-Action Minimization**: Typing a query (e.g., "burger" or "pizza") or tapping a Category Pill (like Burgers, Pizza, Desserts, Munchies, Sushi, Indian, Healthy) instantly renders a direct feed of matching food items rather than forcing the user to navigate through restaurant directories first.
* **Inline Cart Controls & Quantities**: Add items, increase quantities, or remove them directly from the search feed via haptic-responsive buttons (`+ Add` or `- 1 +`). The app handles parent restaurant assignment dynamically under the hood, reducing checkout friction.
* **Singular/Plural Query Stemming**: An integrated query parser extracts root words (e.g., searching for "burgers" automatically searches for "burger" and vice-versa) to prevent singular/plural mismatches from blocking matches.

### 3. Localized Fast Food Chains
* **Localized Cravings Mappings**: Virtual restaurants in the India menu map directly to national comfort food giants (Domino's Pizza, McDonald's & KFC, Baskin Robbins & Naturals, Theobroma & Monginis, Haldiram's & Faasos, and Sushi Junction) and feature local staples like the McAloo Tikki, Spicy Chicken Zinger, and Faasos rolls.
* **Western Counterparts**: In USD and GBP locales, menus automatically adjust to American or British equivalents (like Dairy Queen, Ben & Jerry's, Cinnabon, Greggs, Sushirrito, and Wasabi) to evoke the exact anticipatory dopamine spikes that trigger food app orders.

### 4. Cognitive Nudge Engine
* **Contextual Nudges**: Features a database of behavioral science nudges categorized by cuisine (Pizza, Burger, Biryani, Sushi, Salad, and General).
* **Smart Rotation**: Alternates between *physiological facts* (how dopamine loops work) and *future-self reinforcement* (financial goals), rotating every 3 minutes (or every 3 seconds in Fast Mode).
* **Repeat Prevention**: An algorithm prevents the same nudge from showing twice in a row.
* **Framer Motion Transitions**: Smooth, height-stable text fade transitions (`mode="wait"`) keep the UI premium.

### 5. Active Craving Interventions
* **🧘 Box Breathing Overlay**: A 60-second guided breathing module matching a calming 4-4-4-4 cycle to down-regulate the nervous system.
* **🎮 Focus Challenge (3D-matching)**: A 30-second color-matching grid game designed to occupy the visual cortex and block mental imagery of food.
* **📈 Future Goal Carousel**: A rotating banner showing how saved money maps to long-term goals (e.g., *"₹350 saved = 12% toward your weekend trip"*).

### 6. Constrained Exploration
* **Browse Lockout**: Locks the "Browse" tab during an active simulation to prevent impulsive scrolling.
* **Active Order Mini-Bar**: A floating, interactive tracking pill remains visible at the top of other screens, allowing users to tap and jump straight back to their delivery.

### 7. Premium Layered Dark Palette
* **Aesthetic Depth**: Swapped flat blacks for a deep charcoal-to-navy gradient (`#0B0E14` to `#161B22`).
* **Elevated Cards**: Cards use a solid `#1C212E` background with custom `shadow-card-elevation` drop shadows.
* **Un-Filtered Food Photography**: Removed aggressive black overlays on food photos, replacing them with subtle, bottom-anchored fades to let the imagery feel tactile.
* **Seed-Based Image Variety**: Fallback images are selected from pools of high-quality Unsplash URLs using a hash of the restaurant or item ID, ensuring no duplicate images across restaurants of the same cuisine.

---

## 🛠️ Technology Stack
* **Frontend**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion
* **Maps**: Leaflet & React Leaflet
* **State Management**: Zustand
* **Icons**: Lucide React

---

## 💻 Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/NextGenTech2/antigravity-nudge.git
   cd anti-dopamine
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Localized Menu Databases
The application utilizes localized menu databases for different currency segments:
* **menu_in.json**: Contains Indian market giants (Domino's, McDonald's & KFC, Baskin Robbins, Haldiram's & Faasos, Sushi Junction) and localized delicacies.
* **menu_us.json**: Map to American counterparts (Domino's, McDonald's & Chick-fil-A, Baskin-Robbins & Ben & Jerry's, Cheesecake Factory, Taco Bell, Sushirrito).
* **menu_uk.json**: Maps to British counterparts (Domino's, McDonald's & Nando's, Dairy Queen, Greggs, Taco Bell, Wasabi Sushi).

### Running the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Build for production:
   ```bash
   npm run build
   ```
