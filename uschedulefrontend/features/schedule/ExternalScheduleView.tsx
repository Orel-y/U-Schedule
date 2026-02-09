
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScheduleShareRequest, CourseOffering, Assignment, Instructor } from '../../types/index';
import { fetchInstructorsByProgram, updateShareRequestDraftAssignments } from '../../lib/api';
import TimetableGrid from './TimetableGrid';
import CourseCard from './CourseCard';

interface ExternalScheduleViewProps {
    request: ScheduleShareRequest;
    userProgramId: string;
    onSubmitAssignment: (requestId: string, instructorId: string, instructorName: string, assignments?: Assignment[]) => Promise<void>;
    onBack: () => void;
}

const ExternalScheduleView: React.FC<ExternalScheduleViewProps> = ({
    request,
    userProgramId,
    onSubmitAssignment,
    onBack
}) => {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [selectedInstructorId, setSelectedInstructorId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localAssignments, setLocalAssignments] = useState<Assignment[]>([]);
    const [localOfferings, setLocalOfferings] = useState<CourseOffering[]>(request.courses || []);

    // Unified assignments (sender's draft + local assignments)
    const combinedAssignments = useMemo(() => {
        return [...(request.draftAssignments || []), ...localAssignments];
    }, [request.draftAssignments, localAssignments]);

    // Unified course offerings (sender's courses + possibly local ones)
    const combinedOfferings = useMemo(() => {
        return request.allDraftCourses || localOfferings || [];
    }, [request.allDraftCourses, localOfferings]);

    // Check if any course has scheduling data
    const hasSchedulingData = localAssignments.length > 0;

    // Get instructor name for selected
    const selectedInstructor = instructors.find(i => i.id === selectedInstructorId);

    // Fetch program instructors
    useEffect(() => {
        const loadInstructors = async () => {
            try {
                const data = await fetchInstructorsByProgram(userProgramId);
                setInstructors(data);
            } catch (error) {
                console.error('Failed to load instructors:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInstructors();
    }, [userProgramId]);

    // Handle dropping a course onto the timetable
    // Also pushes changes into shared storage (via API) for real-time propagation
    const handleDrop = useCallback(async (day: string, time: string, payloadStr: string) => {
        try {
            const payload = JSON.parse(payloadStr);

            // Handle moving existing assignment
            if (payload.isMove && payload.assignmentId) {
                const existingAssignment = localAssignments.find(a => a.id === payload.assignmentId);
                if (!existingAssignment) return;

                if (existingAssignment.day === day && existingAssignment.startTime === time) {
                    return;
                }

                // Check for collisions in local assignments
                if (localAssignments.some(a => a.day === day && a.startTime === time && a.id !== payload.assignmentId)) {
                    alert("This slot is already occupied.");
                    return;
                }

                setLocalAssignments(prev => {
                    const updated = prev.map(a =>
                        a.id === payload.assignmentId
                            ? { ...a, day, startTime: time }
                            : a
                    );
                    updateShareRequestDraftAssignments(request.id, updated)
                        .catch(err => console.error('Failed to sync external draft assignments:', err));
                    return updated;
                });
                return;
            }

            // Create new assignment
            const newAssignment: Assignment = {
                id: `ext-assign-${Date.now()}`,
                courseOfferingId: payload.courseId,
                instructorId: selectedInstructorId,
                instructorName: selectedInstructor?.name, // Capture name for visibility
                sectionId: request.draftScheduleId,
                day,
                startTime: time,
                endTime: time,
                hourType: payload.hourType,
                labAssistantId: payload.labAssistantId
            };

            // Update local offerings to reduce hours
            setLocalOfferings(prev => prev.map(c => {
                if (c.id === payload.courseId) {
                    const updates = { ...c };
                    if (payload.hourType === 'lecture') updates.remainingLecture = Math.max(0, (c.remainingLecture || 0) - 1);
                    if (payload.hourType === 'lab') updates.remainingLab = Math.max(0, (c.remainingLab || 0) - 1);
                    if (payload.hourType === 'tutorial') updates.remainingTutorial = Math.max(0, (c.remainingTutorial || 0) - 1);

                    // Also attach instructor info so it shows on the grid card
                    updates.instructorId = selectedInstructorId;
                    updates.instructorName = selectedInstructor?.name || '';
                    return updates;
                }
                return c;
            }));

            // Add to local assignments
            setLocalAssignments(prev => {
                const updated = [...prev, newAssignment];
                // Push updated assignments to shared state so owners can see them in real time
                updateShareRequestDraftAssignments(request.id, updated)
                    .catch(err => console.error('Failed to sync external draft assignments:', err));
                return updated;
            });
        } catch (error) {
            console.error('Failed to parse drop payload:', error);
        }
    }, [selectedInstructorId, selectedInstructor, request.id, localAssignments, request.draftScheduleId]);

    // Handle removing an assignment
    const handleRemove = useCallback((assignmentId: string) => {
        const assignmentToRemove = localAssignments.find(a => a.id === assignmentId);
        if (assignmentToRemove) {
            setLocalOfferings(prev => prev.map(c => {
                if (c.id === assignmentToRemove.courseOfferingId) {
                    const updates = { ...c };
                    if (assignmentToRemove.hourType === 'lecture') updates.remainingLecture = (c.remainingLecture || 0) + 1;
                    if (assignmentToRemove.hourType === 'lab') updates.remainingLab = (c.remainingLab || 0) + 1;
                    if (assignmentToRemove.hourType === 'tutorial') updates.remainingTutorial = (c.remainingTutorial || 0) + 1;
                    return updates;
                }
                return c;
            }));
        }
        setLocalAssignments(prev => {
            const updated = prev.filter(a => a.id !== assignmentId);
            // Sync updated assignments to shared state as well
            updateShareRequestDraftAssignments(request.id, updated)
                .catch(err => console.error('Failed to sync external draft assignments on remove:', err));
            return updated;
        });
    }, [localAssignments, request.id]);

    // Handle drag start for course cards
    const handleDragStart = useCallback((e: React.DragEvent, payload: any) => {
        e.dataTransfer.setData('hourScheduleData', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
    }, []);

    // Handle submitting the assignment
    const handleSubmit = async () => {
        if (!selectedInstructorId || !selectedInstructor) return;

        setIsSubmitting(true);
        try {
            await onSubmitAssignment(
                request.id,
                selectedInstructorId,
                selectedInstructor.name,
                localAssignments
            );
        } catch (error) {
            console.error('Failed to submit assignment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Qualified instructor IDs map (all for shared course)
    const qualifiedInstructorsByCourse = useMemo(() => {
        const map: Record<string, string[]> = {};
        combinedOfferings.forEach(course => {
            map[course.courseCode] = instructors.map(i => i.id);
        });
        return map;
    }, [combinedOfferings, instructors]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-brand-100 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-bold">Back to Requests</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                        Shared Schedule from {request.sourceProgramName}
                    </span>
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-brand border border-white/10 rounded-[32px] p-8 shadow-xl shadow-brand/20 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Staffing Request
                        </h2>
                    </div>
                    <p className="text-brand-100/80 text-sm font-medium leading-relaxed max-w-2xl">
                        The <span className="text-white font-bold">{request.sourceProgramName}</span> program has requested an instructor for their schedule.
                        Select a qualified staff member and drag the course to an available slot.
                    </p>

                    {/* Suggested time if provided */}
                    {(request.requestedDay || request.requestedTime) && (
                        <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                            <svg className="w-4 h-4 text-brand-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[12px] font-black text-white uppercase tracking-wider">
                                Recommended: {request.requestedDay} at {request.requestedTime}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
                {/* Left Panel - Course and Instructor Selection */}
                <div className="space-y-6">
                    {/* Step 1: Select Instructor */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center font-black text-sm">1</div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Select Instructor</h3>
                        </div>

                        <select
                            value={selectedInstructorId}
                            onChange={(e) => setSelectedInstructorId(e.target.value)}
                            className="w-full h-11 px-4 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                        >
                            <option value="">Select an instructor...</option>
                            {instructors.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.name} (Remaining: {inst.remainingLoad}h)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Step 2: Course Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${selectedInstructorId ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400'
                                }`}>2</div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Drag Course to Schedule</h3>
                        </div>

                        {selectedInstructorId ? (
                            <div className="space-y-3">
                                {localOfferings.map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={{ ...course, instructorId: selectedInstructorId }}
                                        instructors={instructors}
                                        qualifiedInstructorIds={qualifiedInstructorsByCourse[course.courseCode] || []}
                                        labAssistants={[]}
                                        onDragStart={handleDragStart}
                                        onUpdateAssignment={() => { }}
                                        isHead={true}
                                        userProgramId={userProgramId}
                                        canEdit={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
                                Select an instructor first
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedInstructorId || !hasSchedulingData || isSubmitting}
                        className={`w-full py-3 rounded-xl text-sm font-black transition-all ${selectedInstructorId && hasSchedulingData
                            ? 'bg-brand text-white hover:bg-brand-600 shadow-lg shadow-brand/20'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Assignment'
                        )}
                    </button>

                    {!hasSchedulingData && selectedInstructorId && (
                        <p className="text-xs text-slate-400 text-center">
                            Drag your course to the timetable to schedule it
                        </p>
                    )}
                </div>

                {/* Right Panel - Timetable */}
                <div>
                    <TimetableGrid
                        assignments={combinedAssignments}
                        courseOfferings={combinedOfferings}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        onDragStart={handleDragStart}
                        isHead={true}
                        userProgramId={userProgramId}
                        isExternalView={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExternalScheduleView;
