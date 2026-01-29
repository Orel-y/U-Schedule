
import React from 'react';
import { CourseOffering } from '../types';

interface CourseCardProps {
  course: CourseOffering;
  onDragStart: (e: React.DragEvent, courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, course.id)}
      className="bg-white rounded-[8px] p-3 flex flex-col gap-2 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      {/* Top Section – Course Information */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {/* Color Indicator */}
          <div className={`w-3 h-3 rounded-[3px] shrink-0 ${course.color || 'bg-slate-300'}`} />
          
          <div className="flex items-baseline gap-1.5 overflow-hidden">
            <span className="text-[14px] font-semibold text-slate-700 whitespace-nowrap">
              {course.courseCode}
            </span>
            <span className="text-[14px] text-slate-500 truncate">
              {course.courseTitle}
            </span>
          </div>
        </div>

        {/* Metadata Line */}
        <div className="text-[12px] text-slate-400 pl-5">
          {course.creditHours} Credit Hours • {course.sessionsPerWeek} Sessions per week
        </div>
      </div>

      {/* Bottom Section – Teacher Assignment */}
      <div className="flex flex-col gap-1 mt-1">
        <label className="text-[12px] text-slate-400">
          Assigned Teacher
        </label>
        
        <div className="relative group/select">
          <select 
            className="w-full h-8 px-2 pr-8 text-[12px] text-slate-600 bg-white border border-slate-200 rounded-[6px] appearance-none outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
            defaultValue={course.teacherId}
            onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking select
          >
            <option value="" disabled>Select teacher</option>
            <option value={course.teacherId}>{course.teacherName}</option>
            <option value="other-1">Dr. J. Doe</option>
            <option value="other-2">Prof. S. Smith</option>
          </select>
          
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
