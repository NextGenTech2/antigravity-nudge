import { useAppStore } from '../store/useAppStore';

// Simple string hashing function to generate a consistent seed for Pollinations AI
const getSeedFromId = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 100000;
};

// High-quality Unsplash fallback images mapped to keywords
const FALLBACK_IMAGES: Record<string, string | string[]> = {
  'double-cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
  'truffle-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
  'fried-chicken-sandwich': 'https://images.unsplash.com/photo-1627662236973-4f825912447a?w=500&auto=format&fit=crop&q=60',
  'salmon-nigiri': 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&auto=format&fit=crop&q=60',
  'spicy-tuna-roll': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60',
  'tonkotsu-ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60',
  'margherita-pizza': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop&q=60',
  'mushroom-pasta': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=60',
  'quinoa-salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
  'salmon-poke-bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
  'acai-smoothie': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=60',
  'mutton-biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
  'butter-chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60',
  'phirni': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60',
  'sushi-platter': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60',
  'woodfired-pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
  
  // Cuisine direct mapping pools for variety
  'biryani': [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  ],
  'curry': [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=60'
  ],
  'dosa': [
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60'
  ],
  'burger': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&auto=format&fit=crop&q=60'
  ],
  'pizza': [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop&q=60'
  ],
  'noodles': [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1612966608997-300e801c312f?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60'
  ],
  'sushi': [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&auto=format&fit=crop&q=60'
  ],
  'salad': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&auto=format&fit=crop&q=60'
  ],
  'beverage': [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=60'
  ],
  'sides': [
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=500&auto=format&fit=crop&q=60'
  ],
  'dessert': [
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60'
  ]
};

// Local cache for generated DALL-E images to avoid redundant API calls and costs
const dalleCache: Record<string, { url: string; timestamp: number }> = {};
const CACHE_EXPIRY = 50 * 60 * 1000; // DALL-E URLs expire in 60 mins, cache for 50 mins

export const imageGenerator = {
  /**
   * Generates a food image URL.
   * If an OpenAI API key is present, it will attempt to fetch from DALL-E 3 (with caching).
   * Otherwise, it returns a Pollinations.ai URL which generates the image dynamically on the fly.
   */
  getMenuItemImage: async (itemId: string, itemName: string, restaurantName: string): Promise<string> => {
    const { settings } = useAppStore.getState();
    const promptText = `Gourmet professional food photography of ${itemName} from ${restaurantName}, exquisite plating, macro shot, warm cinematic lighting, soft bokeh, 4k, delicious appetizing food styling`;
    
    // 1. If OpenAI Key is available, use DALL-E 3
    if (settings.openaiApiKey && settings.openaiApiKey.trim() !== '') {
      const cacheKey = `dalle_${itemId}`;
      const cached = dalleCache[cacheKey];
      
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        return cached.url;
      }
      
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: promptText,
            n: 1,
            size: '1024x1024', // DALL-E 3 only supports 1024x1024 or larger
            quality: 'standard',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const url = data.data[0].url;
          dalleCache[cacheKey] = { url, timestamp: Date.now() };
          return url;
        } else {
          console.warn('OpenAI DALL-E 3 API failed, falling back to Pollinations AI');
        }
      } catch (error) {
        console.error('Error calling DALL-E 3, falling back to Pollinations AI:', error);
      }
    }

    // 2. Fallback / Default: Pollinations.ai (Stable Diffusion)
    // We add a unique seed per item so the image is stable and consistent for that item
    const seed = getSeedFromId(itemId);
    const encodedPrompt = encodeURIComponent(promptText);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true&seed=${seed}`;
  },

  /**
   * Generates a header image URL for a restaurant.
   */
  getRestaurantHeaderImage: (restaurantId: string, _restaurantName: string, cuisine: string): string => {
    const promptText = `Modern cozy restaurant facade interior, aesthetic decoration, warm lighting, architectural digest, ${cuisine} restaurant, professional photography`;
    const seed = getSeedFromId(restaurantId);
    const encodedPrompt = encodeURIComponent(promptText);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=500&nologo=true&seed=${seed}`;
  },

  /**
   * Retrieves a high-quality static Unsplash fallback image if the AI generator is slow or fails.
   */
  getFallbackImage: (keyword: string, id?: string): string => {
    const cleanKeyword = keyword.toLowerCase();
    
    // 1. Try exact match first
    let val = FALLBACK_IMAGES[cleanKeyword];
    
    // 2. Fuzzy match group fallback
    if (!val) {
      if (cleanKeyword.includes('burger')) {
        val = FALLBACK_IMAGES['burger'];
      } else if (cleanKeyword.includes('pizza')) {
        val = FALLBACK_IMAGES['pizza'];
      } else if (cleanKeyword.includes('biryani') || cleanKeyword.includes('rice')) {
        val = FALLBACK_IMAGES['biryani'];
      } else if (
        cleanKeyword.includes('curry') || 
        cleanKeyword.includes('masala') || 
        cleanKeyword.includes('paneer') || 
        cleanKeyword.includes('dal') || 
        cleanKeyword.includes('tikka') || 
        cleanKeyword.includes('kebab') || 
        cleanKeyword.includes('naan') || 
        cleanKeyword.includes('roti') || 
        cleanKeyword.includes('chole') || 
        cleanKeyword.includes('veg')
      ) {
        val = FALLBACK_IMAGES['curry'];
      } else if (
        cleanKeyword.includes('dosa') || 
        cleanKeyword.includes('idli') || 
        cleanKeyword.includes('vada') || 
        cleanKeyword.includes('uttapam') || 
        cleanKeyword.includes('pongal')
      ) {
        val = FALLBACK_IMAGES['dosa'];
      } else if (
        cleanKeyword.includes('noodle') || 
        cleanKeyword.includes('spring') || 
        cleanKeyword.includes('manchurian') || 
        cleanKeyword.includes('dim sum') || 
        cleanKeyword.includes('soup') || 
        cleanKeyword.includes('chow')
      ) {
        val = FALLBACK_IMAGES['noodles'];
      } else if (
        cleanKeyword.includes('sushi') || 
        cleanKeyword.includes('roll') || 
        cleanKeyword.includes('sashimi') || 
        cleanKeyword.includes('nigiri') || 
        cleanKeyword.includes('tempura') || 
        cleanKeyword.includes('udon') || 
        cleanKeyword.includes('katsu')
      ) {
        val = FALLBACK_IMAGES['sushi'];
      } else if (
        cleanKeyword.includes('salad') || 
        cleanKeyword.includes('bowl') || 
        cleanKeyword.includes('toast') || 
        cleanKeyword.includes('hummus')
      ) {
        val = FALLBACK_IMAGES['salad'];
      } else if (
        cleanKeyword.includes('fries') || 
        cleanKeyword.includes('nuggets') || 
        cleanKeyword.includes('rings') || 
        cleanKeyword.includes('sticks') || 
        cleanKeyword.includes('wedges') || 
        cleanKeyword.includes('wings') || 
        cleanKeyword.includes('lollipop')
      ) {
        val = FALLBACK_IMAGES['sides'];
      } else if (
        cleanKeyword.includes('shake') || 
        cleanKeyword.includes('smoothie') || 
        cleanKeyword.includes('lassi') || 
        cleanKeyword.includes('coffee') || 
        cleanKeyword.includes('tea') || 
        cleanKeyword.includes('soda') || 
        cleanKeyword.includes('cola') || 
        cleanKeyword.includes('mojito') || 
        cleanKeyword.includes('juice') || 
        cleanKeyword.includes('water')
      ) {
        val = FALLBACK_IMAGES['beverage'];
      } else if (
        cleanKeyword.includes('cake') || 
        cleanKeyword.includes('brownie') || 
        cleanKeyword.includes('jamun') || 
        cleanKeyword.includes('phirni') || 
        cleanKeyword.includes('dessert') || 
        cleanKeyword.includes('sweet') || 
        cleanKeyword.includes('tiramisu')
      ) {
        val = FALLBACK_IMAGES['dessert'];
      }
    }
    
    if (!val) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60';
    }
    
    if (Array.isArray(val)) {
      if (id) {
        const seed = getSeedFromId(id);
        return val[seed % val.length];
      }
      return val[0];
    }
    return val;
  }
};
