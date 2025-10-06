import React, { useState, useMemo } from 'react';
import { Listing, BlogPost, Page } from '../../types';
import FilterBar from '../FilterBar';
import ListingCard from '../ListingCard';

interface HomePageProps {
  listings: Listing[];
  blogPosts: BlogPost[];
  onSelectListing: (listing: Listing) => void;
  onPostSelect: (postId: number) => void;
  onNavigate: (page: Page) => void;
  categories: string[];
}

const Hero: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
        قايض ما لا تحتاج بما تحتاجه
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        "وين للمقايضة" هي منصتك الأولى في سوريا لتبادل الأغراض بكل سهولة وأمان.
      </p>
      <div className="mt-8 max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  </div>
);

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

const RecentBlogPosts: React.FC<{ posts: BlogPost[], onPostSelect: (id: number) => void, onNavigateToBlog: () => void }> = ({ posts, onPostSelect, onNavigateToBlog }) => {
    const recentPosts = posts.slice(0, 3);
    if (recentPosts.length === 0) return null;

    return (
        <div className="py-16 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader title="أحدث المقالات" onViewAll={onNavigateToBlog} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recentPosts.map(post => (
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
                    ))}
                </div>
            </div>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ listings, blogPosts, onSelectListing, onPostSelect, onNavigate, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredListings = useMemo(() => {
    return listings
      .filter(listing => listing.status === 'active')
      .filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(listing =>
        selectedGovernorate ? listing.governorate === selectedGovernorate : true
      )
      .filter(listing =>
        selectedCategory ? listing.category === selectedCategory : true
      );
  }, [listings, searchTerm, selectedGovernorate, selectedCategory]);

  return (
    <>
      <Hero>
        <FilterBar
          setSearchTerm={setSearchTerm}
          setSelectedGovernorate={setSelectedGovernorate}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
      </Hero>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="أحدث العروض" onViewAll={() => onNavigate(Page.Listings)} />
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} onSelect={onSelectListing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-slate-600">لا توجد نتائج تطابق بحثك</h2>
            <p className="text-slate-500 mt-2">حاول تغيير كلمات البحث أو الفلاتر.</p>
          </div>
        )}
      </div>

       <RecentBlogPosts 
        posts={blogPosts}
        onPostSelect={onPostSelect}
        onNavigateToBlog={() => onNavigate(Page.Blog)}
      />
    </>
  );
};

export default HomePage;
