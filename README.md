# Anti-Dopamine Food Craving Intercept App

An agentic, behavioral-science-backed web application designed to help users break impulsive food-ordering habits. By intercepting cravings with a realistic "fake delivery" simulation, the app diverts cognitive bandwidth, calms the nervous system, and visualizes immediate financial savings.

---

## 🧠 The Psychological Mechanism
Impulsive food cravings typically last between **10 to 15 minutes**. When a user feels the urge to order fast food, they open this app, browse a massive selection of restaurants, and place a "fake order." 

Instead of spending real money, the cost of the order is redirected to their **Saved Money** balance, and a realistic delivery simulation begins. The app locks them out of browsing and guides them through active cognitive interventions during the critical craving window.

---

## 🚀 Key Features

### 1. Real-Time Geolocation Map Tracker
* **Browser Geolocation Integration**: Requests the user's GPS coordinates to set their real-world location as the "Home" destination.
* **Local Path Calibration**: Automatically places the simulated "Restaurant" at a ~1.5km offset in the user's actual neighborhood, drawing an accurate path and animating a rider moving in real-time on a Leaflet map.
* **Privacy-First Fallback**: If location access is denied, it defaults seamlessly to a Bengaluru city view. Location data is processed entirely client-side and is never stored.

### 2. Cognitive Nudge Engine
* **Contextual Nudges**: Features a database of **50+ behavioral science nudges** categorized by cuisine (Pizza, Burger, Biryani, Sushi, Salad, and General).
* **Smart Rotation**: Alternates between *physiological facts* (how dopamine loops work) and *future-self reinforcement* (financial goals), rotating every 3 minutes (or every 3 seconds in testing Fast Mode).
* **Repeat Prevention**: An algorithm prevents the same nudge from showing twice in a row.
* **Framer Motion Transitions**: Smooth, height-stable text fade transitions (`mode="wait"`) keep the UI premium.

### 3. Active Craving Interventions
* **🧘 Box Breathing Overlay**: A 60-second guided breathing module matching a calming 4-4-4-4 cycle to down-regulate the nervous system.
* **🎮 Focus Challenge (3D-matching)**: A 30-second color-matching grid game designed to occupy the visual cortex and block mental imagery of food.
* **📈 Future Goal Carousel**: A rotating banner showing how saved money maps to long-term goals (e.g., *"₹350 saved = 12% toward your weekend trip"*).

### 4. Constrained Exploration
* **Browse Lockout**: Locks the "Browse" tab during an active simulation to prevent impulsive scrolling.
* **Active Order Mini-Bar**: A floating, interactive tracking pill remains visible at the top of other screens, allowing users to tap and jump straight back to their delivery.

### 5. Premium Layered Dark Palette
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

### Database Generation
The application includes a database of **160 restaurants and 8,000 menu items** across 8 major Indian cities (New Delhi, Gurugram, Noida, Hyderabad, Bengaluru, Pune, Mumbai, Kolkata).

To regenerate or modify this database:
```bash
python generate_restaurants.py
```

### Running the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Build for production:
   ```bash
   npm run build
   ```
