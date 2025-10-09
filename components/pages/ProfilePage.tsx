import React from 'react';
import { User, Listing } from '../../types';
import ListingCard from '../ListingCard'; // Re-using the styled card

interface ProfilePageProps {
  currentUser: User;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  isListingSaved: (listingId: string) => boolean;
  onToggleSave: (listingId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, listings, onSelectListing, isListingSaved, onToggleSave }) => {
  const userListings = listings.filter(listing => listing.userId === currentUser.id);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center">
          <img className="w-28 h-28 rounded-full object-cover mb-4 sm:mb-0 sm:me-8 border-4 border-purple-200 shadow-md" src={currentUser.avatarUrl} alt={currentUser.name} />
          <div className="text-center sm:text-right">
            <h1 className="text-3xl font-bold text-slate-800">{currentUser.name}</h1>
            <p className="text-slate-500 mt-2">{currentUser.email}</p>
            <p className="text-slate-500 mt-1 flex items-center justify-center sm:justify-start">
              <LocationIcon className="w-4 h-4 me-1 text-slate-400" />
              {currentUser.governorate}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-6">عروضي ({userListings.length})</h2>
        {userListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userListings.map(listing => (
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
            <h2 className="text-xl font-bold text-slate-600">لم تقم بإضافة أي عروض بعد</h2>
            <p className="text-slate-500 mt-2">عندما تضيف عرضًا للمقايضة، سيظهر هنا.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export default ProfilePage;