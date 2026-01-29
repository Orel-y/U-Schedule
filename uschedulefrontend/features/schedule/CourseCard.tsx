
import React, { useState, useMemo } from 'react';
import { CourseOffering, HourType, Instructor, LabAssistant } from '../../types/index';

interface CourseCardProps {
  course: CourseOffering;
  instructors: Instructor[]; 
  qualifiedInstructorIds: string[]; // List of IDs eligible for this course
  labAssistants: LabAssistant[];
  onDragStart: (e: React.DragEvent, payload: any) => void;
  onUpdateAssignment: (courseId: string, instructorId: string, labAssistantId?: string) => void;
  onOpenAssignFlow?: () => void;
  isHead?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  instructors, 
  qualifiedInstructorIds,
  labAssistants, 
  onDragStart, 
  onUpdateAssignment,
  onOpenAssignFlow,
  isHead = false 
}) => {
  const [selectedHourType, setSelectedHourType] = useState<HourType>('lecture');
  const [selectedInstructorId, setSelectedInstructorId] = useState(course.instructorId);
  const [selectedLabAssistantId, setSelectedLabAssistantId] = useState(course.labAssistantId || "");

  const hourTypes: { type: HourType; label: string; remaining: number }[] = [
    { type: 'lecture', label: 'Lec', remaining: course.remainingLecture },
    { type: 'lab', label: 'Lab', remaining: course.remainingLab },
    { type: 'tutorial', label: 'Tut', remaining: course.remainingTutorial },
    { type: 'field', label: 'Fld', remaining: course.remainingField },
  ];

  const currentRemaining = hourTypes.find(h => h.type === selectedHourType)?.remaining || 0;
  const courseLoad = course.lectureHours + course.labHours + course.tutorialHours + course.fieldHours;

  // Filter the provided instructors to only those qualified for THIS specific course
  const courseSpecificInstructors = useMemo(() => {
    return instructors.filter(inst => qualifiedInstructorIds.includes(inst.id));
  }, [instructors, qualifiedInstructorIds]);

  const handleInstructorChange = (id: string) => {
    setSelectedInstructorId(id);
    onUpdateAssignment(course.id, id, selectedLabAssistantId);
  };

  const handleLabAssistantChange = (id: string) => {
    setSelectedLabAssistantId(id);
    onUpdateAssignment(course.id, selectedInstructorId, id);
  };

  return (
    <div
      draggable={isHead && currentRemaining > 0 && !!selectedInstructorId}
      onDragStart={(e) => {
        if (!isHead) return;
        onDragStart(e, {
          courseId: course.id,
          hourType: selectedHourType,
          instructorId: selectedInstructorId,
          labAssistantId: selectedHourType === 'lab' ? selectedLabAssistantId : undefined
        });
      }}
      className={`bg-white rounded-2xl p-4 flex flex-col gap-4 border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_4px_12px_-1px_rgba(0,0,0,0.03)] transition-all select-none
        ${isHead && currentRemaining > 0 && !!selectedInstructorId ? 'hover:shadow-[0_8px_20px_-6px_rgba(2,136,209,0.15)] hover:border-brand-200 cursor-grab active:cursor-grabbing group' : 'cursor-default opacity-90'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${course.color || 'bg-slate-300'}`} />
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] font-bold text-slate-800 leading-tight">
            {course.courseCode}
          </span>
          <span className="text-[13px] text-slate-500 truncate font-medium">
            {course.courseTitle}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
        {hourTypes.map(({ type, label, remaining }) => (
          <label 
            key={type}
            className={`flex flex-col items-center justify-center py-2 rounded-lg cursor-pointer transition-all border ${selectedHourType === type ? 'bg-white border-brand-200 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <input 
              type="radio" 
              name={`hour-type-${course.id}`} 
              className="hidden" 
              checked={selectedHourType === type} 
              onChange={() => setSelectedHourType(type)}
            />
            <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedHourType === type ? 'text-brand' : 'text-slate-500'}`}>{label}</span>
            <span className={`text-[12px] font-bold ${remaining === 0 ? 'text-red-400' : 'text-slate-800'}`}>{remaining}h</span>
          </label>
        ))}
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Instructor (Qualified)</label>
            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">LOAD: {courseLoad}H</span>
          </div>
          <div className="relative group/select">
            <select 
              disabled={!isHead}
              value={selectedInstructorId}
              onChange={(e) => handleInstructorChange(e.target.value)}
              className={`w-full h-9 px-3 pr-8 text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all ${isHead ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">{courseSpecificInstructors.length > 0 ? "Select Instructor" : "No qualified staff"}</option>
              {courseSpecificInstructors.map(t => {
                const isCurrent = t.id === course.instructorId;
                const insufficient = !isCurrent && t.remainingLoad < courseLoad;
                return (
                  <option key={t.id} value={t.id} disabled={insufficient}>
                    {t.name} (Rem: {t.remainingLoad}h) {insufficient ? '— NO CAPACITY' : ''}
                  </option>
                );
              })}
            </select>
            {isHead && (
              <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </div>
            )}
          </div>
          
          {courseSpecificInstructors.length === 0 && isHead && (
            <div className="text-[9px] font-bold text-red-400 bg-red-50/50 p-2 rounded-lg border border-red-50 mt-1">
              No qualified instructors {instructors.length > 0 ? "staffed to section" : "available"}.
              {onOpenAssignFlow && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenAssignFlow(); }}
                  className="block text-brand underline mt-1 font-black"
                >
                  Manage Section Staffing
                </button>
              )}
            </div>
          )}
        </div>

        {selectedHourType === 'lab' && (
          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex justify-between">
              Lab Assistant <span className="text-red-500">* Required</span>
            </label>
            <div className="relative group/select">
              <select 
                disabled={!isHead}
                value={selectedLabAssistantId}
                onChange={(e) => handleLabAssistantChange(e.target.value)}
                className={`w-full h-9 px-3 pr-8 text-[12px] font-bold text-emerald-700 bg-emerald-50/30 border border-emerald-100 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all ${isHead ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="" disabled>Select Lab Assistant</option>
                {labAssistants.map(la => <option key={la.id} value={la.id}>{la.name}</option>)}
              </select>
              {isHead && (
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-emerald-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isHead && currentRemaining > 0 && !selectedInstructorId && courseSpecificInstructors.length > 0 && (
        <div className="mt-1 text-[10px] font-bold text-brand-600 text-center bg-brand-50 py-1 rounded-lg border border-brand-100 uppercase tracking-tighter">
          Please assign staff first
        </div>
      )}

      {isHead && currentRemaining === 0 && (
        <div className="mt-1 text-[10px] font-bold text-red-500 text-center bg-red-50 py-1 rounded-lg border border-red-100 uppercase tracking-tighter">
          Fully Scheduled ({selectedHourType})
        </div>
      )}
    </div>
  );
};

export default CourseCard;
