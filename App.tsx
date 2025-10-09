import React, { useState, useEffect } from 'react';
import { Page, User, Listing, Message, Report, BlogPost, PageContent, AdminAction, RegistrationData, ListingData, SiteSettings } from './types';
import { ToastProvider, useToast } from './components/Toast';
import { api } from './services/api';
import { auth, firebaseInitializationSuccess, db } from './src/firebaseConfig';
import { collection, onSnapshot, doc, query, where, Unsubscribe } from "firebase/firestore";

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
import SavedListingsPage from './components/pages/SavedListingsPage';
import CompleteProfilePage from './components/pages/CompleteProfilePage';

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">فشل في تهيئة التطبيق</h1>
        <p className="text-slate-600 text-center">
            تعذر الاتصال بالخدمات الأساسية. قد يكون السبب هو عدم وجود إعدادات التهيئة الصحيحة.
        </p>
         <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <p className="font-bold mb-2">للمطورين:</p>
            <p>يرجى تعديل ملف <strong>index.html</strong> مباشرة. ابحث عن وسم <code>&lt;script&gt;</code> الذي يُعرّف <code>window.__ENV__</code> واملأ القيم الفارغة باستخدام إعدادات مشروع Firebase و Gemini API الخاصة بك.</p>
            <pre className="mt-3 p-3 bg-slate-200 text-slate-800 rounded-md text-left overflow-x-auto" dir="ltr">
                {`<script>
  window.__ENV__ = {
    // Firebase Configuration
    VITE_FIREBASE_API_KEY: "YOUR_API_KEY",
    VITE_FIREBASE_AUTH_DOMAIN: "YOUR_AUTH_DOMAIN",
    VITE_FIREBASE_PROJECT_ID: "YOUR_PROJECT_ID",
    VITE_FIREBASE_STORAGE_BUCKET: "YOUR_STORAGE_BUCKET",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "YOUR_SENDER_ID",
    VITE_FIREBASE_APP_ID: "YOUR_APP_ID",

    // Gemini AI Configuration
    VITE_API_KEY: "YOUR_GEMINI_API_KEY"
  };
</script>`}
            </pre>
        </div>
    </div>
  </div>
);


function AppContent() {
  const [currentPage, setCurrentPage] = useStickyState<Page>(Page.Home, 'currentPage');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeConversation, setActiveConversation] = useStickyState<{ partner: User; listing: Listing } | null>(null, 'activeConversation');
  
  // State for handling orphaned auth users
  const [userToCompleteProfile, setUserToCompleteProfile] = useState<{uid: string, email: string} | null>(null);

  // Raw data from Firestore
  const [users, setUsers] = useState<User[]>([]);
  const [rawListings, setRawListings] = useState<ListingData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logoUrl: '', customFontName: '', customFontBase64: '' });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Derived/Hydrated Data
  const [listings, setListings] = useState<Listing[]>([]);
  
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addToast } = useToast();
  
  // --- Data Hydration ---
  // This effect runs whenever raw listings or users change, and creates the hydrated 'listings' state.
  useEffect(() => {
    if (users.length === 0) {
        setListings([]);
        return;
    }
    const usersById = new Map(users.map(u => [u.id, u]));
    const hydratedListings = rawListings
      .map(l => ({
        ...l,
        user: usersById.get(l.userId) || null,
      }))
      .filter(l => l.user !== null) as Listing[];
    setListings(hydratedListings);
  }, [rawListings, users]);

  // --- Real-time Data Listeners ---
  useEffect(() => {
    // Wait until the initial auth check is complete before setting up listeners.
    if (!authChecked) {
        return;
    }

    if (!db) {
        setIsLoading(false);
        return;
    }

    const listeners: Unsubscribe[] = [];
    
    // Generic function to create a listener
    const createListener = <T,>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        const q = query(collection(db, collectionName));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
            setter(data);
        }, (error) => console.error(`Error listening to ${collectionName}:`, error));
        return unsubscribe;
    };

    // Listen to public collections always
    listeners.push(createListener<User>('users', setUsers));
    listeners.push(createListener<ListingData>('listings', setRawListings));
    listeners.push(createListener<BlogPost>('blogPosts', setBlogPosts));
    listeners.push(createListener<PageContent>('pages', setPages));

    // Listen to site_data documents
    listeners.push(onSnapshot(doc(db, 'site_data', 'settings'), (docSnap) => {
        if (docSnap.exists()) setSiteSettings(docSnap.data() as SiteSettings);
    }));
    listeners.push(onSnapshot(doc(db, 'site_data', 'categories'), (docSnap) => {
        if (docSnap.exists()) setCategories(docSnap.data().list || []);
    }));

    // Listen to user-specific or admin-specific collections
    if (currentUser) {
        // Messages involving the current user
        const sentQuery = query(collection(db, 'messages'), where('senderId', '==', currentUser.id));
        const receivedQuery = query(collection(db, 'messages'), where('receiverId', '==', currentUser.id));

        listeners.push(onSnapshot(sentQuery, (snapshot) => {
            const sentMessages = snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Message[];
            setMessages(prev => {
                const otherMessages = prev.filter(m => m.senderId !== currentUser.id);
                const messageMap = new Map([...otherMessages, ...sentMessages].map(m => [m.id, m]));
                return Array.from(messageMap.values());
            });
        }));

        listeners.push(onSnapshot(receivedQuery, (snapshot) => {
            const receivedMessages = snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Message[];
             setMessages(prev => {
                const otherMessages = prev.filter(m => m.receiverId !== currentUser.id);
                const messageMap = new Map([...otherMessages, ...receivedMessages].map(m => [m.id, m]));
                return Array.from(messageMap.values());
            });
        }));

        // Reports (for admins)
        if (currentUser.role === 'admin') {
            listeners.push(createListener<Report>('reports', setReports));
        }
    } else {
        // Clear private data on logout
        setMessages([]);
        setReports([]);
    }

    setIsLoading(false); // Data is now live or empty

    // Cleanup function to unsubscribe from all listeners on component unmount or user change
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, [authChecked, currentUser]); // This whole effect re-runs on login/logout

  // --- Main Authentication Listener ---
  useEffect(() => {
    if (!auth) {
        setAuthChecked(true);
        return;
    }
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            // Only try to fetch profile if currentUser isn't already set by a direct action
            if (!currentUser) {
                const userProfile = await api.getUserProfile(firebaseUser.uid);
                if (userProfile) {
                    if (userProfile.status === 'active') {
                        setCurrentUser(userProfile);
                    } else {
                        addToast('error', 'الحساب محظور', 'تم تسجيل خروجك لأن حسابك غير نشط.');
                        await api.logout();
                        setCurrentUser(null);
                    }
                } else {
                    // This case is now less likely to happen due to handleRegister/Login taking precedence.
                    // It can still happen for a user with a valid auth session but a deleted DB record.
                    setCurrentUser(null);
                }
            }
        } else {
            setCurrentUser(null);
        }
        setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [addToast, currentUser]);
  
  // --- UI Effects ---
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
  
  // --- Navigation & Page Load ---
  const handleNavigate = (page: Page, params?: { postId?: string; slug?: string; listingId?: string }) => {
    if (page !== Page.Messages) setActiveConversation(null);
    if (page !== Page.CompleteProfile) setUserToCompleteProfile(null);
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
  
  // --- User Actions ---
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await api.login(email, password);
      if (user) {
        // Directly set the user state to win the race condition against the listener.
        setCurrentUser(user);
        addToast('success', 'أهلاً بعودتك!', `تم تسجيل دخولك بنجاح, ${user.name}.`);
        handleNavigate(Page.Home);
        return true;
      } else {
        // api.login returns null on auth error like wrong password
        addToast('error', 'فشل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        return false;
      }
    } catch(error: any) {
        if (error.message === 'AUTH_USER_BANNED') {
            addToast('error', 'الحساب محظور', 'تم حظر هذا الحساب. يرجى التواصل مع الإدارة.');
        } else if (error.message && error.message.startsWith('USER_PROFILE_NOT_FOUND:')) {
             const uid = error.message.split(':')[1];
             if (uid) {
                 addToast('info', 'إكمال الملف الشخصي', 'يبدو أن ملفك الشخصي غير مكتمل. يرجى إكمال بياناتك للمتابعة.');
                 setUserToCompleteProfile({ uid, email });
                 handleNavigate(Page.CompleteProfile);
             } else {
                 addToast('error', 'خطأ في الحساب', 'لم يتم العثور على ملفك الشخصي. يرجى التواصل مع الدعم الفني.');
             }
        } else if (error.message === 'USER_PROFILE_NOT_FOUND') {
             addToast('error', 'خطأ في الحساب', 'لم يتم العثور على ملفك الشخصي. يرجى محاولة التسجيل مرة أخرى.');
        } else {
            addToast('error', 'فشل الدخول', 'حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول.');
        }
        return false;
    }
  };

  const handleRegister = async (newUserData: RegistrationData): Promise<boolean> => {
    try {
        const newUser = await api.register(newUserData);
        if (newUser) {
            // Directly set the user state to win the race condition against the listener.
            setCurrentUser(newUser);
            addToast('success', 'أهلاً بك!', 'تم إنشاء حسابك بنجاح.');
            handleNavigate(Page.Home);
            return true;
        }
        addToast('error', 'فشل التسجيل', 'حدث خطأ غير متوقع.');
        return false;
    } catch(error: any) {
         let title = 'فشل التسجيل';
         let message = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
         switch (error.message) {
             case 'EMAIL_EXISTS':
                 message = 'هذا البريد الإلكتروني مسجل بالفعل.';
                 break;
             case 'WEAK_PASSWORD':
                 message = 'كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.';
                 break;
             case 'INVALID_EMAIL':
                 message = 'صيغة البريد الإلكتروني غير صحيحة.';
                 break;
         }
         addToast('error', title, message);
         return false;
    }
  };
  
  const handleCompleteProfile = async (profileData: Omit<RegistrationData, 'password' | 'email'>): Promise<boolean> => {
    if (!userToCompleteProfile) return false;

    try {
        const fullProfileData = { ...profileData, email: userToCompleteProfile.email };
        const newUser = await api.createUserProfile(userToCompleteProfile.uid, fullProfileData);
        if (newUser) {
            setCurrentUser(newUser);
            addToast('success', 'أهلاً بك!', 'تم إكمال ملفك الشخصي بنجاح.');
            setUserToCompleteProfile(null);
            handleNavigate(Page.Home);
            return true;
        }
        return false;
    } catch (error) {
        addToast('error', 'فشل', 'لم نتمكن من حفظ ملفك الشخصي. يرجى المحاولة مرة أخرى.');
        return false;
    }
  };

  const handleLogout = () => {
    api.logout(); // This will trigger onAuthStateChanged, which handles the rest.
    handleNavigate(Page.Home);
  };
  
  const handleAddListing = async (newListingData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>) => {
      if (!currentUser) {
          addToast('warning', 'مطلوب تسجيل الدخول', 'يجب تسجيل الدخول لإضافة عرض.');
          return;
      }
      try {
        await api.addListing(newListingData, currentUser);
        // No need to setListings locally, the real-time listener will do it.
        addToast('info', 'تم استلام عرضك', 'تمت إضافة عرضك بنجاح، وهو الآن قيد المراجعة.');
        handleNavigate(Page.Profile);
      } catch (error) {
        console.error("Add listing error:", error);
        addToast('error', 'خطأ', 'لم نتمكن من إضافة العرض. قد تكون هناك مشكلة في رفع الصورة.');
      }
  };
  
  const handleSelectListing = (listing: Listing) => {
    handleNavigate(Page.ListingDetail, { listingId: listing.id });
  };

  const handleStartConversation = (partner: User, listing: Listing) => {
      setActiveConversation({ partner, listing });
      handleNavigate(Page.Messages);
  };

  const handleSendMessage = async (type: 'text' | 'image' | 'audio', content: string) => {
      if (!currentUser || !activeConversation) return;
      try {
        await api.sendMessage(type, content, currentUser, activeConversation);
        // No need to setMessages, listener will catch it.
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
        await api.reportListing(listingId, reason, currentUser);
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
        addToast('info', 'تم إرسال التعديلات', 'تم حفظ تعديلاتك، وهي الآن قيد المراجعة.');
    }
  };

  const handleAdminAction = async (action: AdminAction, payload: any) => {
    if (!currentUser || currentUser.role !== 'admin') {
      addToast('error', 'غير مصرح به', 'ليس لديك صلاحيات للقيام بهذا الإجراء.');
      return;
    }
    try {
      await api.performAdminAction(action, payload, currentUser);
      // The real-time listeners will update the UI automatically.
      addToast('success', 'تم تنفيذ الإجراء', `تم تنفيذ الإجراء الإداري بنجاح.`);
    } catch (error) {
      console.error("Failed to perform admin action:", error);
      addToast('error', 'خطأ', `فشل تنفيذ الإجراء الإداري.`);
    }
  };

  const handleToggleSaveListing = async (listingId: string) => {
    if (!currentUser) {
      addToast('warning', 'مطلوب تسجيل الدخول', 'يجب عليك تسجيل الدخول لحفظ العروض.');
      return;
    }
    try {
      const updatedSavedListings = await api.toggleSaveListing(currentUser.id, listingId);
      if (updatedSavedListings !== null) {
        const isNowSaved = updatedSavedListings.includes(listingId);
        // The user's own profile will be updated by the listener, no need to setCurrentUser here.
        addToast(isNowSaved ? 'success' : 'info', isNowSaved ? 'تم الحفظ' : 'تم الإلغاء', isNowSaved ? 'تمت إضافة العرض إلى قائمتك المحفوظة.' : 'تمت إزالة العرض من قائمتك المحفوظة.');
      }
    } catch (error) {
      addToast('error', 'خطأ', 'لم نتمكن من تحديث قائمة الحفظ.');
    }
  };

  const isListingSaved = (listingId: string): boolean => {
    return currentUser?.savedListings?.includes(listingId) ?? false;
  };

  const unreadMessagesCount = currentUser
    ? messages.filter(m => m.receiverId === currentUser.id && !m.read).length
    : 0;

  if (!firebaseInitializationSuccess) {
    return <FirebaseErrorOverlay />;
  }

  const renderPage = () => {
    if (isLoading && !authChecked) { // Show loader only during the very initial auth check
      return <div className="flex justify-center items-center h-[calc(100vh-80px)]"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div></div>;
    }
    const selectedPost = selectedPostId ? blogPosts.find(p => p.id === selectedPostId) : null;
    const author = selectedPost ? users.find(u => u.id === selectedPost.authorId) : null;
    const selectedCustomPage = selectedPageSlug ? pages.find(p => p.slug === selectedPageSlug && p.status === 'published') : null;
    const selectedListingData = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;

    const mainHomePage = <HomePage listings={listings} blogPosts={blogPosts} onSelectListing={handleSelectListing} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} onNavigate={handleNavigate} categories={categories} isListingSaved={isListingSaved} onToggleSave={handleToggleSaveListing} />;
    const loginPage = <LoginPage onLogin={handleLogin} onRegister={handleRegister} onNavigateToHome={() => handleNavigate(Page.Home)} />;

    switch (currentPage) {
      case Page.Home: return mainHomePage;
      case Page.Login: return loginPage;
      case Page.Profile: return currentUser ? <ProfilePage currentUser={currentUser} listings={listings} onSelectListing={handleSelectListing} isListingSaved={isListingSaved} onToggleSave={handleToggleSaveListing} /> : loginPage;
      case Page.AddListing: return currentUser ? <AddListingPage onAddListing={handleAddListing} categories={categories} /> : loginPage;
      case Page.Messages: return currentUser ? <MessagesPage messages={messages} currentUser={currentUser} listings={listings} users={users} activeConversation={activeConversation} onSendMessage={handleSendMessage} onStartConversation={handleStartConversation} onBackToInbox={handleBackToInbox} /> : loginPage;
      case Page.Admin: return currentUser?.role === 'admin' ? <AdminPage users={users} listings={listings} reports={reports} blogPosts={blogPosts} pages={pages} categories={categories} siteSettings={siteSettings} onAdminAction={handleAdminAction} onSelectListing={handleSelectListing} /> : mainHomePage;
      case Page.Listings: return <ListingsPage listings={listings} onSelectListing={handleSelectListing} categories={categories} isListingSaved={isListingSaved} onToggleSave={handleToggleSaveListing} />;
      case Page.Blog: return <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.BlogPost: return selectedPost && author ? <BlogPostPage post={selectedPost} author={author} /> : <BlogListPage posts={blogPosts} users={users} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} />;
      case Page.ContentPage: return selectedCustomPage ? <ContentPage page={selectedCustomPage} onNavigate={handleNavigate} listings={listings} blogPosts={blogPosts} users={users} categories={categories} onSelectListing={handleSelectListing} onPostSelect={(id) => handleNavigate(Page.BlogPost, { postId: id })} isListingSaved={isListingSaved} onToggleSave={handleToggleSaveListing} /> : mainHomePage;
      case Page.ListingDetail: return selectedListingData ? <ListingDetailPage listing={selectedListingData} allListings={listings} currentUser={currentUser} onBack={() => window.history.back()} onStartConversation={handleStartConversation} onReportListing={handleReportListing} onSelectUserListing={handleSelectListing} onUpdateStatus={handleUpdateUserListingStatus} onUpdateListing={handleUpdateListing} categories={categories} isSaved={isListingSaved(selectedListingData.id)} onToggleSave={handleToggleSaveListing} /> : mainHomePage;
      case Page.SavedListings: return currentUser ? <SavedListingsPage currentUser={currentUser} listings={listings} onSelectListing={handleSelectListing} isListingSaved={isListingSaved} onToggleSave={handleToggleSaveListing} /> : loginPage;
      case Page.CompleteProfile: return userToCompleteProfile ? <CompleteProfilePage email={userToCompleteProfile.email} onCompleteProfile={handleCompleteProfile} /> : loginPage;
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