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

# ============================================================
# CUISINE-SPECIFIC MENU POOLS
# Each cuisine has its own relevant items so menus make sense
# ============================================================

BURGER_ITEMS = [
    {"name": "Classic Veg Burger", "price_min": 99, "price_max": 149, "desc": "Crispy vegetable patty with lettuce, tomatoes, and mayo in a soft bun.", "image_keyword": "veg burger"},
    {"name": "Double Cheeseburger", "price_min": 189, "price_max": 259, "desc": "Juicy flame-grilled beef patty topped with double melted cheddar cheese, pickles, and mustard.", "image_keyword": "double-cheeseburger"},
    {"name": "Crispy Chicken Burger", "price_min": 169, "price_max": 249, "desc": "Crumb-fried chicken breast fillet topped with lettuce and creamy garlic mayo.", "image_keyword": "chicken burger"},
    {"name": "BBQ Pulled Pork Burger", "price_min": 219, "price_max": 299, "desc": "Slow-cooked shredded pork in smoky BBQ sauce with coleslaw on a brioche bun.", "image_keyword": "bbq burger"},
    {"name": "Spicy Paneer Burger", "price_min": 129, "price_max": 179, "desc": "Grilled paneer patty with jalapeños, spicy sauce, and crunchy onion rings.", "image_keyword": "paneer burger"},
    {"name": "Mushroom Swiss Burger", "price_min": 199, "price_max": 269, "desc": "Juicy patty topped with sautéed mushrooms and melted Swiss cheese.", "image_keyword": "mushroom burger"},
    {"name": "Bacon Avocado Burger", "price_min": 249, "price_max": 329, "desc": "Beef patty layered with crispy bacon, fresh avocado, and chipotle mayo.", "image_keyword": "bacon burger"},
    {"name": "Fish Fillet Burger", "price_min": 179, "price_max": 239, "desc": "Crispy battered fish fillet with tartar sauce and shredded lettuce.", "image_keyword": "fish burger"},
    {"name": "Smash Burger", "price_min": 199, "price_max": 279, "desc": "Thin-pressed crispy-edged patty with American cheese and special sauce.", "image_keyword": "smash burger"},
    {"name": "Veggie Bean Burger", "price_min": 109, "price_max": 159, "desc": "Black bean and sweet potato patty with avocado cream and pickled onions.", "image_keyword": "veggie burger"},
    {"name": "Tandoori Chicken Burger", "price_min": 179, "price_max": 249, "desc": "Tandoori spiced chicken patty with mint chutney and crisp lettuce.", "image_keyword": "tandoori burger"},
    {"name": "Hot Wings (6 Pcs)", "price_min": 159, "price_max": 219, "desc": "Crispy fried chicken wings tossed in fiery buffalo sauce.", "image_keyword": "hot wings"},
    {"name": "Chicken Nuggets (8 Pcs)", "price_min": 139, "price_max": 189, "desc": "Golden breaded chicken nuggets with honey mustard dipping sauce.", "image_keyword": "chicken nuggets"},
    {"name": "Onion Rings", "price_min": 99, "price_max": 139, "desc": "Thick-cut onion rings in a crispy beer batter.", "image_keyword": "onion rings"},
    {"name": "French Fries Classic", "price_min": 90, "price_max": 130, "desc": "Golden, salted potato fries served crispy with tomato ketchup.", "image_keyword": "french fries"},
    {"name": "Peri Peri French Fries", "price_min": 110, "price_max": 150, "desc": "Crispy potato fries tossed in hot and tangy peri peri seasoning.", "image_keyword": "fries"},
    {"name": "Loaded Cheese Fries", "price_min": 149, "price_max": 199, "desc": "Crispy fries smothered in nacho cheese sauce, jalapeños, and sour cream.", "image_keyword": "loaded fries"},
    {"name": "Mozzarella Sticks (6 Pcs)", "price_min": 139, "price_max": 189, "desc": "Breaded mozzarella sticks fried golden, served with marinara sauce.", "image_keyword": "mozzarella sticks"},
    {"name": "Coleslaw", "price_min": 59, "price_max": 89, "desc": "Creamy shredded cabbage and carrot slaw with a tangy dressing.", "image_keyword": "coleslaw"},
    {"name": "Chicken Caesar Wrap", "price_min": 169, "price_max": 229, "desc": "Grilled chicken, romaine lettuce, parmesan, and Caesar dressing in a flour tortilla.", "image_keyword": "chicken wrap"},
    {"name": "Chocolate Milkshake", "price_min": 119, "price_max": 169, "desc": "Thick and creamy chocolate milkshake topped with whipped cream.", "image_keyword": "chocolate milkshake"},
    {"name": "Strawberry Milkshake", "price_min": 119, "price_max": 169, "desc": "Sweet strawberry milkshake blended with real strawberries and vanilla ice cream.", "image_keyword": "strawberry milkshake"},
    {"name": "Oreo Milkshake", "price_min": 129, "price_max": 179, "desc": "Rich cookies and cream milkshake blended with crushed Oreo cookies.", "image_keyword": "oreo shake"},
    {"name": "Iced Cold Coffee", "price_min": 90, "price_max": 130, "desc": "Chilled blended espresso with milk, sugar, and vanilla ice cream.", "image_keyword": "cold coffee"},
    {"name": "Fresh Lime Soda", "price_min": 50, "price_max": 80, "desc": "Refreshing soda with fresh lime juice, sweet or salted.", "image_keyword": "lime soda"},
    {"name": "Hot Chocolate Brownie", "price_min": 110, "price_max": 160, "desc": "Fudgy chocolate brownie served warm with vanilla ice cream.", "image_keyword": "chocolate brownie"},
]

PIZZA_ITEMS = [
    {"name": "Margherita Pizza", "price_min": 240, "price_max": 320, "desc": "Classic pizza with tomato sauce, fresh mozzarella, and basil leaves.", "image_keyword": "margherita-pizza"},
    {"name": "Veggie Supreme Pizza", "price_min": 290, "price_max": 380, "desc": "Loaded with bell peppers, onions, tomatoes, sweet corn, and black olives.", "image_keyword": "woodfired-pizza"},
    {"name": "Chicken Tikka Pizza", "price_min": 340, "price_max": 450, "desc": "Spiced chicken tikka chunks, red onions, green chilies, and fresh mozzarella.", "image_keyword": "chicken pizza"},
    {"name": "Pepperoni Pizza", "price_min": 320, "price_max": 420, "desc": "Classic American pizza loaded with spicy pepperoni slices and mozzarella.", "image_keyword": "pepperoni pizza"},
    {"name": "BBQ Chicken Pizza", "price_min": 340, "price_max": 440, "desc": "Smoky BBQ sauce base with grilled chicken, red onions, and cilantro.", "image_keyword": "bbq pizza"},
    {"name": "Four Cheese Pizza", "price_min": 310, "price_max": 400, "desc": "Rich blend of mozzarella, cheddar, parmesan, and gorgonzola.", "image_keyword": "cheese pizza"},
    {"name": "Mushroom Truffle Pizza", "price_min": 350, "price_max": 450, "desc": "Wild mushrooms with truffle oil, mozzarella, and fresh thyme.", "image_keyword": "mushroom pizza"},
    {"name": "Paneer Makhani Pizza", "price_min": 280, "price_max": 360, "desc": "Butter masala sauce base with paneer cubes and capsicum.", "image_keyword": "paneer pizza"},
    {"name": "Garlic Bread (4 Pcs)", "price_min": 110, "price_max": 160, "desc": "Toasted bread brushed with garlic butter and herbs.", "image_keyword": "garlic bread"},
    {"name": "Cheesy Garlic Bread", "price_min": 140, "price_max": 190, "desc": "Garlic bread loaded with melted mozzarella and herbs.", "image_keyword": "cheesy garlic bread"},
    {"name": "Pasta Alfredo", "price_min": 210, "price_max": 280, "desc": "Penne pasta in a rich, creamy white sauce with mushrooms and parmesan.", "image_keyword": "pasta alfredo"},
    {"name": "Pasta Arrabbiata", "price_min": 190, "price_max": 260, "desc": "Penne in a spicy tomato sauce with garlic, red chili flakes, and basil.", "image_keyword": "pasta arrabbiata"},
    {"name": "Chicken Pasta Carbonara", "price_min": 260, "price_max": 340, "desc": "Spaghetti with creamy egg sauce, grilled chicken, and crispy bacon bits.", "image_keyword": "pasta carbonara"},
    {"name": "Caesar Salad", "price_min": 160, "price_max": 220, "desc": "Crisp romaine lettuce with Caesar dressing, croutons, and parmesan.", "image_keyword": "caesar salad"},
    {"name": "Bruschetta (4 Pcs)", "price_min": 140, "price_max": 190, "desc": "Toasted bread topped with diced tomatoes, basil, garlic, and olive oil.", "image_keyword": "bruschetta"},
    {"name": "Potato Wedges", "price_min": 110, "price_max": 150, "desc": "Seasoned baked potato wedges served with sour cream dip.", "image_keyword": "potato wedges"},
    {"name": "Tiramisu", "price_min": 180, "price_max": 240, "desc": "Classic Italian dessert with layers of espresso-soaked ladyfingers and mascarpone.", "image_keyword": "tiramisu"},
    {"name": "Chocolate Lava Cake", "price_min": 150, "price_max": 200, "desc": "Warm chocolate cake with a molten center, served with vanilla ice cream.", "image_keyword": "lava cake"},
    {"name": "Iced Tea", "price_min": 70, "price_max": 100, "desc": "Chilled sweetened tea with a hint of lemon.", "image_keyword": "iced tea"},
    {"name": "Virgin Mojito", "price_min": 90, "price_max": 130, "desc": "Refreshing mint and lime mocktail with soda and crushed ice.", "image_keyword": "mojito"},
    {"name": "Pepsi / Coke (330ml)", "price_min": 40, "price_max": 60, "desc": "Chilled carbonated cola.", "image_keyword": "cola"},
    {"name": "Fresh Lime Soda", "price_min": 50, "price_max": 80, "desc": "Refreshing soda with fresh lime juice, sweet or salted.", "image_keyword": "lime soda"},
]

BIRYANI_ITEMS = [
    {"name": "Lucknowi Chicken Biryani", "price_min": 290, "price_max": 380, "desc": "Fragrant long-grain basmati rice layered with juicy chicken, cooked dum-style.", "image_keyword": "chicken biryani"},
    {"name": "Kolkata Mutton Biryani", "price_min": 380, "price_max": 490, "desc": "Classic Kolkata-style dum biryani with tender mutton, egg, and a spiced potato.", "image_keyword": "mutton-biryani"},
    {"name": "Hyderabadi Veg Biryani", "price_min": 220, "price_max": 300, "desc": "Spicy vegetable and paneer layer biryani served with salan and raita.", "image_keyword": "veg biryani"},
    {"name": "Egg Dum Biryani", "price_min": 240, "price_max": 310, "desc": "Hard-boiled eggs cooked with spiced rice, saffron, and caramelized onions.", "image_keyword": "egg biryani"},
    {"name": "Paneer Biryani", "price_min": 240, "price_max": 310, "desc": "Aromatic dum biryani with marinated paneer cubes and whole spices.", "image_keyword": "paneer biryani"},
    {"name": "Prawns Biryani", "price_min": 380, "price_max": 480, "desc": "Coastal-style spiced biryani with juicy prawns and saffron rice.", "image_keyword": "prawns biryani"},
    {"name": "Tandoori Chicken Tikka", "price_min": 280, "price_max": 360, "desc": "Boneless chicken chunks marinated in tandoori spices and charred in clay oven.", "image_keyword": "chicken tikka"},
    {"name": "Chicken Seekh Kabab", "price_min": 260, "price_max": 340, "desc": "Minced chicken skewers flavored with garlic, coriander, and warm spices.", "image_keyword": "chicken seekh kebab"},
    {"name": "Paneer Tikka Angare", "price_min": 240, "price_max": 320, "desc": "Cottage cheese cubes marinated in spicy yogurt and grilled in tandoor.", "image_keyword": "paneer tikka"},
    {"name": "Chicken Lollipop", "price_min": 240, "price_max": 320, "desc": "Flipped chicken wings fried to crisp perfection, served with schezwan dip.", "image_keyword": "chicken lollipop"},
    {"name": "Mutton Rogan Josh", "price_min": 450, "price_max": 580, "desc": "Tender mutton pieces slow-cooked in a rich Kashmiri red chili and yogurt gravy.", "image_keyword": "mutton curry"},
    {"name": "Butter Chicken Boneless", "price_min": 320, "price_max": 420, "desc": "Tandoori chicken pieces in a velvety, buttery tomato gravy with cream.", "image_keyword": "butter-chicken"},
    {"name": "Dal Makhani", "price_min": 220, "price_max": 300, "desc": "Slow-cooked black lentils and kidney beans topped with fresh cream and butter.", "image_keyword": "dal makhani"},
    {"name": "Raita", "price_min": 50, "price_max": 70, "desc": "Cool yogurt mixed with chopped onion, tomato, and roasted cumin.", "image_keyword": "raita"},
    {"name": "Butter Naan", "price_min": 55, "price_max": 75, "desc": "Soft, leavened clay-oven bread brushed with melted butter.", "image_keyword": "butter naan"},
    {"name": "Garlic Naan", "price_min": 65, "price_max": 85, "desc": "Leavened flatbread topped with minced garlic, coriander, and butter.", "image_keyword": "garlic naan"},
    {"name": "Gulab Jamun (2 Pcs)", "price_min": 50, "price_max": 80, "desc": "Warm, deep-fried milk dumplings soaked in cardamom-scented sugar syrup.", "image_keyword": "gulab jamun"},
    {"name": "Zafrani Phirni", "price_min": 80, "price_max": 120, "desc": "Traditional Kashmiri ground-rice pudding with saffron and almonds.", "image_keyword": "phirni"},
    {"name": "Punjabi Sweet Lassi", "price_min": 70, "price_max": 100, "desc": "Thick, creamy churned yogurt drink sweetened and served in a clay glass.", "image_keyword": "lassi"},
    {"name": "Masala Chai", "price_min": 30, "price_max": 50, "desc": "Brewed black tea with milk and aromatic spices.", "image_keyword": "masala chai"},
]

NORTH_INDIAN_ITEMS = [
    {"name": "Paneer Butter Masala", "price_min": 260, "price_max": 340, "desc": "Rich cottage cheese in a creamy, sweet, and lightly spiced tomato-butter gravy.", "image_keyword": "paneer butter masala"},
    {"name": "Dal Makhani", "price_min": 220, "price_max": 300, "desc": "Slow-cooked black lentils and kidney beans topped with fresh cream and butter.", "image_keyword": "dal makhani"},
    {"name": "Kadai Paneer", "price_min": 250, "price_max": 330, "desc": "Cottage cheese with freshly ground spices and bell peppers in a tomato gravy.", "image_keyword": "kadai paneer"},
    {"name": "Butter Chicken Boneless", "price_min": 320, "price_max": 420, "desc": "Tandoori chicken pieces in a velvety, buttery tomato gravy with cream.", "image_keyword": "butter-chicken"},
    {"name": "Chicken Tikka Masala", "price_min": 310, "price_max": 390, "desc": "Grilled chicken chunks in a spicy, thick onion-tomato gravy.", "image_keyword": "chicken tikka masala"},
    {"name": "Mutton Rogan Josh", "price_min": 450, "price_max": 580, "desc": "Tender mutton slow-cooked in rich Kashmiri red chili and yogurt gravy.", "image_keyword": "mutton curry"},
    {"name": "Kadai Chicken", "price_min": 300, "price_max": 380, "desc": "Chicken cooked with capsicum, onions, and freshly ground kadai spices.", "image_keyword": "kadai chicken"},
    {"name": "Malai Kofta", "price_min": 280, "price_max": 360, "desc": "Paneer and potato dumplings in a rich, sweet, cashew-based white gravy.", "image_keyword": "malai kofta"},
    {"name": "Pindi Chole", "price_min": 180, "price_max": 240, "desc": "Tangy and spicy chickpeas cooked in authentic Punjabi spices.", "image_keyword": "chole"},
    {"name": "Mix Vegetable Curry", "price_min": 190, "price_max": 260, "desc": "Assorted vegetables cooked in a semi-dry onion-tomato gravy.", "image_keyword": "mix veg"},
    {"name": "Egg Curry Masala", "price_min": 190, "price_max": 260, "desc": "Boiled eggs in a spicy onion-tomato gravy with fresh coriander.", "image_keyword": "egg curry"},
    {"name": "Yellow Dal Tadka", "price_min": 160, "price_max": 220, "desc": "Tempered yellow lentils with cumin, garlic, tomatoes, and green chilies.", "image_keyword": "dal tadka"},
    {"name": "Aloo Gobhi Adraki", "price_min": 170, "price_max": 230, "desc": "Dry potatoes and cauliflower flavored with julienned ginger.", "image_keyword": "aloo gobhi"},
    {"name": "Paneer Tikka Angare", "price_min": 240, "price_max": 320, "desc": "Cottage cheese cubes marinated in spicy yogurt and grilled in tandoor.", "image_keyword": "paneer tikka"},
    {"name": "Tandoori Chicken Tikka", "price_min": 280, "price_max": 360, "desc": "Boneless chicken chunks marinated in tandoori spices and charred in clay oven.", "image_keyword": "chicken tikka"},
    {"name": "Chicken Seekh Kabab", "price_min": 260, "price_max": 340, "desc": "Minced chicken skewers flavored with garlic, coriander, and warm spices.", "image_keyword": "chicken seekh kebab"},
    {"name": "Dahi Ke Kebab", "price_min": 220, "price_max": 280, "desc": "Soft, melt-in-mouth kebabs made of hung curd and mild spices.", "image_keyword": "dahi kebab"},
    {"name": "Butter Naan", "price_min": 55, "price_max": 75, "desc": "Soft, leavened clay-oven bread brushed with melted butter.", "image_keyword": "butter naan"},
    {"name": "Garlic Naan", "price_min": 65, "price_max": 85, "desc": "Leavened flatbread topped with minced garlic, coriander, and butter.", "image_keyword": "garlic naan"},
    {"name": "Tandoori Roti Plain", "price_min": 25, "price_max": 35, "desc": "Whole wheat flatbread baked in a traditional clay tandoor.", "image_keyword": "roti"},
    {"name": "Lachha Paratha", "price_min": 45, "price_max": 65, "desc": "Multi-layered flaky whole wheat bread baked in tandoor.", "image_keyword": "paratha"},
    {"name": "Jeera Rice", "price_min": 120, "price_max": 160, "desc": "Steamed basmati rice tempered with ghee and aromatic cumin seeds.", "image_keyword": "jeera rice"},
    {"name": "Gulab Jamun (2 Pcs)", "price_min": 50, "price_max": 80, "desc": "Warm milk dumplings soaked in cardamom-scented sugar syrup.", "image_keyword": "gulab jamun"},
    {"name": "Punjabi Sweet Lassi", "price_min": 70, "price_max": 100, "desc": "Thick, creamy churned yogurt drink.", "image_keyword": "lassi"},
    {"name": "Masala Chai", "price_min": 30, "price_max": 50, "desc": "Brewed black tea with milk and aromatic spices.", "image_keyword": "masala chai"},
]

SOUTH_INDIAN_ITEMS = [
    {"name": "Masala Dosa Classic", "price_min": 110, "price_max": 160, "desc": "Crispy rice crepe stuffed with spiced potato mash, served with sambar and chutney.", "image_keyword": "masala dosa"},
    {"name": "Plain Dosa", "price_min": 80, "price_max": 120, "desc": "Paper-thin crispy rice and lentil crepe served with sambar and chutneys.", "image_keyword": "plain dosa"},
    {"name": "Rava Onion Dosa", "price_min": 130, "price_max": 180, "desc": "Crisp semolina crepe flavored with chopped onions and green chilies.", "image_keyword": "rava dosa"},
    {"name": "Mysore Masala Dosa", "price_min": 140, "price_max": 190, "desc": "Dosa spread with spicy red chutney and stuffed with potato masala.", "image_keyword": "mysore dosa"},
    {"name": "Paneer Dosa", "price_min": 150, "price_max": 200, "desc": "Crispy dosa stuffed with spiced crumbled paneer filling.", "image_keyword": "paneer dosa"},
    {"name": "Idli Sambar (2 Pcs)", "price_min": 60, "price_max": 90, "desc": "Soft steamed rice cakes served with hot lentil sambar and coconut chutney.", "image_keyword": "idli sambar"},
    {"name": "Idli Sambar (4 Pcs)", "price_min": 100, "price_max": 140, "desc": "Four soft steamed rice cakes with sambar and two chutneys.", "image_keyword": "idli sambar"},
    {"name": "Medu Vada (2 Pcs)", "price_min": 80, "price_max": 110, "desc": "Crispy, savory fried lentil donuts served with sambar and coconut dip.", "image_keyword": "vada"},
    {"name": "Uttapam Onion", "price_min": 100, "price_max": 140, "desc": "Thick rice pancake topped with chopped onions, served with chutney.", "image_keyword": "uttapam"},
    {"name": "Pongal", "price_min": 90, "price_max": 130, "desc": "Savory rice and lentil porridge tempered with black pepper and cumin.", "image_keyword": "pongal"},
    {"name": "Upma", "price_min": 70, "price_max": 100, "desc": "Savory semolina porridge with mustard seeds, curry leaves, and vegetables.", "image_keyword": "upma"},
    {"name": "Curd Rice", "price_min": 80, "price_max": 120, "desc": "Cool tempered yogurt rice with mustard seeds and curry leaves.", "image_keyword": "curd rice"},
    {"name": "Lemon Rice", "price_min": 90, "price_max": 130, "desc": "Tangy turmeric-tinted rice with peanuts, curry leaves, and lemon juice.", "image_keyword": "lemon rice"},
    {"name": "Rasam", "price_min": 50, "price_max": 70, "desc": "Hot and tangy South Indian tomato-tamarind broth with pepper.", "image_keyword": "rasam"},
    {"name": "Sambar Rice", "price_min": 110, "price_max": 150, "desc": "Steamed rice served with piping hot mixed vegetable sambar.", "image_keyword": "sambar rice"},
    {"name": "Coconut Chutney", "price_min": 30, "price_max": 50, "desc": "Fresh ground coconut chutney with green chilies and tempered mustard seeds.", "image_keyword": "coconut chutney"},
    {"name": "Filter Coffee", "price_min": 40, "price_max": 60, "desc": "Strong South Indian drip coffee with frothy hot milk.", "image_keyword": "filter coffee"},
    {"name": "Mango Lassi", "price_min": 80, "price_max": 110, "desc": "Thick yogurt drink blended with Alphonso mango pulp.", "image_keyword": "mango lassi"},
    {"name": "Payasam", "price_min": 60, "price_max": 90, "desc": "Traditional South Indian milk pudding with vermicelli and cardamom.", "image_keyword": "payasam"},
    {"name": "Kesari Bath", "price_min": 60, "price_max": 90, "desc": "Sweet semolina dessert flavored with saffron, ghee, and cashews.", "image_keyword": "kesari"},
]

CHINESE_ITEMS = [
    {"name": "Veg Hakka Noodles", "price_min": 160, "price_max": 220, "desc": "Stir-fried noodles with julienned vegetables in light soy sauce.", "image_keyword": "hakka noodles"},
    {"name": "Chicken Hakka Noodles", "price_min": 200, "price_max": 270, "desc": "Stir-fried noodles with egg, chicken shreds, and mixed vegetables.", "image_keyword": "chicken noodles"},
    {"name": "Veg Fried Rice", "price_min": 150, "price_max": 210, "desc": "Aromatic jasmine rice tossed with finely chopped vegetables and soy sauce.", "image_keyword": "fried rice"},
    {"name": "Chicken Fried Rice", "price_min": 190, "price_max": 260, "desc": "Wok-tossed rice with scrambled egg, chicken pieces, and scallions.", "image_keyword": "chicken fried rice"},
    {"name": "Veg Manchurian Gravy", "price_min": 180, "price_max": 240, "desc": "Deep-fried vegetable dumplings in a sweet, sour, and spicy dark soy gravy.", "image_keyword": "manchurian"},
    {"name": "Chilli Paneer Dry", "price_min": 220, "price_max": 300, "desc": "Wok-tossed cottage cheese with bell peppers, onions, and spicy soy sauce.", "image_keyword": "chilli paneer"},
    {"name": "Chilli Chicken Dry", "price_min": 280, "price_max": 350, "desc": "Classic Indo-Chinese crispy chicken tossed with green chilies and soy sauce.", "image_keyword": "chilli chicken"},
    {"name": "Veg Spring Rolls", "price_min": 160, "price_max": 220, "desc": "Crispy wrappers filled with stir-fried vegetables, served with sweet chili sauce.", "image_keyword": "spring rolls"},
    {"name": "Crispy Corn Pepper Salt", "price_min": 180, "price_max": 240, "desc": "Deep-fried sweet corn kernels tossed with onions, garlic, and crushed pepper.", "image_keyword": "crispy corn"},
    {"name": "Chicken Lollipop", "price_min": 240, "price_max": 320, "desc": "Flipped chicken wings fried to crisp perfection, served with schezwan dip.", "image_keyword": "chicken lollipop"},
    {"name": "Schezwan Noodles", "price_min": 180, "price_max": 240, "desc": "Spicy stir-fried noodles in schezwan sauce with vegetables.", "image_keyword": "schezwan noodles"},
    {"name": "Sweet Corn Soup", "price_min": 90, "price_max": 130, "desc": "Creamy sweet corn soup with a hint of pepper and fresh coriander.", "image_keyword": "corn soup"},
    {"name": "Hot and Sour Soup", "price_min": 100, "price_max": 140, "desc": "Tangy and spicy soup with vegetables, tofu, and a dash of vinegar.", "image_keyword": "hot sour soup"},
    {"name": "Dim Sum Veg (6 Pcs)", "price_min": 160, "price_max": 220, "desc": "Steamed vegetable dumplings with soy-chili dipping sauce.", "image_keyword": "dim sum"},
    {"name": "Kung Pao Chicken", "price_min": 260, "price_max": 340, "desc": "Stir-fried chicken with peanuts, dried chilies, and Sichuan peppercorns.", "image_keyword": "kung pao"},
    {"name": "Orange Chicken", "price_min": 270, "price_max": 350, "desc": "Crispy battered chicken in a tangy-sweet orange glaze.", "image_keyword": "orange chicken"},
    {"name": "Iced Lemon Tea", "price_min": 60, "price_max": 90, "desc": "Chilled sweetened tea with fresh lemon.", "image_keyword": "iced tea"},
    {"name": "Fresh Lime Soda", "price_min": 50, "price_max": 80, "desc": "Refreshing soda with fresh lime juice.", "image_keyword": "lime soda"},
]

SUSHI_ITEMS = [
    {"name": "California Sushi Roll (6 Pcs)", "price_min": 350, "price_max": 450, "desc": "Maki roll with crab sticks, avocado, cucumber, topped with sesame seeds.", "image_keyword": "sushi-platter"},
    {"name": "Spicy Salmon Sushi Roll (6 Pcs)", "price_min": 450, "price_max": 580, "desc": "Fresh salmon, spicy mayo, and cucumber rolled in nori and seasoned rice.", "image_keyword": "spicy-tuna-roll"},
    {"name": "Cucumber Avocado Roll (6 Pcs)", "price_min": 280, "price_max": 350, "desc": "Vegetarian maki roll with crisp cucumber and creamy avocado.", "image_keyword": "sushi roll"},
    {"name": "Dragon Roll (8 Pcs)", "price_min": 520, "price_max": 650, "desc": "Shrimp tempura inside, topped with eel and avocado slices.", "image_keyword": "dragon roll"},
    {"name": "Rainbow Roll (8 Pcs)", "price_min": 480, "price_max": 600, "desc": "California roll topped with assorted sashimi and avocado.", "image_keyword": "rainbow roll"},
    {"name": "Tempura Udon", "price_min": 320, "price_max": 420, "desc": "Hot udon noodles in dashi broth with crispy shrimp tempura.", "image_keyword": "tempura udon"},
    {"name": "Chicken Katsu Curry", "price_min": 300, "price_max": 380, "desc": "Crispy panko-breaded chicken cutlet with Japanese curry and steamed rice.", "image_keyword": "katsu curry"},
    {"name": "Edamame", "price_min": 120, "price_max": 160, "desc": "Steamed young soybeans lightly salted.", "image_keyword": "edamame"},
    {"name": "Miso Soup", "price_min": 80, "price_max": 120, "desc": "Traditional Japanese soybean soup with tofu and seaweed.", "image_keyword": "miso soup"},
    {"name": "Gyoza (6 Pcs)", "price_min": 180, "price_max": 240, "desc": "Pan-fried Japanese dumplings filled with chicken and vegetables.", "image_keyword": "gyoza"},
    {"name": "Salmon Sashimi (5 Pcs)", "price_min": 420, "price_max": 520, "desc": "Thinly sliced fresh salmon served with wasabi and pickled ginger.", "image_keyword": "sashimi"},
    {"name": "Tuna Nigiri (4 Pcs)", "price_min": 380, "price_max": 480, "desc": "Hand-pressed sushi rice topped with fresh tuna slices.", "image_keyword": "nigiri"},
    {"name": "Chicken Teriyaki", "price_min": 260, "price_max": 340, "desc": "Grilled chicken glazed with sweet teriyaki sauce, served with rice.", "image_keyword": "teriyaki"},
    {"name": "Vegetable Tempura", "price_min": 180, "price_max": 240, "desc": "Lightly battered and fried seasonal vegetables with tentsuyu dipping sauce.", "image_keyword": "tempura"},
    {"name": "Spicy Tuna Tartare", "price_min": 380, "price_max": 480, "desc": "Diced fresh tuna with spicy mayo, sesame oil, and crispy wonton chips.", "image_keyword": "tuna tartare"},
    {"name": "Green Tea Ice Cream", "price_min": 100, "price_max": 140, "desc": "Creamy matcha-flavored ice cream.", "image_keyword": "matcha ice cream"},
    {"name": "Japanese Iced Green Tea", "price_min": 80, "price_max": 110, "desc": "Cold-brewed premium Japanese green tea.", "image_keyword": "green tea"},
    {"name": "Sake (Glass)", "price_min": 200, "price_max": 300, "desc": "Chilled premium Japanese rice wine.", "image_keyword": "sake"},
]

SALAD_ITEMS = [
    {"name": "Caesar Salad Veg", "price_min": 190, "price_max": 260, "desc": "Crisp romaine lettuce with Caesar dressing, croutons, and parmesan.", "image_keyword": "healthy-salad"},
    {"name": "Caesar Salad with Chicken", "price_min": 240, "price_max": 320, "desc": "Classic Caesar with grilled chicken strips, croutons, and parmesan.", "image_keyword": "chicken caesar"},
    {"name": "Avocado Quinoa Salad", "price_min": 240, "price_max": 340, "desc": "Organic quinoa, avocado chunks, cherry tomatoes, and lemon dressing.", "image_keyword": "quinoa-salad"},
    {"name": "Greek Salad", "price_min": 190, "price_max": 260, "desc": "Cucumber, tomatoes, olives, red onion, and feta cheese with olive oil.", "image_keyword": "greek salad"},
    {"name": "Asian Sesame Salad", "price_min": 210, "price_max": 280, "desc": "Mixed greens with edamame, mandarin oranges, and sesame ginger dressing.", "image_keyword": "asian salad"},
    {"name": "Kale Superfood Salad", "price_min": 220, "price_max": 300, "desc": "Massaged kale with cranberries, walnuts, apple slices, and honey vinaigrette.", "image_keyword": "kale salad"},
    {"name": "Grilled Chicken Salad", "price_min": 260, "price_max": 340, "desc": "Mixed greens topped with grilled chicken, cherry tomatoes, and balsamic.", "image_keyword": "grilled chicken salad"},
    {"name": "Beetroot Feta Salad", "price_min": 200, "price_max": 270, "desc": "Roasted beetroot with crumbled feta, walnuts, and honey-balsamic glaze.", "image_keyword": "beetroot salad"},
    {"name": "Smoothie Bowl (Acai)", "price_min": 240, "price_max": 320, "desc": "Thick acai blend topped with granola, banana, berries, and chia seeds.", "image_keyword": "acai bowl"},
    {"name": "Smoothie Bowl (Mango)", "price_min": 210, "price_max": 280, "desc": "Blended mango base topped with coconut, granola, and kiwi slices.", "image_keyword": "mango bowl"},
    {"name": "Green Detox Smoothie", "price_min": 160, "price_max": 220, "desc": "Spinach, banana, apple, ginger, and lemon juice blended smooth.", "image_keyword": "green smoothie"},
    {"name": "Protein Power Bowl", "price_min": 280, "price_max": 360, "desc": "Brown rice, grilled chicken, avocado, edamame, and tahini dressing.", "image_keyword": "protein bowl"},
    {"name": "Hummus & Pita Plate", "price_min": 180, "price_max": 240, "desc": "Creamy chickpea hummus served with warm pita bread and olive oil.", "image_keyword": "hummus"},
    {"name": "Avocado Toast", "price_min": 160, "price_max": 220, "desc": "Sourdough toast topped with smashed avocado, chili flakes, and poached egg.", "image_keyword": "avocado toast"},
    {"name": "Fresh Fruit Bowl", "price_min": 120, "price_max": 170, "desc": "Seasonal fresh fruits including watermelon, mango, kiwi, and berries.", "image_keyword": "fruit bowl"},
    {"name": "Granola Yogurt Parfait", "price_min": 140, "price_max": 190, "desc": "Layered Greek yogurt with homemade granola, honey, and mixed berries.", "image_keyword": "yogurt parfait"},
    {"name": "Cold Pressed Juice (Orange)", "price_min": 100, "price_max": 140, "desc": "Freshly pressed orange juice, no added sugar.", "image_keyword": "orange juice"},
    {"name": "Coconut Water", "price_min": 60, "price_max": 90, "desc": "Fresh tender coconut water.", "image_keyword": "coconut water"},
]

# Map cuisine names to their specific item pools
CUISINE_MENU_MAP = {
    "Biryani, North Indian": BIRYANI_ITEMS,
    "North Indian, Mughlai": NORTH_INDIAN_ITEMS,
    "South Indian, Healthy": SOUTH_INDIAN_ITEMS,
    "Burgers, Fast Food, American": BURGER_ITEMS,
    "Pizza, Fast Food, Italian": PIZZA_ITEMS,
    "Chinese, Asian, Noodles": CHINESE_ITEMS,
    "Sushi, Japanese, Pan-Asian": SUSHI_ITEMS,
    "Healthy Salad, Continental": SALAD_ITEMS,
}

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
            
            # Select menu items FROM THE CUISINE-SPECIFIC POOL
            cuisine_pool = CUISINE_MENU_MAP[cuisine_name]
            pool_size = len(cuisine_pool)
            
            # Use all items from the pool, then fill remaining slots with random repeats
            if pool_size >= 20:
                selected_items = random.sample(cuisine_pool, min(pool_size, 20))
            else:
                selected_items = list(cuisine_pool)
            
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
        
    print(f"Successfully generated {len(restaurants)} restaurants with cuisine-matched menus in src/data/restaurants.json!")

if __name__ == "__main__":
    generate_restaurants()
