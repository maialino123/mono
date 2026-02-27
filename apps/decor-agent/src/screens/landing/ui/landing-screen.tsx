import type { Product } from '@/entities/product';
import type { Profile } from '@/entities/profile';
import { ProductGrid } from '@/widgets/product-grid';
import { ProfileHero } from '@/widgets/profile-hero';

interface LandingScreenProps {
  profile: Profile;
  featuredProducts: Product[];
  allProducts: Product[];
}

export function LandingScreen({
  profile,
  featuredProducts,
  allProducts,
}: LandingScreenProps) {
  return (
    <main className="w-full flex-1">
      {/* Container with proper max-width and centering */}
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:space-y-12 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero Section */}
        <section>
          <ProfileHero profile={profile} />
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <ProductGrid
            products={featuredProducts}
            title="Đồ mình đang dùng"
          />
        )}

        {/* All Products */}
        {allProducts.length > 0 && (
          <ProductGrid
            products={allProducts}
            title="Tất cả sản phẩm"
          />
        )}

        {/* Empty state */}
        {featuredProducts.length === 0 && allProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-white/60">
              Chưa có sản phẩm nào. Hãy quay lại sau nhé!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

