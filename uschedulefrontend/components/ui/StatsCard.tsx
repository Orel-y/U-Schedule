
import React from 'react';
import { Section } from '../../types/index';

interface StatsCardProps {
  section: Section | null;
}

const StatsCard: React.FC<StatsCardProps> = ({ section }) => {
  if (section === '' || section === null) return <div className="bg-yellow-50 p-7 rounded-[32px] border border-slate-200 shadow-sm back">Select a section to start scheduling</div>;
  return (
    <div className="bg-gradient-to-br from-brand to-brand-900 p-6 rounded-[24px] text-white shadow-xl shadow-brand-200/50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.1em]">Selected Unit</h3>
          <p className="text-2xl font-bold tracking-tight">{section.name}</p>
        </div>
        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> 
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] font-medium opacity-60 mb-0.5">Students</p>
          <p className="text-lg font-bold">{section.studentCount}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] font-medium opacity-60 mb-0.5">Base Room</p>
          <p className="text-lg font-bold truncate">{section.assignedRoomName || 'TBD'}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;