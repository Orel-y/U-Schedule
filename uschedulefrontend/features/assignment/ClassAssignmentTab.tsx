
import React, { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { HomebaseAssignment } from '../../types/index';

interface ClassAssignmentTabProps {
  isHead?: boolean;
}

const ClassAssignmentTab: React.FC<ClassAssignmentTabProps> = ({ isHead = false }) => {
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignments, setAssignments] = useState<HomebaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const VISUAL_MOCKS: HomebaseAssignment[] = [
    { id: 'vm-1', sectionName: 'CS Section A', academicProgramName: 'Computer Science', studentCount: 52, roomName: 'C-101', buildingName: 'Tech Hall', floor: 1 },
    { id: 'vm-2', sectionName: 'EE Section B', academicProgramName: 'Electrical Engineering', studentCount: 45, roomName: 'E-202', buildingName: 'Power Block', floor: 2 },
    { id: 'vm-3', sectionName: 'IS Section C', academicProgramName: 'Information Systems', studentCount: 30, roomName: 'I-303', buildingName: 'Innovation Hub', floor: 3 },
    { id: 'vm-4', sectionName: 'MATH Section D', academicProgramName: 'Mathematics', studentCount: 60, roomName: 'M-105', buildingName: 'Science Center', floor: 1 }
  ];

  const load = async () => {
    setIsLoading(true);
    const { isAssigned: status } = await api.getClassAssignmentStatus();
    setIsAssigned(status);
    if (status) {
      const realData = await api.fetchHomebaseAssignments();
      setAssignments([...realData, ...VISUAL_MOCKS]);
    } else {
      setAssignments([]);
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!isHead) return;
    const res = await api.assignClasses();
    if (res.success) load(); else alert(res.message);
  };

  const handleReset = async () => {
    if (!isHead) return;
    if (window.confirm("Are you sure you want to reset all classroom mappings?")) {
      await api.resetClassAssignment();
      setIsAssigned(false);
      setAssignments([]);
    }
  };

  if (isLoading) return (
    <div className="p-24 text-center">
      <div className="inline-block w-10 h-10 border-[3px] border-brand-100 border-t-brand rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Synchronizing state...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-[32px] border border-slate-200 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Section Class Room Assignment</h2>
          <p className="text-sm font-medium text-slate-500 mt-1.5 max-w-lg leading-relaxed">System-wide section to classroom assignments. Matches sections to the most optimal available room based on student capacity.</p>
        </div>
        {isHead && (
          <div className="flex gap-4">
            <button 
              onClick={handleAssign} 
              disabled={isAssigned} 
              className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-100 ${isAssigned ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-brand text-white hover:bg-brand-600 active:scale-[0.96]'}`}
            >
              Run Assignment Engine
            </button>
            <button 
              onClick={handleReset} 
              disabled={!isAssigned} 
              className={`px-8 py-3.5 rounded-2xl font-black text-sm border transition-all ${!isAssigned ? 'border-slate-100 text-slate-200 cursor-not-allowed' : 'border-red-100 text-red-500 hover:bg-red-50 active:scale-[0.96]'}`}
            >
              Reset Mapping
            </button>
          </div>
        )}
      </div>

      {isAssigned ? (
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-6 text-[11px] font-black text-brand uppercase tracking-[0.2em] border-r border-slate-100 last:border-r-0">Academic Unit</th>
                  <th className="px-8 py-6 text-[11px] font-black text-brand uppercase tracking-[0.2em] border-r border-slate-100 last:border-r-0">Academic Program</th>
                  <th className="px-8 py-6 text-[11px] font-black text-brand uppercase tracking-[0.2em] border-r border-slate-100 last:border-r-0">Cohort Size</th>
                  <th className="px-8 py-6 text-[11px] font-black text-brand uppercase tracking-[0.2em] border-r border-slate-100 last:border-r-0">Mapped Room</th>
                  <th className="px-8 py-6 text-[11px] font-black text-brand uppercase tracking-[0.2em]">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map(row => (
                  <tr key={row.id} className="hover:bg-brand-50/10 transition-colors group">
                    <td className="px-8 py-5 font-black text-slate-800 border-r border-slate-50 last:border-r-0">{row.sectionName}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium border-r border-slate-50 last:border-r-0">{row.academicProgramName}</td>
                    <td className="px-8 py-5 border-r border-slate-50 last:border-r-0">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 border border-slate-200">{row.studentCount}</span>
                    </td>
                    <td className="px-8 py-5 border-r border-slate-50 last:border-r-0">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                         <span className="text-brand font-black tracking-tight">{row.roomName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{row.buildingName} (F-{row.floor})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] py-24 text-center px-6">
           <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
             <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h3 className="text-xl font-black text-slate-700">No Assignments Generated</h3>
           <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">
             {isHead 
               ? "Run the greedy assignment engine to map academic units to physical spaces."
               : "Academic head has not generated room assignments yet."}
           </p>
        </div>
      )}
    </div>
  );
};

export default ClassAssignmentTab;
