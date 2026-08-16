import InfiniteBlogGrid from '@/components/InfiniteBlogGrid';
import { fetchBlogPosts, type FetchBlogPostsParams } from '@/lib/api';

interface Props {
  searchParams: Promise<{ search?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { search = '' } = await searchParams;

  const query: FetchBlogPostsParams = { search: search || undefined, limit: 9 };
  const { posts, pagination } = await fetchBlogPosts(query);

  return (
    <div className="mx-auto w-full max-w-[1650px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        {search ? `Search results for "${search}"` : 'Blog'}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{pagination.total} post{pagination.total === 1 ? '' : 's'} found</p>

      <div className="mt-8">
        <InfiniteBlogGrid initialPosts={posts} initialPages={pagination.pages} queryParams={query} />
      </div>
    </div>
  );
}
