import ShopFilters from '@/components/ShopFilters';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { fetchProducts, fetchCollections, fetchBrands, type FetchProductsParams } from '@/lib/api';

interface Props {
  searchParams: Promise<{
    search?: string;
    collection?: string;
    brand?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

const SORT_VALUES = ['newest', 'price_asc', 'price_desc', 'popular', 'rating'];

export default async function ShopPage({ searchParams }: Props) {
  const { search = '', collection, brand, sort, minPrice, maxPrice } = await searchParams;

  const query: FetchProductsParams = { search: search || undefined, collection, brand };
  if (sort && SORT_VALUES.includes(sort)) query.sort = sort as FetchProductsParams['sort'];
  if (minPrice) query.minPrice = Number(minPrice);
  if (maxPrice) query.maxPrice = Number(maxPrice);

  const [{ products, pagination }, collections, brands, priciest] = await Promise.all([
    fetchProducts(query),
    fetchCollections(),
    fetchBrands(),
    fetchProducts({ sort: 'price_desc', limit: 1 }),
  ]);

  // Slider upper bound: highest catalog price rounded up to the next 500.
  const priceCap = Math.max(500, Math.ceil((priciest.products[0]?.price || 0) / 500) * 500);

  return (
    <div className="mx-auto w-full max-w-[1650px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        {search ? `Search results for "${search}"` : 'All Products'}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{pagination.total} product{pagination.total === 1 ? '' : 's'} found</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64 lg:sticky lg:top-[200px] h-max lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
          <div className="lg:rounded-[8px] lg:border lg:border-zinc-200 lg:bg-white lg:p-5">
            <ShopFilters collections={collections} brands={brands} priceCap={priceCap} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <InfiniteProductGrid
            initialProducts={products}
            initialPages={pagination.pages}
            queryParams={query}
          />
        </div>
      </div>
    </div>
  );
}
