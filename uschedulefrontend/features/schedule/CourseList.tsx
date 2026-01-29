
import React from 'react';
import { CourseOffering, Instructor, LabAssistant } from '../../types/index';
import CourseCard from './CourseCard';

interface CourseListProps {
  offerings: CourseOffering[];
  instructors: Instructor[]; // Section staffed instructors
  qualifiedInstructors: Record<string, string[]>; // courseCode -> qualified IDs
  labAssistants: LabAssistant[];
  isLoading: boolean;
  onDragStart: (e: React.DragEvent, payload: any) => void;
  onUpdateInstructor: (courseId: string, instructorId: string, labAssistantId?: string) => void;
  onOpenAssignFlow?: () => void;
  isTermSelected: boolean;
  isHead?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ 
  offerings, 
  instructors, 
  qualifiedInstructors,
  labAssistants, 
  isLoading, 
  onDragStart, 
  onUpdateInstructor,
  onOpenAssignFlow,
  isTermSelected, 
  isHead = false 
}) => {
  if (!isTermSelected) return (
    <div className="py-12 px-6 text-center">
       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
         <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
       </div>
       <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest leading-relaxed">Select a semester and batch to load curriculum</p>
    </div>
  );

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-[140px] bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />)}
    </div>
  );

  if (offerings.length === 0) return (
    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
      <p className="text-slate-400 text-sm font-medium">No courses found for selected filters.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Course Offerings</h3>
        <span className="text-[10px] font-black text-white bg-brand px-2 py-0.5 rounded-lg">{offerings.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {offerings.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            instructors={instructors}
            qualifiedInstructorIds={qualifiedInstructors[course.courseCode] || []}
            labAssistants={labAssistants}
            onDragStart={onDragStart} 
            onUpdateAssignment={onUpdateInstructor}
            onOpenAssignFlow={onOpenAssignFlow}
            isHead={isHead} 
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
