
export interface User {
  id: string; // Changed from number
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatarUrl: string;
  governorate: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  savedListings?: string[];
}

export type RegistrationData = Omit<User, 'id' | 'role' | 'status'>;

export interface Listing {
  id: string; // Changed from number
  userId: string; // New field to link to user
  user: User; // This will be added dynamically in App.tsx (hydrated)
  title: string;
  description: string;
  category: string;
  governorate: string;
  images: string[];
  wanted: string;
  createdAt: Date;
  status: 'pending' | 'active' | 'traded' | 'deleted';
}

// Represents the raw listing data from Firestore before hydration
export interface ListingData extends Omit<Listing, 'user'> {}


export interface Message {
  id: string; // Changed from number
  senderId: string; // Changed from number
  receiverId: string; // Changed from number
  listingId: string; // Changed from number
  content: string;
  type: 'text' | 'image' | 'audio';
  createdAt: Date;
  read: boolean;
}

export interface BlogPost {
  id: string; // Changed from number
  title: string;
  content: string; 
  authorId: string; // Changed from number
  createdAt: Date;
  featuredImage: string;
  category: string;
  tags: string[];
}

export interface Report {
  id: string; // Changed from number
  listingId: string; // Changed from number
  reporterId: string; // Changed from number
  reason: string;
  createdAt: Date;
  status: 'new' | 'resolved';
}

export interface PageBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'banner' | 'slider' | 'listings' | 'blogPosts';
  props: Record<string, any>;
}

export interface PageContent {
  id: string; // Changed from number
  title: string;
  slug: string;
  content: PageBlock[];
  status: 'published' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export enum Page {
  Home = 'Home',
  Login = 'Login',
  Profile = 'Profile',
  AddListing = 'AddListing',
  Messages = 'Messages',
  Admin = 'Admin',
  Blog = 'Blog',
  BlogPost = 'BlogPost',
  ContentPage = 'ContentPage',
  Listings = 'Listings',
  ListingDetail = 'ListingDetail',
  SavedListings = 'SavedListings',
}

export type AdminAction =
  | 'UPDATE_USER_STATUS'
  | 'UPDATE_LISTING_STATUS'
  | 'UPDATE_REPORT_STATUS'
  | 'CREATE_BLOG_POST'
  | 'UPDATE_BLOG_POST'
  | 'DELETE_BLOG_POST'
  | 'CREATE_PAGE'
  | 'UPDATE_PAGE'
  | 'DELETE_PAGE'
  | 'ADD_CATEGORY'
  | 'UPDATE_SITE_SETTINGS'
  | 'DELETE_LISTING';

// FIX: Moved SiteSettings here from App.tsx to be globally available.
export interface SiteSettings {
  logoUrl: string;
  customFontName?: string;
  customFontBase64?: string;
}