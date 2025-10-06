import React, { useState, useMemo } from 'react';
import { Listing, User } from '../../types';
import FilterBar from '../FilterBar';
import ListingCard from '../ListingCard';

interface HomePageProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  // FIX: Added categories to props to be passed to FilterBar.
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


const HomePage: React.FC<HomePageProps> = ({ listings, onSelectListing, categories }) => {
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
          // FIX: Pass the categories prop to FilterBar.
          categories={categories}
        />
      </Hero>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
    </>
  );
};

export default HomePage;