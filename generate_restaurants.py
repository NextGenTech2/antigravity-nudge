import json
import random

CITIES = ["New Delhi", "Gurugram", "Noida", "Hyderabad", "Bengaluru", "Pune", "Mumbai", "Kolkata"]

CUISINES_POOL = [
    {"name": "Biryani, North Indian", "category_match": "biryani", "image_keyword": "biryani"},
    {"name": "North Indian, Mughlai", "category_match": "north_indian", "image_keyword": "curry"},
    {"name": "South Indian, Healthy", "category_match": "south_indian", "image_keyword": "dosa"},
    {"name": "Burgers, Fast Food, American", "category_match": "burger", "image_keyword": "burger"},
    {"name": "Pizza, Fast Food, Italian", "category_match": "pizza", "image_keyword": "pizza"},
    {"name": "Chinese, Asian, Noodles", "category_match": "chinese", "image_keyword": "noodles"},
    {"name": "Sushi, Japanese, Pan-Asian", "category_match": "sushi", "image_keyword": "sushi"},
    {"name": "Healthy Salad, Continental", "category_match": "salad", "image_keyword": "salad"}
]

RESTAURANT_PREFIXES = [
    "The Grand", "Royal", "Capital", "Spicy", "Delhi", "Mumbai", "Hyderabad", "Bengaluru", 
    "Golden", "Flavors of", "Urban", "Gourmet", "Signature", "The Daily", "Hungry", "Classic", 
    "Desi", "Ancient", "Modern", "Midnight", "Punjabi", "Saffron", "Tandoori", "Empire"
]

RESTAURANT_SUFFIXES = {
    "Biryani, North Indian": ["Biryani House", "Darbar", "Palace", "Kitchen", "Tandoor", "Dhaba"],
    "North Indian, Mughlai": ["Rasoi", "Diner", "Treat", "Dhaba", "Clove", "Court", "Chulha"],
    "South Indian, Healthy": ["Cafe", "Bhavan", "Vilas", "Express", "Udupi", "Junction"],
    "Burgers, Fast Food, American": ["Burgers", "Bistro", "Grill", "Joint", "Shack", "Spot"],
    "Pizza, Fast Food, Italian": ["Pizzeria", "Trattoria", "Oven", "Slice", "Woodfire", "Crust"],
    "Chinese, Asian, Noodles": ["Wok", "Panda", "Bowl", "Wall", "House", "Garden", "Canton"],
    "Sushi, Japanese, Pan-Asian": ["Zen Sushi", "Tokyo Dine", "Maki", "Ninja", "Asian Hub"],
    "Healthy Salad, Continental": ["Salad Co.", "Green Bistro", "Organic Bowl", "Freshery", "Leafy"]
}

# Extensive Menu Item Pool (65 unique items to select 50 from per restaurant)
MENU_ITEMS_POOL = [
    # Starters (Veg)
    {"name": "Paneer Tikka Angare", "price_min": 240, "price_max": 320, "desc": "Cottage cheese cubes marinated in spicy yogurt and grilled in tandoor.", "image_keyword": "paneer tikka"},
    {"name": "Hara Bhara Kabab", "price_min": 180, "price_max": 240, "desc": "Crispy spinach, green peas, and potato patties spiced with herbs.", "image_keyword": "hara bhara kabab"},
    {"name": "Veg Spring Rolls", "price_min": 160, "price_max": 220, "desc": "Crispy wrappers filled with stir-fried vegetables, served with sweet chili sauce.", "image_keyword": "spring rolls"},
    {"name": "Chilli Paneer Dry", "price_min": 220, "price_max": 300, "desc": "Wok-tossed cottage cheese with bell peppers, onions, and spicy soy sauce.", "image_keyword": "chilli paneer"},
    {"name": "Crispy Corn Pepper Salt", "price_min": 180, "price_max": 240, "desc": "Deep-fried sweet corn kernels tossed with onions, garlic, and crushed pepper.", "image_keyword": "crispy corn"},
    {"name": "Dahi Ke Kebab", "price_min": 220, "price_max": 280, "desc": "Soft, melt-in-mouth kebabs made of hung curd and mild spices.", "image_keyword": "dahi kebab"},
    
    # Starters (Non-Veg)
    {"name": "Tandoori Chicken Tikka", "price_min": 280, "price_max": 360, "desc": "Boneless chicken chunks marinated in tandoori spices and charred in clay oven.", "image_keyword": "chicken tikka"},
    {"name": "Chicken Seekh Kabab", "price_min": 260, "price_max": 340, "desc": "Minced chicken skewers flavored with garlic, coriander, and warm spices.", "image_keyword": "chicken seekh kebab"},
    {"name": "Chilli Chicken Dry", "price_min": 280, "price_max": 350, "desc": "Classic Indo-Chinese crispy chicken tossed with green chilies and soy sauce.", "image_keyword": "chilli chicken"},
    {"name": "Chicken Lollipop", "price_min": 240, "price_max": 320, "desc": "Flipped chicken wings fried to crisp perfection, served with schezwan dip.", "image_keyword": "chicken lollipop"},
    {"name": "Fish Amritsari Fry", "price_min": 320, "price_max": 420, "desc": "Gram-flour battered crispy fried fish fillets flavored with carom seeds.", "image_keyword": "fried fish"},
    
    # Mains (Veg)
    {"name": "Paneer Butter Masala", "price_min": 260, "price_max": 340, "desc": "Rich cottage cheese in a creamy, sweet, and lightly spiced tomato-butter gravy.", "image_keyword": "paneer butter masala"},
    {"name": "Dal Makhani", "price_min": 220, "price_max": 300, "desc": "Slow-cooked black lentils and kidney beans topped with fresh cream and butter.", "image_keyword": "dal makhani"},
    {"name": "Kadai Paneer", "price_min": 250, "price_max": 330, "desc": "Cottage cheese cooked with freshly ground spices and bell peppers in a tomato gravy.", "image_keyword": "kadai paneer"},
    {"name": "Mix Vegetable Curry", "price_min": 190, "price_max": 260, "desc": "Assorted fresh seasonal vegetables cooked in a semi-dry onion-tomato gravy.", "image_keyword": "mix veg"},
    {"name": "Pindi Chole", "price_min": 180, "price_max": 240, "desc": "Tangy and spicy chickpeas cooked in authentic Punjabi spices.", "image_keyword": "chole"},
    {"name": "Malai Kofta", "price_min": 280, "price_max": 360, "desc": "Paneer and potato dumplings in a rich, sweet, cashew-based white gravy.", "image_keyword": "malai kofta"},
    {"name": "Aloo Gobhi Adraki", "price_min": 170, "price_max": 230, "desc": "Dry preparation of potatoes and cauliflower florets flavored with julienned ginger.", "image_keyword": "aloo gobhi"},
    {"name": "Yellow Dal Tadka", "price_min": 160, "price_max": 220, "desc": "Tempered yellow lentils cooked with cumin, garlic, tomatoes, and green chilies.", "image_keyword": "dal tadka"},
    
    # Mains (Non-Veg)
    {"name": "Butter Chicken Boneless", "price_min": 320, "price_max": 420, "desc": "Tandoori chicken pieces cooked in a velvety, buttery tomato gravy with cream.", "image_keyword": "butter-chicken"},
    {"name": "Chicken Tikka Masala", "price_min": 310, "price_max": 390, "desc": "Grilled chicken chunks in a spicy, thick onion-tomato gravy with bell peppers.", "image_keyword": "chicken tikka masala"},
    {"name": "Mutton Rogan Josh", "price_min": 450, "price_max": 580, "desc": "Tender mutton pieces slow-cooked in a rich Kashmiri red chili and yogurt gravy.", "image_keyword": "mutton curry"},
    {"name": "Kadai Chicken", "price_min": 300, "price_max": 380, "desc": "Chicken cooked with capsicum, onions, and freshly ground whole kadai spices.", "image_keyword": "kadai chicken"},
    {"name": "Egg Curry Masala", "price_min": 190, "price_max": 260, "desc": "Boiled eggs cooked in a spicy onion-tomato gravy with fresh coriander.", "image_keyword": "egg curry"},
    
    # Biryani & Rice
    {"name": "Lucknowi Chicken Biryani", "price_min": 290, "price_max": 380, "desc": "Fragrant long-grain basmati rice layered with juicy chicken, cooked dum-style.", "image_keyword": "chicken biryani"},
    {"name": "Kolkata Mutton Biryani", "price_min": 380, "price_max": 490, "desc": "Classic Kolkata-style dum biryani cooked with tender mutton, egg, and a spiced potato.", "image_keyword": "mutton-biryani"},
    {"name": "Hyderabadi Veg Biryani", "price_min": 220, "price_max": 300, "desc": "Spicy vegetable and paneer layer biryani served with salan and raita.", "image_keyword": "veg biryani"},
    {"name": "Jeera Rice", "price_min": 120, "price_max": 160, "desc": "Steamed basmati rice tempered with ghee and aromatic cumin seeds.", "image_keyword": "jeera rice"},
    {"name": "Steamed Basmati Rice", "price_min": 100, "price_max": 140, "desc": "Fluffy, high-quality steamed long-grain basmati rice.", "image_keyword": "rice"},
    {"name": "Egg Dum Biryani", "price_min": 240, "price_max": 310, "desc": "Hard-boiled eggs cooked with spiced rice, saffron, and caramelized onions.", "image_keyword": "egg biryani"},
    
    # Breads
    {"name": "Tandoori Roti Plain", "price_min": 25, "price_max": 35, "desc": "Whole wheat flatbread baked in a traditional clay tandoor.", "image_keyword": "roti"},
    {"name": "Butter Naan", "price_min": 55, "price_max": 75, "desc": "Soft, leavened clay-oven bread brushed with melted butter.", "image_keyword": "butter naan"},
    {"name": "Garlic Naan", "price_min": 65, "price_max": 85, "desc": "Leavened flatbread topped with minced garlic, coriander, and butter.", "image_keyword": "garlic naan"},
    {"name": "Lachha Paratha", "price_min": 45, "price_max": 65, "desc": "Multi-layered flaky whole wheat bread baked in tandoor.", "image_keyword": "paratha"},
    {"name": "Rumali Roti", "price_min": 35, "price_max": 50, "desc": "Extremely thin and soft wheat flatbread folded like a handkerchief.", "image_keyword": "rumali roti"},
    
    # Fast Food & Pizzas
    {"name": "Margherita Pizza", "price_min": 240, "price_max": 320, "desc": "Simple classic topped with tomato sauce, fresh mozzarella, and basil leaves.", "image_keyword": "margherita-pizza"},
    {"name": "Veggie Supreme Pizza", "price_min": 290, "price_max": 380, "desc": "Loaded with bell peppers, onions, tomatoes, sweet corn, and black olives.", "image_keyword": "woodfired-pizza"},
    {"name": "Chicken Tikka Pizza", "price_min": 340, "price_max": 450, "desc": "Spiced chicken tikka chunks, red onions, green chilies, and fresh mozzarella.", "image_keyword": "chicken pizza"},
    {"name": "Classic Veg Burger", "price_min": 99, "price_max": 149, "desc": "Crispy vegetable patty with lettuce, tomatoes, and mayo in a soft bun.", "image_keyword": "veg burger"},
    {"name": "Double Cheeseburger", "price_min": 189, "price_max": 259, "desc": "Juicy flame-grilled beef patty topped with double melted cheddar cheese, pickles, and mustard on a toasted bun.", "image_keyword": "double-cheeseburger"},
    {"name": "Crispy Chicken Burger", "price_min": 169, "price_max": 249, "desc": "Crumb-fried chicken breast fillet topped with lettuce and creamy garlic mayo.", "image_keyword": "chicken burger"},
    {"name": "French Fries Classic", "price_min": 90, "price_max": 130, "desc": "Golden, salted potato fries served crispy with tomato ketchup.", "image_keyword": "french fries"},
    {"name": "Peri Peri French Fries", "price_min": 110, "price_max": 150, "desc": "Crispy potato fries tossed in hot and tangy peri peri seasoning.", "image_keyword": "fries"},
    
    # Chinese & Noodles
    {"name": "Veg Hakka Noodles", "price_min": 160, "price_max": 220, "desc": "Stir-fried noodles with julienned vegetables in light soy sauce.", "image_keyword": "hakka noodles"},
    {"name": "Chicken Hakka Noodles", "price_min": 200, "price_max": 270, "desc": "Stir-fried noodles with egg, chicken shreds, and mixed vegetables.", "image_keyword": "chicken noodles"},
    {"name": "Veg Fried Rice", "price_min": 150, "price_max": 210, "desc": "Aromatic jasmine rice tossed with finely chopped vegetables and soy sauce.", "image_keyword": "fried rice"},
    {"name": "Chicken Fried Rice", "price_min": 190, "price_max": 260, "desc": "Wok-tossed rice with scrambled egg, chicken pieces, and scallions.", "image_keyword": "chicken fried rice"},
    {"name": "Veg Manchurian Gravy", "price_min": 180, "price_max": 240, "desc": "Deep-fried vegetable dumplings in a sweet, sour, and spicy dark soy gravy.", "image_keyword": "manchurian"},
    
    # South Indian
    {"name": "Masala Dosa Classic", "price_min": 110, "price_max": 160, "desc": "Crispy rice crepe stuffed with spiced potato mash, served with sambar and chutney.", "image_keyword": "masala dosa"},
    {"name": "Idli Sambar (2 Pcs)", "price_min": 60, "price_max": 90, "desc": "Soft steamed rice cakes served with hot lentil sambar and coconut chutney.", "image_keyword": "idli sambar"},
    {"name": "Medu Vada (2 Pcs)", "price_min": 80, "price_max": 110, "desc": "Crispy, savory fried lentil donuts served with sambar and coconut dip.", "image_keyword": "vada"},
    {"name": "Rava Onion Dosa", "price_min": 130, "price_max": 180, "desc": "Crisp semolina crepe flavored with chopped onions and green chilies.", "image_keyword": "rava dosa"},
    
    # Salads & Sushi
    {"name": "Caesar Salad Veg", "price_min": 190, "price_max": 260, "desc": "Crisp romaine lettuce tossed in creamy Caesar dressing with croutons and parmesan.", "image_keyword": "healthy-salad"},
    {"name": "Avocado Quinoa Salad", "price_min": 240, "price_max": 340, "desc": "Healthy mix of organic quinoa, avocado chunks, cherry tomatoes, and lemon dressing.", "image_keyword": "quinoa-salad"},
    {"name": "California Sushi Roll (6 Pcs)", "price_min": 350, "price_max": 450, "desc": "Maki roll with crab sticks, avocado, cucumber, topped with toasted sesame seeds.", "image_keyword": "sushi-platter"},
    {"name": "Spicy Salmon Sushi Roll (6 Pcs)", "price_min": 450, "price_max": 580, "desc": "Fresh salmon chunks, spicy mayo, and cucumber rolled in nori and seasoned rice.", "image_keyword": "spicy-tuna-roll"},
    {"name": "Cucumber Avocado Roll (6 Pcs)", "price_min": 280, "price_max": 350, "desc": "Vegetarian maki roll filled with crisp cucumber and creamy avocado.", "image_keyword": "sushi roll"},
    
    # Desserts
    {"name": "Gulab Jamun (2 Pcs)", "price_min": 50, "price_max": 80, "desc": "Warm, deep-fried milk dumplings soaked in cardamom-scented sugar syrup.", "image_keyword": "gulab jamun"},
    {"name": "Hot Chocolate Brownie", "price_min": 110, "price_max": 160, "desc": "Fudgy chocolate brownie served warm with a rich chocolate glaze.", "image_keyword": "chocolate brownie"},
    {"name": "Zafrani Phirni", "price_min": 80, "price_max": 120, "desc": "Traditional Kashmiri ground-rice pudding flavored with saffron and almonds.", "image_keyword": "phirni"},
    {"name": "Mango Kulfi", "price_min": 60, "price_max": 90, "desc": "Rich, creamy Indian frozen dessert made with Alphonso mango pulp.", "image_keyword": "kulfi"},
    
    # Beverages
    {"name": "Punjabi Sweet Lassi", "price_min": 70, "price_max": 100, "desc": "Thick, creamy churned yogurt drink sweetened and served in a clay glass.", "image_keyword": "lassi"},
    {"name": "Masala Chai", "price_min": 30, "price_max": 50, "desc": "Brewed black tea with milk and a blend of aromatic spices like ginger and cardamom.", "image_keyword": "masala chai"},
    {"name": "Iced Cold Coffee", "price_min": 90, "price_max": 130, "desc": "Chilled blended espresso with milk, sugar, and vanilla ice cream.", "image_keyword": "cold coffee"},
    {"name": "Fresh Lime Soda", "price_min": 50, "price_max": 80, "desc": "Refreshing soda with fresh lime juice, choice of sweet, salted, or mixed.", "image_keyword": "lime soda"}
]

def generate_restaurants():
    restaurants = []
    res_id_counter = 1

    for city in CITIES:
        for i in range(1, 21):
            # Select a cuisine category
            cuisine_info = random.choice(CUISINES_POOL)
            cuisine_name = cuisine_info["name"]
            
            # Formulate a name
            prefix = random.choice(RESTAURANT_PREFIXES)
            suffix_pool = RESTAURANT_SUFFIXES[cuisine_name]
            suffix = random.choice(suffix_pool)
            
            if prefix in suffix:
                name = suffix
            else:
                name = f"{prefix} {suffix}"
                
            rating = round(random.uniform(4.1, 4.8), 1)
            delivery_time = random.choice([20, 25, 30, 35, 40, 45])
            delivery_fee = random.choice([30, 40, 50])
            price_for_two = random.choice([300, 350, 400, 450, 500, 600, 700, 800])
            
            restaurant = {
                "id": f"res_{res_id_counter}",
                "name": name,
                "cuisine": cuisine_name,
                "rating": rating,
                "deliveryTime": delivery_time,
                "deliveryFee": delivery_fee,
                "image_keyword": cuisine_info["image_keyword"],
                "city": city,
                "menu": []
            }
            
            # Select exactly 50 menu items for this restaurant
            selected_items = random.sample(MENU_ITEMS_POOL, 50)
            
            menu_id_counter = 1
            for item in selected_items:
                price = random.randint(item["price_min"], item["price_max"])
                price = (price // 10) * 10 + 9 # Realistic pricing
                
                menu_item = {
                    "id": f"m_{res_id_counter}_{menu_id_counter}",
                    "name": item["name"],
                    "description": item["desc"],
                    "price": price,
                    "image_keyword": item["image_keyword"]
                }
                restaurant["menu"].append(menu_item)
                menu_id_counter += 1
                
            restaurants.append(restaurant)
            res_id_counter += 1
            
    # Write to restaurants.json
    output_path = "d:/Users/nirakumar/Desktop/Niraj/AI/Agy/Anti-dopamine/src/data/restaurants.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(restaurants, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated {len(restaurants)} restaurants with 50 items each in src/data/restaurants.json!")

if __name__ == "__main__":
    generate_restaurants()
