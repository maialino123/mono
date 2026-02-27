export interface Product {
  slug: string;
  title: string;
  description: string;
  image: string;
  affiliateUrl: string;
  category: 'lighting' | 'furniture' | 'decor' | 'tech';
  featured: boolean;
}

export interface Profile {
  name: string;
  avatar: string;
  bio: string;
}
