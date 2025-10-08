import React, { useState } from 'react';
import { Listing, User } from '../types';
import { useToast } from './Toast';

interface ListingDetailModalProps {
  listing: Listing;
  currentUser: User | null;
  onClose: () => void;
  onStartConversation: (partner: User, listing: Listing) => void;
  // FIX: Changed listingId from number to string to match data type.
  onReportListing: (listingId: string, reason: string) => void;
}

const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing, currentUser, onClose, onStartConversation, onReportListing }) => {
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const { addToast } = useToast();

    const handleStartChat = () => {
        if (!currentUser) {
            addToast('warning', 'مطلوب تسجيل الدخول', 'يرجى تسجيل الدخول لبدء المحادثة.');
            return;
        }
        if (currentUser.id === listing.user.id) {
            addToast('warning', 'لا يمكن', 'لا يمكنك بدء محادثة مع نفسك.');
            return;
        }
        onStartConversation(listing.user, listing);
        onClose();
    }

    const handleReportSubmit = () => {
        if (!reportReason.trim()) {
            addToast('warning', 'حقل مطلوب', 'يرجى كتابة سبب البلاغ.');
            return;
        }
        onReportListing(listing.id, reportReason);
        setIsReporting(false);
        setReportReason("");
        onClose();
        addToast('success', 'تم إرسال البلاغ', 'شكراً لك، تم إرسال بلاغك للإدارة وسنراجعه قريباً.');
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                {isReporting ? (
                    <div className="p-8">
                         <h3 className="text-xl font-bold text-slate-800 mb-4">الإبلاغ عن العرض</h3>
                         <textarea 
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            rows={4} 
                            placeholder="اكتب سبب بلاغك هنا..."
                            className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                         />
                         <div className="flex justify-end items-center gap-4 mt-6">
                             <button onClick={() => setIsReporting(false)} className="text-slate-600 font-semibold hover:bg-slate-100 px-6 py-2.5 rounded-lg transition">إلغاء</button>
                             <button onClick={handleReportSubmit} className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-red-700 transition">إرسال البلاغ</button>
                         </div>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <img src={listing.images[0]} alt={listing.title} className="w-full aspect-[4/5] object-cover rounded-t-2xl" />
                            <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 rounded-full p-2 hover:bg-white transition-transform hover:scale-110">
                                <CloseIcon className="w-6 h-6 text-slate-700" />
                            </button>
                        </div>
                        <div className="p-6 sm:p-8 flex-grow">
                            <p className="text-sm text-purple-600 font-semibold mb-2">{listing.category}</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">{listing.title}</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                            
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-700 mb-2">المقابل المطلوب:</h4>
                                <p className="text-slate-600">{listing.wanted}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <img src={listing.user.avatarUrl} alt={listing.user.name} className="w-12 h-12 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-slate-800">{listing.user.name}</p>
                                    <p className="text-sm text-slate-500">{listing.governorate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                               {currentUser && currentUser.id !== listing.user.id &&
                                <button onClick={() => setIsReporting(true)} className="text-sm text-slate-500 hover:text-red-600 font-semibold">
                                    إبلاغ
                                </button>
                               }
                               <button onClick={handleStartChat} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-transform hover:scale-105 shadow-md w-full sm:w-auto">
                                  بدء المحادثة
                               </button>
                            </div>
                        </div>
                   </>
                )}
            </div>
        </div>
    );
};

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default ListingDetailModal;