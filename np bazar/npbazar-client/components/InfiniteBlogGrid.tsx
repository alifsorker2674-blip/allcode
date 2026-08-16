'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import BlogPostCard from './BlogPostCard';
import { BlogPost, FetchBlogPostsParams, API_BASE_URL } from '@/lib/api';
import { FiLoader } from 'react-icons/fi';

interface Props {
  initialPosts: BlogPost[];
  initialPages: number;
  queryParams: FetchBlogPostsParams;
}

export default function InfiniteBlogGrid({ initialPosts, initialPages, queryParams }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPages > 1);

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPages > 1);
  }, [initialPosts, initialPages]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const qs = new URLSearchParams();
      if (queryParams.blog) qs.set('blog', queryParams.blog);
      if (queryParams.search) qs.set('search', queryParams.search);
      if (queryParams.limit) qs.set('limit', String(queryParams.limit));
      qs.set('page', String(nextPage));

      const res = await fetch(`${API_BASE_URL}/blog-posts?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setPosts((prev) => {
        const newItems = data.posts.filter((p: BlogPost) => !prev.some((existing) => existing._id === p._id));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(nextPage < data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, queryParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loadMore]);

  return (
    <div className="w-full">
      {posts.length === 0 ? (
        <p className="mt-12 text-center text-sm text-zinc-400">No blog posts found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={loaderRef} className="mt-12 flex items-center justify-center py-6">
          <FiLoader className="animate-spin text-zinc-400" size={24} />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="mt-12 text-center text-sm text-zinc-400 py-6 border-t border-zinc-100">
          You have reached the end.
        </p>
      )}
    </div>
  );
}
