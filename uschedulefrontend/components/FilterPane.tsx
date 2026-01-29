
import React from 'react';
import Select from './Common/Select';
import { Department, Section } from '../types';

interface FilterPaneProps {
  departments: Department[];
  yearLevels: number[];
  sections: Section[];
  selectedDept: string;
  selectedYear: string;
  selectedSection: string;
  selectedTerm: string;
  onDeptChange: (id: string) => void;
  onYearChange: (year: string) => void;
  onSectionChange: (id: string) => void;
  onTermChange: (term: string) => void;
  isLoading: {
    depts: boolean;
    years: boolean;
    sections: boolean;
  };
}

const FilterPane: React.FC<FilterPaneProps> = ({
  departments,
  yearLevels,
  sections,
  selectedDept,
  selectedYear,
  selectedSection,
  selectedTerm,
  onDeptChange,
  onYearChange,
  onSectionChange,
  onTermChange,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <Select
        label="Department"
        value={selectedDept}
        options={departments.map(d => ({ value: d.id, label: d.name }))}
        onChange={onDeptChange}
        loading={isLoading.depts}
        placeholder="Choose Department"
      />
      
      <Select
        label="Year Level"
        value={selectedYear}
        options={yearLevels.map(y => ({ value: y, label: `Year ${y}` }))}
        onChange={onYearChange}
        disabled={!selectedDept}
        loading={isLoading.years}
        placeholder="Choose Year"
      />

      <Select
        label="Section"
        value={selectedSection}
        options={sections.map(s => ({ value: s.id, label: s.name }))}
        onChange={onSectionChange}
        disabled={!selectedYear}
        loading={isLoading.sections}
        placeholder="Choose Section"
      />

      <Select
        label="Term"
        value={selectedTerm}
        options={[
          { value: '1', label: 'Semester I' },
          { value: '2', label: 'Semester II' }
        ]}
        onChange={onTermChange}
        disabled={!selectedSection}
        placeholder="Choose Term"
      />

      <div className="flex md:col-span-1 lg:col-span-1">
        <button 
          onClick={() => {
            onDeptChange("");
            onYearChange("");
            onSectionChange("");
            onTermChange("");
          }}
          className="w-full h-11 px-4 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPane;
