import React from 'react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isSaved: boolean;
  onToggleSave: (listingId: string) => void;
}

const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement> & { isFilled: boolean }> = ({ isFilled, ...props }) => {
    if (isFilled) {
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.082l-7.805 3.588A.75.75 0 013 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>;
};

const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect, isSaved, onToggleSave }) => {
  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    onToggleSave(listing.id);
  };
  
  return (
    <div 
      onClick={() => onSelect(listing)}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative"
    >
      <button 
        onClick={handleToggleSave}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors duration-200 ${isSaved ? 'bg-purple-600 text-white' : 'bg-white/70 text-slate-600 backdrop-blur-sm hover:bg-white'}`}
        aria-label={isSaved ? 'إلغاء حفظ العرض' : 'حفظ العرض'}
      >
        <BookmarkIcon className="w-5 h-5" isFilled={isSaved} />
      </button>

      {/* Image */}
      <div className="aspect-square w-full bg-slate-200">
        <img 
          className="w-full h-full object-cover" 
          src={listing.images[0]} 
          alt={listing.title} 
        />
      </div>
      
      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-600 transition truncate">
            {listing.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mt-2 h-10 overflow-hidden">
            {listing.description}
        </p>
        
        {/* Wanted Section */}
        <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-1">المقابل المطلوب:</p>
            <p className="text-sm text-slate-700 font-semibold truncate">{listing.wanted}</p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex justify-between items-center">
            {/* Owner Info */}
            <div className="flex items-center gap-2 min-w-0">
                <img className="w-8 h-8 rounded-full object-cover flex-shrink-0" src={listing.user.avatarUrl} alt={listing.user.name} />
                <span className="text-sm font-semibold text-slate-700 truncate">{listing.user.name}</span>
            </div>
            {/* More Details Link */}
            <span className="text-sm font-bold text-purple-600 flex-shrink-0">
                المزيد
            </span>
        </div>
      </div>
    </div>
  );
};


export default ListingCard;
