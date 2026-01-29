
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { HomebaseAssignment } from '../types';

const ClassAssignmentTab: React.FC = () => {
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignments, setAssignments] = useState<HomebaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const { isAssigned: status } = await api.getClassAssignmentStatus();
      setIsAssigned(status);
      if (status) {
        const data = await api.fetchHomebaseAssignments();
        setAssignments(data);
      }
    } catch (error) {
      console.error("Failed to load assignment status", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      const result = await api.assignClasses();
      if (result.success) {
        await loadStatus();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Assignment failed", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all class assignments? This cannot be undone.")) return;
    
    setIsResetting(true);
    try {
      const result = await api.resetClassAssignment();
      if (result.success) {
        setIsAssigned(false);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Reset failed", error);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Checking assignment status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Section to Room Assignment</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isAssigned 
              ? "Current system-wide assignments are active." 
              : "Assign all sections to their respective homebase classrooms based on capacity."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAssign}
            disabled={isAssigned || isAssigning}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg
              ${isAssigned 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 active:scale-95'}
              ${isAssigning ? 'opacity-70 animate-pulse' : ''}`}
          >
            {isAssigning ? 'Assigning...' : 'Assign Classes'}
          </button>
          <button
            onClick={handleReset}
            disabled={!isAssigned || isResetting}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm border transition-all
              ${!isAssigned 
                ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed' 
                : 'bg-white text-red-500 border-red-100 hover:bg-red-50 active:scale-95'}`}
          >
            {isResetting ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      </div>

      {isAssigned ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Room Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Building</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Floor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.sectionName}</td>
                    <td className="px-6 py-4 text-slate-600">{row.departmentName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-500">
                        {row.studentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-semibold">{row.roomName}</td>
                    <td className="px-6 py-4 text-slate-600">{row.buildingName}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 text-sm">Floor {row.floor}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Assignments Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Click the 'Assign Classes' button to automatically match sections with classrooms that fit their capacity.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassAssignmentTab;
