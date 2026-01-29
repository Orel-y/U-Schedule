
import React from 'react';
import { CourseOffering } from '../types';
import CourseCard from './CourseCard';

interface CourseListProps {
  offerings: CourseOffering[];
  isLoading: boolean;
  onDragStart: (e: React.DragEvent, courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ offerings, isLoading, onDragStart }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[120px] bg-slate-50 animate-pulse rounded-xl border border-slate-100" />
        ))}
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm">No course offerings found for this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Courses</h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {offerings.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {offerings.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onDragStart={onDragStart} 
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;
