
import React, { useMemo, useState, useCallback } from 'react';
import { Days, TIME_SLOTS, Assignment, CourseOffering } from '../../types/index';

interface TimetableGridProps {
  assignments: Assignment[];
  courseOfferings: CourseOffering[];
  onDrop: (day: string, time: string, payload: string) => void;
  onRemove: (assignmentId: string) => void;
  onDragStart?: (e: React.DragEvent, payload: any) => void;
  isHead?: boolean;
  admissionType?: string;
  // Cross-program support
  userProgramId?: string;
  isExternalView?: boolean; // When viewing a shared draft as external owner
  onShareDraft?: () => void;
}

// Toast notification component
const Toast: React.FC<{ message: string; type: 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
    }`}>
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {type === 'error' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )}
    </svg>
    <span className="text-sm font-bold">{message}</span>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const TimetableGrid: React.FC<TimetableGridProps> = ({
  assignments,
  courseOfferings,
  onDrop,
  onRemove,
  onDragStart,
  isHead = false,
  admissionType = 'Regular',
  userProgramId,
  isExternalView = false,
  onShareDraft
}) => {
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null);

  // Check if a course can be scheduled by current user
  const canScheduleCourse = useCallback((courseId: string): boolean => {
    if (!userProgramId) return true; // No program restriction
    const course = courseOfferings.find(c => c.id === courseId);
    if (!course) return false;

    // In external view, only allow scheduling your own courses
    if (isExternalView) {
      return course.owningProgramId === userProgramId;
    }

    // In normal view, only allow scheduling owned courses
    return course.owningProgramId === userProgramId;
  }, [courseOfferings, userProgramId, isExternalView]);

  // Check if a slot is available (for external view)
  const isSlotOccupied = useCallback((day: string, time: string): boolean => {
    return assignments.some(a => a.day === day && a.startTime === time);
  }, [assignments]);

  const showToast = useCallback((message: string, type: 'error' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    if (isHead) e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    if (!isHead) return;
    e.preventDefault();

    const payloadStr = e.dataTransfer.getData('hourScheduleData');
    if (!payloadStr) return;

    try {
      const payload = JSON.parse(payloadStr);
      const courseId = payload.courseId;

      // Check if this is an external course being dropped
      if (!canScheduleCourse(courseId)) {
        const course = courseOfferings.find(c => c.id === courseId);
        showToast(
          `Cannot schedule ${course?.courseCode || 'this course'} - it's managed by ${course?.owningProgramCode || 'another'} program. Share the draft to request scheduling.`,
          'error'
        );
        return;
      }

      // In external view, check if slot is occupied
      if (isExternalView && isSlotOccupied(day, time)) {
        showToast('This slot is already occupied. Please choose an available slot.', 'error');
        return;
      }

      onDrop(day, time, payloadStr);
    } catch {
      onDrop(day, time, payloadStr);
    }
  };

  const handleAssignmentDragStart = (e: React.DragEvent, assignment: Assignment) => {
    if (!isHead || !onDragStart) return;

    // Check if user can move this assignment
    if (!canScheduleCourse(assignment.courseOfferingId)) {
      e.preventDefault();
      const course = courseOfferings.find(c => c.id === assignment.courseOfferingId);
      showToast(
        `Cannot move ${course?.courseCode || 'this course'} - it's managed by ${course?.owningProgramCode || 'another'} program.`,
        'info'
      );
      return;
    }

    e.stopPropagation();
    const payload = {
      assignmentId: assignment.id,
      courseId: assignment.courseOfferingId,
      hourType: assignment.hourType,
      instructorId: assignment.instructorId,
      labAssistantId: assignment.labAssistantId,
      isMove: true // Flag to indicate this is a move operation
    };
    // Set data transfer directly for immediate use
    e.dataTransfer.setData('hourScheduleData', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    // Also call the handler if provided (for consistency)
    onDragStart(e, payload);
  };

  const getAssignmentAt = (day: string, time: string) => assignments.find(a => a.day === day && a.startTime === time);

  const displayedDays = useMemo(() => {
    if (admissionType === 'Weekend') {
      return [Days.SATURDAY, Days.SUNDAY];
    }
    return [Days.MONDAY, Days.TUESDAY, Days.WEDNESDAY, Days.THURSDAY, Days.FRIDAY];
  }, [admissionType]);

  const hiddenAssignmentsExist = useMemo(() => {
    return assignments.some(a => !displayedDays.includes(a.day as Days));
  }, [assignments, displayedDays]);

  const gridColsClass = admissionType === 'Weekend'
    ? 'grid-cols-[100px_repeat(2,1fr)]'
    : 'grid-cols-[100px_repeat(5,1fr)]';

  // Check if assignment is for an external course (for visual styling)
  const hasExternalCourses = useMemo(() => {
    if (!userProgramId) return false;
    return courseOfferings.some(c => c.owningProgramId !== userProgramId);
  }, [courseOfferings, userProgramId]);

  // Check if assignment is for an external course (for visual styling)
  const isExternalAssignment = useCallback((assignment: Assignment): boolean => {
    if (!userProgramId) return false;
    const course = courseOfferings.find(c => c.id === assignment.courseOfferingId);
    return course ? course.owningProgramId !== userProgramId : false;
  }, [courseOfferings, userProgramId]);

  return (
    <div className="space-y-4">
      {/* External View Banner */}
      {isExternalView && (
        <div className="flex items-center gap-3 px-6 py-4 bg-brand-50 border border-brand-100 rounded-2xl text-brand-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-xs font-bold uppercase tracking-wider">
            External Draft View • You can only schedule your own courses in available (empty) slots
          </p>
        </div>
      )}

      {hiddenAssignmentsExist && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-bold uppercase tracking-wider">
            Notice: Some scheduled sessions are hidden by the current Admission Type filter.
            <span className="ml-1 opacity-70">Switch back to view them.</span>
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-[32px] border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.02)]">
        <div className={admissionType === 'Weekend' ? 'min-w-[600px]' : 'min-w-[900px]'}>
          {/* Header Row */}
          <div className={`grid ${gridColsClass} border-b border-slate-200`}>
            <div className="p-4 bg-slate-50/80 border-r border-slate-200" />
            {displayedDays.map((day) => (
              <div key={day} className="p-6 bg-slate-50/80 text-center font-black text-slate-500 text-[11px] uppercase tracking-[0.2em] border-r last:border-r-0 border-slate-200">
                {day}
              </div>
            ))}
          </div>

          {/* Timetable Body */}
          <div className={`grid ${gridColsClass}`}>
            {TIME_SLOTS.map((time) => (
              <React.Fragment key={time}>
                {/* Time Slot Label */}
                <div className="p-6 flex items-center justify-center text-[12px] font-black text-slate-400 border-r border-b border-slate-200 bg-slate-50/40">
                  {time}
                </div>

                {/* Day Columns for current Time Slot */}
                {displayedDays.map((day) => {
                  const assignment = getAssignmentAt(day, time);
                  const course = assignment ? courseOfferings.find(c => c.id === assignment.courseOfferingId) : null;
                  const isExternal = assignment ? isExternalAssignment(assignment) : false;
                  const slotOccupied = isSlotOccupied(day, time);

                  return (
                    <div
                      key={`${day}-${time}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, time)}
                      className={`min-h-[140px] p-3 border-r last:border-r-0 border-b border-slate-100 transition-colors group relative ${isHead && !slotOccupied ? 'hover:bg-slate-50/80' : ''
                        } ${isExternalView && slotOccupied && !isExternal ? 'bg-slate-50/50' : ''}`}
                    >
                      {assignment && course ? (
                        <div
                          draggable={isHead && !isExternal}
                          onDragStart={(e) => handleAssignmentDragStart(e, assignment)}
                          className={`h-full p-3 rounded-[18px] border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all ${isExternal
                            ? 'bg-amber-50/50 border-amber-200 cursor-default'
                            : 'bg-white border-slate-200'
                            } ${isHead && !isExternal
                              ? 'cursor-grab active:cursor-grabbing group-hover:shadow-[0_4px_15px_-4px_rgba(2,136,209,0.2)] group-hover:border-brand-200 hover:scale-[1.02] hover:border-brand-300'
                              : ''
                            }`}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${course.color || 'bg-slate-300'}`} />
                                <span className="text-[11px] font-black text-slate-800 leading-none truncate">{course.courseCode}</span>
                                {/* Ownership badge */}
                                {course.owningProgramCode && (
                                  <span className={`px-1 py-0.5 rounded text-[8px] font-black ${isExternal
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-brand-50 text-brand'
                                    }`}>
                                    {course.owningProgramCode}
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight ${assignment.hourType === 'lecture' ? 'bg-brand-50 text-brand border border-brand-100' :
                                assignment.hourType === 'lab' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  assignment.hourType === 'tutorial' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                                }`}>
                                {assignment.hourType}
                              </span>
                            </div>
                            <p className="text-[12px] font-bold text-slate-500 leading-tight line-clamp-2">{course.courseTitle}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Instructor</span>
                              <span className="text-[11px] font-bold text-slate-700 truncate">
                                {assignment.instructorName ||
                                  (assignment.instructorId.startsWith('t-')
                                    ? (course.instructorName || assignment.instructorId)
                                    : assignment.instructorId)}
                              </span>
                              {assignment.hourType === 'lab' && assignment.labAssistantId && (
                                <span className="text-[9px] font-medium text-emerald-500 truncate mt-0.5">Asst: {assignment.labAssistantId}</span>
                              )}
                            </div>
                            {isHead && !isExternal && (
                              <button onClick={() => onRemove(assignment.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                            {isExternal && (
                              <span className="text-[9px] font-bold text-amber-500">
                                <svg className="w-3 h-3 inline-block mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                External
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        isHead && (
                          <div className={`h-full w-full border-2 border-dashed rounded-[18px] flex items-center justify-center transition-all ${isExternalView && !slotOccupied
                            ? 'border-brand-200 opacity-100 bg-brand-50/30'
                            : 'border-slate-200/50 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                            }`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isExternalView ? 'text-brand' : 'text-slate-300'
                              }`}>
                              {isExternalView ? 'Available' : 'Drop Slot'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Share Draft Block - Moved to bottom and conditional */}
      {isHead && !isExternalView && hasExternalCourses && onShareDraft && (
        <div className="flex items-center justify-between px-8 py-6 bg-white border border-slate-200 rounded-[32px] shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Cross-Program Notification</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Found external courses that need staffing. Share this draft to notify owners.
              </p>
            </div>
          </div>
          <button
            onClick={onShareDraft}
            className="group px-10 py-4 bg-brand text-white rounded-2xl text-[14px] font-black transition-all hover:bg-brand-600 hover:shadow-2xl hover:shadow-brand/30 active:scale-95 flex items-center gap-3"
          >
            <span>Share Draft with Programs</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TimetableGrid;
