
import React from 'react';
import Select from '../../components/ui/Select';
import { AcademicProgram, Section, Batch, CourseOffering, Instructor, LabAssistant } from '../../types/index';
import CourseCard from './CourseCard';

interface FilterPaneProps {
  batches: Batch[];
  academicPrograms: AcademicProgram[];
  yearLevels: number[];
  sections: Section[];
  availableYears: { value: string; label: string }[];
  
  selectedProgramType: string;
  selectedAdmissionType: string;
  selectedEntryYear: string;
  selectedProgram: string;
  selectedYear: string;
  selectedSection: string;
  selectedTerm: string;
  searchQuery: string;

  onProgramTypeChange: (type: string) => void;
  onAdmissionTypeChange: (type: string) => void;
  onEntryYearChange: (year: string) => void;
  onProgramChange: (id: string) => void;
  onYearChange: (year: string) => void;
  onSectionChange: (id: string) => void;
  onTermChange: (term: string) => void;
  setSearchQuery: (query: string) => void;
  onClearFilters: () => void;
  
  isLoading: any;
  
  // Prompt related props
  showPrompt: boolean;
  onClosePrompt: () => void;
  selectedSectionData: Section | null;
  courseOfferings: CourseOffering[];
  instructors: Instructor[]; // Full list for staffing prompt
  sectionInstructors: Instructor[]; // Filtered list for cards
  labAssistants: LabAssistant[];
  qualifiedInstructors: Record<string, string[]>; // Map courseCode -> qualified IDs
  onUpdateInstructor: (courseId: string, instructorId: string, labAssistantId?: string) => void;
  onDragStart: (e: React.DragEvent, payload: any) => void;
}

const FilterPane: React.FC<FilterPaneProps> = (props) => (
  <div className="relative space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-5 items-end bg-white p-7 rounded-[24px] border border-slate-200 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)]">
      <Select 
        label="Program" 
        value={props.selectedProgramType} 
        options={[
          { value: 'Degree', label: 'Degree' },
          { value: 'Masters', label: 'Masters' },
          { value: 'PhD', label: 'PhD' },
          { value: 'Certificate', label: 'Certificate' }
        ]} 
        onChange={props.onProgramTypeChange} 
        placeholder="Choose Type" 
      />
      <Select 
        label="Admission" 
        value={props.selectedAdmissionType} 
        options={[
          { value: 'Regular', label: 'Regular' },
          { value: 'Weekend', label: 'Weekend' },
          { value: 'Evening', label: 'Evening' }
        ]} 
        onChange={props.onAdmissionTypeChange} 
        placeholder="Choose Mode" 
      />
      <Select 
        label="Batch (Year)" 
        value={props.selectedEntryYear} 
        options={props.availableYears} 
        onChange={props.onEntryYearChange} 
        disabled={!props.selectedProgramType || !props.selectedAdmissionType}
        placeholder="Entry Year" 
      />
      <Select 
        label="Academic Program" 
        value={props.selectedProgram} 
        options={props.academicPrograms.map(p => ({ value: p.id, label: p.name }))} 
        onChange={props.onProgramChange} 
        loading={props.isLoading.programs} 
        placeholder="Select Program" 
      />
      <Select 
        label="Year Level" 
        value={props.selectedYear} 
        options={props.yearLevels.map(y => ({ value: y, label: `Year ${y}` }))} 
        onChange={props.onYearChange} 
        disabled={!props.selectedProgram} 
        loading={props.isLoading.years} 
        placeholder="Year" 
      />
      <Select 
        label="Semester" 
        value={props.selectedTerm} 
        options={[{ value: '1', label: 'Semester I' }, { value: '2', label: 'Semester II' }]} 
        onChange={props.onTermChange} 
        disabled={!props.selectedYear} 
        placeholder="Term" 
      />
      <Select 
        label="Section" 
        value={props.selectedSection} 
        options={props.sections.map(s => ({ value: s.id, label: s.name }))} 
        onChange={props.onSectionChange} 
        disabled={!props.selectedYear} 
        loading={props.isLoading.sections} 
        placeholder="Section" 
      />
      <button 
        onClick={props.onClearFilters} 
        aria-label="Clear all filters"
        className="h-11 px-4 text-[13px] font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-200/50 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-red-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        Clear All
      </button>
    </div>

    {props.showPrompt && props.selectedSectionData && (
      <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-brand-50/50 border border-brand-100 rounded-[28px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand border border-brand-100">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Staff Instructors to {props.selectedSectionData.name}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Assign teachers qualified for each of this section's courses.
              </p>
            </div>
          </div>
          <button 
            onClick={props.onClosePrompt}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:text-red-500 text-slate-400 transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-md active:scale-95"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {props.courseOfferings.map(course => (
            <div key={course.id} className="relative group">
              <CourseCard 
                course={course}
                instructors={props.instructors} // All instructors (global check)
                qualifiedInstructorIds={props.qualifiedInstructors[course.courseCode] || []}
                labAssistants={props.labAssistants}
                onDragStart={props.onDragStart}
                onUpdateAssignment={props.onUpdateInstructor}
                isHead={true}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {course.isAssigned && (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">STAFFED</span>
                )}
              </div>
            </div>
          ))}
          {props.courseOfferings.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 font-bold text-sm bg-white/50 border border-dashed border-slate-200 rounded-2xl uppercase tracking-widest">
              No courses found for this criteria
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={props.onClosePrompt}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-500 hover:text-brand hover:border-brand-200 hover:bg-brand-50 transition-all active:scale-95 shadow-sm"
          >
            Finished staffing
          </button>
        </div>
      </div>
    )}
  </div>
);

export default FilterPane;
