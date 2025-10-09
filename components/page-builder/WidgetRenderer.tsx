import React from 'react';
import { PageBlock, Listing, BlogPost, User, Page } from '../../types';
import { HeroWidget, TextWidget, ImageWidget, BannerWidget, SliderWidget, ListingsWidget, BlogPostsWidget } from './widgets';

interface WidgetRendererProps {
  block: PageBlock;
  listings?: Listing[];
  blogPosts?: BlogPost[];
  users?: User[];
  categories?: string[];
  onSelectListing?: (listing: Listing) => void;
  // FIX: Changed postId from number to string to match data type.
  onPostSelect?: (postId: string) => void;
  onNavigate?: (page: Page, params?: any) => void;
  isListingSaved?: (listingId: string) => boolean;
  onToggleSave?: (listingId: string) => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ block, listings, blogPosts, users, onSelectListing, onPostSelect, onNavigate, isListingSaved, onToggleSave }) => {
  switch (block.type) {
    case 'hero':
      return <HeroWidget title={block.props.title} subtitle={block.props.subtitle} imageUrl={block.props.imageUrl} />;
    case 'text':
      return <TextWidget content={block.props.content} />;
    case 'image':
      return <ImageWidget src={block.props.src} alt={block.props.alt} />;
    case 'banner':
      return <BannerWidget src={block.props.src} alt={block.props.alt} />;
    case 'slider':
      return <SliderWidget slides={block.props.slides} />;
    case 'listings':
      if (!listings || !onSelectListing || !onNavigate || !isListingSaved || !onToggleSave) return null;
      return <ListingsWidget
                title={block.props.title}
                limit={block.props.limit}
                category={block.props.category}
                layout={block.props.layout}
                listings={listings}
                onSelectListing={onSelectListing}
                onNavigate={onNavigate}
                isListingSaved={isListingSaved}
                onToggleSave={onToggleSave}
             />;
    case 'blogPosts':
      if (!blogPosts || !users || !onPostSelect || !onNavigate) return null;
      return <BlogPostsWidget
                title={block.props.title}
                limit={block.props.limit}
                blogPosts={blogPosts}
                users={users}
                onPostSelect={onPostSelect}
                onNavigate={onNavigate}
            />;
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return (
        <div className="container mx-auto p-4 my-4 bg-red-100 border border-red-500 text-red-700 rounded-lg">
          مكعب غير معروف: "{block.type}"
        </div>
      );
  }
};

export default WidgetRenderer;