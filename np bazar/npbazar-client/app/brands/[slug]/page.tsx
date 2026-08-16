import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ShopFilters from '@/components/ShopFilters';
import { fetchBrandBySlug, fetchProducts, fetchCollections, fetchBrands, type FetchProductsParams } from '@/lib/api';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    collection?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

const SORT_VALUES = ['newest', 'price_asc', 'price_desc', 'popular', 'rating'];

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { search = '', collection, sort, minPrice, maxPrice } = await searchParams;

  const brand = await fetchBrandBySlug(slug);
  if (!brand) notFound();

  const query: FetchProductsParams = { search: search || undefined, brand: slug, collection };
  if (sort && SORT_VALUES.includes(sort)) query.sort = sort as FetchProductsParams['sort'];
  if (minPrice) query.minPrice = Number(minPrice);
  if (maxPrice) query.maxPrice = Number(maxPrice);

  const [{ products }, collections, brands, priciest] = await Promise.all([
    fetchProducts(query),
    fetchCollections(),
    fetchBrands(),
    fetchProducts({ sort: 'price_desc', limit: 1 }),
  ]);

  const priceCap = Math.max(500, Math.ceil((priciest.products[0]?.price || 0) / 500) * 500);

  return (
    <div className="mx-auto w-full max-w-[1650px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        {brand.name}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{products.length} product{products.length === 1 ? '' : 's'} found</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64 lg:sticky lg:top-[200px] h-max lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
          <div className="lg:rounded-[8px] lg:border lg:border-zinc-200 lg:bg-white lg:p-5">
            <ShopFilters collections={collections.filter((c) => c.isActive)} brands={brands} priceCap={priceCap} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <p className="mt-12 text-center text-sm text-zinc-400">No products found. Try different filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
