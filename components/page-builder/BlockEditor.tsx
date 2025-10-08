// FIX: Reconstructed this file as it was previously incomplete, and added the named export for BlockEditor.
import React, { useState } from 'react';
import { PageBlock } from '../../types';
import RichTextEditor from '../RichTextEditor';

// --- General Editor Components ---
const inputStyle = "w-full py-2 px-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400";
const labelStyle = "block text-sm font-bold text-slate-600 mb-1";

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className={labelStyle}>{label}</label>
        {children}
    </div>
);

// Reusable component for handling image uploads or URLs
const ImageInput: React.FC<{ value: string, onChange: (value: string) => void }> = ({ value, onChange }) => {
    const [inputType, setInputType] = useState<'url' | 'upload'>(value?.startsWith('data:image') ? 'upload' : 'url');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event) => onChange(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="image-source" value="url" checked={inputType === 'url'} onChange={() => setInputType('url')} /><span>رابط</span></label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="image-source" value="upload" checked={inputType === 'upload'} onChange={() => setInputType('upload')} /><span>رفع</span></label>
            </div>
            {inputType === 'url' ? (
                <input type="text" value={value?.startsWith('data:image') ? '' : value} onChange={e => onChange(e.target.value)} placeholder="https://example.com/image.jpg" className={inputStyle} />
            ) : (
                <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            )}
            {value && <img src={value} alt="Preview" className="mt-2 w-32 h-20 rounded object-cover border" />}
        </div>
    );
}

// --- Specific Block Editors ---

const HeroEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));
    
    return (
        <div className="space-y-4">
            <FormField label="العنوان الرئيسي"><input type="text" value={props.title || ''} onChange={e => updateProp('title', e.target.value)} className={inputStyle} /></FormField>
            <FormField label="العنوان الفرعي"><input type="text" value={props.subtitle || ''} onChange={e => updateProp('subtitle', e.target.value)} className={inputStyle} /></FormField>
            <FormField label="صورة الخلفية"><ImageInput value={props.imageUrl || ''} onChange={val => updateProp('imageUrl', val)} /></FormField>
            <div className="pt-4 border-t flex justify-end">
                <button onClick={() => onSave({ ...block, props })} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ</button>
            </div>
        </div>
    );
};

const TextEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [content, setContent] = useState(block.props.content || '');

    return (
        <div className="space-y-4">
            <FormField label="المحتوى النصي"><RichTextEditor value={content} onChange={setContent} /></FormField>
            <div className="pt-4 border-t flex justify-end">
                <button onClick={() => onSave({ ...block, props: { content } })} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ</button>
            </div>
        </div>
    );
};

const ImageEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));
    
    return (
        <div className="space-y-4">
            <FormField label="الصورة"><ImageInput value={props.src || ''} onChange={val => updateProp('src', val)} /></FormField>
            <FormField label="النص البديل (Alt text)"><input type="text" value={props.alt || ''} onChange={e => updateProp('alt', e.target.value)} className={inputStyle} /></FormField>
            <div className="pt-4 border-t flex justify-end">
                <button onClick={() => onSave({ ...block, props })} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ</button>
            </div>
        </div>
    );
};

const BannerEditor = ImageEditor; // Same editor for now

const SliderEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [slides, setSlides] = useState(block.props.slides || []);
    
    const updateSlide = (index: number, field: string, value: string) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    const addSlide = () => {
        setSlides([...slides, { id: `slide-${Date.now()}`, src: '', title: '', subtitle: '' }]);
    };
    
    const removeSlide = (index: number) => {
        setSlides(slides.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {slides.map((slide: any, index: number) => (
                <div key={slide.id || index} className="p-4 border rounded-lg space-y-2 bg-slate-50 relative">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold">الشريحة #{index + 1}</h4>
                        <button onClick={() => removeSlide(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full text-xl font-bold leading-none">&times;</button>
                    </div>
                    <FormField label="العنوان"><input type="text" value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} className={inputStyle} /></FormField>
                    <FormField label="العنوان الفرعي"><input type="text" value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} className={inputStyle} /></FormField>
                    <FormField label="الصورة"><ImageInput value={slide.src} onChange={val => updateSlide(index, 'src', val)} /></FormField>
                </div>
            ))}
            <button onClick={addSlide} className="text-sm font-semibold bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-300">+ إضافة شريحة</button>
            <div className="pt-4 border-t flex justify-end">
                <button onClick={() => onSave({ ...block, props: { slides } })} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ</button>
            </div>
        </div>
    );
};

const ListingsEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void, categories: string[] }> = ({ block, onSave, categories }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-4">
            <FormField label="العنوان"><input type="text" value={props.title || ''} onChange={e => updateProp('title', e.target.value)} className={inputStyle} /></FormField>
            <FormField label="الحد الأقصى للعروض"><input type="number" value={props.limit || 4} onChange={e => updateProp('limit', parseInt(e.target.value, 10))} className={inputStyle} /></FormField>
            <FormField label="الفئة (اختياري)">
                <select value={props.category || ''} onChange={e => updateProp('category', e.target.value)} className={inputStyle}>
                    <option value="">كل الفئات</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </FormField>
            <FormField label="التصميم">
                <select value={props.layout || 'grid'} onChange={e => updateProp('layout', e.target.value)} className={inputStyle}>
                    <option value="grid">شبكة</option>
                    <option value="list">قائمة</option>
                </select>
            </FormField>
            <div className="pt-4 border-t flex justify-end">
                <button onClick={() => onSave({ ...block, props })} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ</button>
            </div>
        </div>
    );
};

const BlogPostsEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-4">
            <FormField label="العنوان"><input type="text" value={props.title || ''} onChange={e => updateProp('title', e.target.value)} className={inputStyle} /></FormField>
            <FormField label="الحد الأقصى للمقالات"><input type="number" value={props.limit || 3} onChange={e => updateProp('limit', parseInt(e.target.value, 10))} className={inputStyle} /></FormField>
            <div className="pt-4 border-t flex justify-end">
                <button onClick={() => onSave({ ...block, props })} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">حفظ</button>
            </div>
        </div>
    );
};

interface BlockEditorProps {
    block: PageBlock;
    onSave: (block: PageBlock) => void;
    onCancel: () => void;
    categories: string[];
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onSave, onCancel, categories }) => {
    const blockTypes: Record<string, { label: string, editor: React.FC<any> }> = {
        hero: { label: 'بانر رئيسي (Hero)', editor: HeroEditor },
        text: { label: 'نص (Text)', editor: TextEditor },
        image: { label: 'صورة (Image)', editor: ImageEditor },
        banner: { label: 'بانر عرض كامل (Banner)', editor: BannerEditor },
        slider: { label: 'سلايدر شرائح (Slider)', editor: SliderEditor },
        listings: { label: 'عروض المقايضة (Listings)', editor: ListingsEditor },
        blogPosts: { label: 'مقالات المدونة (Blog)', editor: BlogPostsEditor },
    };

    const SpecificEditor = blockTypes[block.type]?.editor;
    const title = blockTypes[block.type]?.label || 'مكعب غير معروف';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <h3 className="text-xl font-bold text-slate-800">تعديل مكعب: {title}</h3>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-600"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                {SpecificEditor ? <SpecificEditor block={block} onSave={onSave} categories={categories} /> : <p>لا يوجد محرر لهذا المكعب.</p>}
            </div>
        </div>
    );
};
