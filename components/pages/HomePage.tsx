import React, { useState, useMemo } from 'react';
import { Listing, BlogPost, Page } from '../../types';
import FilterBar from '../FilterBar';
import ListingCard from '../ListingCard';

interface HomePageProps {
  listings: Listing[];
  blogPosts: BlogPost[];
  onSelectListing: (listing: Listing) => void;
  // FIX: Changed postId to string to match the data type.
  onPostSelect: (postId: string) => void;
  onNavigate: (page: Page) => void;
  categories: string[];
}

const Hero: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative isolate pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Background Gradient & Shapes */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-slate-100 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#6366f1] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight">
                قايض ما لا تحتاج بما <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">تحتاجه</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
                "وين للمقايضة" هي منصتك الأولى في سوريا لتبادل الأغراض بكل سهولة وأمان.
            </p>
            <div className="mt-10 flex justify-center">
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

// FIX: Changed id to string to match the data type.
const RecentBlogPosts: React.FC<{ posts: BlogPost[], onPostSelect: (id: string) => void, onNavigateToBlog: () => void }> = ({ posts, onPostSelect, onNavigateToBlog }) => {
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