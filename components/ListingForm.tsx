import React, { useState } from 'react';
import { ListingData } from '../types';
import { GOVERNORATES } from '../constants';
import { getBarterSuggestion } from '../services/geminiService';
import { useToast } from './Toast';

interface ListingFormProps {
  initialData?: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>;
  onSave: (listing: Omit<ListingData, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  categories: string[];
  submitButtonText: string;
}

const ListingForm: React.FC<ListingFormProps> = ({ initialData, onSave, categories, submitButtonText }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]);
  const [governorate, setGovernorate] = useState(initialData?.governorate || GOVERNORATES[0]);
  const [wanted, setWanted] = useState(initialData?.wanted || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { addToast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages([event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetSuggestion = async () => {
    if (!title || !description || !category) {
      addToast('warning', 'معلومات ناقصة', 'يرجى ملء العنوان والوصف والفئة أولاً للحصول على اقتراح.');
      return;
    }
    setIsSuggesting(true);
    setSuggestion('');
    try {
      const result = await getBarterSuggestion(title, category, description);
      setSuggestion(result);
    } catch (error) {
      addToast('error', 'خطأ في جلب الاقتراح', 'حدث خطأ أثناء محاولة الحصول على اقتراح.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !governorate || !wanted || images.length === 0) {
      addToast('warning', 'حقول مطلوبة', 'يرجى ملء جميع الحقول وإضافة صورة واحدة على الأقل.');
      return;
    }
    onSave({ title, description, category, governorate, wanted, images });
  };

  const inputStyle = "w-full py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-slate-800 placeholder:text-slate-400";
  const labelStyle = "block text-sm font-bold text-slate-600 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className={labelStyle}>عنوان العرض</label>
        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} placeholder="مثال: لابتوب Dell مستعمل" required />
      </div>

      <div>
        <label className={labelStyle}>صورة العرض</label>
        <div className="mt-2 flex justify-center items-center w-full">
          <label htmlFor="file-upload" className="flex flex-col justify-center items-center w-full h-96 bg-slate-50 rounded-xl border-2 border-slate-300 border-dashed cursor-pointer hover:bg-slate-100 transition">
            {images[0] ? (
              <img src={images[0]} alt="Preview" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">اضغط للرفع</span> أو اسحب وأفلت</p>
                <p className="text-xs text-slate-500">PNG, JPG, GIF (MAX. 10MB)</p>
              </div>
            )}
            <input id="file-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelStyle}>الوصف</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className={inputStyle} placeholder="صف حالة الغرض وأي تفاصيل مهمة..." required></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className={labelStyle}>الفئة</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputStyle}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="governorate" className={labelStyle}>المحافظة</label>
          <select id="governorate" value={governorate} onChange={e => setGovernorate(e.target.value)} className={inputStyle}>
            {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="wanted" className={labelStyle}>ماذا تريد في المقابل؟</label>
        <div className="relative">
          <textarea id="wanted" value={wanted} onChange={e => setWanted(e.target.value)} rows={3} className={`${inputStyle} resize-none`} placeholder="مثال: هاتف ذكي, جهاز لوحي, أو مبلغ مالي..." required />
          <button type="button" onClick={handleGetSuggestion} disabled={isSuggesting} className="absolute top-3 left-3 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-wait">
            {isSuggesting ? 'جارٍ التفكير...' : '✨ اقترح لي'}
          </button>
        </div>
        {suggestion && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm font-semibold text-purple-800 mb-2">اقتراحاتنا لك:</p>
            <p className="text-sm text-purple-800 whitespace-pre-line">{suggestion}</p>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3.5 px-6 rounded-full hover:bg-purple-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg hover:scale-105">
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export default ListingForm;