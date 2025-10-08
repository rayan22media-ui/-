import React, { useState, useEffect } from 'react';
import { Page, User, Listing, Message, Report, BlogPost, PageContent, AdminAction, RegistrationData } from './types';
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

// Represents settings configurable by the admin
interface SiteSettings {
  logoUrl: string; // Stored as a base64 string
  customFontName?: string;
  customFontBase64?: string; // Base64 data URL for the font
}


// Custom hook for state persistence in localStorage, safe for SSR/build environments like Vercel
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    // Check if we are in a browser environment before accessing localStorage
    if (typeof window === 'undefined') {
      return defaultValue;
    }
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
        // If parsing fails, fall back to default
    }
    return defaultValue;
  });

  useEffect(() => {
    // This effect only runs on the client where localStorage is available
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}




function AppContent() {
  // UI and Session state can remain sticky
  const [currentPage, setCurrentPage] = useStickyState<Page>(Page.Home, 'currentPage');
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'currentUser');
  const [activeConversation, setActiveConversation] = useStickyState<{ partner: User; listing: Listing } | null>(null, 'activeConversation');
  
  // Application data state, now fetched from the API service
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logoUrl: '', customFontName: '', customFontBase64: '' });

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  // State for UI enhancements
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addToast } = useToast();

  // Effect to fetch all data from the service layer on initial load
  useEffect(() => {
    api.fetchAllData().then(data => {
        setUsers(data.users);
        setListings(data.listings);
        setMessages(data.messages);
        setReports(data.reports);
        setBlogPosts(data.blogPosts);
        setPages(data.pages);
        setCategories(data.categories);
        setSiteSettings(data.siteSettings);
    });
  }, []);

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
  }, [listings]); // Depend on listings to ensure data is loaded before checking
  
  const handleLogin = (email: string, password: string): boolean => {
    api.login(email, password).then(user => {
      if (user) {
        setCurrentUser(user);
        addToast('success', 'أهلاً بعودتك!', `تم تسجيل دخولك بنجاح, ${user.name}.`);
        handleNavigate(Page.Home);
      } else {
         addToast('error', 'فشل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      }
    });
    return true; // Assume async operation, UI handles feedback
  };

  const handleRegister = (newUserData: RegistrationData): boolean => {
    api.register(newUserData).then(user => {
        if(user) {
            setUsers(prev => [...prev, user]);
            setCurrentUser(user);
            addToast('success', 'أهلاً بك!', 'تم إنشاء حسابك بنجاح.');
            handleNavigate(Page.Home);
        } else {
            addToast('error', 'فشل التسجيل', 'هذا البريد الإلكتروني مسجل بالفعل.');
        }
    });
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
      api.addListing(newListingData, currentUser).then(newListing => {
          setListings(prev => [...prev, newListing]);
          addToast('info', 'تم استلام عرضك', 'تمت إضافة عرضك بنجاح، وهو الآن قيد المراجعة.');
          handleNavigate(Page.Profile);
      });
  };
  
  const handleSelectListing = (listing: Listing) => {
    handleNavigate(Page.ListingDetail, { listingId: listing.id });
  };

  const handleStartConversation = (partner: User, listing: Listing) => {
      if (currentUser) {
         api.markMessagesAsRead(currentUser, partner, listing).then(setMessages);
      }
      setActiveConversation({ partner, listing });
      handleNavigate(Page.Messages);
  };

  const handleSendMessage = (type: 'text' | 'image' | 'audio', content: string) => {
      if (!currentUser || !activeConversation) return;
      api.sendMessage(type, content, currentUser, activeConversation).then(newMessage => {
          setMessages(prev => [...prev, newMessage]);
      });
  };
  
  const handleBackToInbox = () => {
      setActiveConversation(null);
  };
  
  const handleReportListing = (listingId: number, reason: string) => {
      if (!currentUser) {
          addToast('warning', 'مطلوب تسجيل الدخول', 'يجب تسجيل الدخول للإبلاغ عن عرض.');
          return;
      }
      api.reportListing(listingId, reason, currentUser).then(newReport => {
          setReports(prev => [...prev, newReport]);
          addToast('success', 'تم إرسال البلاغ', 'شكراً لك، تم إرسال بلاغك للإدارة وسنراجعه قريباً.');
      });
  };

  const handleUpdateUserListingStatus = (listingId: number, status: Listing['status']) => {
    if (!currentUser) { addToast('error', 'غير مصرح به', 'يجب عليك تسجيل الدخول لتغيير حالة العرض.'); return; }
    const listingToUpdate = listings.find(l => l.id === listingId);
    if (!listingToUpdate) { addToast('error', 'خطأ', 'العرض غير موجود.'); return; }
    if (listingToUpdate.user.id !== currentUser.id) { addToast('error', 'غير مصرح به', 'لا يمكنك تعديل هذا العرض.'); return; }
    
    api.updateUserListingStatus(listingId, status).then(updatedListing => {
        if(updatedListing) {
            setListings(listings.map(l => l.id === listingId ? updatedListing : l));
            if (status === 'traded') addToast('success', 'تم التحديث', 'تم تغيير حالة عرضك إلى "تمت المقايضة".');
            else if (status === 'active') addToast('success', 'تم التحديث', 'تم إعادة عرضك وهو الآن نشط.');
        }
    });
  };
  
  const handleUpdateListing = (listingId: number, updatedData: Omit<Listing, 'id' | 'user' | 'createdAt' | 'status'>) => {
    if (!currentUser) { addToast('error', 'غير مصرح به', 'يجب تسجيل الدخول لتعديل العرض.'); return; }
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) { addToast('error', 'خطأ', 'العرض غير موجود.'); return; }
    if (listings[listingIndex].user.id !== currentUser.id) { addToast('error', 'غير مصرح به', 'لا تملك صلاحية تعديل هذا العرض.'); return; }

    api.updateListing(listingId, updatedData).then(updatedListing => {
        if(updatedListing) {
            setListings(listings.map(l => l.id === listingId ? updatedListing : l));
            addToast('info', 'تم إرسال التعديلات', 'تم حفظ تعديلاتك، وهي الآن قيد المراجعة.');
        }
    });
  };

  const handleAdminAction = (action: AdminAction, payload: any) => {
      if (!currentUser) return;
      api.performAdminAction(action, payload, currentUser).then(result => {
           switch (action) {
              case 'UPDATE_USER_STATUS': setUsers(result); break;
              case 'UPDATE_LISTING_STATUS':
              case 'DELETE_LISTING': setListings(result); break;
              case 'UPDATE_REPORT_STATUS': setReports(result); break;
              case 'CREATE_BLOG_POST':
              case 'UPDATE_BLOG_POST':
              case 'DELETE_BLOG_POST': setBlogPosts(result); break;
              case 'CREATE_PAGE':
              case 'UPDATE_PAGE':
              case 'DELETE_PAGE': setPages(result); break;
              case 'ADD_CATEGORY': setCategories(result); break;
              case 'UPDATE_SITE_SETTINGS':
                  setSiteSettings(result);
                  addToast('success', 'تم الحفظ', 'تم حفظ إعدادات الموقع بنجاح.');
                  break;
            }
      });
  };

  const unreadMessagesCount = currentUser
    ? messages.filter(m => m.receiverId === currentUser.id && !m.read).length
    : 0;

  const renderPage = () => {
    const selectedPost = selectedPostId ? blogPosts.find(p => p.id === selectedPostId) : null;
    const author = selectedPost ? users.find(u => u.id === selectedPost.authorId) : null;
    const selectedCustomPage = selectedPageSlug ? pages.find(p => p.slug === selectedPageSlug && p.status === 'published') : null;
    const selectedListingData = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;

    const mainHomePage = <HomePage
        listings={listings}
        blogPosts={blogPosts}
        onSelectListing={handleSelectListing}
        onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })}
        onNavigate={handleNavigate}
        categories={categories}
    />;
    
    const loginPage = <LoginPage onLogin={handleLogin} onRegister={handleRegister} onNavigateToHome={() => handleNavigate(Page.Home)} />;

    switch (currentPage) {
      case Page.Home:
        return mainHomePage;
      case Page.Login:
        return loginPage;
      case Page.Profile:
        return currentUser ? <ProfilePage currentUser={currentUser} listings={listings} onSelectListing={handleSelectListing} /> : loginPage;
      case Page.AddListing:
        return currentUser ? <AddListingPage onAddListing={handleAddListing} categories={categories} /> : loginPage;
      case Page.Messages:
        return currentUser ? <MessagesPage messages={messages} currentUser={currentUser} listings={listings} users={users} activeConversation={activeConversation} onSendMessage={handleSendMessage} onStartConversation={handleStartConversation} onBackToInbox={handleBackToInbox} /> : loginPage;
      case Page.Admin:
         return currentUser?.role === 'admin' ? <AdminPage users={users} listings={listings} reports={reports} blogPosts={blogPosts} pages={pages} categories={categories} siteSettings={siteSettings} onAdminAction={handleAdminAction} onSelectListing={handleSelectListing} /> : mainHomePage;
      case Page.Listings:
        return <ListingsPage listings={listings} onSelectListing={handleSelectListing} categories={categories} />;
      case Page.Blog:
        return <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.BlogPost:
        return selectedPost && author ? <BlogPostPage post={selectedPost} author={author} /> : <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.ContentPage:
        return selectedCustomPage ? <ContentPage page={selectedCustomPage} onNavigate={handleNavigate} listings={listings} blogPosts={blogPosts} users={users} categories={categories} onSelectListing={handleSelectListing} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} /> : mainHomePage;
      case Page.ListingDetail:
        return selectedListingData ? <ListingDetailPage listing={selectedListingData} allListings={listings} currentUser={currentUser} onBack={() => window.history.back()} onStartConversation={handleStartConversation} onReportListing={handleReportListing} onSelectUserListing={handleSelectListing} onUpdateStatus={handleUpdateUserListingStatus} onUpdateListing={handleUpdateListing} categories={categories} /> : mainHomePage;
      default:
        return mainHomePage;
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