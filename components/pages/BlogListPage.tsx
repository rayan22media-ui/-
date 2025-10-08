import React from 'react';
import { BlogPost, User } from '../../types';

interface BlogListPageProps {
  posts: BlogPost[];
  users: User[];
  // FIX: Changed postId from number to string to match data type.
  onPostSelect: (postId: string) => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ posts, users, onPostSelect }) => {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">مدونة </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">نصائح، أخبار، وقصص نجاح لمساعدتك في الحصول على أفضل تجربة مقايضة.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => {
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => onPostSelect(post.id)}
                                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                            >
                                <div className="aspect-video w-full bg-slate-200">
                                    <img className="w-full h-full object-cover" src={post.featuredImage} alt={post.title} />
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <p className="text-sm text-slate-500">
                                       {new Date(post.createdAt).toLocaleDateString('ar-SY', { month: 'long', year: 'numeric' })}
                                    </p>
                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-600 transition mt-2 flex-grow">
                                        {post.title}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BlogListPage;