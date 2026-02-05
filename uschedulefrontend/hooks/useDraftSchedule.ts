
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../lib/api';
import {
    CourseOffering, Assignment, DraftSchedule, ScheduleShareRequest, Instructor
} from '../types/index';

interface UseDraftScheduleProps {
    termId: string;
    batchId: string;
    sectionId: string;
    userId: string;
    userProgramId: string;
    courseOfferings: CourseOffering[];
}

export const useDraftSchedule = ({
    termId,
    batchId,
    sectionId,
    userId,
    userProgramId,
    courseOfferings
}: UseDraftScheduleProps) => {
    const [draft, setDraft] = useState<DraftSchedule | null>(null);
    const [pendingShares, setPendingShares] = useState<ScheduleShareRequest[]>([]);
    const [outgoingShares, setOutgoingShares] = useState<ScheduleShareRequest[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Derived: courses owned by current user's program
    const ownedCourses = useMemo(() =>
        courseOfferings.filter(c => c.owningProgramId === userProgramId),
        [courseOfferings, userProgramId]
    );

    // Derived: courses owned by other programs (external)
    const externalCourses = useMemo(() =>
        courseOfferings.filter(c => c.owningProgramId !== userProgramId),
        [courseOfferings, userProgramId]
    );

    // Group external courses by their owning program
    const externalCoursesByProgram = useMemo(() => {
        const grouped: Record<string, { programId: string; programCode: string; courses: CourseOffering[] }> = {};
        externalCourses.forEach(course => {
            const key = course.owningProgramId;
            if (!grouped[key]) {
                grouped[key] = {
                    programId: course.owningProgramId,
                    programCode: course.owningProgramCode || 'Unknown',
                    courses: []
                };
            }
            grouped[key].courses.push(course);
        });
        return Object.values(grouped);
    }, [externalCourses]);

    // Check if current user can edit a specific course
    const canEditCourse = useCallback((courseId: string) => {
        const course = courseOfferings.find(c => c.id === courseId);
        return course?.owningProgramId === userProgramId;
    }, [courseOfferings, userProgramId]);

    // Fetch pending share requests for this program
    const fetchPendingRequests = useCallback(async () => {
        if (!userProgramId) return;
        try {
            const pending = await api.fetchPendingShareRequests(userProgramId);
            setPendingShares(pending);
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
        }
    }, [userProgramId]);

    // Fetch outgoing share requests from this program
    const fetchOutgoingRequests = useCallback(async () => {
        if (!userProgramId) return;
        try {
            const outgoing = await api.fetchOutgoingShareRequests(userProgramId);
            setOutgoingShares(outgoing);
        } catch (error) {
            console.error('Failed to fetch outgoing requests:', error);
        }
    }, [userProgramId]);

    // Create a new draft schedule
    const createDraft = useCallback(async () => {
        if (!termId || !batchId || !sectionId || !userId || !userProgramId) return;

        setIsSaving(true);
        try {
            const newDraft = await api.createDraftSchedule(
                termId,
                batchId,
                sectionId,
                userId,
                userProgramId,
                courseOfferings
            );
            setDraft(newDraft);
            return newDraft;
        } catch (error) {
            console.error('Failed to create draft:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [termId, batchId, sectionId, userId, userProgramId, courseOfferings]);

    // Save current draft state
    const saveDraft = useCallback(async (updates: Partial<DraftSchedule>) => {
        if (!draft) return;

        setIsSaving(true);
        try {
            const updatedDraft = await api.saveDraftSchedule({ ...draft, ...updates });
            setDraft(updatedDraft);
            return updatedDraft;
        } catch (error) {
            console.error('Failed to save draft:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [draft]);

    // Share external courses with their owning programs
    const shareWithProgram = useCallback(async (
        courseIds: string[],
        targetProgramId: string,
        requestedDay?: string,
        requestedTime?: string
    ) => {
        if (!draft) {
            // Create draft first if it doesn't exist
            const newDraft = await createDraft();
            if (!newDraft) throw new Error('Failed to create draft');
        }

        const draftId = draft?.id;
        if (!draftId) throw new Error('No draft available');

        setIsSharing(true);
        try {
            const request = await api.shareScheduleWithProgram(
                draftId,
                courseIds,
                targetProgramId,
                userProgramId,
                requestedDay,
                requestedTime
            );

            // Refresh outgoing requests
            await fetchOutgoingRequests();

            return request;
        } catch (error) {
            console.error('Failed to share with program:', error);
            throw error;
        } finally {
            setIsSharing(false);
        }
    }, [draft, createDraft, userProgramId, fetchOutgoingRequests]);

    // Accept an incoming share request
    const acceptRequest = useCallback(async (requestId: string) => {
        try {
            const updated = await api.acceptShareRequest(requestId);
            setPendingShares(prev =>
                prev.map(r => r.id === requestId ? updated : r)
            );
            return updated;
        } catch (error) {
            console.error('Failed to accept request:', error);
            throw error;
        }
    }, []);

    // Submit instructor assignment for a share request
    const submitAssignment = useCallback(async (
        requestId: string,
        instructorId: string,
        instructorName: string
    ) => {
        try {
            const updated = await api.submitExternalAssignment(requestId, instructorId, instructorName);

            // Remove from pending and update lists
            setPendingShares(prev => prev.filter(r => r.id !== requestId));

            return updated;
        } catch (error) {
            console.error('Failed to submit assignment:', error);
            throw error;
        }
    }, []);

    // Load pending requests on mount and when program changes
    useEffect(() => {
        fetchPendingRequests();
        fetchOutgoingRequests();
    }, [fetchPendingRequests, fetchOutgoingRequests]);

    return {
        // State
        draft,
        pendingShares,
        outgoingShares,
        isSaving,
        isSharing,

        // Derived
        ownedCourses,
        externalCourses,
        externalCoursesByProgram,
        hasExternalCourses: externalCourses.length > 0,

        // Actions
        canEditCourse,
        createDraft,
        saveDraft,
        shareWithProgram,
        acceptRequest,
        submitAssignment,
        refetchPendingRequests: fetchPendingRequests,
        refetchOutgoingRequests: fetchOutgoingRequests,
    };
};
