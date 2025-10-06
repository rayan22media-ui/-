import React from 'react';
import { GOVERNORATES } from '../constants';

interface FilterBarProps {
  setSearchTerm: (term: string) => void;
  setSelectedGovernorate: (gov: string) => void;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ setSearchTerm, setSelectedGovernorate, setSelectedCategory, categories }) => {
  const inputStyle = "w-full py-3 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-slate-800 placeholder:text-slate-400 shadow-sm";

  return (
    <div className="p-4 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن أي شيء..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputStyle} ps-10`}
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <select 
          onChange={(e) => setSelectedGovernorate(e.target.value)}
          className={inputStyle}
        >
          <option value="">كل المحافظات</option>
          {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
        </select>
        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={inputStyle}
        >
          <option value="">كل الفئات</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
    </div>
  );
};

// --- SVG Icon ---

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export default FilterBar;