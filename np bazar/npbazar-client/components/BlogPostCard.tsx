import Link from 'next/link';
import type { BlogPost } from '@/lib/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-zinc-200 bg-white transition-colors duration-300 hover:border-[var(--primary)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-50">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">No Image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 lg:p-5">
        {post.blog && (
          <span className="mb-2 inline-block w-fit rounded-[8px] bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
            {post.blog.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-base lg:text-lg font-bold text-zinc-900 transition-colors group-hover:text-[var(--primary)]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            className="mt-2 line-clamp-2 text-sm text-zinc-500"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-zinc-400">
          {post.author && <span>{post.author}</span>}
          {post.author && <span>•</span>}
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
