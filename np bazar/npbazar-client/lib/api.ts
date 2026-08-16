// The API base URL must come from the environment (.env.local) — never hardcode it here.
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to .env.local (see .env.example).');
}
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  parent?: { _id: string; name: string; slug: string } | string | null;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ShippingZone {
  _id: string;
  name: string;
  city: string;
  shippingCost: number;
  freeShippingThreshold: number;
  isActive: boolean;
}

export async function fetchShippingZones(): Promise<ShippingZone[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping-zones`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.zones || [];
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return [];
  }
}

export async function fetchCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/collections?all=true`, {
      cache: 'no-store', // Always fetch fresh to be fully dynamic
    });

    if (!res.ok) {
      console.error('Failed to fetch collections');
      return [];
    }

    const data = await res.json();
    return data.collections || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function fetchCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/collections/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.collection || null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export interface StoreSettings {
  storeName: string;
  logo?: string;
  favicon?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency: string;
  currencySymbol: string;
  shippingCost: number;
  freeShippingThreshold: number;
  /** Storefront theme colors (hex strings), editable from admin Settings → Appearance. */
  buttonColor?: string;
  primaryColor?: string;
  navbarColor?: string;
  backgroundColor?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  /** Third-party tracking/verification codes, rendered by the root layout. */
  trackingCodes?: {
    ga4MeasurementId?: string;
    gtmContainerId?: string;
    metaPixelId?: string;
    searchConsoleVerification?: string;
    bingVerification?: string;
    customHeadCode?: string;
  };
  aboutUs?: string;
  contactUs?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  /** Site-wide SEO/social-share defaults, plus per-static-page overrides. */
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    /** Social share (Open Graph/Twitter) image — falls back to `logo` when empty. */
    ogImage?: string;
    pages?: Partial<Record<'home' | 'about' | 'contact' | 'privacyPolicy' | 'refundPolicy', { title?: string; description?: string }>>;
  };
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Ecomus',
  currency: 'BDT',
  currencySymbol: '৳',
  shippingCost: 0,
  freeShippingThreshold: 0,
  buttonColor: '#f97316',
  primaryColor: '#df0000',
  navbarColor: '#0b2221',
  backgroundColor: '#fbf9f5',
};

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      cache: 'no-store', // Always fetch fresh so admin changes show up immediately
    });

    if (!res.ok) {
      console.error('Failed to fetch settings');
      return DEFAULT_SETTINGS;
    }

    const data = await res.json();
    return data.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export type BannerPlacement = 'hero_slider' | 'hero_side' | 'home_bottom';

export interface Banner {
  _id: string;
  placement: BannerPlacement;
  image: string;
  /** Optional alternate image shown on small screens instead of `image`. */
  mobileImage?: string;
  link?: string;
  title?: string;
  order: number;
  isActive: boolean;
}

export async function fetchBanners(placement: BannerPlacement): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners?placement=${placement}`, {
      cache: 'no-store', // Always fetch fresh so admin changes show up immediately
    });

    if (!res.ok) {
      console.error('Failed to fetch banners');
      return [];
    }

    const data = await res.json();
    return data.banners || [];
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands`, {
      cache: 'no-store', // Always fetch fresh so admin changes show up immediately
    });

    if (!res.ok) {
      console.error('Failed to fetch brands');
      return [];
    }

    const data = await res.json();
    return data.brands || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.brand || null;
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  thumbnail?: string;
  /** null = unlimited stock. */
  stock: number | null;
  sold?: number;
  isFeatured?: boolean;
  isBestSelling?: boolean;
}

export interface FetchProductsParams {
  search?: string;
  collection?: string;
  brand?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  featured?: boolean;
  bestSelling?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
}

export interface ProductsResult {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const EMPTY_PRODUCTS: ProductsResult = { products: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } };

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductsResult> {
  try {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.collection) qs.set('collection', params.collection);
    if (params.brand) qs.set('brand', params.brand);
    if (params.sort) qs.set('sort', params.sort);
    if (params.featured) qs.set('featured', 'true');
    if (params.bestSelling) qs.set('bestSelling', 'true');
    if (params.minPrice) qs.set('minPrice', String(params.minPrice));
    if (params.maxPrice) qs.set('maxPrice', String(params.maxPrice));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.page) qs.set('page', String(params.page));

    const res = await fetch(`${API_BASE_URL}/products?${qs.toString()}`, {
      cache: 'no-store', // Always fetch fresh so new/edited products show up immediately
    });

    if (!res.ok) {
      console.error('Failed to fetch products');
      return EMPTY_PRODUCTS;
    }

    const data = await res.json();
    return { products: data.products || [], pagination: data.pagination || EMPTY_PRODUCTS.pagination };
  } catch (error) {
    console.error('Error fetching products:', error);
    return EMPTY_PRODUCTS;
  }
}

export interface VariantOption {
  value: string;
  price?: number | null;
  images?: string[];
}

export interface Variant {
  name: string;
  options: VariantOption[];
}

export interface ProductDetail extends Product {
  description?: string;
  images?: string[];
  variants?: Variant[];
  rating?: number;
  numReviews?: number;
  brand?: { _id: string; name: string; slug: string } | null;
  collections?: { _id: string; name: string; slug: string }[];
  seoTitle?: string;
  seoDescription?: string;
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.product || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  blog: { _id: string; name: string; slug: string } | null;
  author?: string;
  tags: string[];
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface FetchBlogPostsParams {
  blog?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export interface BlogPostsResult {
  posts: BlogPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const EMPTY_BLOG_POSTS: BlogPostsResult = { posts: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } };

export async function fetchBlogPosts(params: FetchBlogPostsParams = {}): Promise<BlogPostsResult> {
  try {
    const qs = new URLSearchParams();
    if (params.blog) qs.set('blog', params.blog);
    if (params.search) qs.set('search', params.search);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.page) qs.set('page', String(params.page));

    const res = await fetch(`${API_BASE_URL}/blog-posts?${qs.toString()}`, {
      cache: 'no-store', // Always fetch fresh so new/edited posts show up immediately
    });

    if (!res.ok) {
      console.error('Failed to fetch blog posts');
      return EMPTY_BLOG_POSTS;
    }

    const data = await res.json();
    return { posts: data.posts || [], pagination: data.pagination || EMPTY_BLOG_POSTS.pagination };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return EMPTY_BLOG_POSTS;
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog-posts/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.post || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: { name: string } | null;
  createdAt: string;
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export interface CouponValidateItem {
  productId: string;
  quantity: number;
  variant?: Record<string, string>;
}

export interface CouponFreeGift {
  productId: string;
  name: string;
  thumbnail?: string;
  quantity: number;
}

export interface CouponDiscountedLine {
  productId: string;
  quantity: number;
  free: boolean;
}

export interface CouponValidateResult {
  coupon: { code: string; discountType: string };
  discount: number;
  freeShipping: boolean;
  freeGift: CouponFreeGift | null;
  /** Already-in-cart product(s) the discount landed on — shows as "Free" on that line. */
  discountedLines: CouponDiscountedLine[];
  total: number;
}

// Throws with the backend's user-facing message (invalid code, expired,
// minimum order not met, usage limit reached, no eligible items, etc.).
export async function validateCoupon(code: string, items: CouponValidateItem[]): Promise<CouponValidateResult> {
  const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, items }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Could not apply coupon');
  }
  return {
    coupon: data.coupon,
    discount: data.discount,
    freeShipping: data.freeShipping,
    freeGift: data.freeGift || null,
    discountedLines: data.discountedLines || [],
    total: data.total,
  };
}

export interface PaymentGatewayOption {
  key: string;
  label: string;
}

export async function fetchActivePaymentGateways(): Promise<PaymentGatewayOption[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/payment-gateways/active`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.gateways || [];
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return [];
  }
}
