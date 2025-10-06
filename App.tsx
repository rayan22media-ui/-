import React, { useState, useEffect } from 'react';
import { Page, User, Listing, Message, Report, BlogPost, PageContent, AdminAction } from './types';
import { MOCK_USERS_DATA, MOCK_LISTINGS_DATA, MOCK_MESSAGES_DATA, MOCK_REPORTS_DATA, MOCK_BLOG_POSTS_DATA, MOCK_PAGES_DATA, INITIAL_CATEGORIES } from './constants';
import { ToastProvider, useToast } from './components/Toast';

import Header from './components/Header';
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

// Represents settings configurable by the admin
interface SiteSettings {
  logoUrl: string; // Stored as a base64 string
  customFontName?: string;
  customFontBase64?: string; // Base64 data URL for the font
}


// Custom hook for state persistence in localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
        const stickyValue = window.localStorage.getItem(key);
        if (stickyValue !== null) {
            return JSON.parse(stickyValue, (k, v) => {
                // Reviver function to parse date strings back to Date objects
                if (['createdAt', 'updatedAt'].includes(k) && typeof v === 'string') {
                    const d = new Date(v);
                    if (!isNaN(d.getTime())) return d;
                }
                return v;
            });
        }
    } catch (error) {
        console.error("Failed to parse sticky state from localStorage for key:", key, error);
        // If parsing fails, clear the corrupted item and fall back to default
        window.localStorage.removeItem(key);
    }
    return defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export type RegistrationData = Omit<User, 'id' | 'role' | 'status'>;


function AppContent() {
  const [currentPage, setCurrentPage] = useStickyState<Page>(Page.Home, 'currentPage');
  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS_DATA, 'users');
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'currentUser');
  const [listings, setListings] = useStickyState<Listing[]>(MOCK_LISTINGS_DATA, 'listings');
  const [messages, setMessages] = useStickyState<Message[]>(MOCK_MESSAGES_DATA, 'messages');
  const [reports, setReports] = useStickyState<Report[]>(MOCK_REPORTS_DATA, 'reports');
  const [blogPosts, setBlogPosts] = useStickyState<BlogPost[]>(MOCK_BLOG_POSTS_DATA, 'blogPosts');
  const [pages, setPages] = useStickyState<PageContent[]>(MOCK_PAGES_DATA, 'pages');
  const [categories, setCategories] = useStickyState<string[]>(INITIAL_CATEGORIES, 'categories');
  const [siteSettings, setSiteSettings] = useStickyState<SiteSettings>({ logoUrl: '', customFontName: '', customFontBase64: '' }, 'siteSettings');
  const [activeConversation, setActiveConversation] = useStickyState<{ partner: User; listing: Listing } | null>(null, 'activeConversation');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);


  // State for UI enhancements
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addToast } = useToast();

  // Effect to handle scroll detection for dynamic header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Effect to apply custom font globally
  useEffect(() => {
    const styleElement = document.getElementById('custom-font-style');
    const root = document.documentElement;

    if (siteSettings.customFontBase64 && siteSettings.customFontName && styleElement) {
      const fontFaceRule = `
        @font-face {
          font-family: '${siteSettings.customFontName}';
          src: url(${siteSettings.customFontBase64});
        }
      `;
      styleElement.innerHTML = fontFaceRule;
      root.style.setProperty('--custom-font', `'${siteSettings.customFontName}', sans-serif`);
    } else {
      if (styleElement) styleElement.innerHTML = '';
      root.style.removeProperty('--custom-font');
    }
  }, [siteSettings.customFontName, siteSettings.customFontBase64]);

  // Effect to prevent body scroll when mobile menu or modal is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);
  
  const handleNavigate = (page: Page, params?: { postId?: number; slug?: string; listingId?: number }) => {
    if (page !== Page.Messages) setActiveConversation(null);
    
    // Reset IDs on navigation to ensure clean state
    setSelectedPostId(null);
    setSelectedPageSlug(null);
    setSelectedListingId(null);

    if (page === Page.BlogPost && params?.postId) {
        setSelectedPostId(params.postId);
    } else if (page === Page.ContentPage && params?.slug) {
        setSelectedPageSlug(params.slug);
    } else if (page === Page.ListingDetail && params?.listingId) {
        setSelectedListingId(params.listingId);
    }
    
    setCurrentPage(page);
    setIsMobileMenuOpen(false); // Close mobile menu on any navigation
    window.scrollTo(0, 0);
  };
  
  // Effect for handling deep links from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const listingIdParam = params.get('listingId');
    
    if (pageParam === Page.ListingDetail && listingIdParam) {
        const listingId = parseInt(listingIdParam, 10);
        if (!isNaN(listingId) && listings.some(l => l.id === listingId)) {
            handleNavigate(Page.ListingDetail, { listingId: listingId });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount to handle deep links.
  
  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && user.status === 'active') {
      setCurrentUser(user);
      addToast('success', 'أهلاً بعودتك!', `تم تسجيل دخولك بنجاح, ${user.name}.`);
      handleNavigate(Page.Home);
      return true;
    }
    return false;
  };

  const handleRegister = (newUserData: RegistrationData): boolean => {
    if (users.some(u => u.email === newUserData.email)) {
      addToast('error', 'فشل التسجيل', 'هذا البريد الإلكتروني مسجل بالفعل.');
      return false;
    }
    
    const newUser: User = {
        ...newUserData,
        id: Math.max(...users.map(u => u.id), 0) + 1,
        role: 'user',
        status: 'active',
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast('success', 'أهلاً بك!', 'تم إنشاء حسابك بنجاح.');
    handleNavigate(Page.Home);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate(Page.Home);
  };
  
  const handleAddListing = (newListingData: Omit<Listing, 'id' | 'user' | 'createdAt' | 'status'>) => {
      if (!currentUser) {
          addToast('warning', 'مطلوب تسجيل الدخول', 'يجب تسجيل الدخول لإضافة عرض.');
          return;
      }
      const newListing: Listing = {
          ...newListingData,
          id: Math.max(...listings.map(l => l.id), 0) + 1,
          user: currentUser,
          createdAt: new Date(),
          status: 'pending' // Listings need admin approval
      };
      setListings(prev => [...prev, newListing]);
      addToast('info', 'تم استلام عرضك', 'تمت إضافة عرضك بنجاح، وهو الآن قيد المراجعة.');
      handleNavigate(Page.Profile);
  };
  
  const handleSelectListing = (listing: Listing) => {
    handleNavigate(Page.ListingDetail, { listingId: listing.id });
  };

  const handleStartConversation = (partner: User, listing: Listing) => {
      if (currentUser) {
          const updatedMessages = messages.map(m => {
              if (
                  m.receiverId === currentUser.id &&
                  m.senderId === partner.id &&
                  m.listingId === listing.id &&
                  !m.read
              ) {
                  return { ...m, read: true };
              }
              return m;
          });
          setMessages(updatedMessages);
      }
      setActiveConversation({ partner, listing });
      handleNavigate(Page.Messages);
  };

  const handleSendMessage = (type: 'text' | 'image' | 'audio', content: string) => {
      if (!currentUser || !activeConversation) return;

      const newMessage: Message = {
          id: Math.max(0, ...messages.map(m => m.id)) + 1,
          senderId: currentUser.id,
          receiverId: activeConversation.partner.id,
          listingId: activeConversation.listing.id,
          content,
          type,
          createdAt: new Date(),
          read: false,
      };
      setMessages(prev => [...prev, newMessage]);
  };
  
  const handleBackToInbox = () => {
      setActiveConversation(null);
  };
  
  const handleReportListing = (listingId: number, reason: string) => {
      if (!currentUser) {
          addToast('warning', 'مطلوب تسجيل الدخول', 'يجب تسجيل الدخول للإبلاغ عن عرض.');
          return;
      }
      const newReport: Report = {
          id: Math.max(0, ...reports.map(r => r.id)) + 1,
          listingId,
          reporterId: currentUser.id,
          reason,
          createdAt: new Date(),
          status: 'new'
      };
      setReports(prev => [...prev, newReport]);
      addToast('success', 'تم إرسال البلاغ', 'شكراً لك، تم إرسال بلاغك للإدارة وسنراجعه قريباً.');
  };

  const handleUpdateUserListingStatus = (listingId: number, status: Listing['status']) => {
    if (!currentUser) {
        addToast('error', 'غير مصرح به', 'يجب عليك تسجيل الدخول لتغيير حالة العرض.');
        return;
    }

    const listingToUpdate = listings.find(l => l.id === listingId);

    if (!listingToUpdate) {
        addToast('error', 'خطأ', 'العرض غير موجود.');
        return;
    }

    if (listingToUpdate.user.id !== currentUser.id) {
        addToast('error', 'غير مصرح به', 'لا يمكنك تعديل هذا العرض.');
        return;
    }

    setListings(listings.map(listing => listing.id === listingId ? { ...listing, status } : listing));
    
    if (status === 'traded') {
        addToast('success', 'تم التحديث', 'تم تغيير حالة عرضك إلى "تمت المقايضة".');
    } else if (status === 'active') {
        addToast('success', 'تم التحديث', 'تم إعادة عرضك وهو الآن نشط.');
    }
  };
  
  const handleUpdateListing = (listingId: number, updatedData: Omit<Listing, 'id' | 'user' | 'createdAt' | 'status'>) => {
    if (!currentUser) {
        addToast('error', 'غير مصرح به', 'يجب تسجيل الدخول لتعديل العرض.');
        return;
    }
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) {
        addToast('error', 'خطأ', 'العرض غير موجود.');
        return;
    }
    if (listings[listingIndex].user.id !== currentUser.id) {
        addToast('error', 'غير مصرح به', 'لا تملك صلاحية تعديل هذا العرض.');
        return;
    }

    const updatedListings = [...listings];
    const originalListing = updatedListings[listingIndex];

    updatedListings[listingIndex] = {
        ...originalListing,
        ...updatedData,
        status: 'pending' // Set status to pending for review
    };

    setListings(updatedListings);
    addToast('info', 'تم إرسال التعديلات', 'تم حفظ تعديلاتك، وهي الآن قيد المراجعة.');
  };

  const handleAdminAction = (action: AdminAction, payload: any) => {
      switch (action) {
          case 'UPDATE_USER_STATUS':
              setUsers(users.map(user => user.id === payload.id ? { ...user, status: payload.status } : user));
              break;
          case 'UPDATE_LISTING_STATUS':
              setListings(listings.map(listing => listing.id === payload.id ? { ...listing, status: payload.status } : listing));
              break;
          case 'UPDATE_REPORT_STATUS':
              setReports(reports.map(report => report.id === payload.id ? { ...report, status: payload.status } : report));
              break;
          case 'CREATE_BLOG_POST': {
              const newPost: BlogPost = {
                  ...payload,
                  id: Math.max(0, ...blogPosts.map(p => p.id)) + 1,
                  authorId: currentUser!.id,
                  createdAt: new Date(),
              };
              setBlogPosts(prev => [newPost, ...prev]);
              break;
          }
          case 'UPDATE_BLOG_POST':
              setBlogPosts(blogPosts.map(post => post.id === payload.id ? { ...post, ...payload } : post));
              break;
          case 'DELETE_BLOG_POST':
              setBlogPosts(blogPosts.filter(post => post.id !== payload.id));
              break;
          case 'DELETE_LISTING':
              setListings(listings.filter(listing => listing.id !== payload.id));
              addToast('info', 'تم الحذف', 'تم حذف العرض بنجاح.');
              break;
          case 'CREATE_PAGE': {
              const newPage: PageContent = {
                  ...payload,
                  id: Math.max(0, ...pages.map(p => p.id)) + 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
              };
              setPages(prev => [newPage, ...prev]);
              break;
          }
          case 'UPDATE_PAGE': {
              const updatedPage = { ...payload, updatedAt: new Date() };
              setPages(pages.map(page => page.id === updatedPage.id ? updatedPage : page));
              break;
          }
          case 'DELETE_PAGE':
              setPages(pages.filter(page => page.id !== payload.id));
              break;
          case 'ADD_CATEGORY':
              if (payload.name && !categories.includes(payload.name)) {
                  setCategories(prev => [...prev, payload.name]);
              }
              break;
          case 'UPDATE_SITE_SETTINGS':
              setSiteSettings(prev => ({ ...prev, ...payload }));
              addToast('success', 'تم الحفظ', 'تم حفظ إعدادات الموقع بنجاح.');
              break;
          default:
              console.warn("Unhandled admin action:", action);
      }
  };

  const unreadMessagesCount = currentUser
    ? messages.filter(m => m.receiverId === currentUser.id && !m.read).length
    : 0;

  const renderPage = () => {
    const selectedPost = selectedPostId ? blogPosts.find(p => p.id === selectedPostId) : null;
    const author = selectedPost ? users.find(u => u.id === selectedPost.authorId) : null;
    const selectedCustomPage = selectedPageSlug ? pages.find(p => p.slug === selectedPageSlug && p.status === 'published') : null;
    const homePage = pages.find(p => p.slug === 'home' && p.status === 'published');
    const selectedListingData = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;

    const renderHomePage = () => {
        return homePage
            ? <ContentPage
                page={homePage}
                listings={listings}
                blogPosts={blogPosts}
                users={users}
                categories={categories}
                onSelectListing={handleSelectListing}
                onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })}
                onNavigate={handleNavigate}
              />
            : <div className="text-center p-20">Homepage content not found. Please configure a page with the slug 'home' in the admin panel.</div>;
    };
    
    const loginPage = <LoginPage onLogin={handleLogin} onRegister={handleRegister} onNavigateToHome={() => handleNavigate(Page.Home)} />;

    switch (currentPage) {
      case Page.Home:
        return renderHomePage();
      case Page.Login:
        return loginPage;
      case Page.Profile:
        return currentUser ? <ProfilePage currentUser={currentUser} listings={listings} onSelectListing={handleSelectListing} /> : loginPage;
      case Page.AddListing:
        return currentUser ? <AddListingPage onAddListing={handleAddListing} categories={categories} /> : loginPage;
      case Page.Messages:
        return currentUser ? <MessagesPage messages={messages} currentUser={currentUser} listings={listings} users={users} activeConversation={activeConversation} onSendMessage={handleSendMessage} onStartConversation={handleStartConversation} onBackToInbox={handleBackToInbox} /> : loginPage;
      case Page.Admin:
         return currentUser?.role === 'admin' ? <AdminPage users={users} listings={listings} reports={reports} blogPosts={blogPosts} pages={pages} categories={categories} siteSettings={siteSettings} onAdminAction={handleAdminAction} onSelectListing={handleSelectListing} /> : renderHomePage();
      case Page.Listings:
        return <ListingsPage listings={listings} onSelectListing={handleSelectListing} categories={categories} />;
      case Page.Blog:
        return <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.BlogPost:
        return selectedPost && author ? <BlogPostPage post={selectedPost} author={author} /> : <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.ContentPage:
        return selectedCustomPage ? <ContentPage page={selectedCustomPage} onNavigate={handleNavigate} /> : renderHomePage();
      case Page.ListingDetail:
        return selectedListingData ? <ListingDetailPage listing={selectedListingData} allListings={listings} currentUser={currentUser} onBack={() => window.history.back()} onStartConversation={handleStartConversation} onReportListing={handleReportListing} onSelectUserListing={handleSelectListing} onUpdateStatus={handleUpdateUserListingStatus} onUpdateListing={handleUpdateListing} categories={categories} /> : renderHomePage();
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800" dir="rtl">
        <Header 
          currentUser={currentUser} 
          pages={pages}
          logoUrl={siteSettings.logoUrl}
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isScrolled={isScrolled}
          unreadMessagesCount={unreadMessagesCount}
        />
        <main className="pt-20"> {/* Add padding top to avoid content being hidden by sticky header */}
            {renderPage()}
        </main>
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