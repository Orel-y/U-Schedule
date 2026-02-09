
import React, { useState, useEffect } from 'react';
import { ScheduleShareRequest, Instructor, Assignment } from '../../types/index';
import * as api from '../../lib/api';
import ExternalScheduleView from './ExternalScheduleView';

interface PendingSharesPanelProps {
    pendingRequests: ScheduleShareRequest[];
    userProgramId: string;
    onAccept: (requestId: string) => Promise<void>;
    onSubmitAssignment: (requestId: string, instructorId: string, instructorName: string, assignments?: Assignment[]) => Promise<void>;
    onRefresh: () => void;
}

const PendingSharesPanel: React.FC<PendingSharesPanelProps> = ({
    pendingRequests,
    userProgramId,
    onAccept,
    onSubmitAssignment,
    onRefresh
}) => {
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [programInstructors, setProgramInstructors] = useState<Instructor[]>([]);
    const [selectedInstructor, setSelectedInstructor] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [scheduleViewRequestId, setScheduleViewRequestId] = useState<string | null>(null);

    // Get the current version of the request being viewed
    const scheduleViewRequest = pendingRequests.find(r => r.id === scheduleViewRequestId);

    // Fetch instructors for this program
    useEffect(() => {
        const loadInstructors = async () => {
            const instructors = await api.fetchInstructorsByProgram(userProgramId);
            setProgramInstructors(instructors);
        };
        loadInstructors();
    }, [userProgramId]);

    const handleAccept = async (requestId: string) => {
        try {
            await onAccept(requestId);
            setExpandedRequest(requestId);
        } catch (error) {
            alert('Failed to accept request');
        }
    };

    const handleOpenScheduleView = (request: ScheduleShareRequest) => {
        setScheduleViewRequestId(request.id);
    };

    const handleSubmit = async (request: ScheduleShareRequest) => {
        const instructorId = selectedInstructor[request.id];
        if (!instructorId) {
            alert('Please select an instructor');
            return;
        }

        const instructor = programInstructors.find(i => i.id === instructorId);
        if (!instructor) return;

        setIsSubmitting(request.id);
        try {
            await onSubmitAssignment(request.id, instructorId, instructor.name);
            setExpandedRequest(null);
            onRefresh();
        } catch (error) {
            alert('Failed to submit assignment');
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleScheduleViewSubmit = async (
        requestId: string,
        instructorId: string,
        instructorName: string,
        assignments?: Assignment[]
    ) => {
        try {
            await onSubmitAssignment(requestId, instructorId, instructorName, assignments);
            setScheduleViewRequestId(null);
            onRefresh();
        } catch (error) {
            alert('Failed to submit assignment');
        }
    };

    // If in schedule view mode, show the full external schedule view
    if (scheduleViewRequest) {
        return (
            <ExternalScheduleView
                request={scheduleViewRequest}
                userProgramId={userProgramId}
                onSubmitAssignment={handleScheduleViewSubmit}
                onBack={() => setScheduleViewRequestId(null)}
            />
        );
    }

    if (pendingRequests.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-bold text-slate-600 mb-1">No Pending Requests</h3>
                <p className="text-sm text-slate-400">You don't have any instructor assignment requests at this time.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-800">Pending Instructor Requests</h2>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/5 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {pendingRequests.map(request => (
                <div
                    key={request.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                >
                    {/* Request Header */}
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${request.status === 'pending'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {request.status === 'pending' ? 'Awaiting Response' : 'In Progress'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800">
                                    Request from {request.sourceProgramName}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {request.courses.length} course(s) need instructor assignment
                                </p>
                                {request.requestedDay && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        <span className="font-medium">Suggested:</span> {request.requestedDay}
                                        {request.requestedTime && ` at ${request.requestedTime}`}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {request.status === 'pending' && (
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        className="px-4 py-2 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-600 transition-colors"
                                    >
                                        Accept & Assign
                                    </button>
                                )}
                                {(request.status === 'in_progress' || expandedRequest === request.id) && (
                                    <button
                                        onClick={() => handleOpenScheduleView(request)}
                                        className="px-4 py-2 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Open Schedule View
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Courses List */}
                    <div className="p-4 bg-slate-50/50">
                        <div className="space-y-2">
                            {request.courses.map(course => (
                                <div
                                    key={course.id}
                                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
                                >
                                    <div className={`w-3 h-3 rounded-full ${course.color || 'bg-slate-300'}`} />
                                    <div className="flex-1">
                                        <span className="font-bold text-slate-800">{course.courseCode}</span>
                                        <span className="text-slate-400 mx-2">•</span>
                                        <span className="text-slate-600">{course.courseTitle}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{course.creditHours} CR</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Assignment Form (expanded) - Alternative to full schedule view */}
                    {(request.status === 'in_progress' || expandedRequest === request.id) && (
                        <div className="p-5 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50">
                            <h4 className="font-bold text-slate-700 mb-3">Quick Assign (Instructor Only)</h4>
                            <p className="text-xs text-slate-500 mb-3">
                                Use this for quick instructor assignment, or click "Open Schedule View" above for full scheduling.
                            </p>

                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">
                                        Select Instructor from Your Department
                                    </label>
                                    <select
                                        value={selectedInstructor[request.id] || ''}
                                        onChange={e => setSelectedInstructor(prev => ({ ...prev, [request.id]: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    >
                                        <option value="">Choose an instructor...</option>
                                        {programInstructors.map(inst => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.name} (Load: {inst.remainingLoad} hrs remaining)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setExpandedRequest(null)}
                                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(request)}
                                        disabled={!selectedInstructor[request.id] || isSubmitting === request.id}
                                        className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting === request.id ? 'Submitting...' : 'Submit Quick Assignment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PendingSharesPanel;
