import Hero from '@/components/Hero';
import FeaturedCategories from '@/components/FeaturedCategories';
import FeaturedBrands from '@/components/FeaturedBrands';
import TopSellingProducts from '@/components/TopSellingProducts';
import ProductGridSection from '@/components/ProductGridSection';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { fetchBanners, fetchCollections, fetchBrands, fetchProducts } from '@/lib/api';

export default async function Home() {
  const [sliderBanners, sideBanners, collections, brands, topSelling, featuredProducts, allProducts] = await Promise.all([
    fetchBanners('hero_slider'),
    fetchBanners('hero_side'),
    fetchCollections(),
    fetchBrands(),
    fetchProducts({ bestSelling: true, limit: 10 }),
    fetchProducts({ featured: true, limit: 8 }),
    fetchProducts({ sort: 'newest', limit: 12 }),
  ]);

  const activeCategories = collections.filter((c) => c.isActive);

  return (
    <div className="flex flex-col flex-1 pb-16">
      <Hero sliderBanners={sliderBanners} sideBanner={sideBanners[0] || null} />
      <main className="mx-auto mt-12 w-full max-w-[1650px] px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-zinc-900">Featured Categories</h1>
        <FeaturedCategories categories={activeCategories} />
      </main>
      <TopSellingProducts products={topSelling.products} />

      <div className="mx-auto mt-12 w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-zinc-900">Featured Brands</h2>
        <FeaturedBrands brands={brands} />
      </div>

      <ProductGridSection title="Featured Products" products={featuredProducts.products} viewAllHref="/featured" />
      
      <div className="mx-auto mt-12 w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-900">All Products</h2>
        </div>
        <InfiniteProductGrid 
          initialProducts={allProducts.products} 
          initialPages={allProducts.pagination.pages} 
          queryParams={{ sort: 'newest', limit: 12 }} 
        />
      </div>
    </div>
  );
}
