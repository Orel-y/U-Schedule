
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../lib/api';
import { AcademicProgram, Section, CourseOffering, Assignment, Batch, Instructor, LabAssistant, HourType, Campus } from '../types/index';

export const useSchedule = () => {
  // Filter states
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedProgramType, setSelectedProgramType] = useState("");
  const [selectedAdmissionType, setSelectedAdmissionType] = useState("");
  const [selectedEntryYear, setSelectedEntryYear] = useState("");

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignmentPrompt, setShowAssignmentPrompt] = useState(false);

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [academicPrograms, setAcademicPrograms] = useState<AcademicProgram[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [labAssistants, setLabAssistants] = useState<LabAssistant[]>([]);
  const [academicYears, setAcademicYears] = useState<{ value: string; label: string }[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [qualifiedInstructors, setQualifiedInstructors] = useState<Record<string, string[]>>(api.QUALIFIED_INSTRUCTORS);
  const [sectionStaffIds, setSectionStaffIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState({
    campuses: false,
    batches: false,
    programs: false,
    academicYears: false,
    sections: false,
    offerings: false,
    personnel: false
  });

  useEffect(() => {
    setIsLoading(p => ({ ...p, campuses: true, batches: true, personnel: true }));
    Promise.all([
      api.fetchCampuses(),
      api.fetchBatches(),
      api.fetchInstructors(),
      api.fetchLabAssistants()
    ]).then(([campusesData, batchesData, instructorsData, labData]) => {
      setCampuses(campusesData);
      setBatches(batchesData);
      setInstructors(instructorsData);
      setLabAssistants(labData);
      setIsLoading(p => ({ ...p, campuses: false, batches: false, personnel: false }));
    });
  }, []);

  // Fetch programs when campus changes
  useEffect(() => {
    if (selectedCampus) {
      setIsLoading(p => ({ ...p, programs: true }));
      api.fetchAcademicPrograms(selectedCampus).then(data => {
        setAcademicPrograms(data);
        setIsLoading(p => ({ ...p, programs: false }));
      });
    } else {
      setAcademicPrograms([]);
    }
  }, [selectedCampus]);

  // Fetch academic years when program changes
  useEffect(() => {
    if (selectedProgram) {
      setIsLoading(p => ({ ...p, academicYears: true }));
      api.fetchAcademicYears(selectedProgram).then(data => {
        setAcademicYears(data);
        setIsLoading(p => ({ ...p, academicYears: false }));
      });
    } else {
      setAcademicYears([]);
    }
  }, [selectedProgram]);

  // Derived: Resolve the specific Batch ID based on all selection criteria
  const resolvedBatchId = useMemo(() => {
    const match = batches.find(b =>
      b.program === selectedProgramType &&
      b.admission_type === selectedAdmissionType &&
      b.entry_year.toString() === selectedEntryYear
    );
    return match ? match.id : "";
  }, [batches, selectedProgramType, selectedAdmissionType, selectedEntryYear]);

  const fetchOfferings = useCallback(async (batchId: string, programId: string, academicYear: string) => {
    if (batchId && programId && academicYear) {
      setIsLoading(p => ({ ...p, offerings: true }));
      try {
        const offerings = await api.fetchCourseOfferings(batchId, programId, academicYear);
        setCourseOfferings(offerings);
      } finally {
        setIsLoading(p => ({ ...p, offerings: false }));
      }
    }
  }, []);

  // Handlers
  const handleCampusChange = useCallback((id: string) => {
    setSelectedCampus(id);
    setSelectedProgram("");
    setSelectedAcademicYear("");
    setSelectedSection("");
    setCourseOfferings([]);
    setSections([]);
    setAssignments([]);
  }, []);

  const handleProgramTypeChange = useCallback((type: string) => {
    setSelectedProgramType(type);
    setSelectedEntryYear("");
    setCourseOfferings([]);
    setAssignments([]);
  }, []);

  const handleAdmissionTypeChange = useCallback((type: string) => {
    setSelectedAdmissionType(type);
    setSelectedEntryYear("");
    setCourseOfferings([]);
    setAssignments([]);
  }, []);

  const handleEntryYearChange = useCallback((year: string) => {
    setSelectedEntryYear(year);
    setCourseOfferings([]);
    setAssignments([]);
  }, []);

  // Effect to trigger offering fetch
  useEffect(() => {
    if (resolvedBatchId && selectedProgram && selectedAcademicYear) {
      fetchOfferings(resolvedBatchId, selectedProgram, selectedAcademicYear);
    }
  }, [resolvedBatchId, selectedProgram, selectedAcademicYear, fetchOfferings]);

  const handleProgramChange = useCallback(async (id: string) => {
    setSelectedProgram(id);
    setSelectedAcademicYear("");
    setSelectedSection("");
    setCourseOfferings([]);
    setSections([]);
    setAssignments([]);
  }, []);

  const handleAcademicYearChange = useCallback(async (ay: string) => {
    setSelectedAcademicYear(ay);
    setSelectedSection("");
    setCourseOfferings([]);
    setSections([]);
    setAssignments([]);
    if (ay && selectedProgram) {
      setIsLoading(p => ({ ...p, sections: true }));
      const secs = await api.fetchSections(selectedProgram, ay);
      setSections(secs);
      setIsLoading(p => ({ ...p, sections: false }));
    }
  }, [selectedProgram]);

  const handleSectionChange = useCallback(async (id: string) => {
    setSelectedSection(id);
    setAssignments([]);
    setSectionStaffIds([]);
    if (id) {
      setShowAssignmentPrompt(true);
    }
  }, []);

  const handleStaffInstructorToSection = useCallback((instructorId: string) => {
    setSectionStaffIds(prev => prev.includes(instructorId) ? prev : [...prev, instructorId]);
  }, []);

  const handleUpdateInstructorAssignment = useCallback((courseId: string, instructorId: string, labAssistantId?: string) => {
    const course = courseOfferings.find(c => c.id === courseId);
    if (!course) return;

    if (instructorId) {
      const qualified = qualifiedInstructors[course.courseCode] || [];
      if (!qualified.includes(instructorId)) {
        alert("This instructor is not qualified for this course.");
        return;
      }
    }

    const courseLoad = course.lectureHours + course.labHours + course.tutorialHours + course.fieldHours;
    const prevInstructorId = course.instructorId;
    const wasAssigned = course.isAssigned;

    if (instructorId === prevInstructorId && wasAssigned) return;

    const newInstructor = instructors.find(i => i.id === instructorId);

    if (instructorId && newInstructor) {
      if (newInstructor.remainingLoad < courseLoad) {
        alert(`Insufficient load for ${newInstructor.name}. Required: ${courseLoad}, Available: ${newInstructor.remainingLoad}`);
        return;
      }
    }

    setCourseOfferings(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          instructorId,
          instructorName: newInstructor?.name || "",
          labAssistantId,
          isAssigned: !!instructorId
        };
      }
      return c;
    }));

    setInstructors(prev => prev.map(inst => {
      let load = inst.remainingLoad;
      if (wasAssigned && inst.id === prevInstructorId) {
        load += courseLoad;
      }
      if (instructorId && inst.id === instructorId) {
        load -= courseLoad;
      }
      return { ...inst, remainingLoad: Math.max(0, load) };
    }));

    if (instructorId) {
      handleStaffInstructorToSection(instructorId);
    }
  }, [courseOfferings, instructors, qualifiedInstructors, handleStaffInstructorToSection]);

  const handleDragStart = useCallback((e: React.DragEvent, payload: { courseId?: string; assignmentId?: string; hourType: HourType; instructorId: string; labAssistantId?: string; isMove?: boolean }) => {
    e.dataTransfer.setData('hourScheduleData', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((day: string, time: string, rawData: string) => {
    if (!selectedSection) return;

    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) { return; }

    // Handle moving existing assignment
    if (data.isMove && data.assignmentId) {
      const existingAssignment = assignments.find(a => a.id === data.assignmentId);
      if (!existingAssignment) return;

      if (existingAssignment.day === day && existingAssignment.startTime === time) {
        return;
      }

      if (assignments.some(a => a.day === day && a.startTime === time && a.id !== data.assignmentId)) {
        alert("This slot is already occupied.");
        return;
      }

      setAssignments(prev => prev.map(a =>
        a.id === data.assignmentId
          ? { ...a, day, startTime: time }
          : a
      ));
      return;
    }

    const { courseId, hourType, instructorId, labAssistantId } = data;

    if (!instructorId) {
      alert("An instructor must be assigned to this section and course before scheduling.");
      return;
    }

    if (hourType === 'lab' && !labAssistantId) {
      alert("A lab assistant must be selected for lab hours.");
      return;
    }

    if (assignments.some(a => a.day === day && a.startTime === time)) {
      alert("This slot is already occupied.");
      return;
    }

    const courseIndex = courseOfferings.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;

    const course = courseOfferings[courseIndex];
    let remaining = 0;
    switch (hourType) {
      case 'lecture': remaining = course.remainingLecture; break;
      case 'lab': remaining = course.remainingLab; break;
      case 'tutorial': remaining = course.remainingTutorial; break;
      case 'field': remaining = course.remainingField; break;
    }

    if (remaining <= 0) {
      alert(`No more ${hourType} hours remaining for ${course.courseCode}.`);
      return;
    }

    const newAssignment: Assignment = {
      id: `asgn-${Date.now()}`,
      sectionId: selectedSection,
      courseOfferingId: courseId,
      hourType,
      instructorId,
      instructorName: course.instructorName, // Capture name for cross-program visibility
      labAssistantId,
      day,
      startTime: time,
      endTime: ""
    };

    setAssignments(prev => [...prev, newAssignment]);

    setCourseOfferings(prev => {
      const updated = [...prev];
      const target = { ...updated[courseIndex] };
      if (hourType === 'lecture') target.remainingLecture--;
      if (hourType === 'lab') target.remainingLab--;
      if (hourType === 'tutorial') target.remainingTutorial--;
      if (hourType === 'field') target.remainingField--;
      updated[courseIndex] = target;
      return updated;
    });

  }, [assignments, courseOfferings, selectedSection]);

  const handleRemoveAssignment = useCallback((id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;

    setAssignments(prev => prev.filter(a => a.id !== id));

    setCourseOfferings(prev => {
      const updated = [...prev];
      const courseIndex = updated.findIndex(c => c.id === assignment.courseOfferingId);
      if (courseIndex !== -1) {
        const target = { ...updated[courseIndex] };
        if (assignment.hourType === 'lecture') target.remainingLecture++;
        if (assignment.hourType === 'lab') target.remainingLab++;
        if (assignment.hourType === 'tutorial') target.remainingTutorial++;
        if (assignment.hourType === 'field') target.remainingField++;
        updated[courseIndex] = target;
      }
      return updated;
    });
  }, [assignments]);

  const selectedSectionData = useMemo(() =>
    sections.find(s => s.id === selectedSection) || null
    , [sections, selectedSection]);

  const sectionInstructors = useMemo(() =>
    instructors.filter(i => sectionStaffIds.includes(i.id))
    , [instructors, sectionStaffIds]);

  const availableYears = useMemo(() => {
    if (!selectedProgramType || !selectedAdmissionType) return [];
    const filtered = batches.filter(b => b.program === selectedProgramType && b.admission_type === selectedAdmissionType);
    const years = Array.from(new Set(filtered.map(b => b.entry_year))).sort((a: number, b: number) => b - a);
    return years.map(y => ({ value: y.toString(), label: y.toString() }));
  }, [batches, selectedProgramType, selectedAdmissionType]);

  const handleClearFilters = useCallback(() => {
    setSelectedCampus("");
    setSelectedProgramType("");
    setSelectedAdmissionType("");
    setSelectedEntryYear("");
    setSelectedProgram("");
    setSelectedAcademicYear("");
    setSelectedSection("");
    setSearchQuery("");
    setCourseOfferings([]);
    setAssignments([]);
  }, []);

  return {
    selectedCampus, selectedProgramType, selectedAdmissionType, selectedEntryYear,
    selectedProgram, selectedAcademicYear, selectedSection, searchQuery,
    showAssignmentPrompt, setShowAssignmentPrompt,
    campuses, batches, academicPrograms, instructors, labAssistants, academicYears, sections, courseOfferings, assignments,
    qualifiedInstructors, availableYears,
    isLoading, selectedSectionData, sectionInstructors,
    handleCampusChange, handleProgramTypeChange, handleAdmissionTypeChange, handleEntryYearChange,
    handleProgramChange, handleAcademicYearChange, handleSectionChange, setSearchQuery,
    handleDragStart, handleDrop, handleRemoveAssignment, handleUpdateInstructorAssignment,
    handleStaffInstructorToSection, handleClearFilters
  };
};
