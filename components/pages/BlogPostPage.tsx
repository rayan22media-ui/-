import React from 'react';
import { BlogPost, User } from '../../types';

interface BlogPostPageProps {
  post: BlogPost;
  author: User;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, author }) => {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-base font-semibold text-purple-600 uppercase tracking-wide">{post.category}</p>
            <h1 className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-6 flex items-center justify-center">
              <div className="flex-shrink-0">
                <img className="h-12 w-12 rounded-full object-cover" src={author.avatarUrl} alt={author.name} />
              </div>
              <div className="ms-3">
                <p className="text-sm font-medium text-gray-900">{author.name}</p>
                <div className="flex space-s-1 text-sm text-gray-500">
                  <time dateTime={new Date(post.createdAt).toISOString()}>
                    {new Date(post.createdAt).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img className="w-full h-auto max-h-96 object-cover rounded-xl shadow-lg" src={post.featuredImage} alt={post.title} />
          </div>

          {/* Post Content */}
          <article
            className="prose prose-lg prose-indigo mx-auto text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">الوسوم:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;