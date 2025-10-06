import React, { useState, useEffect, useMemo } from 'react';
import { PageBlock, Listing, BlogPost, User, Page } from '../../types';
import FilterBar from '../FilterBar';
import ListingCard from '../ListingCard';

const SectionHeader: React.FC<{ title: string; onViewAll?: () => void }> = ({ title, onViewAll }) => (
    <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
             <span className="w-1.5 h-7 bg-indigo-400 rounded-full" aria-hidden="true"></span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{title}</h2>
        </div>
        {onViewAll && (
            <button onClick={onViewAll} className="text-sm font-semibold text-slate-500 hover:text-indigo-500 transition">
                عرض الكل
            </button>
        )}
    </div>
);


// --- Hero Widget ---
export const HeroWidget: React.FC<{ title: string; subtitle: string; imageUrl: string }> = ({ title, subtitle, imageUrl }) => (
    <div className="relative bg-gray-800 text-white" style={{ minHeight: '60vh' }}>
        <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center" style={{ minHeight: '60vh' }}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">{title}</h1>
            <p className="text-lg md:text-xl max-w-3xl">{subtitle}</p>
        </div>
    </div>
);

// --- Text Widget ---
export const TextWidget: React.FC<{ content: string }> = ({ content }) => (
    <div className="bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div
                className="prose prose-lg max-w-3xl mx-auto text-slate-700"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    </div>
);

// --- Image Widget ---
export const ImageWidget: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <img src={src} alt={alt} className="max-w-4xl mx-auto rounded-xl shadow-lg" />
        </div>
    </div>
);

// --- Banner Widget ---
export const BannerWidget: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <div className="w-full">
        <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[500px]" />
    </div>
);

// --- Slider Widget ---
interface Slide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

export const SliderWidget: React.FC<{ slides: Slide[] }> = ({ slides = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (slides.length > 1) {
            const timer = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, slides.length]);

    if (!slides || slides.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-[60vh] max-h-[600px] bg-gray-900 overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">{slide.title}</h2>
                        <p className="text-lg md:text-xl max-w-2xl [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">{slide.subtitle}</p>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- Listing List Item (for list view) ---
const ListingListItem: React.FC<{ listing: Listing, onSelect: (listing: Listing) => void }> = ({ listing, onSelect }) => {
    return (
        <div 
            onClick={() => onSelect(listing)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex items-center p-4 gap-4"
        >
            <img 
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
                src={listing.images[0]} 
                alt={listing.title} 
            />
            <div className="flex-grow min-w-0">
                <span className="text-purple-700 bg-purple-100 text-xs font-bold px-2.5 py-1 rounded-full">{listing.category}</span>
                <h3 className="text-lg font-bold text-slate-800 truncate my-2 group-hover:text-purple-600 transition">{listing.title}</h3>
                <div className="flex items-center text-sm text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 me-1.5 text-slate-400 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <span>{listing.governorate}</span>
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center text-center">
                <img src={listing.user.avatarUrl} alt={listing.user.name} className="w-10 h-10 rounded-full object-cover"/>
                <p className="text-sm font-semibold text-slate-700 mt-1 truncate max-w-[80px]">{listing.user.name}</p>
            </div>
        </div>
    );
};


// --- Listings Widget ---
export const ListingsWidget: React.FC<{ title: string; limit: number; category?: string; layout?: 'grid' | 'list'; listings: Listing[]; onSelectListing: (listing: Listing) => void; onNavigate: (page: Page) => void; }> = ({ title, limit, category, layout = 'grid', listings = [], onSelectListing, onNavigate }) => {

    const filteredListings = useMemo(() => {
        return listings
            .filter(listing => listing.status === 'active')
            .filter(listing => category ? listing.category === category : true) // Filter by category
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit || 8);
    }, [listings, limit, category]);

    return (
        <div className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <SectionHeader title={title} onViewAll={() => onNavigate(Page.Listings)} />
                 {filteredListings.length > 0 ? (
                    layout === 'list' ? (
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {filteredListings.map(listing => (
                                <ListingListItem key={listing.id} listing={listing} onSelect={onSelectListing} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {filteredListings.map(listing => (
                                <ListingCard key={listing.id} listing={listing} onSelect={onSelectListing} />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-slate-600">لا توجد عروض تطابق هذه المعايير</h2>
                        <p className="text-slate-500 mt-2">تحقق مرة أخرى قريباً!</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Blog Posts Widget ---
export const BlogPostsWidget: React.FC<{ title: string; limit: number; blogPosts: BlogPost[]; users: User[]; onPostSelect: (postId: number) => void; onNavigate: (page: Page) => void; }> = ({ title, limit, blogPosts = [], users = [], onPostSelect, onNavigate }) => {
    const recentPosts = useMemo(() => {
        return blogPosts.slice(0, limit || 3);
    }, [blogPosts, limit]);

    return (
        <div className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader title={title} onViewAll={() => onNavigate(Page.Blog)} />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {recentPosts.map(post => {
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