import { User, Listing, Message, Report, BlogPost, PageContent, RegistrationData, AdminAction } from '../types';
import { MOCK_USERS_BASE, MOCK_LISTINGS_BASE, MOCK_MESSAGES_BASE, MOCK_REPORTS_BASE, MOCK_BLOG_POSTS_BASE, MOCK_PAGES_BASE, INITIAL_CATEGORIES } from '../constants';

// --- In-memory database simulation ---
let users: User[] = MOCK_USERS_BASE;
let listings: Listing[] = MOCK_LISTINGS_BASE;
let messages: Message[] = MOCK_MESSAGES_BASE;
let reports: Report[] = MOCK_REPORTS_BASE;
let blogPosts: BlogPost[] = MOCK_BLOG_POSTS_BASE;
let pages: PageContent[] = MOCK_PAGES_BASE;
let categories: string[] = INITIAL_CATEGORIES;

// Represents settings configurable by the admin
interface SiteSettings {
  logoUrl: string; // Stored as a base64 string
  customFontName?: string;
  customFontBase64?: string; // Base64 data URL for the font
}
let siteSettings: SiteSettings = { logoUrl: '', customFontName: '', customFontBase64: '' };


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
        return Promise.resolve(updatedListing);
    },

    async updateUserListingStatus(listingId: number, status: Listing['status']): Promise<Listing | null> {
        const listingIndex = listings.findIndex(l => l.id === listingId);
        if (listingIndex === -1) return Promise.resolve(null);

        listings[listingIndex].status = status;
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
        return Promise.resolve(newReport);
    },

    // --- Admin Actions ---
    async performAdminAction(action: AdminAction, payload: any, currentUser: User): Promise<any> {
        switch (action) {
            case 'UPDATE_USER_STATUS':
                users = users.map(user => user.id === payload.id ? { ...user, status: payload.status } : user);
                return Promise.resolve(users);
            case 'UPDATE_LISTING_STATUS':
                listings = listings.map(listing => listing.id === payload.id ? { ...listing, status: payload.status } : listing);
                return Promise.resolve(listings);
            case 'UPDATE_REPORT_STATUS':
                reports = reports.map(report => report.id === payload.id ? { ...report, status: payload.status } : report);
                return Promise.resolve(reports);
            case 'CREATE_BLOG_POST': {
                const newPost: BlogPost = {
                    ...payload,
                    id: Math.max(0, ...blogPosts.map(p => p.id)) + 1,
                    authorId: currentUser!.id,
                    createdAt: new Date(),
                };
                blogPosts = [newPost, ...blogPosts];
                return Promise.resolve(blogPosts);
            }
            case 'UPDATE_BLOG_POST':
                blogPosts = blogPosts.map(post => post.id === payload.id ? { ...post, ...payload } : post);
                return Promise.resolve(blogPosts);
            case 'DELETE_BLOG_POST':
                blogPosts = blogPosts.filter(post => post.id !== payload.id);
                return Promise.resolve(blogPosts);
            case 'DELETE_LISTING':
                listings = listings.filter(listing => listing.id !== payload.id);
                return Promise.resolve(listings);
            case 'CREATE_PAGE': {
                const newPage: PageContent = {
                    ...payload,
                    id: Math.max(0, ...pages.map(p => p.id)) + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                pages = [...pages, newPage];
                return Promise.resolve(pages);
            }
            case 'UPDATE_PAGE': {
                const updatedPage = { ...payload, updatedAt: new Date() };
                pages = pages.map(page => page.id === updatedPage.id ? updatedPage : page);
                return Promise.resolve(pages);
            }
            case 'DELETE_PAGE':
                pages = pages.filter(page => page.id !== payload.id);
                return Promise.resolve(pages);
            case 'ADD_CATEGORY':
                if (payload.name && !categories.includes(payload.name)) {
                    categories = [...categories, payload.name];
                }
                return Promise.resolve(categories);
            case 'UPDATE_SITE_SETTINGS':
                siteSettings = { ...siteSettings, ...payload };
                return Promise.resolve(siteSettings);
            default:
                console.warn("Unhandled admin action:", action);
                return Promise.reject(new Error("Unhandled admin action"));
        }
    }
};