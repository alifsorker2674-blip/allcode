import Link from 'next/link';
import { FiTag } from 'react-icons/fi';
import WishlistButton from '@/components/WishlistButton';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.comparePrice && product.comparePrice > product.price;
  const save = hasDiscount ? product.comparePrice! - product.price : 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[8px] bg-white border border-zinc-200 transition-all duration-300 hover:shadow-lg hover:border-zinc-300">
      {product.isBestSelling && (
        <span className="absolute left-0 top-0 z-10 flex items-center gap-1 rounded-br-lg bg-[#ff4500] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
          <FiTag size={12} /> Best Selling
        </span>
      )}

      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-zinc-50 overflow-hidden">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">No Image</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 lg:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm lg:text-lg font-bold text-zinc-800 transition-colors group-hover:text-[var(--primary)]">{product.name}</h3>
        </Link>
        {product.shortDescription && (
          <p className="mt-1 line-clamp-2 hidden lg:block text-sm text-zinc-500">{product.shortDescription}</p>
        )}
        <div className="mt-1 lg:mt-2 flex flex-wrap items-end gap-2">
          <span className="text-base lg:text-lg font-bold text-zinc-900">৳{product.price.toLocaleString()}</span>
          {hasDiscount && <span className="mb-0.5 text-xs lg:text-sm text-zinc-400 line-through">৳{product.comparePrice!.toLocaleString()}</span>}
        </div>
        {hasDiscount && (
          <span className="mt-1 lg:mt-2 text-xs lg:text-sm font-semibold text-[var(--primary)]">
            Save ৳{save.toLocaleString()}
          </span>
        )}
        
        {/* Actions - visible on both mobile and desktop at the bottom */}
        <div className="mt-auto flex items-center gap-2 pt-4">
          {product.stock === 0 ? (
            <span className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border border-[var(--primary)] px-2 py-2 lg:px-4 lg:py-2.5 text-xs lg:text-sm font-medium text-[var(--primary)]">
              Out
            </span>
          ) : (
            <AddToCartButton
              productId={product._id}
              productName={product.name}
              price={product.price}
              className="flex-1 !px-2 lg:!px-4 !py-2 lg:!py-2.5 !text-xs lg:!text-sm"
            />
          )}
          <div className="hidden lg:block shrink-0">
            <WishlistButton productId={product._id} className="border border-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
