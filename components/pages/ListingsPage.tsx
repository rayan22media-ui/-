import React, { useState, useMemo } from 'react';
import { Listing } from '../../types';
import FilterBar from '../FilterBar';
import ListingCard from '../ListingCard';

interface ListingsPageProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  categories: string[];
  isListingSaved: (listingId: string) => boolean;
  onToggleSave: (listingId: string) => void;
}

const ListingsPage: React.FC<ListingsPageProps> = ({ listings, onSelectListing, categories, isListingSaved, onToggleSave }) => {
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
    <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">تصفح كل العروض</h1>
                <FilterBar
                  setSearchTerm={setSearchTerm}
                  setSelectedGovernorate={setSelectedGovernorate}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                />
            </div>
      
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredListings.map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    onSelect={onSelectListing} 
                    isSaved={isListingSaved(listing.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-600">لا توجد نتائج تطابق بحثك</h2>
                <p className="text-slate-500 mt-2">حاول تغيير كلمات البحث أو الفلاتر.</p>
              </div>
            )}
        </div>
    </div>
  );
};

export default ListingsPage;