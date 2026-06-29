export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_keyword: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number; // in minutes
  deliveryFee: number;  // in local currency
  image_keyword: string;
  menu: MenuItem[];
}
