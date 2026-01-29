
import React from 'react';
import { Days, TIME_SLOTS, Assignment, CourseOffering } from '../types';

interface TimetableGridProps {
  assignments: Assignment[];
  courseOfferings: CourseOffering[];
  onDrop: (day: string, time: string, courseId: string) => void;
  onRemove: (assignmentId: string) => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  assignments, 
  courseOfferings, 
  onDrop,
  onRemove 
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    const courseId = e.dataTransfer.getData('courseId');
    if (courseId) {
      onDrop(day, time, courseId);
    }
  };

  const getAssignmentAt = (day: string, time: string) => {
    return assignments.find(a => a.day === day && a.startTime === time);
  };

  const days = Object.values(Days);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200">
          <div className="p-4 bg-slate-50 border-r border-slate-200" />
          {days.map((day) => (
            <div key={day} className="p-4 bg-slate-50 text-center font-bold text-slate-600 text-xs uppercase tracking-wider border-r last:border-r-0 border-slate-200">
              {day}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)]">
          {TIME_SLOTS.map((time) => (
            <React.Fragment key={time}>
              {/* Time Label */}
              <div className="p-4 flex items-center justify-center text-[11px] font-bold text-slate-400 border-r border-b border-slate-200 bg-slate-50/30">
                {time}
              </div>

              {/* Day Slots */}
              {days.map((day) => {
                const assignment = getAssignmentAt(day, time);
                const course = assignment ? courseOfferings.find(c => c.id === assignment.courseOfferingId) : null;

                return (
                  <div
                    key={`${day}-${time}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, time)}
                    className="min-h-[110px] p-2 border-r last:border-r-0 border-b border-slate-100 hover:bg-slate-50 transition-colors group relative"
                  >
                    {assignment && course ? (
                      <div className="h-full p-2 rounded-[6px] bg-white border border-slate-200 shadow-sm flex flex-col justify-between transition-all group-hover:shadow-md">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-[2px] ${course.color || 'bg-slate-300'}`} />
                            <span className="text-[10px] font-bold text-slate-700 leading-none">{course.courseCode}</span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 leading-tight line-clamp-2">{course.courseTitle}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50">
                           <span className="text-[9px] font-medium text-slate-400 truncate pr-2">{course.teacherName}</span>
                           <button 
                            onClick={() => onRemove(assignment.id)}
                            className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
                           >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Assign</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
