import React from 'react';
import { ListingData } from '../../types';
import ListingForm from '../ListingForm';

interface AddListingPageProps {
  onAddListing: (listing: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  categories: string[];
}

const AddListingPage: React.FC<AddListingPageProps> = ({ onAddListing, categories }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">إضافة عرض جديد</h1>
        <ListingForm 
            onSave={onAddListing}
            categories={categories}
            submitButtonText="إضافة العرض"
        />
      </div>
    </div>
  );
};


export default AddListingPage;