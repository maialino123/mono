import { SoraLandingScreen } from '@/screens/sora';
import { getProfile } from '@/entities/profile';
import { getProducts, getFeaturedProducts } from '@/entities/product';

// CRITICAL: Force static generation for Cloudflare Workers (no fs at runtime)
export const dynamic = 'force-static';
export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [profile, featuredProducts, allProducts] = await Promise.all([
    getProfile(),
    getFeaturedProducts(),
    getProducts(),
  ]);

  return (
    <SoraLandingScreen
      profile={profile}
      featuredProducts={featuredProducts}
      allProducts={allProducts}
    />
  );
}
