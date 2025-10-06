import { User, Listing, Message, BlogPost, Report, PageContent } from './types';

export const GOVERNORATES: string[] = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'دير الزور', 'الحسكة', 'الرقة', 'إدلب', 'درعا', 'السويداء', 'القنيطرة',
];

export const INITIAL_CATEGORIES: string[] = [
  'إلكترونيات', 'أجهزة منزلية', 'أثاث وديكور', 'ملابس وإكسسوارات', 'كتب وهوايات', 'سيارات ومركبات', 'عقارات', 'خدمات', 'أخرى',
];

export const BLOG_CATEGORIES: string[] = [
    'نصائح للمقايضة', 'أخبار المنصة', 'قصص نجاح', 'مقالات عامة'
];


// --- MOCK DATA ---
// We define base users and listings here to be used in other mock data sets

const MOCK_USERS_BASE: User[] = [
  { id: 1, name: 'علي الأحمد', email: 'ali@example.com', password: '123', phone: '0912345678', avatarUrl: 'https://picsum.photos/seed/user1/200/200', governorate: 'دمشق', role: 'user', status: 'active' },
  { id: 2, name: 'فاطمة الزهراء', email: 'fatima@example.com', password: '123', phone: '0987654321', avatarUrl: 'https://picsum.photos/seed/user2/200/200', governorate: 'حلب', role: 'user', status: 'active' },
  { id: 3, name: 'مدير النظام', email: 'admin@win.sy', password: 'admin123', phone: '0933333333', avatarUrl: 'https://picsum.photos/seed/admin/200/200', governorate: 'دمشق', role: 'admin', status: 'active' },
  { id: 4, name: 'سامر المحمد', email: 'samer@example.com', password: '123', phone: '0944444444', avatarUrl: 'https://picsum.photos/seed/user4/200/200', governorate: 'حمص', role: 'user', status: 'banned' },
];

const MOCK_LISTINGS_BASE: Listing[] = [
  { id: 1, user: MOCK_USERS_BASE[0], title: 'لابتوب Dell XPS 15 مستعمل', description: 'لابتوب بحالة ممتازة، معالج i7، رام 16 جيجا، SSD 512. للمقايضة على هاتف حديث.', category: 'إلكترونيات', governorate: 'دمشق', images: ['https://picsum.photos/seed/laptop/800/600'], wanted: 'هاتف iPhone 13 أو أحدث', createdAt: new Date('2023-10-26T10:00:00Z'), status: 'active' },
  { id: 2, user: MOCK_USERS_BASE[1], title: 'مجموعة كتب وروايات عالمية', description: 'مجموعة من 20 رواية عالمية مترجمة بحالة جديدة. أبحث عن آلة صنع قهوة.', category: 'كتب وهوايات', governorate: 'حلب', images: ['https://picsum.photos/seed/books/800/600'], wanted: 'آلة صنع قهوة نوع جيد', createdAt: new Date('2023-10-25T14:30:00Z'), status: 'active' },
  { id: 3, user: MOCK_USERS_BASE[0], title: 'دراجة هوائية رياضية', description: 'دراجة بحالة جيدة جداً، استخدام قليل. للمقايضة على جهاز لوحي.', category: 'سيارات ومركبات', governorate: 'دمشق', images: ['https://picsum.photos/seed/bike/800/600'], wanted: 'جهاز لوحي (تابلت)', createdAt: new Date('2023-10-24T09:00:00Z'), status: 'traded' },
  { id: 4, user: MOCK_USERS_BASE[1], title: 'كاميرا كانون احترافية', description: 'كاميرا Canon EOS 5D Mark IV مع عدسة 24-105mm. بحالة ممتازة. أبحث عن لابتوب MacBook Pro.', category: 'إلكترونيات', governorate: 'اللاذقية', images: ['https://picsum.photos/seed/camera/800/600'], wanted: 'MacBook Pro M1', createdAt: new Date('2023-10-28T12:00:00Z'), status: 'pending' },
];

export const MOCK_USERS_DATA: User[] = MOCK_USERS_BASE;
export const MOCK_LISTINGS_DATA: Listing[] = MOCK_LISTINGS_BASE;

export const MOCK_MESSAGES_DATA: Message[] = [
    { id: 1, senderId: 2, receiverId: 1, listingId: 1, type: 'text', content: 'مرحباً، هل ما زال اللابتوب متوفراً؟', createdAt: new Date('2023-10-26T11:00:00Z'), read: false },
    { id: 2, senderId: 1, receiverId: 2, listingId: 1, type: 'text', content: 'أهلاً، نعم متوفر.', createdAt: new Date('2023-10-26T11:05:00Z'), read: true },
    { id: 3, senderId: 2, receiverId: 1, listingId: 1, type: 'text', content: 'ما هي حالة البطارية؟', createdAt: new Date('2023-10-26T11:10:00Z'), read: false },
];

export const MOCK_BLOG_POSTS_DATA: BlogPost[] = [
    {
      id: 1,
      title: '5 نصائح لمقايضة ناجحة وآمنة',
      content: '<h1><strong>مقايضة ذكية!</strong></h1><p>المقايضة فن، ولتضمن أفضل صفقة، اتبع هذه النصائح الخمسة. أولاً، تأكد من جودة الغرض الذي ستحصل عليه...</p><ul><li>افحص الغرض جيداً.</li><li>التق في مكان عام.</li><li>كن واضحاً في طلباتك.</li></ul>',
      authorId: 3,
      createdAt: new Date('2023-10-20T09:00:00Z'),
      featuredImage: 'https://picsum.photos/seed/blog1/1200/600',
      category: 'نصائح للمقايضة',
      tags: ['أمان', 'مقايضة', 'نصائح']
    },
    {
      id: 2,
      title: 'إطلاق ميزة المحادثات الصوتية في وين!',
      content: '<h2>تحديث جديد!</h2><p>يسعدنا الإعلان عن إطلاق ميزة المحادثات الصوتية لتسهيل التواصل بين المستخدمين. يمكنك الآن تسجيل وإرسال رسائل صوتية مباشرة من المحادثة.</p>',
      authorId: 3,
      createdAt: new Date('2023-10-15T15:20:00Z'),
      featuredImage: 'https://picsum.photos/seed/blog2/1200/600',
      category: 'أخبار المنصة',
      tags: ['تحديث', 'ميزات جديدة']
    }
];

export const MOCK_REPORTS_DATA: Report[] = [
    { id: 1, listingId: 2, reporterId: 1, reason: 'المستخدم غير جاد ولا يرد على الرسائل.', createdAt: new Date('2023-10-27T18:00:00Z'), status: 'new' },
    { id: 2, listingId: 3, reporterId: 2, reason: 'العرض مبالغ فيه جداً والمقابل المطلوب غير منطقي.', createdAt: new Date('2023-10-26T11:30:00Z'), status: 'resolved' },
];

export const MOCK_PAGES_DATA: PageContent[] = [
    {
        id: 1,
        title: 'من نحن',
        slug: 'about-us',
        content: [
            {
                id: 'hero-1',
                type: 'hero',
                props: {
                    title: 'وين للمقايضة: أكثر من مجرد تبادل',
                    subtitle: 'نحن المنصة الرائدة في سوريا لتسهيل عملية المقايضة. مهمتنا هي ربط الناس لمبادلة أغراضهم غير المستخدمة بأشياء يحتاجونها.',
                    imageUrl: 'https://picsum.photos/seed/about-hero/1600/900'
                }
            },
            {
                id: 'text-1',
                type: 'text',
                props: {
                    content: '<h2><strong>رؤيتنا</strong></h2><p>نسعى لخلق قيمة للجميع والمساهمة في اقتصاد مستدام ومجتمع يعتمد على المشاركة. في "وين"، كل غرض له قيمة جديدة تنتظر من يكتشفها.</p>'
                }
            },
             {
                id: 'image-1',
                type: 'image',
                props: {
                    src: 'https://picsum.photos/seed/about-community/1200/800',
                    alt: 'Community'
                }
            },
            {
                id: 'text-2',
                type: 'text',
                props: {
                    content: '<h3><strong>انضم إلينا</strong></h3><p>كن جزءاً من مجتمعنا اليوم. اعرض ما لديك، وابحث عما تحتاجه، واكتشف متعة المقايضة.</p>'
                }
            },
        ],
        status: 'published',
        createdAt: new Date('2023-11-01T10:00:00Z'),
        updatedAt: new Date('2023-11-01T10:00:00Z'),
    },
    {
        id: 2,
        title: 'سياسة الخصوصية',
        slug: 'privacy-policy',
        content: [
            {
                id: 'text-privacy-1',
                type: 'text',
                props: {
                    content: '<h2>سياسة الخصوصية</h2><p>خصوصيتك مهمة لنا. تشرح هذه الصفحة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية. نحن لا نشارك بياناتك مع أطراف ثالثة دون موافقتك.</p>'
                }
            }
        ],
        status: 'draft',
        createdAt: new Date('2023-11-02T12:00:00Z'),
        updatedAt: new Date('2023-11-02T12:00:00Z'),
    },
    {
        id: 3,
        title: 'صفحة تجريبية بالمكعبات الجديدة',
        slug: 'new-builder-demo',
        content: [
            {
                id: 'slider-1',
                type: 'slider',
                props: {
                   slides: [
                       { id: 'slide-1', src: 'https://picsum.photos/seed/slider1/1920/1080', title: 'قايض الإلكترونيات بسهولة', subtitle: 'جدد أجهزتك دون أن تدفع نقوداً.' },
                       { id: 'slide-2', src: 'https://picsum.photos/seed/slider2/1920/1080', title: 'وسع مكتبتك', subtitle: 'تبادل الكتب والروايات مع محبي القراءة الآخرين.' },
                       { id: 'slide-3', src: 'https://picsum.photos/seed/slider3/1920/1080', title: 'أثاث جديد لمنزلك', subtitle: 'غير ديكور منزلك عبر مقايضة قطع الأثاث.' },
                   ]
                }
            },
            {
                id: 'text-demo-1',
                type: 'text',
                props: {
                    content: '<h2>مرحباً في باني الصفحات المطور!</h2><p>هذه الصفحة تم بناؤها بالكامل باستخدام المكعبات الجديدة. يمكنك الآن إضافة سلايدرات تفاعلية وبانرات تمتد على عرض الشاشة بالكامل.</p>'
                }
            },
            {
                id: 'banner-1',
                type: 'banner',
                props: {
                    src: 'https://picsum.photos/seed/banner1/1920/800',
                    alt: 'Banner showcasing community'
                }
            }
        ],
        status: 'draft',
        createdAt: new Date('2023-11-05T10:00:00Z'),
        updatedAt: new Date('2023-11-05T10:00:00Z'),
    },
    {
        id: 4,
        title: 'الصفحة الرئيسية',
        slug: 'home',
        content: [
            {
                id: 'banner-home',
                type: 'banner',
                props: {
                    src: 'https://placehold.co/1600x500/a5b4fc/a5b4fc.png',
                    alt: 'Banner'
                }
            },
            {
                id: 'listings-1',
                type: 'listings',
                props: {
                    title: 'أحدث العروض',
                    limit: 4,
                    layout: 'grid'
                }
            },
            {
                id: 'blog-1',
                type: 'blogPosts',
                props: {
                    title: 'أحدث المقالات',
                    limit: 3
                }
            }
        ],
        status: 'published',
        createdAt: new Date('2023-11-10T10:00:00Z'),
        updatedAt: new Date('2023-11-10T10:00:00Z'),
    }
];