import React, { useMemo } from 'react';
import { Listing, User } from '../../types';
import ListingCard from '../ListingCard';

interface SavedListingsPageProps {
  currentUser: User;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  isListingSaved: (listingId: string) => boolean;
  onToggleSave: (listingId: string) => void;
}

const SavedListingsPage: React.FC<SavedListingsPageProps> = ({ currentUser, listings, onSelectListing, isListingSaved, onToggleSave }) => {
  const savedListings = useMemo(() => {
    const savedIds = new Set(currentUser.savedListings || []);
    return listings.filter(listing => savedIds.has(listing.id));
  }, [currentUser.savedListings, listings]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">العروض المحفوظة</h1>
      {savedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedListings.map(listing => (
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
          <h2 className="text-xl font-bold text-slate-600">لم تقم بحفظ أي عروض بعد</h2>
          <p className="text-slate-500 mt-2">عندما تجد عرضًا يعجبك، اضغط على أيقونة الحفظ لإضافته هنا.</p>
        </div>
      )}
    </div>
  );
};

export default SavedListingsPage;
