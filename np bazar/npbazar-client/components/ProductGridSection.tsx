import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/api';

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

export default function ProductGridSection({ title, products, viewAllHref }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto mt-12 w-full max-w-[1650px] px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-[var(--primary)] hover:underline">
            View All
          </Link>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
