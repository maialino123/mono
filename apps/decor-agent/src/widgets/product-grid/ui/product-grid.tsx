import { ProductCard } from '@/widgets/product-card';
import type { Product } from '@/entities/product';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export function ProductGrid({ products, title }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
