'use client';
import type { Profile } from '@/entities/profile';
import type { Product } from '@/entities/product';
import { SoraHeader, ShowcaseCard, LinkCard, SoraFooter } from '@/widgets/sora';

interface SoraLandingScreenProps {
  profile: Profile;
  featuredProducts: Product[];
  allProducts: Product[];
}

export function SoraLandingScreen({
  profile,
  featuredProducts,
  allProducts,
}: SoraLandingScreenProps) {
  // Get first featured product for showcase
  const showcaseProduct = featuredProducts[0];

  // Get up to 4 products for link cards (excluding the showcase product)
  const linkProducts = allProducts
    .filter((p) => p.slug !== showcaseProduct?.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-sora-bg py-12">
      <div className="max-w-[600px] mx-auto px-6">
        <SoraHeader
          name={profile.name}
          tagline={profile.bio}
          avatar={profile.avatar}
        />

        {showcaseProduct && (
          <ShowcaseCard
            product={showcaseProduct}
            onCTAClick={() => {
              window.open(showcaseProduct.affiliateUrl, '_blank');
            }}
          />
        )}

        <div className="space-y-3 mb-8">
          {linkProducts.map((product, index) => (
            <LinkCard
              key={product.slug}
              product={product}
              index={index}
              onClick={() => {
                window.open(product.affiliateUrl, '_blank');
              }}
            />
          ))}
        </div>

        <SoraFooter />
      </div>
    </div>
  );
}
