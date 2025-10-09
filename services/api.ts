import { User, ListingData, Message, Report, BlogPost, PageContent, RegistrationData, AdminAction, Listing, SiteSettings } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { auth, db, storage } from '../src/firebaseConfig';
// FIX: Use named imports for Firebase auth functions instead of a namespace import.
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  serverTimestamp,
  orderBy,
  documentId,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL 
} from "firebase/storage";

// --- Helper Functions ---

// Converts a Firestore document snapshot into a typed object, including its ID.
const docToType = <T>(docSnap: any): T => {
    const data = docSnap.data();
    // Convert Firestore Timestamps to JS Date objects
    Object.keys(data).forEach(key => {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    });
    return { ...data, id: docSnap.id } as T;
};

const FIREBASE_INIT_ERROR = 'FIREBASE_NOT_INITIALIZED';

// --- API Service ---
export const api = {
    // --- Auth & Users ---
    async getUserProfile(uid: string): Promise<User | null> {
        if (!db) {
            throw new Error(FIREBASE_INIT_ERROR);
        }

        // Retry logic to handle the race condition between Firebase Auth user creation
        // and the corresponding Firestore document creation. This is a critical fix.
        const retries = 3;
        const initialDelay = 400; // ms

        for (let i = 0; i < retries; i++) {
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    return docToType<User>(userDoc);
                }
                // If the document doesn't exist, wait before the next attempt.
                if (i < retries - 1) {
                    await new Promise(res => setTimeout(res, initialDelay * (i + 1)));
                }
            } catch (error) {
                console.error(`Error fetching user profile (attempt ${i + 1}):`, error);
                // If there's an actual error (e.g., permissions), stop retrying.
                return null;
            }
        }
        
        console.warn(`User profile for UID ${uid} could not be found after ${retries} attempts. This can happen if the registration process is interrupted.`);
        return null;
    },

    async login(email: string, password: string): Promise<User | null> {
        if (!auth) {
            throw new Error(FIREBASE_INIT_ERROR);
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userProfile = await this.getUserProfile(userCredential.user.uid);
    
            if (!userProfile) {
                // Throw a specific error with the UID to allow for profile completion.
                throw new Error(`USER_PROFILE_NOT_FOUND:${userCredential.user.uid}`);
            }
    
            if (userProfile.status !== 'active') {
                await signOut(auth);
                throw new Error('AUTH_USER_BANNED');
            }
    
            return userProfile;
        } catch (error: any) {
            // If it's one of our custom errors, re-throw it.
            if (error.message.startsWith('USER_PROFILE_NOT_FOUND:') || error.message === 'AUTH_USER_BANNED') {
                throw error;
            }
            
            // For any other error (likely from signInWithEmailAndPassword, e.g., wrong password), return null.
            console.error("Firebase login error:", error.code);
            return null;
        }
    },

    async register(newUserData: RegistrationData): Promise<User> {
        if (!auth || !db || !storage) {
            throw new Error(FIREBASE_INIT_ERROR);
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUserData.email, newUserData.password!);
            const { uid } = userCredential.user;
            
            let avatarUrl = `https://picsum.photos/seed/${newUserData.email}/200/200`;
            if(newUserData.avatarUrl && newUserData.avatarUrl.startsWith('data:image')) {
                const storageRef = ref(storage, `avatars/${uid}`);
                await uploadString(storageRef, newUserData.avatarUrl, 'data_url');
                avatarUrl = await getDownloadURL(storageRef);
            }

            const newUser: Omit<User, 'id'> = {
                name: newUserData.name,
                email: newUserData.email,
                phone: newUserData.phone,
                avatarUrl: avatarUrl,
                governorate: newUserData.governorate,
                role: 'user',
                status: 'active',
                savedListings: [],
            };
            
            await setDoc(doc(db, 'users', uid), newUser);
            return { ...newUser, id: uid };
        } catch (error: any) {
            console.error("Firebase registration error:", error.code, error.message);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    throw new Error('EMAIL_EXISTS');
                case 'auth/weak-password':
                    throw new Error('WEAK_PASSWORD');
                case 'auth/invalid-email':
                    throw new Error('INVALID_EMAIL');
                default:
                    throw new Error('UNKNOWN_ERROR');
            }
        }
    },
    
    async createUserProfile(uid: string, profileData: Omit<RegistrationData, 'password'>): Promise<User> {
        if (!db || !storage) {
            throw new Error(FIREBASE_INIT_ERROR);
        }
        try {
            let avatarUrl = `https://picsum.photos/seed/${profileData.email}/200/200`;
            if(profileData.avatarUrl && profileData.avatarUrl.startsWith('data:image')) {
                const storageRef = ref(storage, `avatars/${uid}`);
                await uploadString(storageRef, profileData.avatarUrl, 'data_url');
                avatarUrl = await getDownloadURL(storageRef);
            }

            const newUser: Omit<User, 'id'> = {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                avatarUrl: avatarUrl,
                governorate: profileData.governorate,
                role: 'user',
                status: 'active',
                savedListings: [],
            };
            
            await setDoc(doc(db, 'users', uid), newUser);
            return { ...newUser, id: uid };
        } catch (error) {
            console.error("Error creating user profile document:", error);
            throw new Error('PROFILE_CREATION_FAILED');
        }
    },

    async logout(): Promise<void> {
        if (!auth) {
            throw new Error(FIREBASE_INIT_ERROR);
        }
        await signOut(auth);
    },

    // --- Listings ---
    async addListing(newListingData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>, currentUser: User): Promise<ListingData> {
        if (!db || !storage) throw new Error(FIREBASE_INIT_ERROR);
        
        try {
            let finalImageUrl = '';
            if (newListingData.images && newListingData.images[0]?.startsWith('data:image')) {
                const listingImageRef = ref(storage, `listings/${currentUser.id}_${Date.now()}`);
                await uploadString(listingImageRef, newListingData.images[0], 'data_url');
                finalImageUrl = await getDownloadURL(listingImageRef);
            }
    
            const dataToSave = {
                title: newListingData.title,
                description: newListingData.description,
                category: newListingData.category,
                governorate: newListingData.governorate,
                wanted: newListingData.wanted,
                images: finalImageUrl ? [finalImageUrl] : [],
                userId: currentUser.id,
                createdAt: serverTimestamp(),
                status: 'pending' as const
            };
    
            const docRef = await addDoc(collection(db, 'listings'), dataToSave);
            const newDoc = await getDoc(docRef);
            return docToType<ListingData>(newDoc);
        } catch (error) {
            console.error("Error in api.addListing:", error);
            throw error; // Re-throw to be caught by the UI layer
        }
    },
    
    async updateListing(listingId: string, updatedData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>): Promise<ListingData | null> {
        if (!db || !storage) return null;
        const docRef = doc(db, 'listings', listingId);

        const dataToUpdate: any = {
            title: updatedData.title,
            description: updatedData.description,
            category: updatedData.category,
            governorate: updatedData.governorate,
            wanted: updatedData.wanted,
            status: 'pending' as const
        };
        
        if (updatedData.images && updatedData.images[0] && updatedData.images[0].startsWith('data:image')) {
            const currentUser = auth?.currentUser;
            if (!currentUser) throw new Error("User not authenticated for image upload");
            
            const listingImageRef = ref(storage, `listings/${currentUser.id}_${Date.now()}`);
            await uploadString(listingImageRef, updatedData.images[0], 'data_url');
            const newImageUrl = await getDownloadURL(listingImageRef);
            dataToUpdate.images = [newImageUrl];
        } else if (updatedData.images) {
            dataToUpdate.images = updatedData.images;
        }
        
        await updateDoc(docRef, dataToUpdate);
        
        const updatedDoc = await getDoc(docRef);
        return docToType<ListingData>(updatedDoc);
    },

    async updateUserListingStatus(listingId: string, status: Listing['status']): Promise<ListingData | null> {
        if (!db) return null;
        const docRef = doc(db, 'listings', listingId);
        await updateDoc(docRef, { status });
        const updatedDoc = await getDoc(docRef);
        return docToType<ListingData>(updatedDoc);
    },
    
    async toggleSaveListing(userId: string, listingId: string): Promise<string[] | null> {
        if (!db) throw new Error(FIREBASE_INIT_ERROR);
        const userRef = doc(db, 'users', userId);
        try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                console.error("User not found for saving listing.");
                return null;
            }
            const userData = userSnap.data() as User;
            const savedListings = userData.savedListings || [];

            if (savedListings.includes(listingId)) {
                // Unsave: remove from array
                await updateDoc(userRef, {
                    savedListings: arrayRemove(listingId)
                });
                return savedListings.filter(id => id !== listingId);
            } else {
                // Save: add to array
                await updateDoc(userRef, {
                    savedListings: arrayUnion(listingId)
                });
                return [...savedListings, listingId];
            }
        } catch (error) {
            console.error("Error toggling save listing:", error);
            return null;
        }
    },

    // --- Messages ---
    async sendMessage(type: 'text' | 'image' | 'audio', content: string, currentUser: User, activeConversation: { partner: User; listing: Listing }): Promise<Message> {
        if (!db || !storage) throw new Error(FIREBASE_INIT_ERROR);
        let finalContent = content;
        if ((type === 'image' || type === 'audio') && content.startsWith('data:')) {
            const mediaRef = ref(storage, `messages/${currentUser.id}/${Date.now()}`);
            await uploadString(mediaRef, content, 'data_url');
            finalContent = await getDownloadURL(mediaRef);
        }

        const docRef = await addDoc(collection(db, 'messages'), {
            senderId: currentUser.id,
            receiverId: activeConversation.partner.id,
            listingId: activeConversation.listing.id,
            content: finalContent,
            type,
            createdAt: serverTimestamp(),
            read: false,
        });
        const newDoc = await getDoc(docRef);
        return docToType<Message>(newDoc);
    },

    // --- Reports ---
    async reportListing(listingId: string, reason: string, currentUser: User): Promise<Report> {
        if (!db) throw new Error(FIREBASE_INIT_ERROR);
        const docRef = await addDoc(collection(db, 'reports'), {
            listingId,
            reporterId: currentUser.id,
            reason,
            createdAt: serverTimestamp(),
            status: 'new'
        });
        const newDoc = await getDoc(docRef);
        return docToType<Report>(newDoc);
    },

    // --- Admin Actions ---
    async performAdminAction(action: AdminAction, payload: any, currentUser: User): Promise<void> {
        if (currentUser.role !== 'admin' || !db) {
            console.error("Unauthorized admin action attempt or DB not initialized.");
            return;
        }
        switch (action) {
            case 'UPDATE_USER_STATUS':
                await updateDoc(doc(db, 'users', payload.id), { status: payload.status });
                break;
            case 'UPDATE_LISTING_STATUS':
                await updateDoc(doc(db, 'listings', payload.id), { status: payload.status });
                break;
            case 'UPDATE_REPORT_STATUS':
                await updateDoc(doc(db, 'reports', payload.id), { status: payload.status });
                break;
            case 'CREATE_BLOG_POST':
                const { id: _, ...newPostData } = payload; // remove id if it exists
                await addDoc(collection(db, 'blogPosts'), { ...newPostData, authorId: currentUser.id, createdAt: serverTimestamp() });
                break;
            case 'UPDATE_BLOG_POST':
                const { id: blogId, ...blogData } = payload;
                await updateDoc(doc(db, 'blogPosts', blogId), blogData);
                break;
            case 'DELETE_BLOG_POST':
                await deleteDoc(doc(db, 'blogPosts', payload.id));
                break;
            case 'DELETE_LISTING':
                await deleteDoc(doc(db, 'listings', payload.id));
                break;
            case 'CREATE_PAGE':
                const { id: __, ...newPageData } = payload; // remove id if it exists
                await addDoc(collection(db, 'pages'), { ...newPageData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                break;
            case 'UPDATE_PAGE':
                const { id: pageId, ...pageData } = payload;
                await updateDoc(doc(db, 'pages', pageId), { ...pageData, updatedAt: serverTimestamp() });
                break;
            case 'DELETE_PAGE':
                await deleteDoc(doc(db, 'pages', payload.id));
                break;
            case 'ADD_CATEGORY':
                const catDoc = doc(db, 'site_data', 'categories');
                const catDocSnap = await getDoc(catDoc);
                const currentCategories = catDocSnap.exists() ? catDocSnap.data().list : [];
                if (!currentCategories.includes(payload.name)) {
                   await setDoc(catDoc, { list: [...currentCategories, payload.name] });
                }
                break;
            case 'UPDATE_SITE_SETTINGS':
                await setDoc(doc(db, 'site_data', 'settings'), payload);
                break;
            default:
                console.warn("Unhandled admin action:", action);
                throw new Error("Unhandled admin action");
        }
    }
};