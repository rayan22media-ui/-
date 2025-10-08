import { User, Listing, Message, Report, BlogPost, PageContent, RegistrationData, AdminAction } from '../types';
import { MOCK_USERS_BASE, MOCK_LISTINGS_BASE, MOCK_MESSAGES_BASE, MOCK_REPORTS_BASE, MOCK_BLOG_POSTS_BASE, MOCK_PAGES_BASE, INITIAL_CATEGORIES } from '../constants';

// --- localStorage Persistence ---

// Helper to load data, falling back to initial mock data
function loadFromStorage<T>(key: string, defaultValue: T): T {
  // Check for server-side rendering environments
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue) {
      // Use a reviver to correctly parse Date objects from strings
      return JSON.parse(storedValue, (k, v) => {
        if (['createdAt', 'updatedAt'].includes(k) && typeof v === 'string') {
          const d = new Date(v);
          if (!isNaN(d.getTime())) return d;
        }
        return v;
      });
    }
  } catch (error) {
    console.error(`Failed to load '${key}' from localStorage`, error);
  }
  return defaultValue;
}

// Helper to save data
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save '${key}' to localStorage`, error);
  }
}

// --- In-memory database simulation (now backed by localStorage) ---

let users: User[] = loadFromStorage('db_users', MOCK_USERS_BASE);
let listings: Listing[] = loadFromStorage('db_listings', MOCK_LISTINGS_BASE);
let messages: Message[] = loadFromStorage('db_messages', MOCK_MESSAGES_BASE);
let reports: Report[] = loadFromStorage('db_reports', MOCK_REPORTS_BASE);
let blogPosts: BlogPost[] = loadFromStorage('db_blogPosts', MOCK_BLOG_POSTS_BASE);
let pages: PageContent[] = loadFromStorage('db_pages', MOCK_PAGES_BASE);
let categories: string[] = loadFromStorage('db_categories', INITIAL_CATEGORIES);

// Represents settings configurable by the admin
interface SiteSettings {
  logoUrl: string; // Stored as a base64 string
  customFontName?: string;
  customFontBase64?: string; // Base64 data URL for the font
}
let siteSettings: SiteSettings = loadFromStorage('db_siteSettings', { logoUrl: '', customFontName: '', customFontBase64: '' });


// Create a single function to persist all state to avoid repetition
const persistState = () => {
    saveToStorage('db_users', users);
    saveToStorage('db_listings', listings);
    saveToStorage('db_messages', messages);
    saveToStorage('db_reports', reports);
    saveToStorage('db_blogPosts', blogPosts);
    saveToStorage('db_pages', pages);
    saveToStorage('db_categories', categories);
    saveToStorage('db_siteSettings', siteSettings);
}


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Service ---
export const api = {
    // Fetch all initial data
    async fetchAllData() {
        await delay(50); // Simulate network latency
        return Promise.resolve({
            users,
            listings,
            messages,
            reports,
            blogPosts,
            pages,
            categories,
            siteSettings,
        });
    },

    // --- Auth ---
    async login(email: string, password: string): Promise<User | null> {
        const user = users.find(u => u.email === email && u.password === password);
        if (user && user.status === 'active') {
            return Promise.resolve(user);
        }
        return Promise.resolve(null);
    },

    async register(newUserData: RegistrationData): Promise<User | null> {
        if (users.some(u => u.email === newUserData.email)) {
            return Promise.resolve(null); // Email already exists
        }
        const newUser: User = {
            ...newUserData,
            id: Math.max(...users.map(u => u.id), 0) + 1,
            role: 'user',
            status: 'active',
        };
        users = [...users, newUser];
        persistState();
        return Promise.resolve(newUser);
    },

    // --- Listings ---
    // FIX: Corrected the type for newListingData to not expect a `user` property, which is added from `currentUser`.
    async addListing(newListingData: Omit<Listing, 'id' | 'user' | 'createdAt' | 'status'>, currentUser: User): Promise<Listing> {
        const newListing: Listing = {
            ...newListingData,
            id: Math.max(...listings.map(l => l.id), 0) + 1,
            user: currentUser,
            createdAt: new Date(),
            status: 'pending' // Listings need admin approval
        };
        listings = [...listings, newListing];
        persistState();
        return Promise.resolve(newListing);
    },
    
    async updateListing(listingId: number, updatedData: Omit<Listing, 'id' | 'user' | 'createdAt' | 'status'>): Promise<Listing | null> {
        const listingIndex = listings.findIndex(l => l.id === listingId);
        if (listingIndex === -1) return Promise.resolve(null);

        const originalListing = listings[listingIndex];
        const updatedListing = {
            ...originalListing,
            ...updatedData,
            status: 'pending' as 'pending'
        };
        listings[listingIndex] = updatedListing;
        persistState();
        return Promise.resolve(updatedListing);
    },

    async updateUserListingStatus(listingId: number, status: Listing['status']): Promise<Listing | null> {
        const listingIndex = listings.findIndex(l => l.id === listingId);
        if (listingIndex === -1) return Promise.resolve(null);

        listings[listingIndex].status = status;
        persistState();
        return Promise.resolve(listings[listingIndex]);
    },
    
    // --- Messages ---
    async sendMessage(type: 'text' | 'image' | 'audio', content: string, currentUser: User, activeConversation: { partner: User; listing: Listing }): Promise<Message> {
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
        messages = [...messages, newMessage];
        persistState();
        return Promise.resolve(newMessage);
    },
    
    async markMessagesAsRead(currentUser: User, partner: User, listing: Listing): Promise<Message[]> {
        messages = messages.map(m => {
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
        persistState();
        return Promise.resolve(messages);
    },

    // --- Reports ---
    async reportListing(listingId: number, reason: string, currentUser: User): Promise<Report> {
        const newReport: Report = {
            id: Math.max(0, ...reports.map(r => r.id)) + 1,
            listingId,
            reporterId: currentUser.id,
            reason,
            createdAt: new Date(),
            status: 'new'
        };
        reports = [...reports, newReport];
        persistState();
        return Promise.resolve(newReport);
    },

    // --- Admin Actions ---
    async performAdminAction(action: AdminAction, payload: any, currentUser: User): Promise<any> {
        switch (action) {
            case 'UPDATE_USER_STATUS':
                users = users.map(user => user.id === payload.id ? { ...user, status: payload.status } : user);
                persistState();
                return Promise.resolve(users);
            case 'UPDATE_LISTING_STATUS':
                listings = listings.map(listing => listing.id === payload.id ? { ...listing, status: payload.status } : listing);
                persistState();
                return Promise.resolve(listings);
            case 'UPDATE_REPORT_STATUS':
                reports = reports.map(report => report.id === payload.id ? { ...report, status: payload.status } : report);
                persistState();
                return Promise.resolve(reports);
            case 'CREATE_BLOG_POST': {
                const newPost: BlogPost = {
                    ...payload,
                    id: Math.max(0, ...blogPosts.map(p => p.id)) + 1,
                    authorId: currentUser!.id,
                    createdAt: new Date(),
                };
                blogPosts = [newPost, ...blogPosts];
                persistState();
                return Promise.resolve(blogPosts);
            }
            case 'UPDATE_BLOG_POST':
                blogPosts = blogPosts.map(post => post.id === payload.id ? { ...post, ...payload } : post);
                persistState();
                return Promise.resolve(blogPosts);
            case 'DELETE_BLOG_POST':
                blogPosts = blogPosts.filter(post => post.id !== payload.id);
                persistState();
                return Promise.resolve(blogPosts);
            case 'DELETE_LISTING':
                listings = listings.filter(listing => listing.id !== payload.id);
                persistState();
                return Promise.resolve(listings);
            case 'CREATE_PAGE': {
                const newPage: PageContent = {
                    ...payload,
                    id: Math.max(0, ...pages.map(p => p.id)) + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                pages = [...pages, newPage];
                persistState();
                return Promise.resolve(pages);
            }
            case 'UPDATE_PAGE': {
                const updatedPage = { ...payload, updatedAt: new Date() };
                pages = pages.map(page => page.id === updatedPage.id ? updatedPage : page);
                persistState();
                return Promise.resolve(pages);
            }
            case 'DELETE_PAGE':
                pages = pages.filter(page => page.id !== payload.id);
                persistState();
                return Promise.resolve(pages);
            case 'ADD_CATEGORY':
                if (payload.name && !categories.includes(payload.name)) {
                    categories = [...categories, payload.name];
                }
                persistState();
                return Promise.resolve(categories);
            case 'UPDATE_SITE_SETTINGS':
                siteSettings = { ...siteSettings, ...payload };
                persistState();
                return Promise.resolve(siteSettings);
            default:
                console.warn("Unhandled admin action:", action);
                return Promise.reject(new Error("Unhandled admin action"));
        }
    }
};