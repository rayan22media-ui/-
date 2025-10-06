import React from 'react';
import { PageContent, Listing, BlogPost, User, Page } from '../../types';
import WidgetRenderer from '../page-builder/WidgetRenderer';

interface ContentPageProps {
  page: PageContent;
  listings?: Listing[];
  blogPosts?: BlogPost[];
  users?: User[];
  categories?: string[];
  onSelectListing?: (listing: Listing) => void;
  onPostSelect?: (postId: number) => void;
  onNavigate?: (page: Page, params?: any) => void;
}

const ContentPage: React.FC<ContentPageProps> = ({ page, listings, blogPosts, users, categories, onSelectListing, onPostSelect, onNavigate }) => {
  return (
    <div className="bg-white">
        {page.content && page.content.length > 0 ? (
            page.content.map(block => <WidgetRenderer
                key={block.id}
                block={block}
                listings={listings}
                blogPosts={blogPosts}
                users={users}
                categories={categories}
                onSelectListing={onSelectListing}
                onPostSelect={onPostSelect}
                onNavigate={onNavigate}
            />)
        ) : (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
                    {page.title}
                </h1>
                <p className="text-lg text-slate-500">لا يوجد محتوى لهذه الصفحة بعد.</p>
            </div>
        )}
    </div>
  );
};

export default ContentPage;