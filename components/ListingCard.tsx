import React from 'react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(listing)}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
    >
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