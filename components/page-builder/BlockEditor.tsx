import React, { useState } from 'react';
import { PageBlock } from '../../types';
import { RichTextEditor } from '../pages/AdminPage';

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
            <FormField label="العنوان الفرعي"><textarea value={props.subtitle || ''} onChange={e => updateProp('subtitle', e.target.value)} rows={3} className={inputStyle}></textarea></FormField>
            <FormField label="صورة الخلفية"><ImageInput value={props.imageUrl || ''} onChange={val => updateProp('imageUrl', val)} /></FormField>
            <button onClick={() => onSave({ ...block, props })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

const TextEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [content, setContent] = useState(block.props.content || '');
    return (
         <div className="space-y-4">
            <FormField label="المحتوى النصي"><RichTextEditor value={content} onChange={setContent} /></FormField>
            <button onClick={() => onSave({ ...block, props: { content } })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

const ImageEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-4">
            <FormField label="الصورة"><ImageInput value={props.src || ''} onChange={val => updateProp('src', val)} /></FormField>
            <FormField label="النص البديل (Alt Text)"><input type="text" value={props.alt || ''} onChange={e => updateProp('alt', e.target.value)} className={inputStyle} /></FormField>
            <button onClick={() => onSave({ ...block, props })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

const BannerEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-4">
            <FormField label="صورة البانر"><ImageInput value={props.src || ''} onChange={val => updateProp('src', val)} /></FormField>
            <FormField label="النص البديل (Alt Text)"><input type="text" value={props.alt || ''} onChange={e => updateProp('alt', e.target.value)} className={inputStyle} /></FormField>
            <button onClick={() => onSave({ ...block, props })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

const SliderEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [slides, setSlides] = useState(block.props.slides || []);
    
    const updateSlide = (index: number, field: string, value: any) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };
    
    const addSlide = () => {
        setSlides([...slides, { id: `slide-${Date.now()}`, src: '', title: '', subtitle: '' }]);
    };
    
    const removeSlide = (index: number) => {
        setSlides(slides.filter((_: any, i: number) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                {slides.map((slide: any, index: number) => (
                    <div key={slide.id} className="border p-4 rounded-lg bg-white space-y-3 relative">
                        <h4 className="font-bold text-slate-700">الشريحة #{index + 1}</h4>
                        <FormField label="العنوان"><input type="text" value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} className={inputStyle} /></FormField>
                        <FormField label="النص الفرعي"><input type="text" value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} className={inputStyle} /></FormField>
                        <FormField label="الصورة"><ImageInput value={slide.src} onChange={val => updateSlide(index, 'src', val)} /></FormField>
                        <button onClick={() => removeSlide(index)} className="absolute top-2 left-2 text-red-500 hover:bg-red-100 p-1.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addSlide} className="w-full bg-purple-100 text-purple-700 font-semibold py-2 rounded-lg hover:bg-purple-200">+ إضافة شريحة</button>
            <button onClick={() => onSave({ ...block, props: { slides } })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

const ListingsEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void, categories: string[] }> = ({ block, onSave, categories }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-4">
            <FormField label="عنوان القسم">
                <input type="text" value={props.title || ''} onChange={e => updateProp('title', e.target.value)} className={inputStyle} />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="الفئة">
                    <select value={props.category || ''} onChange={e => updateProp('category', e.target.value)} className={inputStyle}>
                        <option value="">كل الفئات</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </FormField>
                <FormField label="عدد العروض">
                    <input type="number" min="1" max="20" value={props.limit || 8} onChange={e => updateProp('limit', parseInt(e.target.value, 10))} className={inputStyle} />
                </FormField>
            </div>

            <FormField label="طريقة العرض">
                <div className="flex gap-2 p-1 bg-slate-200 rounded-xl">
                    <label className="flex-1 text-center cursor-pointer">
                        <input type="radio" name="layout" value="grid" checked={props.layout === 'grid' || !props.layout} onChange={e => updateProp('layout', e.target.value)} className="sr-only peer" />
                        <div className="p-2 rounded-lg peer-checked:bg-white peer-checked:shadow font-semibold text-slate-600 transition">شبكة (أفقي)</div>
                    </label>
                    <label className="flex-1 text-center cursor-pointer">
                        <input type="radio" name="layout" value="list" checked={props.layout === 'list'} onChange={e => updateProp('layout', e.target.value)} className="sr-only peer" />
                        <div className="p-2 rounded-lg peer-checked:bg-white peer-checked:shadow font-semibold text-slate-600 transition">قائمة (عامودي)</div>
                    </label>
                </div>
            </FormField>
            
            <button onClick={() => onSave({ ...block, props })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

const BlogPostsEditor: React.FC<{ block: PageBlock, onSave: (block: PageBlock) => void }> = ({ block, onSave }) => {
    const [props, setProps] = useState(block.props);
    const updateProp = (key: string, value: any) => setProps(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-4">
            <FormField label="عنوان القسم"><input type="text" value={props.title || ''} onChange={e => updateProp('title', e.target.value)} className={inputStyle} /></FormField>
            <FormField label="عدد المقالات للظهور"><input type="number" value={props.limit || 3} onChange={e => updateProp('limit', parseInt(e.target.value, 10))} className={inputStyle} /></FormField>
            <button onClick={() => onSave({ ...block, props })} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
        </div>
    );
};

// --- Main Block Editor Modal ---
interface BlockEditorProps {
    block: PageBlock;
    onSave: (block: PageBlock) => void;
    onCancel: () => void;
    categories?: string[];
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onSave, onCancel, categories }) => {
    
    const EditorComponent = () => {
        switch (block.type) {
            case 'hero': return <HeroEditor block={block} onSave={onSave} />;
            case 'text': return <TextEditor block={block} onSave={onSave} />;
            case 'image': return <ImageEditor block={block} onSave={onSave} />;
            case 'banner': return <BannerEditor block={block} onSave={onSave} />;
            case 'slider': return <SliderEditor block={block} onSave={onSave} />;
            case 'listings': return <ListingsEditor block={block} onSave={onSave} categories={categories || []} />;
            case 'blogPosts': return <BlogPostsEditor block={block} onSave={onSave} />;
            default: return <p>لا يوجد محرر لهذا النوع من المكعبات.</p>;
        }
    };

    const blockTypeLabels: Record<string, string> = {
        hero: 'تحرير بانر رئيسي',
        text: 'تحرير نص',
        image: 'تحرير صورة',
        banner: 'تحرير بانر عرض كامل',
        slider: 'تحرير سلايدر',
        listings: 'تحرير عروض المقايضة',
        blogPosts: 'تحرير مقالات المدونة',
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <h3 className="text-xl font-bold text-slate-800">{blockTypeLabels[block.type]}</h3>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-600"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <EditorComponent />
        </div>
    );
};
