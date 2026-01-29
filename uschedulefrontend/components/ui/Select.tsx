
import React from 'react';

interface SelectProps {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange, disabled, loading, placeholder }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full h-11 px-3 bg-white border rounded-xl appearance-none transition-all outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${disabled ? 'bg-slate-50 text-slate-400 border-slate-200' : 'border-slate-300 text-slate-700'}`}
      >
        <option value="" disabled>{loading ? 'Loading...' : placeholder || 'Select option'}</option>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

export default Select;