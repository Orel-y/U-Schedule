
import React, { useState } from 'react';
import { useSchedule } from './hooks/useSchedule';
import { useAuth } from './hooks/useAuth';
import { useDraftSchedule } from './hooks/useDraftSchedule';
import FilterPane from './features/schedule/FilterPane';
import StatsCard from './components/ui/StatsCard';
import CourseList from './features/schedule/CourseList';
import TimetableGrid from './features/schedule/TimetableGrid';
import ClassAssignmentTab from './features/assignment/ClassAssignmentTab';
import Login from './features/auth/Login';
import ShareScheduleDialog from './features/schedule/ShareScheduleDialog';
import PendingSharesPanel from './features/schedule/PendingSharesPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'class-assignment' | 'pending-requests'>('schedule');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const schedule = useSchedule();
  const auth = useAuth();

  // Cross-program draft schedule management
  const draftSchedule = useDraftSchedule({
    termId: schedule.selectedTerm,
    batchId: schedule.selectedEntryYear ? `b-${schedule.selectedEntryYear}-${schedule.selectedProgramType?.toLowerCase()}-${schedule.selectedAdmissionType?.toLowerCase()}` : '',
    sectionId: schedule.selectedSection,
    userId: auth.user?.id || '',
    userProgramId: auth.userProgramId || '',
    courseOfferings: schedule.courseOfferings,
    assignments: schedule.assignments,
  });

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-100 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={auth.login} error={auth.error} isLoading={auth.isLoading} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col antialiased">
      <header className="bg-brand border-b border-white/10 h-20 px-8 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-brand/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-white/30 p-1.5 overflow-hidden">
            <img
              src="/hulogo.png"
              alt="Hawassa University"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">HU<span className="text-brand-100">Schedule</span></h1>
            {auth.userProgramCode && (
              <p className="text-[10px] font-bold text-brand-100/70 uppercase tracking-widest">{auth.userProgramCode} Program</p>
            )}
          </div>
        </div>

        <nav className="flex gap-1 bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
          {(['schedule', 'class-assignment', 'pending-requests'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2.5 text-[13px] font-black rounded-xl transition-all duration-300 relative ${activeTab === t ? 'bg-white shadow-lg text-brand' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              {t === 'schedule' ? 'Curriculum Planner' : t === 'class-assignment' ? 'Section Class Room Assignment' : 'Instructor Requests'}
              {t === 'pending-requests' && draftSchedule.pendingShares.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {draftSchedule.pendingShares.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-white">{auth.user?.fullName}</p>
            <p className="text-[10px] font-bold text-brand-100 uppercase tracking-widest opacity-80">{auth.user?.role} Access</p>
          </div>
          <button
            onClick={auth.logout}
            className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 shadow-sm flex items-center justify-center hover:bg-white/20 transition-all group"
            title="Logout"
          >
            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-10 space-y-10">
        {activeTab === 'schedule' ? (
          <>
            <FilterPane
              batches={schedule.batches}
              academicPrograms={schedule.academicPrograms}
              yearLevels={schedule.yearLevels}
              sections={schedule.sections}
              availableYears={schedule.availableYears}

              selectedProgramType={schedule.selectedProgramType}
              selectedAdmissionType={schedule.selectedAdmissionType}
              selectedEntryYear={schedule.selectedEntryYear}
              selectedProgram={schedule.selectedProgram}
              selectedYear={schedule.selectedYear}
              selectedSection={schedule.selectedSection}
              selectedTerm={schedule.selectedTerm}
              searchQuery={schedule.searchQuery}

              onProgramTypeChange={schedule.handleProgramTypeChange}
              onAdmissionTypeChange={schedule.handleAdmissionTypeChange}
              onEntryYearChange={schedule.handleEntryYearChange}
              onProgramChange={schedule.handleProgramChange}
              onYearChange={schedule.handleYearChange}
              onSectionChange={schedule.handleSectionChange}
              onTermChange={schedule.handleTermChange}
              setSearchQuery={schedule.setSearchQuery}
              onClearFilters={schedule.handleClearFilters}

              isLoading={schedule.isLoading}

              showPrompt={schedule.showAssignmentPrompt}
              onClosePrompt={() => schedule.setShowAssignmentPrompt(false)}
              selectedSectionData={schedule.selectedSectionData}
              courseOfferings={schedule.courseOfferings}
              instructors={schedule.instructors}
              sectionInstructors={schedule.sectionInstructors}
              qualifiedInstructors={schedule.qualifiedInstructors}
              labAssistants={schedule.labAssistants}
              onUpdateInstructor={schedule.handleUpdateInstructorAssignment}
              onDragStart={schedule.handleDragStart}
              userProgramId={auth.userProgramId}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10 items-start">
              <aside className="space-y-8 lg:sticky lg:top-28">
                <StatsCard section={schedule.selectedSectionData} />
                <div className="bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm">
                  <CourseList
                    offerings={schedule.courseOfferings}
                    instructors={schedule.sectionInstructors}
                    qualifiedInstructors={schedule.qualifiedInstructors}
                    labAssistants={schedule.labAssistants}
                    isLoading={schedule.isLoading.offerings}
                    onDragStart={schedule.handleDragStart}
                    onUpdateInstructor={schedule.handleUpdateInstructorAssignment}
                    onOpenAssignFlow={() => schedule.setShowAssignmentPrompt(true)}
                    isTermSelected={!!schedule.selectedTerm && !!schedule.selectedEntryYear && !!schedule.selectedProgram && !!schedule.selectedYear}
                    isHead={auth.isHead}
                    userProgramId={auth.userProgramId}
                    onShareWithPrograms={() => setShowShareDialog(true)}
                  />
                </div>
              </aside>

              <div className="min-w-0">
                <TimetableGrid
                  assignments={schedule.assignments}
                  courseOfferings={schedule.courseOfferings}
                  onDrop={schedule.handleDrop}
                  onRemove={schedule.handleRemoveAssignment}
                  onDragStart={schedule.handleDragStart}
                  isHead={auth.isHead}
                  admissionType={schedule.selectedAdmissionType}
                  userProgramId={auth.userProgramId}
                  onShareDraft={() => setShowShareDialog(true)}
                />
              </div>
            </div>
          </>
        ) : activeTab === 'pending-requests' ? (
          <div className="max-w-4xl mx-auto">
            <PendingSharesPanel
              pendingRequests={draftSchedule.pendingShares}
              userProgramId={auth.userProgramId || ''}
              onAccept={draftSchedule.acceptRequest}
              onSubmitAssignment={draftSchedule.submitAssignment}
              onRefresh={draftSchedule.refetchPendingRequests}
            />
          </div>
        ) : (
          <ClassAssignmentTab isHead={auth.isHead} />
        )}
      </main>

      <footer className="p-10 text-center border-t border-slate-100 bg-white/40">
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">
          University Academic Management System • Security Audited 2026
        </p>
      </footer>

      {/* Cross-Program Sharing Dialog */}
      <ShareScheduleDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        externalCoursesByProgram={draftSchedule.externalCoursesByProgram}
        onShare={draftSchedule.shareWithProgram}
        isSharing={draftSchedule.isSharing}
        sectionName={schedule.selectedSectionData?.name}
        programName={auth.userProgramCode}
      />
    </div>
  );
};

export default App;
