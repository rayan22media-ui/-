export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string; // Added for registration
  avatarUrl: string;
  governorate: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
}

export interface Listing {
  id: number;
  user: User;
  title: string;
  description: string;
  category: string;
  governorate: string;
  images: string[];
  wanted: string;
  createdAt: Date;
  status: 'pending' | 'active' | 'traded' | 'deleted';
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  listingId: number;
  content: string;
  type: 'text' | 'image' | 'audio';
  createdAt: Date;
  read: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string; // HTML content from rich text editor
  authorId: number;
  createdAt: Date;
  featuredImage: string; // Base64 URL
  category: string;
  tags: string[];
}

export interface Report {
  id: number;
  listingId: number;
  reporterId: number;
  reason: string;
  createdAt: Date;
  status: 'new' | 'resolved';
}

// Represents a single configurable block/widget on a page
export interface PageBlock {
  id: string; // Unique ID for the block, e.g., a UUID
  type: 'hero' | 'text' | 'image' | 'banner' | 'slider' | 'listings' | 'blogPosts'; // The type of widget to render
  props: Record<string, any>; // Properties specific to the widget type
}

export interface PageContent {
  id: number;
  title: string;
  slug: string; // e.g., 'about-us'
  content: PageBlock[]; // An array of blocks that make up the page
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