import React, { useState, useEffect } from 'react';
import { Page, User, Listing, Message, Report, BlogPost, PageContent, AdminAction, RegistrationData, ListingData, SiteSettings } from './types';
import { ToastProvider, useToast } from './components/Toast';
import { api } from './services/api';
import { auth, firebaseInitializationSuccess } from './src/firebaseConfig'; // Import auth and the new flag

import Header from './components/Header';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import ProfilePage from './components/pages/ProfilePage';
import AddListingPage from './components/pages/AddListingPage';
import MessagesPage from './components/pages/MessagesPage';
import AdminPage from './components/pages/AdminPage';
import BlogListPage from './components/pages/BlogListPage';
import BlogPostPage from './components/pages/BlogPostPage';
import ContentPage from './components/pages/ContentPage';
import ListingsPage from './components/pages/ListingsPage';
import ListingDetailPage from './components/pages/ListingDetailPage';

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
        const stickyValue = window.localStorage.getItem(key);
        if (stickyValue !== null) {
            return JSON.parse(stickyValue, (k, v) => {
                if (['createdAt', 'updatedAt'].includes(k) && typeof v === 'string') {
                    const d = new Date(v);
                    if (!isNaN(d.getTime())) return d;
                }
                return v;
            });
        }
    } catch (error) {
        console.error("Failed to parse sticky state from localStorage for key:", key, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const FirebaseErrorOverlay = () => (
  <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 text-center">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-right" dir="rtl">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">فشل في تهيئة التطبيق</h1>
        <p className="text-slate-600 text-center">
            تعذر الاتصال بالخدمات الأساسية، ولا يمكن تشغيل التطبيق حاليًا.
        </p>
         <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <p className="font-bold mb-2">للمطورين:</p>
            <p>لم يتم العثور على إعدادات Firebase. يرجى إنشاء ملف باسم <code>.env</code> في المجلد الرئيسي للمشروع وإضافة المتغيرات التالية مع استبدال <code>...</code> بالقيم الصحيحة من مشروعك على Firebase:</p>
            <pre className="mt-3 p-3 bg-slate-200 text-slate-800 rounded-md text-left overflow-x-auto" dir="ltr">
                {`VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_API_KEY="..."`}
            </pre>
            <p className="mt-3 font-semibold">ملاحظة هامة: بعد إضافة أو تعديل ملف <code>.env</code>، يجب إعادة تشغيل خادم التطوير لتطبيق التغييرات.</p>
        </div>
    </div>
  </div>
);


function AppContent() {
  const [currentPage, setCurrentPage] = useStickyState<Page>(Page.Home, 'currentPage');
  // Use regular useState for currentUser; Firebase will handle persistence.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeConversation, setActiveConversation] = useStickyState<{ partner: User; listing: Listing } | null>(null, 'activeConversation');
  
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logoUrl: '', customFontName: '', customFontBase64: '' });
  
  // isLoading now tracks both auth check and data fetching
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      // Set loading to true only for data fetching, not auth check.
      const data = await api.fetchAllData();
      
      const usersById = new Map(data.users.map(u => [u.id, u]));
      
      const hydratedListings = data.listings.map(l => ({
        ...l,
        user: usersById.get(l.userId) || null,
      })).filter(l => l.user !== null) as Listing[];

      setUsers(data.users);
      setListings(hydratedListings);
      setMessages(data.messages);
      setReports(data.reports);
      setBlogPosts(data.blogPosts);
      setPages(data.pages);
      setCategories(data.categories);
      setSiteSettings(data.siteSettings);
    } catch (error: any) {
      console.error("Failed to fetch data from Firebase:", error);
      if (error.message === 'FIREBASE_NOT_INITIALIZED') {
          addToast('error', 'فشل تهيئة Firebase', 'لا يمكن الاتصال بالخادم. يرجى التحقق من إعدادات Firebase الخاصة بك.');
      } else {
          addToast('error', 'خطأ في الاتصال', 'لم نتمكن من جلب البيانات من الخادم.');
      }
    }
    // Final loading state is handled by the auth effect
  };
  
  // This effect runs once on mount to check authentication state.
  useEffect(() => {
    // If initialization failed, do nothing. The overlay is already showing.
    if (!firebaseInitializationSuccess) {
        setIsLoading(false); // Ensure loading spinner doesn't run forever
        return;
    }

    // Only subscribe if auth was initialized successfully
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          setIsLoading(true); // Start loading when auth state might change
          if (firebaseUser) {
              // User is signed in, fetch their profile data
              const userProfile = await api.getUserProfile(firebaseUser.uid);
              if (userProfile?.status === 'active') {
                setCurrentUser(userProfile);
              } else {
                 // If user is found but not active (e.g., banned), log them out from the session.
                 if (userProfile) {
                    await api.logout();
                 }
                 setCurrentUser(null);
              }
          } else {
              // User is signed out
              setCurrentUser(null);
          }
          // After auth is checked, fetch the rest of the app data
          await fetchData();
          setIsLoading(false); // Stop loading after auth check and data fetch
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    } else {
      // This case is unlikely if firebaseInitializationSuccess is true, but acts as a safeguard.
      const loadWithoutAuth = async () => {
          setIsLoading(true);
          await fetchData();
          setIsLoading(false);
      };
      loadWithoutAuth();
    }
  }, []);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const styleElement = document.getElementById('custom-font-style');
    const root = document.documentElement;
    if (siteSettings.customFontBase64 && siteSettings.customFontName && styleElement) {
      const fontFaceRule = `@font-face { font-family: '${siteSettings.customFontName}'; src: url(${siteSettings.customFontBase64}); }`;
      styleElement.innerHTML = fontFaceRule;
      root.style.setProperty('--custom-font', `'${siteSettings.customFontName}', sans-serif`);
    } else {
      if (styleElement) styleElement.innerHTML = '';
      root.style.removeProperty('--custom-font');
    }
  }, [siteSettings.customFontName, siteSettings.customFontBase64]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);
  
  const handleNavigate = (page: Page, params?: { postId?: string; slug?: string; listingId?: string }) => {
    if (page !== Page.Messages) setActiveConversation(null);
    
    setSelectedPostId(null);
    setSelectedPageSlug(null);
    setSelectedListingId(null);

    if (page === Page.BlogPost && params?.postId) setSelectedPostId(params.postId);
    else if (page === Page.ContentPage && params?.slug) setSelectedPageSlug(params.slug);
    else if (page === Page.ListingDetail && params?.listingId) setSelectedListingId(params.listingId);
    
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const listingIdParam = params.get('listingId');
    if (pageParam === Page.ListingDetail && listingIdParam) {
        if (!isLoading && listings.some(l => l.id === listingIdParam)) {
            handleNavigate(Page.ListingDetail, { listingId: listingIdParam });
        }
    }
  }, [listings, isLoading]);
  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await api.login(email, password);
      // The `onAuthStateChanged` listener will handle setting the user and navigating.
      if (user) {
        addToast('success', 'أهلاً بعودتك!', `تم تسجيل دخولك بنجاح, ${user.name}.`);
        handleNavigate(Page.Home);
        return true;
      } else {
        // This case handles wrong credentials from Firebase.
        addToast('error', 'فشل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        return false;
      }
    } catch(error: any) {
        if (error.message === 'FIREBASE_NOT_INITIALIZED') {
            addToast('error', 'فشل تهيئة Firebase', 'لا يمكن الاتصال بالخادم. يرجى التحقق من إعدادات Firebase الخاصة بك.');
        } else if (error.message === 'AUTH_USER_BANNED') {
            addToast('error', 'الحساب محظور', 'تم حظر هذا الحساب. يرجى التواصل مع الإدارة.');
        } else {
            addToast('error', 'فشل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        }
        return false;
    }
  };

  const handleRegister = async (newUserData: RegistrationData): Promise<boolean> => {
    try {
        const user = await api.register(newUserData);
        if(user) {
            setUsers(prev => [...prev, user]);
             // onAuthStateChanged will handle setting the user.
            setCurrentUser(user);
            addToast('success', 'أهلاً بك!', 'تم إنشاء حسابك بنجاح.');
            handleNavigate(Page.Home);
            return true;
        } else {
            addToast('error', 'فشل التسجيل', 'هذا البريد الإلكتروني مسجل بالفعل.');
            return false;
        }
    } catch(error: any) {
         if (error.message === 'FIREBASE_NOT_INITIALIZED') {
            addToast('error', 'فشل تهيئة Firebase', 'لا يمكن الاتصال بالخادم. يرجى التحقق من إعدادات Firebase الخاصة بك.');
         } else {
            addToast('error', 'فشل التسجيل', 'حدث خطأ غير متوقع.');
         }
         return false;
    }
  };

  const handleLogout = () => {
    api.logout(); // This will trigger onAuthStateChanged, which will set currentUser to null.
    handleNavigate(Page.Home);
  };
  
  const handleAddListing = async (newListingData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>) => {
      if (!currentUser) {
          addToast('warning', 'مطلوب تسجيل الدخول', 'يجب تسجيل الدخول لإضافة عرض.');
          return;
      }
      try {
        const newListing = await api.addListing(newListingData, currentUser);
        const hydratedListing = { ...newListing, user: currentUser };
        setListings(prev => [...prev, hydratedListing]);
        addToast('info', 'تم استلام عرضك', 'تمت إضافة عرضك بنجاح، وهو الآن قيد المراجعة.');
        handleNavigate(Page.Profile);
      } catch (error) {
        addToast('error', 'خطأ', 'لم نتمكن من إضافة العرض.');
      }
  };
  
  const handleSelectListing = (listing: Listing) => {
    handleNavigate(Page.ListingDetail, { listingId: listing.id });
  };

  const handleStartConversation = async (partner: User, listing: Listing) => {
      if (currentUser) {
         const updatedMessages = await api.markMessagesAsRead(currentUser, partner, listing);
         setMessages(updatedMessages);
      }
      setActiveConversation({ partner, listing });
      handleNavigate(Page.Messages);
  };

  const handleSendMessage = async (type: 'text' | 'image' | 'audio', content: string) => {
      if (!currentUser || !activeConversation) return;
      try {
        const newMessage = await api.sendMessage(type, content, currentUser, activeConversation);
        setMessages(prev => [...prev, newMessage]);
      } catch(e) {
        addToast('error', 'خطأ', 'لم يتم إرسال الرسالة.');
      }
  };
  
  const handleBackToInbox = () => setActiveConversation(null);
  
  const handleReportListing = async (listingId: string, reason: string) => {
      if (!currentUser) {
          addToast('warning', 'مطلوب تسجيل الدخول', 'يجب تسجيل الدخول للإبلاغ عن عرض.');
          return;
      }
      try {
        const newReport = await api.reportListing(listingId, reason, currentUser);
        setReports(prev => [...prev, newReport]);
        addToast('success', 'تم إرسال البلاغ', 'شكراً لك، تم إرسال بلاغك للإدارة وسنراجعه قريباً.');
      } catch(e) {
         addToast('error', 'خطأ', 'لم نتمكن من إرسال البلاغ.');
      }
  };

  const handleUpdateUserListingStatus = async (listingId: string, status: Listing['status']) => {
    if (!currentUser) return;
    const listingToUpdate = listings.find(l => l.id === listingId);
    if (!listingToUpdate || listingToUpdate.userId !== currentUser.id) return;
    
    const updatedListingData = await api.updateUserListingStatus(listingId, status);
    if(updatedListingData) {
        const hydratedListing = { ...updatedListingData, user: currentUser };
        setListings(listings.map(l => l.id === listingId ? hydratedListing : l));
        if (status === 'traded') addToast('success', 'تم التحديث', 'تم تغيير حالة عرضك إلى "تمت المقايضة".');
        else if (status === 'active') addToast('success', 'تم التحديث', 'تم إعادة عرضك وهو الآن نشط.');
    }
  };
  
  const handleUpdateListing = async (listingId: string, updatedData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if (listingIndex === -1 || listings[listingIndex].userId !== currentUser.id) return;

    const updatedListingData = await api.updateListing(listingId, updatedData);
    if(updatedListingData) {
        const hydratedListing = { ...updatedListingData, user: currentUser };
        setListings(listings.map(l => l.id === listingId ? hydratedListing : l));
        addToast('info', 'تم إرسال التعديلات', 'تم حفظ تعديلاتك، وهي الآن قيد المراجعة.');
    }
  };

  const handleAdminAction = async (action: AdminAction, payload: any) => {
      if (!currentUser) return;
      await api.performAdminAction(action, payload, currentUser);
      addToast('success', 'تم تنفيذ الإجراء', `تم تنفيذ الإجراء الإداري بنجاح.`);
      await fetchData(); // Refresh all data to reflect changes
  };

  const unreadMessagesCount = currentUser
    ? messages.filter(m => m.receiverId === currentUser.id && !m.read).length
    : 0;

  if (!firebaseInitializationSuccess) {
    return <FirebaseErrorOverlay />;
  }

  const renderPage = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div></div>;
    }
    const selectedPost = selectedPostId ? blogPosts.find(p => p.id === selectedPostId) : null;
    const author = selectedPost ? users.find(u => u.id === selectedPost.authorId) : null;
    const selectedCustomPage = selectedPageSlug ? pages.find(p => p.slug === selectedPageSlug && p.status === 'published') : null;
    const selectedListingData = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;

    const mainHomePage = <HomePage listings={listings} blogPosts={blogPosts} onSelectListing={handleSelectListing} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} onNavigate={handleNavigate} categories={categories} />;
    const loginPage = <LoginPage onLogin={handleLogin} onRegister={handleRegister} onNavigateToHome={() => handleNavigate(Page.Home)} />;

    switch (currentPage) {
      case Page.Home: return mainHomePage;
      case Page.Login: return loginPage;
      case Page.Profile: return currentUser ? <ProfilePage currentUser={currentUser} listings={listings} onSelectListing={handleSelectListing} /> : loginPage;
      case Page.AddListing: return currentUser ? <AddListingPage onAddListing={handleAddListing} categories={categories} /> : loginPage;
      case Page.Messages: return currentUser ? <MessagesPage messages={messages} currentUser={currentUser} listings={listings} users={users} activeConversation={activeConversation} onSendMessage={handleSendMessage} onStartConversation={handleStartConversation} onBackToInbox={handleBackToInbox} /> : loginPage;
      case Page.Admin: return currentUser?.role === 'admin' ? <AdminPage users={users} listings={listings} reports={reports} blogPosts={blogPosts} pages={pages} categories={categories} siteSettings={siteSettings} onAdminAction={handleAdminAction} onSelectListing={handleSelectListing} /> : mainHomePage;
      case Page.Listings: return <ListingsPage listings={listings} onSelectListing={handleSelectListing} categories={categories} />;
      case Page.Blog: return <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.BlogPost: return selectedPost && author ? <BlogPostPage post={selectedPost} author={author} /> : <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.ContentPage: return selectedCustomPage ? <ContentPage page={selectedCustomPage} onNavigate={handleNavigate} listings={listings} blogPosts={blogPosts} users={users} categories={categories} onSelectListing={handleSelectListing} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} /> : mainHomePage;
      case Page.ListingDetail: return selectedListingData ? <ListingDetailPage listing={selectedListingData} allListings={listings} currentUser={currentUser} onBack={() => window.history.back()} onStartConversation={handleStartConversation} onReportListing={handleReportListing} onSelectUserListing={handleSelectListing} onUpdateStatus={handleUpdateUserListingStatus} onUpdateListing={handleUpdateListing} categories={categories} /> : mainHomePage;
      default: return mainHomePage;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800" dir="rtl">
        <Header currentUser={currentUser} pages={pages} logoUrl={siteSettings.logoUrl} onNavigate={handleNavigate} onLogout={handleLogout} isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isScrolled={isScrolled} unreadMessagesCount={unreadMessagesCount}/>
        <main className="pt-20">{renderPage()}</main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;