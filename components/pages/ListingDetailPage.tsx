import React, { useState } from 'react';
import { Listing, User, Page, ListingData } from '../../types';
import { useToast } from '../Toast';
import ListingCard from '../ListingCard';
import ListingForm from '../ListingForm';

interface ListingDetailPageProps {
  listing: Listing;
  allListings: Listing[];
  currentUser: User | null;
  onBack: () => void;
  onStartConversation: (partner: User, listing: Listing) => void;
  onReportListing: (listingId: string, reason: string) => void;
  onSelectUserListing: (listing: Listing) => void;
  onUpdateStatus: (listingId: string, status: Listing['status']) => void;
  onUpdateListing: (listingId: string, data: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  categories: string[];
  isSaved: boolean;
  onToggleSave: (listingId: string) => void;
}

// --- Helper Functions ---
const getInitials = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// --- Icon Components ---
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
const LocationIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>;
const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.042.586.042h1.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5c0 .621.258 1.186.686 1.586m10.533-3.086a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5c0 .621.258 1.186.686 1.586m13.314-5.872a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5c0 .621.258 1.186.686 1.586m-10.533 3.086a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5c0 .621.258 1.186.686 1.586m13.314-5.872c-.195-.025-.39-.042-.586-.042h-1.5a2.25 2.25 0 00-2.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v1.5c0 .621.258 1.186.686 1.586" /></svg>;
const FlagIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>;
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement> & { isFilled: boolean }> = ({ isFilled, ...props }) => {
    if (isFilled) {
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.082l-7.805 3.588A.75.75 0 013 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>;
};

const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listing, allListings, currentUser, onBack, onStartConversation, onReportListing, onSelectUserListing, onUpdateStatus, onUpdateListing, categories, isSaved, onToggleSave }) => {
    const { addToast } = useToast();
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const isOwner = currentUser?.id === listing.userId;
    
    const otherListingsFromUser = allListings.filter(
        l => l.userId === listing.userId && l.id !== listing.id && l.status === 'active'
    ).slice(0, 2);

    const handleStartChat = () => {
        if (!currentUser) {
            addToast('warning', 'مطلوب تسجيل الدخول', 'يرجى تسجيل الدخول لبدء المحادثة.');
            return;
        }
        if (currentUser.id === listing.userId) {
            addToast('warning', 'لا يمكن', 'لا يمكنك بدء محادثة مع نفسك.');
            return;
        }
        onStartConversation(listing.user, listing);
    };
    
    const handleReportClick = () => {
        if (!currentUser) {
            addToast('warning', 'مطلوب تسجيل الدخول', 'يرجى تسجيل الدخول للإبلاغ.');
            return;
        }
        setShowReportForm(true);
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportReason.trim()) {
            addToast('warning', 'حقل مطلوب', 'يرجى كتابة سبب البلاغ.');
            return;
        }
        onReportListing(listing.id, reportReason);
        setShowReportForm(false);
        setReportReason('');
    };
    
    const handleShare = () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?page=${Page.ListingDetail}&listingId=${listing.id}`;

        if (navigator.share) {
            navigator.share({
                title: listing.title,
                text: `شاهد هذا العرض على وين للمقايضة: ${listing.title}`,
                url: shareUrl,
            }).catch(error => console.log('Error sharing:', error));
        } else {
            navigator.clipboard.writeText(shareUrl);
            addToast('info', 'تم نسخ الرابط', 'تم نسخ رابط الصفحة إلى الحافظة.');
        }
    };

    const handleConfirmToggleTradeStatus = () => {
        const newStatus = listing.status === 'traded' ? 'active' : 'traded';
        onUpdateStatus(listing.id, newStatus);
        setShowConfirmModal(false);
    };

    const UserAvatar: React.FC<{ user: User }> = ({ user }) => (
        <div className="relative w-20 h-20">
            {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{getInitials(user.name)}</span>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <header className="flex justify-end mb-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-semibold hover:text-purple-600 transition group">
                        <span>عودة</span>
                        <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    </button>
                </header>
                
                <main className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative">
                                <img src={listing.images[0]} alt={listing.title} className="w-full aspect-[16/10] object-cover" />
                                <span className="absolute top-4 right-4 bg-white/90 text-slate-700 text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">{listing.category}</span>
                            </div>
                            <div className="p-6 md:p-8">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">{listing.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 mt-4 text-sm">
                                    <div className="flex items-center gap-2"><LocationIcon className="w-4 h-4 text-slate-400" /> {listing.governorate}</div>
                                    <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400" /> {formatDate(new Date(listing.createdAt))}</div>
                                </div>
                                <hr className="my-6" />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-700 mb-2">الوصف</h2>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                                </div>
                                <div className="mt-8 p-5 bg-purple-50 rounded-xl">
                                    <h3 className="text-lg font-bold text-purple-800 mb-1">يريد مقابله:</h3>
                                    <p className="text-purple-700 font-medium">{listing.wanted}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 space-y-6 order-1 lg:order-2 mb-8 lg:mb-0">
                        {/* User Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <div className="flex justify-center mb-4"><UserAvatar user={listing.user} /></div>
                            <h3 className="text-xl font-bold text-slate-800">{listing.user.name}</h3>
                            {isOwner ? (
                                <p className="text-sm text-slate-500 mt-1">هذا هو عرضك</p>
                            ) : (
                                <p className="text-sm text-yellow-500 font-semibold mt-1">⭐ 5 تقييم</p>
                            )}
                             {isOwner ? (
                                <div className="mt-6 space-y-2">
                                    <h4 className="font-bold text-slate-700">إدارة العرض</h4>
                                    
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        تعديل العرض
                                    </button>
                                    
                                    {(listing.status === 'active' || listing.status === 'traded') && (
                                        <button
                                            onClick={() => setShowConfirmModal(true)}
                                            className={`w-full text-white font-bold py-3 px-5 rounded-lg transition ${
                                                listing.status === 'traded'
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                        >
                                            {listing.status === 'traded' ? 'إعادة تفعيل العرض' : 'تحديد كـ "تمت المقايضة"'}
                                        </button>
                                    )}

                                    {listing.status === 'pending' && <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">هذا العرض قيد المراجعة حالياً.</p>}
                                    {listing.status === 'deleted' && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">تم رفض هذا العرض من قبل الإدارة.</p>}
                                </div>
                            ) : (
                                <>
                                    <button onClick={handleStartChat} className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                                        <MessageIcon className="w-5 h-5"/>
                                        <span>إرسال طلب مقايضة</span>
                                    </button>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={handleShare} className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition flex items-center justify-center gap-2"><ShareIcon className="w-4 h-4"/>مشاركة</button>
                                        <button onClick={() => onToggleSave(listing.id)} className={`w-full bg-white border border-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition flex items-center justify-center gap-2 ${isSaved ? 'text-purple-600' : 'text-slate-700'}`}>
                                            <BookmarkIcon className="w-4 h-4" isFilled={isSaved} />
                                            {isSaved ? 'تم الحفظ' : 'حفظ'}
                                        </button>
                                        <button onClick={handleReportClick} className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition flex items-center justify-center gap-2"><FlagIcon className="w-4 h-4"/>إبلاغ</button>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Report Form */}
                        {showReportForm && (
                           <div className="bg-white rounded-2xl shadow-lg p-6">
                                <form onSubmit={handleReportSubmit}>
                                    <h4 className="font-bold text-slate-700 mb-2">سبب الإبلاغ</h4>
                                    <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} rows={3} className="w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" required></textarea>
                                    <div className="flex gap-2 mt-3">
                                        <button type="button" onClick={() => setShowReportForm(false)} className="w-full bg-slate-100 text-slate-700 font-semibold py-2 rounded-lg">إلغاء</button>
                                        <button type="submit" className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg">إرسال</button>
                                    </div>
                                </form>
                           </div>
                        )}

                        {/* Safety Tips Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">نصائح للمقايضة الآمنة</h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" /><span>تحقق من حالة الغرض قبل المقايضة.</span></li>
                                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" /><span>التقِ في مكان عام وآمن.</span></li>
                                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" /><span>لا تشارك معلومات شخصية حساسة.</span></li>
                            </ul>
                        </div>
                        
                        {/* More from this user */}
                        {otherListingsFromUser.length > 0 && (
                             <div className="bg-transparent rounded-2xl">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">عروض أخرى من {listing.user.name.split(' ')[0]}</h3>
                                <div className="space-y-4">
                                  {otherListingsFromUser.map(item => (
                                      <ListingCard 
                                        key={item.id} 
                                        listing={item} 
                                        onSelect={onSelectUserListing}
                                        isSaved={isSaved}
                                        onToggleSave={onToggleSave}
                                      />
                                  ))}
                                </div>
                             </div>
                        )}
                    </div>

                </main>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setIsEditing(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-8 relative">
                            <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">تعديل العرض</h2>
                            <button onClick={() => setIsEditing(false)} className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-600"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <ListingForm 
                                initialData={listing}
                                onSave={(data) => {
                                    onUpdateListing(listing.id, data);
                                    setIsEditing(false);
                                }}
                                categories={categories}
                                submitButtonText="حفظ التعديلات وإرسال للمراجعة"
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setShowConfirmModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">
                            {listing.status === 'traded' ? 'إعادة تفعيل العرض' : 'تأكيد المقايضة'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {listing.status === 'traded' 
                                ? 'هل أنت متأكد من أنك تريد إعادة تفعيل هذا العرض؟ سيصبح ظاهراً للجميع مرة أخرى.'
                                : 'هل أنت متأكد من أنك تريد تحديد هذا العرض كـ "تمت المقايضة"؟ لن يظهر في نتائج البحث بعد الآن.'
                            }
                        </p>
                        <div className="flex justify-center items-center gap-4">
                            <button 
                                onClick={() => setShowConfirmModal(false)} 
                                className="bg-slate-100 text-slate-700 font-bold px-8 py-2.5 rounded-lg hover:bg-slate-200 transition w-full"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={handleConfirmToggleTradeStatus} 
                                className="bg-purple-600 text-white font-bold px-8 py-2.5 rounded-lg hover:bg-purple-700 transition w-full"
                            >
                                تأكيد
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetailPage;