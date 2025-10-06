import React from 'react';
import { User, Page, PageContent } from '../types';

interface HeaderProps {
  currentUser: User | null;
  pages: PageContent[];
  logoUrl: string;
  onNavigate: (page: Page, params?: { postId?: number; slug?: string }) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isScrolled: boolean;
  unreadMessagesCount: number;
}

const Logo: React.FC<{ onClick: () => void; logoUrl: string }> = ({ onClick, logoUrl }) => {
    if (logoUrl) {
        return (
            <button onClick={onClick} className="flex items-center gap-2 focus:outline-none" aria-label="العودة للصفحة الرئيسية">
                <img src={logoUrl} alt="وين للمقايضة" className="h-10 w-auto" />
            </button>
        );
    }
    
    return (
        <button onClick={onClick} className="focus:outline-none" aria-label="العودة للصفحة الرئيسية">
             <span className="text-3xl font-bold text-slate-800 tracking-wider">logo</span>
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ currentUser, pages, onNavigate, onLogout, isMobileMenuOpen, toggleMobileMenu, isScrolled, logoUrl, unreadMessagesCount }) => {
    
    const publishedPages = pages.filter(p => p.status === 'published' && p.slug !== 'home');
    
    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200/80' : 'bg-transparent'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop Header */}
                    <div className="hidden md:flex justify-between items-center h-20">
                        <Logo onClick={() => onNavigate(Page.Home)} logoUrl={logoUrl} />
                        
                        <nav className="flex items-center gap-2">
                           <button onClick={() => onNavigate(Page.Home)} className="font-semibold transition px-4 py-2 rounded-md text-slate-600 hover:text-purple-600 flex items-center gap-2"><HomeIcon className="w-5 h-5"/><span>الرئيسية</span></button>
                           <button onClick={() => onNavigate(Page.Blog)} className="font-semibold transition px-4 py-2 rounded-md text-slate-600 hover:text-purple-600 flex items-center gap-2"><BlogIcon className="w-5 h-5"/><span>المدونة</span></button>
                           {publishedPages.map(page => (
                                <button key={page.id} onClick={() => onNavigate(Page.ContentPage, { slug: page.slug })} className="font-semibold transition px-4 py-2 rounded-md text-slate-600 hover:text-purple-600 flex items-center gap-2">
                                    <PageIcon className="w-5 h-5"/><span>{page.title}</span>
                                </button>
                           ))}
                           {currentUser?.role === 'admin' && <button onClick={() => onNavigate(Page.Admin)} className="font-semibold transition px-4 py-2 rounded-md text-slate-600 hover:text-purple-600 flex items-center gap-2"><AdminIcon className="w-5 h-5"/><span>لوحة التحكم</span></button>}
                        </nav>
                        
                        <div className="flex items-center gap-4">
                           {currentUser ? (
                                <>
                                    <button onClick={() => onNavigate(Page.Messages)} className="relative flex items-center justify-center h-10 w-10 rounded-full text-slate-600 border-2 border-slate-300 hover:bg-slate-100 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors" aria-label={`رسائل غير مقروءة (${unreadMessagesCount})`}>
                                        <span className="sr-only">رسائلي</span>
                                        <MessageIcon className="w-6 h-6" />
                                        {unreadMessagesCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" aria-hidden="true"></span>
                                        )}
                                    </button>
                                    <div className="relative group">
                                        <button className="relative flex items-center justify-center h-10 w-10 rounded-full text-slate-600 border-2 border-slate-300 hover:bg-slate-100 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                                            <span className="sr-only">Open user menu</span>
                                            <ProfileIcon className="w-6 h-6" />
                                        </button>
                                        <div className="absolute end-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                                             <div className="px-4 py-2 border-b"><p className="font-bold text-slate-800 truncate">{currentUser.name}</p><p className="text-sm text-slate-500 truncate">{currentUser.email}</p></div>
                                             <div className="py-1">
                                                <button onClick={() => onNavigate(Page.AddListing)} className="w-full flex items-center gap-3 text-right px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"><PlusIcon className="w-5 h-5 text-slate-500"/>أضف عرض</button>
                                                <button onClick={() => onNavigate(Page.Profile)} className="w-full flex items-center gap-3 text-right px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"><ProfileIcon className="w-5 h-5 text-slate-500"/>ملفي الشخصي</button>
                                                <button onClick={() => onNavigate(Page.Messages)} className="w-full flex items-center justify-between gap-3 text-right px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition">
                                                    <div className="flex items-center gap-3">
                                                      <MessageIcon className="w-5 h-5 text-slate-500"/>
                                                      <span>رسائلي</span>
                                                    </div>
                                                    {unreadMessagesCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{unreadMessagesCount}</span>
                                                    )}
                                                </button>
                                                {currentUser.role === 'admin' && <button onClick={() => onNavigate(Page.Admin)} className="w-full flex items-center gap-3 text-right px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"><AdminIcon className="w-5 h-5 text-slate-500"/>لوحة التحكم</button>}
                                             </div>
                                             <div className="py-1 border-t"><button onClick={onLogout} className="w-full flex items-center gap-3 text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"><span>تسجيل الخروج</span><LogoutIcon className="w-5 h-5"/></button></div>
                                        </div>
                                    </div>
                                </>
                           ) : (
                               <button onClick={() => onNavigate(Page.Login)} className="flex items-center gap-3 bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-all hover:scale-105 shadow-md hover:shadow-lg">
                                   <LoginIcon className="w-5 h-5"/>
                                   <span>تسجيل الدخول</span>
                               </button>
                           )}
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden flex justify-between items-center h-20">
                        <button onClick={toggleMobileMenu} className="p-2 -ml-2 text-slate-700">
                            <MenuIcon className="w-6 h-6"/>
                        </button>
                        <Logo onClick={() => onNavigate(Page.Home)} logoUrl={logoUrl} />
                        <button className="p-2 -mr-2 text-slate-700">
                           <SearchIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 invisible'}`} onClick={toggleMobileMenu}></div>
            <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transition-transform transform md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <div className="p-4 h-full flex flex-col">
                    {currentUser ? (
                        <>
                         <div className="p-4 bg-slate-100 rounded-lg mb-4">
                            <img className="w-16 h-16 rounded-full object-cover mx-auto mb-3" src={currentUser.avatarUrl} alt={currentUser.name}/>
                            <p className="font-bold text-slate-800 text-center truncate">{currentUser.name}</p>
                         </div>
                         <nav className="flex-grow space-y-1">
                            <button onClick={() => onNavigate(Page.Home)} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><HomeIcon className="w-6 h-6"/><span className="font-semibold">الرئيسية</span></button>
                            <button onClick={() => onNavigate(Page.Blog)} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><BlogIcon className="w-6 h-6"/><span className="font-semibold">المدونة</span></button>
                            {publishedPages.map(page => (
                                <button key={page.id} onClick={() => onNavigate(Page.ContentPage, { slug: page.slug })} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><PageIcon className="w-6 h-6"/><span className="font-semibold">{page.title}</span></button>
                            ))}
                            <button onClick={() => onNavigate(Page.Messages)} className="w-full flex items-center justify-between gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition">
                               <div className="flex items-center gap-4">
                                  <MessageIcon className="w-6 h-6"/>
                                  <span className="font-semibold">رسائلي</span>
                               </div>
                               {unreadMessagesCount > 0 && (
                                   <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{unreadMessagesCount}</span>
                               )}
                            </button>
                            <button onClick={() => onNavigate(Page.Profile)} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><ProfileIcon className="w-6 h-6"/><span className="font-semibold">ملفي الشخصي</span></button>
                            {currentUser.role === 'admin' && <button onClick={() => onNavigate(Page.Admin)} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><AdminIcon className="w-6 h-6"/><span className="font-semibold">لوحة التحكم</span></button>}
                         </nav>
                         <div className="mt-auto">
                            <button onClick={() => onNavigate(Page.AddListing)} className="w-full flex justify-center border-2 border-purple-600 text-purple-600 font-bold py-2.5 px-5 rounded-full hover:bg-purple-50 transition items-center gap-2 mb-2"><PlusIcon className="w-5 h-5"/><span>أضف عرض</span></button>
                            <button onClick={onLogout} className="w-full flex justify-center items-center gap-3 text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"><LogoutIcon className="w-5 h-5"/><span>تسجيل الخروج</span></button>
                         </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full">
                            <nav className="flex-grow space-y-1">
                               <button onClick={() => onNavigate(Page.Home)} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><HomeIcon className="w-6 h-6"/><span className="font-semibold">الرئيسية</span></button>
                               <button onClick={() => onNavigate(Page.Blog)} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><BlogIcon className="w-6 h-6"/><span className="font-semibold">المدونة</span></button>
                               {publishedPages.map(page => ( <button key={page.id} onClick={() => onNavigate(Page.ContentPage, { slug: page.slug })} className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 hover:bg-purple-50 rounded-lg transition"><PageIcon className="w-6 h-6"/><span className="font-semibold">{page.title}</span></button>))}
                            </nav>
                            <button onClick={() => onNavigate(Page.Login)} className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white font-bold py-2.5 px-5 rounded-full hover:bg-purple-700 transition shadow-md hover:shadow-lg">
                                <LoginIcon className="w-5 h-5"/>
                                <span>تسجيل الدخول</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// --- SVG Icons ---
const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>);
const ProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const AdminIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226a2.25 2.25 0 012.58 0c.55.22 1.02.684 1.11 1.226l.094.549a2.25 2.25 0 003.956.513 2.25 2.25 0 013.252 3.252c-.351.52-.351 1.23 0 1.75a2.25 2.25 0 01-3.252 3.252 2.25 2.25 0 00-3.956.513l-.094.549c-.09.542-.56 1.007-1.11 1.226a2.25 2.25 0 01-2.58 0c-.55-.22-1.02-.684-1.11-1.226l-.094-.549a2.25 2.25 0 00-3.956-.513 2.25 2.25 0 01-3.252-3.252c.351-.52.351 1.23 0-1.75a2.25 2.25 0 013.252-3.252 2.25 2.25 0 003.956-.513l.094.549z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LoginIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m0 0l3-3m-3 3H9" /></svg>);
const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M9 12l3 3m0 0l-3 3m3-3H3" /></svg>);
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>);
const BlogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>);
const PageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>);

export default Header;