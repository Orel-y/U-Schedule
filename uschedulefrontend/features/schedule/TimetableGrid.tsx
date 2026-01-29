
import React, { useMemo } from 'react';
import { Days, TIME_SLOTS, Assignment, CourseOffering } from '../../types/index';

interface TimetableGridProps {
  assignments: Assignment[];
  courseOfferings: CourseOffering[];
  onDrop: (day: string, time: string, payload: string) => void;
  onRemove: (assignmentId: string) => void;
  isHead?: boolean;
  admissionType?: string;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  assignments, 
  courseOfferings, 
  onDrop, 
  onRemove, 
  isHead = false,
  admissionType = 'Regular'
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    if (isHead) e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    if (!isHead) return;
    e.preventDefault();
    const payload = e.dataTransfer.getData('hourScheduleData');
    if (payload) onDrop(day, time, payload);
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

  return (
    <div className="space-y-4">
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
                  return (
                    <div
                      key={`${day}-${time}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, time)}
                      className={`min-h-[140px] p-3 border-r last:border-r-0 border-b border-slate-100 transition-colors group relative ${isHead ? 'hover:bg-slate-50/80' : ''}`}
                    >
                      {assignment && course ? (
                        <div className={`h-full p-3 rounded-[18px] bg-white border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all ${isHead ? 'group-hover:shadow-[0_4px_15px_-4px_rgba(2,136,209,0.2)] group-hover:border-brand-200' : ''}`}>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${course.color || 'bg-slate-300'}`} />
                                <span className="text-[11px] font-black text-slate-800 leading-none truncate">{course.courseCode}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                                assignment.hourType === 'lecture' ? 'bg-brand-50 text-brand border border-brand-100' :
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
                                <span className="text-[10px] font-bold text-slate-400 truncate">{assignment.instructorId.startsWith('t-') ? course.instructorName : assignment.instructorId}</span>
                                {assignment.hourType === 'lab' && assignment.labAssistantId && (
                                  <span className="text-[9px] font-medium text-emerald-500 truncate">Asst: {assignment.labAssistantId}</span>
                                )}
                             </div>
                             {isHead && (
                               <button onClick={() => onRemove(assignment.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                             )}
                          </div>
                        </div>
                      ) : (
                        isHead && (
                          <div className="h-full w-full border-2 border-dashed border-slate-200/50 rounded-[18px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Drop Slot</span>
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
    </div>
  );
};

export default TimetableGrid;