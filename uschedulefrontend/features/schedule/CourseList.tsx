
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
  // Cross-program support
  userProgramId?: string;
  onShareWithPrograms?: () => void;
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
  isHead = false,
  userProgramId,
  onShareWithPrograms
}) => {
  // Check for external courses (owned by other programs)
  const externalCourses = userProgramId
    ? offerings.filter(c => c.owningProgramId !== userProgramId)
    : [];
  const hasExternalCourses = externalCourses.length > 0;

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

      {/* Cross-Program Alert Banner */}
      {hasExternalCourses && isHead && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-800">External Courses Detected</h4>
              <p className="text-xs text-amber-600 mt-0.5">
                {externalCourses.length} course(s) are owned by other programs and require their approval for instructor assignment.
              </p>
              {onShareWithPrograms && (
                <button
                  onClick={onShareWithPrograms}
                  className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Request Instructor Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
            userProgramId={userProgramId}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
