
import React from 'react';
import { Section } from '../types';

interface StatsCardProps {
  section: Section | null;
}

const StatsCard: React.FC<StatsCardProps> = ({ section }) => {
  if (!section) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-medium opacity-80 uppercase tracking-widest">Selected Section</h3>
          <p className="text-3xl font-bold">{section.name}</p>
        </div>
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 p-3 rounded-xl border border-white/10">
          <p className="text-xs opacity-70 mb-1">Students</p>
          <p className="text-lg font-semibold">{section.studentCount}</p>
        </div>
        <div className="bg-white/10 p-3 rounded-xl border border-white/10">
          <p className="text-xs opacity-70 mb-1">Default Room</p>
          <p className="text-lg font-semibold truncate" title={section.assignedRoomName || 'N/A'}>
            {section.assignedRoomName || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
