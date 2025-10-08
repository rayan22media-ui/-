import { User, ListingData, Message, Report, BlogPost, PageContent, RegistrationData, AdminAction, Listing, SiteSettings } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { auth, db, storage } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
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
  orderBy
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

// Fetches all documents from a collection and converts them to a typed array.
const fetchCollection = async <T>(collectionName: string): Promise<T[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(docSnap => docToType<T>(docSnap));
};

// --- API Service ---
export const api = {
    async fetchAllData() {
        // Fetch all data collections in parallel for efficiency.
        const [users, listings, messages, reports, blogPosts, pages, categories, siteSettings] = await Promise.all([
            fetchCollection<User>('users'),
            fetchCollection<ListingData>('listings'),
            fetchCollection<Message>('messages'),
            fetchCollection<Report>('reports'),
            fetchCollection<BlogPost>('blogPosts'),
            fetchCollection<PageContent>('pages'),
            getDoc(doc(db, 'site_data', 'categories')).then(d => d.exists() ? d.data().list : INITIAL_CATEGORIES),
            getDoc(doc(db, 'site_data', 'settings')).then(d => d.exists() ? d.data() as SiteSettings : { logoUrl: '' }),
        ]);
        return { users, listings, messages, reports, blogPosts, pages, categories, siteSettings };
    },

    // --- Auth ---
    async login(email: string, password: string): Promise<User | null> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
                const userData = docToType<User>(userDoc);
                if (userData.status === 'active') {
                    return userData;
                }
            }
            await signOut(auth); // Sign out if profile doesn't exist or is banned
            return null;
        } catch (error) {
            console.error("Firebase login error:", error);
            return null;
        }
    },

    async register(newUserData: RegistrationData): Promise<User | null> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUserData.email, newUserData.password!);
            const { uid } = userCredential.user;
            
            let avatarUrl = `https://picsum.photos/seed/${newUserData.email}/200/200`;
            if(newUserData.avatarUrl && newUserData.avatarUrl.startsWith('data:image')) {
                const storageRef = ref(storage, `avatars/${uid}`);
                await uploadString(storageRef, newUserData.avatarUrl, 'data_url');
                avatarUrl = await getDownloadURL(storageRef);
            }

            const newUser: User = {
                id: uid,
                name: newUserData.name,
                email: newUserData.email,
                phone: newUserData.phone,
                avatarUrl: avatarUrl,
                governorate: newUserData.governorate,
                role: 'user',
                status: 'active',
            };
            
            await setDoc(doc(db, 'users', uid), newUser);
            return newUser;
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.warn('Registration failed: email already in use.');
            } else {
                console.error("Firebase registration error:", error);
            }
            return null;
        }
    },
    
    async logout(): Promise<void> {
        await signOut(auth);
    },

    // --- Listings ---
    async addListing(newListingData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>, currentUser: User): Promise<ListingData> {
        const imageUrls: string[] = [];
        if (newListingData.images && newListingData.images[0]?.startsWith('data:image')) {
            const listingImageRef = ref(storage, `listings/${currentUser.id}_${Date.now()}`);
            await uploadString(listingImageRef, newListingData.images[0], 'data_url');
            imageUrls.push(await getDownloadURL(listingImageRef));
        }

        const docRef = await addDoc(collection(db, 'listings'), {
            ...newListingData,
            images: imageUrls,
            userId: currentUser.id,
            createdAt: serverTimestamp(),
            status: 'pending'
        });

        const newDoc = await getDoc(docRef);
        return docToType<ListingData>(newDoc);
    },
    
    async updateListing(listingId: string, updatedData: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>): Promise<ListingData | null> {
        const docRef = doc(db, 'listings', listingId);
        await updateDoc(docRef, { ...updatedData, status: 'pending' });
        const updatedDoc = await getDoc(docRef);
        return docToType<ListingData>(updatedDoc);
    },

    async updateUserListingStatus(listingId: string, status: Listing['status']): Promise<ListingData | null> {
        const docRef = doc(db, 'listings', listingId);
        await updateDoc(docRef, { status });
        const updatedDoc = await getDoc(docRef);
        return docToType<ListingData>(updatedDoc);
    },
    
    // --- Messages ---
    async sendMessage(type: 'text' | 'image' | 'audio', content: string, currentUser: User, activeConversation: { partner: User; listing: Listing }): Promise<Message> {
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
    
    async markMessagesAsRead(currentUser: User, partner: User, listing: Listing): Promise<Message[]> {
        const q = query(
            collection(db, 'messages'),
            where('receiverId', '==', currentUser.id),
            where('senderId', '==', partner.id),
            where('listingId', '==', listing.id),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const updates = snapshot.docs.map(docSnap => updateDoc(doc(db, 'messages', docSnap.id), { read: true }));
        await Promise.all(updates);
        
        // Refetch all messages to return the updated list
        return fetchCollection<Message>('messages');
    },

    // --- Reports ---
    async reportListing(listingId: string, reason: string, currentUser: User): Promise<Report> {
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
                await addDoc(collection(db, 'blogPosts'), { ...payload, authorId: currentUser.id, createdAt: serverTimestamp() });
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
                await addDoc(collection(db, 'pages'), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
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
                const currentCategories = (await getDoc(catDoc)).data()?.list || [];
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