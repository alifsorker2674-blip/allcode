import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BlogPostCard from '@/components/BlogPostCard';
import { fetchBlogPostBySlug, fetchBlogPosts, fetchSettings } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([fetchBlogPostBySlug(slug), fetchSettings()]);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.image,
    settings,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) notFound();

  const { posts: pool } = await fetchBlogPosts({ blog: post.blog?._id, limit: 20 });
  const related = pool.filter((p) => p._id !== post._id).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[900px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-[var(--primary)]">Home</Link> <span className="mx-1">›</span>{' '}
        <Link href="/blog" className="hover:text-[var(--primary)]">Blog</Link>
      </nav>

      <article className="rounded-[8px] border border-zinc-200 bg-white p-6 sm:p-8">
        {post.blog && (
          <span className="mb-3 inline-block w-fit rounded-[8px] bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
            {post.blog.name}
          </span>
        )}

        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{post.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          {post.author && <span>{post.author}</span>}
          {post.author && <span>•</span>}
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {post.image && (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-[8px] bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-zinc mt-8 max-w-none prose-img:rounded-[8px] prose-a:text-[var(--primary)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-zinc-100 pt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-[8px] border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Related Posts</h2>
            <Link href="/blog" className="text-sm font-medium text-[var(--primary)] hover:underline">
              View All Posts →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {related.map((p) => (
              <BlogPostCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
