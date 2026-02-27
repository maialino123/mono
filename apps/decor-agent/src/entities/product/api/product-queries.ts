// NOTE: These functions run at BUILD TIME only (getStaticProps/generateStaticParams)
// Cloudflare Workers don't have filesystem access at runtime

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Product } from '@/shared/types/product';

// Use monorepo-aware path resolution
const getContentDir = () => {
  return process.env.CONTENT_ROOT || path.join(process.cwd(), 'content/products');
};

export async function getProducts(): Promise<Product[]> {
  const contentDir = getContentDir();

  try {
    const files = await fs.readdir(contentDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const products = await Promise.all(
      mdFiles.map(async (file) => {
        const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
        const { data } = matter(content);
        return {
          slug: file.replace('.md', ''),
          title: data.title || '',
          description: data.description || '',
          image: data.image || '/placeholder.jpg',
          affiliateUrl: data.affiliateUrl || '',
          category: data.category || 'decor',
          featured: data.featured ?? false,
        } as Product;
      })
    );

    return products;
  } catch (error) {
    console.error('[Products] Failed to read products:', error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const contentDir = getContentDir();

  try {
    const filePath = path.join(contentDir, `${slug}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      image: data.image || '/placeholder.jpg',
      affiliateUrl: data.affiliateUrl || '',
      category: data.category || 'decor',
      featured: data.featured ?? false,
    };
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(p => p.featured);
}

export async function getProductsByCategory(category: Product['category']): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(p => p.category === category);
}
