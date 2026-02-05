
import React, { useState } from 'react';
import { CourseOffering } from '../../types/index';

interface ProgramCourseGroup {
    programId: string;
    programCode: string;
    courses: CourseOffering[];
}

interface ShareScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    externalCoursesByProgram: ProgramCourseGroup[];
    onShare: (courseIds: string[], targetProgramId: string, day?: string, time?: string) => Promise<void>;
    isSharing: boolean;
}

const ShareScheduleDialog: React.FC<ShareScheduleDialogProps> = ({
    isOpen,
    onClose,
    externalCoursesByProgram,
    onShare,
    isSharing
}) => {
    const [selectedCourses, setSelectedCourses] = useState<Record<string, boolean>>({});
    const [requestedDay, setRequestedDay] = useState('');
    const [requestedTime, setRequestedTime] = useState('');

    if (!isOpen) return null;

    const handleToggleCourse = (courseId: string) => {
        setSelectedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    };

    const handleShareWithProgram = async (programId: string, courses: CourseOffering[]) => {
        const selectedIds = courses
            .filter(c => selectedCourses[c.id])
            .map(c => c.id);

        if (selectedIds.length === 0) {
            alert('Please select at least one course to share');
            return;
        }

        try {
            await onShare(selectedIds, programId, requestedDay || undefined, requestedTime || undefined);
            // Clear selections for this program
            const clearedSelections = { ...selectedCourses };
            selectedIds.forEach(id => delete clearedSelections[id]);
            setSelectedCourses(clearedSelections);
            alert('Share request sent successfully!');
        } catch (error) {
            alert('Failed to send share request');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand to-brand-600 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-white">Share with External Programs</h2>
                            <p className="text-brand-100 text-sm mt-1">
                                Request instructor assignment for courses owned by other programs
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {externalCoursesByProgram.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>All courses are owned by your program</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Optional: Suggested time for all shares */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Suggested Schedule (Optional)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
                                        <select
                                            value={requestedDay}
                                            onChange={e => setRequestedDay(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand"
                                        >
                                            <option value="">No preference</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                                        <select
                                            value={requestedTime}
                                            onChange={e => setRequestedTime(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand"
                                        >
                                            <option value="">No preference</option>
                                            <option value="08:00">08:00</option>
                                            <option value="09:00">09:00</option>
                                            <option value="10:00">10:00</option>
                                            <option value="11:00">11:00</option>
                                            <option value="13:00">13:00</option>
                                            <option value="14:00">14:00</option>
                                            <option value="15:00">15:00</option>
                                            <option value="16:00">16:00</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Programs with their courses */}
                            {externalCoursesByProgram.map(group => (
                                <div key={group.programId} className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white font-black text-sm">{group.programCode}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{group.programCode} Program</h3>
                                                    <p className="text-xs text-slate-500">{group.courses.length} course(s) to assign</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleShareWithProgram(group.programId, group.courses)}
                                                disabled={isSharing || !group.courses.some(c => selectedCourses[c.id])}
                                                className="px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isSharing ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {group.courses.map(course => (
                                            <label
                                                key={course.id}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses[course.id] || false}
                                                    onChange={() => handleToggleCourse(course.id)}
                                                    className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand/20"
                                                />
                                                <div className={`w-3 h-3 rounded-full ${course.color || 'bg-slate-300'}`} />
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-800">{course.courseCode}</span>
                                                    <span className="text-slate-500 ml-2">—</span>
                                                    <span className="text-slate-600 ml-2">{course.courseTitle}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">{course.creditHours} CR</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareScheduleDialog;
