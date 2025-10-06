

import React, { useState, useMemo } from 'react';
import { User, Report, Listing, BlogPost, PageContent, PageBlock, AdminAction } from '../../types';
import { BLOG_CATEGORIES } from '../../constants';
import { BlockEditor } from '../page-builder/BlockEditor';
import RichTextEditor from '../RichTextEditor';

interface AdminPageProps {
  users: User[];
  listings: Listing[];
  reports: Report[];
  blogPosts: BlogPost[];
  pages: PageContent[];
  categories: string[];
  siteSettings: {
    logoUrl: string;
    customFontName?: string;
    customFontBase64?: string;
  };
  onAdminAction: (action: AdminAction, payload: any) => void;
  onSelectListing: (listing: Listing) => void;
}

type AdminView = 'dashboard' | 'users' | 'listings' | 'reports' | 'blog' | 'pages' | 'categories' | 'settings';


const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 items-start">
            <AdminSidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-grow w-full min-w-0">
                {currentView === 'dashboard' && <DashboardView {...props} setCurrentView={setCurrentView} />}
                {currentView === 'users' && <UsersManagerView {...props} />}
                {currentView === 'listings' && <ListingsManagerView {...props} />}
                {currentView === 'reports' && <ReportsManagerView {...props} />}
                {currentView === 'blog' && <BlogManagerView {...props} />}
                {currentView === 'pages' && <PagesManagerView {...props} />}
                {currentView === 'categories' && <CategoriesManagerView {...props} />}
                {currentView === 'settings' && <SettingsManagerView {...props} />}
            </div>
        </div>
    );
};

// --- Sidebar ---
const AdminSidebar: React.FC<{currentView: AdminView, setCurrentView: (view: AdminView) => void}> = ({ currentView, setCurrentView }) => {
    const NavItem: React.FC<{view: AdminView, icon: React.ReactNode, children: React.ReactNode}> = ({ view, icon, children }) => (
        <button 
            onClick={() => setCurrentView(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right font-semibold transition ${currentView === view ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-50 text-slate-700'}`}
        >
            {icon}
            {children}
        </button>
    );

    return (
        <aside className="w-full md:w-64 bg-white p-4 rounded-xl shadow-lg flex-shrink-0">
            <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">لوحة التحكم</h2>
            <nav className="space-y-2">
                <NavItem view="dashboard" icon={<DashboardIcon/>}>الإحصائيات</NavItem>
                <NavItem view="users" icon={<UsersIcon/>}>إدارة المستخدمين</NavItem>
                <NavItem view="listings" icon={<ListingsIcon/>}>إدارة العروض</NavItem>
                <NavItem view="reports" icon={<ReportsIcon/>}>البلاغات</NavItem>
                <NavItem view="blog" icon={<BlogIcon/>}>إدارة المدونة</NavItem>
                <NavItem view="pages" icon={<PageIcon/>}>إدارة الصفحات</NavItem>
                <NavItem view="categories" icon={<CategoryIcon/>}>إدارة الفئات</NavItem>
                <NavItem view="settings" icon={<SettingsIcon/>}>إعدادات الموقع</NavItem>
            </nav>
        </aside>
    );
};

// --- Views ---

const DashboardView: React.FC<AdminPageProps & { setCurrentView: (view: AdminView) => void }> = ({ users, listings, reports, setCurrentView }) => {
    const stats = useMemo(() => ({
        totalUsers: users.length,
        totalListings: listings.length,
        pendingListings: listings.filter(l => l.status === 'pending').length,
        newReports: reports.filter(r => r.status === 'new').length,
    }), [users, listings, reports]);
    
    const listingsByCategory = useMemo(() => {
        const counts = listings.reduce((acc: Record<string, number>, l) => {
            acc[l.category] = (acc[l.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        // FIX: Explicitly type the sort callback arguments to prevent type inference issues.
        return Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
    }, [listings]);

    return (
        <div>
             <h1 className="text-3xl font-bold text-slate-800 mb-6">الإحصائيات العامة</h1>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="إجمالي المستخدمين" value={stats.totalUsers} icon={<UsersIcon />} onClick={() => setCurrentView('users')}/>
                <StatCard title="إجمالي العروض" value={stats.totalListings} icon={<ListingsIcon />} onClick={() => setCurrentView('listings')} />
                <StatCard title="عروض قيد المراجعة" value={stats.pendingListings} icon={<PendingIcon />} color="yellow" onClick={() => setCurrentView('listings')} />
                <StatCard title="بلاغات جديدة" value={stats.newReports} icon={<ReportsIcon />} color="red" onClick={() => setCurrentView('reports')} />
             </div>
             <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg text-slate-700 mb-4">العروض حسب الفئة</h3>
                <div className="space-y-3">
                    {listingsByCategory.map(([category, count]) => (
                        <div key={category}>
                            <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                                <span>{category}</span>
                                <span>{count}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-purple-500 h-2.5 rounded-full" style={{width: `${stats.totalListings > 0 ? (count / stats.totalListings) * 100 : 0}%`}}></div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

const UsersManagerView: React.FC<AdminPageProps> = ({ users, onAdminAction }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">إدارة المستخدمين</h1>
        <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">المستخدم</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الحالة</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الإجراء</th></tr></thead>
                <tbody className="bg-white divide-y divide-slate-100">
                {users.filter(u => u.role !== 'admin').map(user => (
                    <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="" /></div><div className="ms-4"><div className="text-sm font-medium text-slate-900">{user.name}</div><div className="text-sm text-slate-500">{user.email}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status === 'active' ? 'نشط' : 'محظور'}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.status === 'active' ? <button onClick={() => onAdminAction('UPDATE_USER_STATUS', { id: user.id, status: 'banned' })} className="text-red-600 hover:text-red-900">حظر</button> : <button onClick={() => onAdminAction('UPDATE_USER_STATUS', { id: user.id, status: 'active' })} className="text-green-600 hover:text-green-900">إلغاء الحظر</button>}</td>
                    </tr>
                ))}
                </tbody>
             </table>
        </div>
    </div>
);

const ListingsManagerView: React.FC<AdminPageProps> = ({ listings, onAdminAction, onSelectListing }) => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'traded' | 'deleted'>('all');

    const filteredListings = useMemo(() => {
        const sortedListings = [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (statusFilter === 'all') {
            return sortedListings;
        }
        return sortedListings.filter(l => l.status === statusFilter);
    }, [listings, statusFilter]);

    const statusMap: Record<Listing['status'], { text: string; className: string }> = {
        pending: { text: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800' },
        active: { text: 'نشط', className: 'bg-green-100 text-green-800' },
        traded: { text: 'تمت المقايضة', className: 'bg-blue-100 text-blue-800' },
        deleted: { text: 'مرفوض', className: 'bg-gray-100 text-gray-800' },
    };
    
    const handleDelete = (listingId: number, listingTitle: string) => {
        if (window.confirm(`هل أنت متأكد من أنك تريد حذف العرض "${listingTitle}" بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            onAdminAction('DELETE_LISTING', { id: listingId });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">إدارة العروض</h1>
            
            <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                {(['all', 'pending', 'active', 'traded', 'deleted'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition ${statusFilter === status ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {status === 'all' && 'الكل'}
                        {status === 'pending' && `قيد المراجعة (${listings.filter(l => l.status === 'pending').length})`}
                        {status === 'active' && 'نشط'}
                        {status === 'traded' && 'تمت المقايضة'}
                        {status === 'deleted' && 'مرفوض'}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">العرض</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">المالك</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredListings.map(listing => (
                            <tr key={listing.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <img className="h-12 w-12 rounded-md object-cover" src={listing.images[0]} alt={listing.title} />
                                        </div>
                                        <div className="ms-4">
                                            <div className="text-sm font-medium text-slate-900 truncate max-w-xs">{listing.title}</div>
                                            <div className="text-sm text-slate-500">{listing.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{listing.user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[listing.status].className}`}>
                                        {statusMap[listing.status].text}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        {listing.status === 'pending' && (
                                            <>
                                                <button onClick={() => onAdminAction('UPDATE_LISTING_STATUS', {id: listing.id, status: 'active'})} className="text-green-600 hover:text-green-900">موافقة</button>
                                                <button onClick={() => onAdminAction('UPDATE_LISTING_STATUS', {id: listing.id, status: 'deleted'})} className="text-yellow-600 hover:text-yellow-900">رفض</button>
                                            </>
                                        )}
                                        {listing.status === 'active' && (
                                            <button onClick={() => onAdminAction('UPDATE_LISTING_STATUS', { id: listing.id, status: 'traded' })} className="text-indigo-600 hover:text-indigo-900">تحديد كمقايض</button>
                                        )}
                                        {listing.status === 'traded' && (
                                            <button onClick={() => onAdminAction('UPDATE_LISTING_STATUS', { id: listing.id, status: 'active' })} className="text-green-600 hover:text-green-900">إعادة تفعيل</button>
                                        )}
                                        <button onClick={() => onSelectListing(listing)} className="text-blue-600 hover:text-blue-900">عرض</button>
                                        <button onClick={() => handleDelete(listing.id, listing.title)} className="text-red-600 hover:text-red-900">حذف نهائي</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredListings.length === 0 && <p className="text-slate-500 text-center py-8">لا توجد عروض تطابق هذا الفلتر.</p>}
            </div>
        </div>
    );
};

const ReportsManagerView: React.FC<AdminPageProps> = ({ reports, listings, users, onAdminAction, onSelectListing }) => {
    const listingsById = Object.fromEntries(listings.map(l => [l.id, l]));
    const usersById = Object.fromEntries(users.map(u => [u.id, u]));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">البلاغات</h1>
            <div className="space-y-4">
                {reports.map(report => {
                    const reportedListing = listingsById[report.listingId];
                    return (
                        <div key={report.id} className="border p-4 rounded-lg bg-slate-50">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500">بلاغ على: 
                                        {reportedListing ? (
                                            <button onClick={() => onSelectListing(reportedListing)} className="font-semibold text-slate-700 hover:underline">{reportedListing.title}</button>
                                        ) : (
                                            <span className="font-semibold text-slate-700">{'عرض محذوف'}</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-slate-500">بواسطة: <span className="font-semibold text-slate-700">{usersById[report.reporterId]?.name || 'مستخدم محذوف'}</span></p>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${report.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{report.status === 'new' ? 'جديد' : 'تم الحل'}</span>
                                    {report.status === 'new' && <button onClick={() => onAdminAction('UPDATE_REPORT_STATUS', { id: report.id, status: 'resolved' })} className="text-sm font-semibold text-blue-600 hover:text-blue-900">وضع علامة تم الحل</button>}
                                </div>
                            </div>
                            <p className="text-slate-800 mt-2 p-3 bg-white border rounded-md">{report.reason}</p>
                        </div>
                    )
                })}
            </div>
             {reports.length === 0 && <p className="text-slate-500">لا توجد بلاغات.</p>}
        </div>
    );
};

const BlogManagerView: React.FC<AdminPageProps> = ({ blogPosts, onAdminAction }) => {
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">إدارة المدونة</h1>
                <button onClick={() => setEditingPost({})} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition w-full sm:w-auto">إضافة مقالة جديدة</button>
            </div>

            {editingPost ? (
                <BlogPostEditor post={editingPost} onSave={(post) => {
                    const action = post.id ? 'UPDATE_BLOG_POST' : 'CREATE_BLOG_POST';
                    onAdminAction(action, post);
                    setEditingPost(null);
                }} onCancel={() => setEditingPost(null)} />
            ) : (
                <div className="space-y-4">
                    {blogPosts.map(post => (
                        <div key={post.id} className="border p-4 rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{post.title}</p>
                                <p className="text-sm text-slate-500">{post.category} - {new Date(post.createdAt).toLocaleDateString('ar-SY')}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                <button onClick={() => setEditingPost(post)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">تعديل</button>
                                <button onClick={() => onAdminAction('DELETE_BLOG_POST', {id: post.id})} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">حذف</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PagesManagerView: React.FC<AdminPageProps> = ({ pages, onAdminAction, categories }) => {
    const [editingPage, setEditingPage] = useState<Partial<PageContent> | null>(null);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">إدارة الصفحات</h1>
                <button onClick={() => setEditingPage({ content: [] })} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition w-full sm:w-auto">إضافة صفحة جديدة</button>
            </div>

            {editingPage ? (
                <PageEditor page={editingPage} onSave={(page) => {
                    const action = page.id ? 'UPDATE_PAGE' : 'CREATE_PAGE';
                    onAdminAction(action, page);
                    setEditingPage(null);
                }} onCancel={() => setEditingPage(null)} categories={categories} />
            ) : (
                <div className="space-y-4">
                    {pages.map(page => (
                        <div key={page.id} className="border p-4 rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{page.title}</p>
                                <p className="text-sm text-slate-500">/{page.slug} - <span className={`font-semibold ${page.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>{page.status === 'published' ? 'منشورة' : 'مسودة'}</span></p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                <button onClick={() => setEditingPage(page)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">تعديل</button>
                                <button onClick={() => onAdminAction('DELETE_PAGE', {id: page.id})} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">حذف</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoriesManagerView: React.FC<AdminPageProps> = ({ categories, onAdminAction }) => {
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAdminAction('ADD_CATEGORY', { name: newCategory.trim() });
            setNewCategory('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">إدارة الفئات</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">الفئات الحالية</h2>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat} className="bg-slate-100 p-3 rounded-lg text-slate-800 font-medium">
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">إضافة فئة جديدة</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="اسم الفئة الجديدة"
                            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
                            required
                        />
                        <button type="submit" className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition flex-shrink-0">
                            إضافة
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const SettingsManagerView: React.FC<AdminPageProps> = ({ siteSettings, onAdminAction }) => {
    const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl);
    const [customFontName, setCustomFontName] = useState(siteSettings.customFontName || '');
    const [customFontBase64, setCustomFontBase64] = useState(siteSettings.customFontBase64 || '');

    const labelStyle = "block text-sm font-bold text-slate-600 mb-2";
    const inputStyle = "w-full py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800";


    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLogoUrl(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCustomFontBase64(event.target.result as string);
                    // Auto-fill font name from filename if empty
                    if (!customFontName) {
                        setCustomFontName(file.name.split('.').slice(0, -1).join('.'));
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveFont = () => {
        setCustomFontName('');
        setCustomFontBase64('');
    };

    const handleSave = () => {
        onAdminAction('UPDATE_SITE_SETTINGS', { logoUrl, customFontName, customFontBase64 });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">إعدادات الموقع</h1>
            <div className="space-y-8">
                <div>
                    <label className={labelStyle}>شعار الموقع (PNG)</label>
                    <div className="flex items-center gap-4">
                        <div className="w-40 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain p-1" />
                            ) : (
                                <span className="text-slate-500 text-sm">لا يوجد شعار</span>
                            )}
                        </div>
                        <input id="logo-upload" type="file" className="hidden" onChange={handleLogoUpload} accept="image/png" />
                        <button type="button" onClick={() => document.getElementById('logo-upload')?.click()} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition">تغيير الشعار</button>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">يفضل أن تكون الصورة بعرض 150 بكسل للحصول على أفضل نتيجة.</p>
                </div>
                
                <hr/>

                <div>
                    <label className={labelStyle}>الخط المخصص للموقع</label>
                    <p className="text-xs text-slate-500 mb-2">
                        ارفع ملف خط (TTF, OTF, WOFF, WOFF2) ليتم تطبيقه على كامل الموقع.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="اسم عائلة الخط (e.g., 'Tajawal')"
                            value={customFontName}
                            onChange={e => setCustomFontName(e.target.value)}
                            className={inputStyle}
                        />
                        <input
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={handleFontUpload}
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                    </div>
                    {customFontBase64 && customFontName && (
                        <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                            <style>{`
                                @font-face {
                                    font-family: '${customFontName}';
                                    src: url(${customFontBase64});
                                }
                            `}</style>
                            <p className="font-bold text-slate-700 mb-2">معاينة الخط:</p>
                            <p style={{ fontFamily: `'${customFontName}', sans-serif` }} className="text-2xl">
                                وين للمقايضة - قايض ما لا تحتاج بما تحتاجه.
                            </p>
                        </div>
                    )}
                    {(siteSettings.customFontName || customFontName) && (
                         <button onClick={handleRemoveFont} className="text-sm text-red-600 hover:underline mt-2">
                            إزالة الخط المخصص والعودة للخط الافتراضي
                        </button>
                    )}
                </div>

                <div className="pt-4 border-t">
                    <button onClick={handleSave} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition">حفظ الإعدادات</button>
                </div>
            </div>
        </div>
    );
};

// --- Child Components ---

const StatCard: React.FC<{title: string, value: number, icon: React.ReactNode, color?: 'yellow'|'red', onClick?: () => void}> = ({title, value, icon, color, onClick}) => {
    const colorClasses = {
        yellow: 'bg-yellow-100 text-yellow-600',
        red: 'bg-red-100 text-red-600',
        default: 'bg-purple-100 text-purple-600'
    };
    const Component = onClick ? 'button' : 'div';
    
    return (
        <Component 
            onClick={onClick}
            className={`bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 text-right w-full ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all' : ''}`}
        >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color ? colorClasses[color] : colorClasses.default}`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{title}</p>
            </div>
        </Component>
    );
}

const BlogPostEditor: React.FC<{post: Partial<BlogPost>, onSave: (post: Partial<BlogPost>) => void, onCancel: () => void}> = ({post, onSave, onCancel}) => {
    const [title, setTitle] = useState(post.title || '');
    const [content, setContent] = useState(post.content || '');
    const [category, setCategory] = useState(post.category || BLOG_CATEGORIES[0]);
    const [tags, setTags] = useState(post.tags?.join(', ') || '');
    const [featuredImage, setFeaturedImage] = useState(post.featuredImage || '');
    
    const inputStyle = "w-full py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400";
    const labelStyle = "block text-sm font-bold text-slate-600 mb-1";

    const handleSave = () => {
        onSave({ ...post, title, content, category, tags: tags.split(',').map(t => t.trim()).filter(Boolean), featuredImage });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setFeaturedImage(event.target!.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="border p-4 rounded-lg space-y-4 bg-slate-50">
            <div><label className={labelStyle}>العنوان</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} /></div>
            <div>
                <label className={labelStyle}>الصورة البارزة</label>
                <div className="flex items-center gap-4">
                    <input type="file" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                    {featuredImage && <img src={featuredImage} alt="Preview" className="w-32 h-20 rounded object-cover" />}
                </div>
            </div>
            <div><label className={labelStyle}>المحتوى</label><RichTextEditor value={content} onChange={setContent} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelStyle}>الفئة</label><select value={category} onChange={e => setCategory(e.target.value)} className={inputStyle}>{BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={labelStyle}>الوسوم (مفصولة بفاصلة)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inputStyle} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2"><button onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-slate-200 font-semibold text-slate-700">إلغاء</button><button onClick={handleSave} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ المقالة</button></div>
        </div>
    );
};


const PageEditor: React.FC<{page: Partial<PageContent>, onSave: (page: Partial<PageContent>) => void, onCancel: () => void, categories: string[]}> = ({page, onSave, onCancel, categories}) => {
    const [pageData, setPageData] = useState<Partial<PageContent>>(page);
    const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);

    const updateField = (field: keyof PageContent, value: any) => {
        setPageData(prev => ({ ...prev, [field]: value }));
    };

    const addBlock = (type: PageBlock['type']) => {
        const newBlock: PageBlock = { id: `${type}-${Date.now()}`, type, props: {} };
        const newContent = [...(pageData.content || []), newBlock];
        updateField('content', newContent);
    };

    const updateBlock = (updatedBlock: PageBlock) => {
        const newContent = (pageData.content || []).map(b => b.id === updatedBlock.id ? updatedBlock : b);
        updateField('content', newContent);
        setEditingBlock(null);
    };
    
    const removeBlock = (blockId: string) => {
        const newContent = (pageData.content || []).filter(b => b.id !== blockId);
        updateField('content', newContent);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const content = [...(pageData.content || [])];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= content.length) return;
        [content[index], content[targetIndex]] = [content[targetIndex], content[index]]; // Swap
        updateField('content', content);
    };

    const inputStyle = "w-full py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400";
    const labelStyle = "block text-sm font-bold text-slate-600 mb-1";
    
    const blockTypes: { type: PageBlock['type']; label: string }[] = [
        { type: 'hero', label: 'بانر رئيسي (Hero)' },
        { type: 'text', label: 'نص (Text)' },
        { type: 'image', label: 'صورة (Image)' },
        { type: 'banner', label: 'بانر عرض كامل (Banner)' },
        { type: 'slider', label: 'سلايدر شرائح (Slider)' },
        { type: 'listings', label: 'عروض المقايضة (Listings)' },
        { type: 'blogPosts', label: 'مقالات المدونة (Blog)' },
    ];

    return (
        <div className="border p-4 rounded-lg space-y-6 bg-slate-50">
            {/* Page Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelStyle}>عنوان الصفحة</label><input type="text" value={pageData.title || ''} onChange={e => updateField('title', e.target.value)} className={inputStyle} /></div>
                <div><label className={labelStyle}>الرابط (Slug)</label><input type="text" value={pageData.slug || ''} onChange={e => updateField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className={inputStyle} placeholder="e.g., about-us" /></div>
            </div>

            {/* Content Blocks */}
            <div>
                <label className={labelStyle}>محتوى الصفحة</label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white space-y-4">
                    {(pageData.content || []).map((block, index) => (
                         <div key={block.id} className="p-3 rounded-lg bg-slate-50 border flex justify-between items-center group">
                            <span className="font-semibold text-slate-700">{blockTypes.find(bt => bt.type === block.type)?.label || 'مكعب غير معروف'}</span>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-2 hover:bg-slate-200 rounded-md disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                                <button onClick={() => moveBlock(index, 'down')} disabled={index === (pageData.content?.length || 0) - 1} className="p-2 hover:bg-slate-200 rounded-md disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                                <button onClick={() => setEditingBlock(block)} className="p-2 hover:bg-slate-200 rounded-md"><PencilIcon className="w-4 h-4 text-blue-600" /></button>
                                <button onClick={() => removeBlock(block.id)} className="p-2 hover:bg-slate-200 rounded-md"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                             </div>
                         </div>
                    ))}
                     {pageData.content?.length === 0 && <p className="text-center text-slate-500 py-4">ابدأ بإضافة مكعبات المحتوى لصفحتك.</p>}
                </div>
            </div>

             {/* Add Block Dropdown */}
            <div className="relative group text-center">
                <button type="button" className="bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-200 transition">
                    + إضافة مكعب
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
                    {blockTypes.map(bt => (
                         <button key={bt.type} onClick={() => addBlock(bt.type)} className="w-full text-right px-4 py-2 hover:bg-purple-50">{bt.label}</button>
                    ))}
                </div>
            </div>


            {/* Page Status and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className={labelStyle}>الحالة</label>
                  <select value={pageData.status || 'draft'} onChange={e => updateField('status', e.target.value as any)} className={inputStyle}>
                    <option value="draft">مسودة</option>
                    <option value="published">منشورة</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-slate-200 font-semibold text-slate-700">إلغاء</button>
                    <button onClick={() => onSave(pageData)} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ الصفحة</button>
                </div>
            </div>

             {/* Block Editor Modal */}
             {editingBlock && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setEditingBlock(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <BlockEditor block={editingBlock} onSave={updateBlock} onCancel={() => setEditingBlock(null)} categories={categories} />
                    </div>
                </div>
             )}
        </div>
    );
};

// --- Icons ---
const iconClass = "w-6 h-6";
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m1-1.5l1 1.5m0 0l.5 1.5m.5-1.5l-1.5-2.25m1.5 2.25l1.5-2.25m0 0l1.5 2.25m-1.5-2.25l1.5-2.25M6 16.5h12M6 16.5L4.5 21m1.5-4.5L7.5 21" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663l.001.109m-8.381 3.362a4.875 4.875 0 01.62-4.676 4.875 4.875 0 017.533-2.493m-7.533 2.493c.346.055.686.106 1.026.155a4.875 4.875 0 004.471-4.218a4.875 4.875 0 00-5.495-4.522a5.495 5.495 0 00-1.026 9.22m0 0c.28.337.62.639.98.898m-1.592 2.87a7.5 7.5 0 01-5.696-3.07M1.999 12a10.003 10.003 0 002.223 6.374m1.54 2.87l-.001-.109a6.375 6.375 0 0111.964-4.663l.001.109" /></svg>;
const ListingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>;
const BlogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226a2.25 2.25 0 012.58 0c.55.22 1.02.684 1.11 1.226l.094.549a2.25 2.25 0 003.956.513 2.25 2.25 0 013.252 3.252c-.351.52-.351 1.23 0 1.75a2.25 2.25 0 01-3.252 3.252 2.25 2.25 0 00-3.956.513l-.094.549c-.09.542-.56 1.007-1.11 1.226a2.25 2.25 0 01-2.58 0c-.55-.22-1.02-.684-1.11-1.226l-.094-.549a2.25 2.25 0 00-3.956-.513 2.25 2.25 0 01-3.252-3.252c.351-.52.351 1.23 0-1.75a2.25 2.25 0 013.252-3.252 2.25 2.25 0 003.956-.513l.094.549z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

export default AdminPage;