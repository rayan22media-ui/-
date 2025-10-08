import React from 'react';
import { GOVERNORATES } from '../constants';

interface FilterBarProps {
  setSearchTerm: (term: string) => void;
  setSelectedGovernorate: (gov: string) => void;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ setSearchTerm, setSelectedGovernorate, setSelectedCategory, categories }) => {
  
  const inputStyle = "w-full md:w-auto flex-grow bg-white/90 border border-transparent rounded-lg py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-slate-800 placeholder:text-slate-500 shadow-sm";
  
  return (
    <div className="w-full max-w-3xl">
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white/40 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-white/30">
          <input
            type="text"
            placeholder="ابحث عن أي شيء..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputStyle}
          />
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

export default FilterBar;