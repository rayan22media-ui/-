import React, { useState, useEffect, useMemo } from 'react';
// FIX: Imported SiteSettings from types.ts
import { Page, User, Listing, Message, Report, BlogPost, PageContent, AdminAction, RegistrationData, ListingData, SiteSettings } from './types';
import { ToastProvider, useToast } from './components/Toast';
import { api } from './services/api';

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

// FIX: Moved SiteSettings interface to types.ts

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

function AppContent() {
  const [currentPage, setCurrentPage] = useStickyState<Page>(Page.Home, 'currentPage');
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'currentUser');
  const [activeConversation, setActiveConversation] = useStickyState<{ partner: User; listing: Listing } | null>(null, 'activeConversation');
  
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logoUrl: '', customFontName: '', customFontBase64: '' });
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchAllData();
      
      const usersById = new Map(data.users.map(u => [u.id, u]));
      
      const hydratedListings = data.listings.map(l => ({
        ...l,
        user: usersById.get(l.userId) || null,
      })).filter(l => l.user !== null) as Listing[]; // Filter out listings with missing users

      setUsers(data.users);
      setListings(hydratedListings);
      setMessages(data.messages);
      setReports(data.reports);
      setBlogPosts(data.blogPosts);
      setPages(data.pages);
      setCategories(data.categories);
      setSiteSettings(data.siteSettings);
    } catch (error) {
      console.error("Failed to fetch data from Firebase:", error);
      addToast('error', 'خطأ في الاتصال', 'لم نتمكن من جلب البيانات من الخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      if (user) {
        setCurrentUser(user);
        addToast('success', 'أهلاً بعودتك!', `تم تسجيل دخولك بنجاح, ${user.name}.`);
        handleNavigate(Page.Home);
        return true;
      } else {
        addToast('error', 'فشل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        return false;
      }
    } catch(error) {
        addToast('error', 'فشل الدخول', 'حدث خطأ غير متوقع.');
        return false;
    }
  };

  const handleRegister = async (newUserData: RegistrationData): Promise<boolean> => {
    try {
        const user = await api.register(newUserData);
        if(user) {
            setUsers(prev => [...prev, user]);
            setCurrentUser(user);
            addToast('success', 'أهلاً بك!', 'تم إنشاء حسابك بنجاح.');
            handleNavigate(Page.Home);
            return true;
        } else {
            addToast('error', 'فشل التسجيل', 'هذا البريد الإلكتروني مسجل بالفعل.');
            return false;
        }
    } catch(error) {
         addToast('error', 'فشل التسجيل', 'حدث خطأ غير متوقع.');
         return false;
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
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