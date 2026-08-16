import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductGallery from '@/components/ProductGallery';
import ProductActions from '@/components/ProductActions';
import ProductTabs from '@/components/ProductTabs';
import StarRating from '@/components/StarRating';
import VariantSelector from '@/components/VariantSelector';
import WishlistButton from '@/components/WishlistButton';
import RatingBreakdown from '@/components/RatingBreakdown';
import ReviewForm from '@/components/ReviewForm';
import ProductCard from '@/components/ProductCard';
import { fetchProductBySlug, fetchProductReviews, fetchProducts, fetchBrandBySlug, fetchSettings } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([fetchProductBySlug(slug), fetchSettings()]);
  if (!product) return {};
  return buildMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    image: product.thumbnail,
    settings,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const [reviews, { products: pool }, brand, settings] = await Promise.all([
    fetchProductReviews(product._id),
    fetchProducts({ limit: 20 }),
    product.brand ? fetchBrandBySlug(product.brand.slug) : Promise.resolve(null),
    fetchSettings(),
  ]);

  const related = pool.filter((p) => p._id !== product._id).sort(() => Math.random() - 0.5).slice(0, 5);

  const images = Array.from(new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))) as string[];
  const hasDiscount = !!product.comparePrice && product.comparePrice > product.price;
  const save = hasDiscount ? product.comparePrice! - product.price : 0;
  const stockLabel = product.stock === null ? 'In Stock' : product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock';
  const stockColor = product.stock === 0 ? 'text-red-600' : 'text-emerald-600';

  return (
    <div className="mx-auto w-full max-w-[1650px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-[var(--primary)]">Home</Link> <span className="mx-1">›</span>{' '}
        <Link href="/shop" className="hover:text-[var(--primary)]">Products</Link>
      </nav>

      <div className="rounded-[8px] border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={images} name={product.name} />

          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>
              <WishlistButton productId={product._id} className="shrink-0 border border-zinc-200" />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <StarRating value={product.rating || 0} />
              <a href="#reviews" className="text-sm text-zinc-500 hover:text-[var(--primary)] hover:underline">
                {product.numReviews || 0} review{product.numReviews === 1 ? '' : 's'}
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-zinc-100 pb-5">
              <span className="text-3xl font-bold text-[var(--primary)]">৳{product.price.toLocaleString()}</span>
              {hasDiscount && <span className="text-lg text-zinc-400 line-through">৳{product.comparePrice!.toLocaleString()}</span>}
              {hasDiscount && (
                <span className="rounded-[8px] bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                  Save ৳{save.toLocaleString()}
                </span>
              )}
            </div>

            <p className={`mt-4 text-sm font-medium ${stockColor}`}>{stockLabel}</p>

            {product.shortDescription && <p className="mt-3 text-sm text-zinc-600">{product.shortDescription}</p>}

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <VariantSelector variants={product.variants} />
              </div>
            )}

            <div className="mt-6">
              <ProductActions productId={product._id} productName={product.name} price={product.price} stock={product.stock} phone={settings.phone} />
            </div>

            {brand?.logo && (
              <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-5">
                <span className="text-sm font-medium text-zinc-500">Brand:</span>
                <Link href={`/brands/${brand.slug}`} className="block h-8 w-20 overflow-hidden rounded-[8px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="reviews" className="mt-10 scroll-mt-24">
        <ProductTabs description={product.description || ''} reviews={reviews} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <RatingBreakdown rating={product.rating || 0} reviews={reviews} />
        <ReviewForm productId={product._id} />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Related Products</h2>
            <Link href="/shop" className="text-sm font-medium text-[var(--primary)] hover:underline">
              More Products →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
