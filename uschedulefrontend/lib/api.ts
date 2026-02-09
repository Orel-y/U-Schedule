
import {
  AcademicProgram, Section, CourseOffering, Room,
  HomebaseAssignment, AuthResponse, User, Batch, Instructor, LabAssistant,
  DraftSchedule, ScheduleShareRequest,
  Assignment, Campus
} from '../types/index';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// DEV_MOCKS: Set to true to use local mock data for testing. 
// This should be disabled or handled via environment variables in production.
const DEV_MOCKS = true;

// dev-data/batches.mock.ts (DEV-ONLY: remove before production)
const MOCK_BATCH_RECORDS: Batch[] = [
  { id: 'b-2021-degree-regular', entry_year: 2021, academic_program_id: 'prog-1', program: 'Degree', admission_type: 'Regular', batch_type: 'Normal', is_active: true },
  { id: 'b-2022-degree-regular', entry_year: 2022, academic_program_id: 'prog-1', program: 'Degree', admission_type: 'Regular', batch_type: 'Normal', is_active: true },
  { id: 'b-2023-degree-regular', entry_year: 2023, academic_program_id: 'prog-1', program: 'Degree', admission_type: 'Regular', batch_type: 'Normal', is_active: true }, // REQUIRED
  { id: 'b-2024-degree-regular', entry_year: 2024, academic_program_id: 'prog-1', program: 'Degree', admission_type: 'Regular', batch_type: 'Normal', is_active: true },
  { id: 'b-2024-degree-weekend', entry_year: 2024, academic_program_id: 'prog-1', program: 'Degree', admission_type: 'Weekend', batch_type: 'Normal', is_active: true },
  { id: 'b-2023-masters-evening', entry_year: 2023, academic_program_id: 'prog-2', program: 'Masters', admission_type: 'Evening', batch_type: 'Normal', is_active: true },
  { id: 'b-2022-phd-regular', entry_year: 2022, academic_program_id: 'prog-3', program: 'PhD', admission_type: 'Regular', batch_type: 'Normal', is_active: true },
  { id: 'b-2021-cert-weekend', entry_year: 2021, academic_program_id: 'prog-4', program: 'Certificate', admission_type: 'Weekend', batch_type: 'Normal', is_active: true },
];

// Extended User interface for cross-program support
export interface ExtendedUser extends User {
  programId?: string;
  programCode?: string;
}

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  await delay(800);
  if (username === "head_admin" && password === "password") {
    return {
      access_token: "mock_jwt_head_token",
      token_type: "bearer",
      user: { id: "u-1", username: "head_admin", fullName: "Dr. Zerihun Kinfe", role: "HEAD", programId: "prog-1", programCode: "SE" } as ExtendedUser
    };
  } else if (username === "cs_admin" && password === "password") {
    return {
      access_token: "mock_jwt_cs_token",
      token_type: "bearer",
      user: { id: "u-3", username: "cs_admin", fullName: "Dr. Computer Science Head", role: "HEAD", programId: "prog-2", programCode: "CS" } as ExtendedUser
    };
  } else if (username === "viewer_user" && password === "password") {
    return {
      access_token: "mock_jwt_viewer_token",
      token_type: "bearer",
      user: { id: "u-2", username: "viewer_user", fullName: "Yonatan Berihun", role: "VIEWER" }
    };
  }
  throw new Error("Invalid username or password");
};

const BATCHES: Batch[] = [
  { id: 'b-2022-reg', entry_year: 2022, academic_program_id: 'p-1', program: 'Degree', admission_type: 'Regular', batch_type: 'Normal', is_active: true },
  { id: 'b-2023-reg', entry_year: 2023, academic_program_id: 'p-1', program: 'Degree', admission_type: 'Regular', batch_type: 'Normal', is_active: true },
  { id: 'b-2021-msc', entry_year: 2021, academic_program_id: 'p-2', program: 'Masters', admission_type: 'Weekend', batch_type: 'Normal', is_active: true },
];

const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  { id: 'prog-1', name: 'Software Engineering', code: 'SE', campusId: 'camp-1' },
  { id: 'prog-2', name: 'Computer Science', code: 'CS', campusId: 'camp-1' },
  { id: 'prog-3', name: 'Electrical Engineering', code: 'EE', campusId: 'camp-2' },
  { id: 'prog-4', name: 'Information Systems', code: 'IS', campusId: 'camp-2' },
];

export const CAMPUSES: Campus[] = [
  { id: 'camp-1', name: 'Main Campus' },
  { id: 'camp-2', name: 'Technology Campus' },
];

export const INSTRUCTORS: Instructor[] = [
  { id: 't-1', name: 'Dr. Abebe', remainingLoad: 18 },
  { id: 't-2', name: 'Prof. Martha', remainingLoad: 21 },
  { id: 't-3', name: 'Dr. Solomon', remainingLoad: 12 },
  { id: 't-4', name: 'Dr. Kebede', remainingLoad: 15 },
  // CS Program instructors
  { id: 't-5', name: 'Dr. Tesfaye (CS)', remainingLoad: 16 },
  { id: 't-6', name: 'Prof. Alemayehu (CS)', remainingLoad: 20 },
];

// Map instructors to their owning programs
export const INSTRUCTOR_PROGRAMS: Record<string, string> = {
  't-1': 'prog-1', 't-2': 'prog-1', 't-3': 'prog-1', 't-4': 'prog-1',
  't-5': 'prog-2', 't-6': 'prog-2',
};

export const QUALIFIED_INSTRUCTORS: Record<string, string[]> = {
  'SE101': ['t-1', 't-4'],
  'MATH101': ['t-5', 't-6'],  // Owned by CS program
  'SE201': ['t-4', 't-1'],
};

export const LAB_ASSISTANTS: LabAssistant[] = [
  { id: 'la-1', name: 'Aschalew Tadesse' },
  { id: 'la-2', name: 'Mulugeta Berhe' },
  { id: 'la-3', name: 'Tigist G/Mariam' },
];

const SECTIONS: Section[] = [
  { id: 'sec-1', name: 'Section 1', academicProgramId: 'prog-1', academicYear: 'year1semester1', studentCount: 45 },
  { id: 'sec-2', name: 'Section 2', academicProgramId: 'prog-1', academicYear: 'year1semester1', studentCount: 42 },
  { id: 'sec-3', name: 'Section 3', academicProgramId: 'prog-1', academicYear: 'year2semester1', studentCount: 38 },
];

const ROOMS: Room[] = [
  { id: 'r-1', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-101', capacity: 50, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-2', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-102', capacity: 45, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-3', buildingId: 'b-1', buildingName: 'Tech Building', name: 'Lab-A', capacity: 30, floor: 2, type: 'lab', status: 'available' },
  { id: 'r-4', buildingId: 'b-2', buildingName: 'Main Hall', name: 'Grand Hall', capacity: 150, floor: 0, type: 'hall', status: 'available' },
];

const COURSE_OFFERINGS_BY_FILTER: Record<string, CourseOffering[]> = {
  'b-2023-degree-regular-prog-1-year1semester1': [
    {
      id: 'co-1', courseCode: 'SE101', courseTitle: 'Intro to SE', creditHours: 3,
      owningProgramId: 'prog-1', owningProgramCode: 'SE',  // Owned by SE
      lectureHours: 3, labHours: 2, tutorialHours: 1, fieldHours: 0,
      remainingLecture: 3, remainingLab: 2, remainingTutorial: 1, remainingField: 0,
      instructorId: '', instructorName: '', color: 'bg-blue-500'
    },
    {
      id: 'co-2', courseCode: 'MATH101', courseTitle: 'Calculus I', creditHours: 4,
      owningProgramId: 'prog-2', owningProgramCode: 'CS',  // Owned by CS - external course!
      lectureHours: 4, labHours: 0, tutorialHours: 2, fieldHours: 0,
      remainingLecture: 4, remainingLab: 0, remainingTutorial: 2, remainingField: 0,
      instructorId: '', instructorName: '', color: 'bg-emerald-500'
    },
  ],
  'b-2022-degree-regular-prog-1-year2semester1': [
    {
      id: 'co-4', courseCode: 'SE201', courseTitle: 'Data Structures', creditHours: 4,
      owningProgramId: 'prog-1', owningProgramCode: 'SE',  // Owned by SE
      lectureHours: 3, labHours: 3, tutorialHours: 0, fieldHours: 0,
      remainingLecture: 3, remainingLab: 3, remainingTutorial: 0, remainingField: 0,
      instructorId: '', instructorName: '', color: 'bg-orange-500'
    },
  ]
};

let homebaseAssignments: { sectionId: string; roomId: string }[] = [];

export const fetchBatches = async () => {
  await delay(300);
  return DEV_MOCKS ? MOCK_BATCH_RECORDS : BATCHES;
};

export const fetchCampuses = async () => { await delay(200); return CAMPUSES; };

export const fetchAcademicPrograms = async (campusId?: string) => {
  await delay(400);
  if (campusId) {
    return ACADEMIC_PROGRAMS.filter(p => p.campusId === campusId);
  }
  return ACADEMIC_PROGRAMS;
};

export const fetchInstructors = async () => { await delay(200); return INSTRUCTORS; };
export const fetchLabAssistants = async () => { await delay(200); return LAB_ASSISTANTS; };
export const fetchAcademicYears = async (programId: string) => {
  await delay(200);
  return [
    { value: 'year1semester1', label: 'Year 1 Semester I' },
    { value: 'year1semester2', label: 'Year 1 Semester II' },
    { value: 'year2semester1', label: 'Year 2 Semester I' },
    { value: 'year2semester2', label: 'Year 2 Semester II' },
    { value: 'year3semester1', label: 'Year 3 Semester I' },
    { value: 'year3semester2', label: 'Year 3 Semester II' },
    { value: 'year4semester1', label: 'Year 4 Semester I' },
    { value: 'year4semester2', label: 'Year 4 Semester II' },
    { value: 'year5semester1', label: 'Year 5 Semester I' },
    { value: 'year5semester2', label: 'Year 5 Semester II' },
  ];
};

export const fetchSections = async (programId: string, academicYear: string) => {
  await delay(300);
  return SECTIONS.filter(s => s.academicProgramId === programId && s.academicYear === academicYear);
};

export const fetchCourseOfferings = async (batchId: string, programId: string, academicYear: string) => {
  await delay(400);
  const key = `${batchId}-${programId}-${academicYear}`;
  return COURSE_OFFERINGS_BY_FILTER[key] || [];
};

export const getClassAssignmentStatus = async () => { await delay(400); return { isAssigned: homebaseAssignments.length > 0 }; };

export const assignClasses = async () => {
  await delay(1000);
  const sections = [...SECTIONS];
  const rooms = ROOMS.filter(r => r.type !== 'lab');
  sections.sort((a, b) => b.studentCount - a.studentCount);
  rooms.sort((a, b) => a.capacity - b.capacity);
  const newAssignments = [];
  const usedRooms = new Set();
  for (const sec of sections) {
    const room = rooms.find(r => r.capacity >= sec.studentCount && !usedRooms.has(r.id));
    if (!room) return { success: false, message: `No fit for ${sec.name}` };
    newAssignments.push({ sectionId: sec.id, roomId: room.id });
    usedRooms.add(room.id);
  }
  homebaseAssignments = newAssignments;
  return { success: true, message: "Success" };
};

export const fetchHomebaseAssignments = async (): Promise<HomebaseAssignment[]> => {
  await delay(500);
  return homebaseAssignments.map((hb, i) => {
    const s = SECTIONS.find(sec => sec.id === hb.sectionId)!;
    const r = ROOMS.find(rm => rm.id === hb.roomId)!;
    const d = ACADEMIC_PROGRAMS.find(prog => prog.id === s.academicProgramId)!;
    return {
      id: `hb-${i}`,
      sectionName: `${d.code} ${s.name}`,
      academicProgramName: d.name,
      studentCount: s.studentCount,
      roomName: r.name,
      buildingName: r.buildingName,
      floor: r.floor
    };
  });
};

export const resetClassAssignment = async () => { await delay(500); homebaseAssignments = []; return { success: true }; };

// ============================================
// Cross-Program Scheduling API Functions
// ============================================

// --------------------------------------------
// Cross-Program Scheduling Storage (Local)
// --------------------------------------------

// Shared storage key for cross-program state (for multi-tab/local testing)
export const CROSS_PROGRAM_STORAGE_KEY = 'uschedule:crossProgramState';

// In-memory mirrors for draft schedules and share requests
let draftSchedules: DraftSchedule[] = [];
let shareRequests: ScheduleShareRequest[] = [];

interface CrossProgramState {
  drafts: DraftSchedule[];
  shares: ScheduleShareRequest[];
}

const loadCrossProgramStateFromStorage = (): CrossProgramState => {
  // During SSR or tests, window/localStorage may not exist – fall back to in-memory only
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return { drafts: draftSchedules, shares: shareRequests };
  }

  try {
    const raw = window.localStorage.getItem(CROSS_PROGRAM_STORAGE_KEY);
    if (!raw) {
      return { drafts: draftSchedules, shares: shareRequests };
    }
    const parsed = JSON.parse(raw) as CrossProgramState;
    return {
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      shares: Array.isArray(parsed.shares) ? parsed.shares : [],
    };
  } catch {
    return { drafts: draftSchedules, shares: shareRequests };
  }
};

const syncCrossProgramStateFromStorage = () => {
  const { drafts, shares } = loadCrossProgramStateFromStorage();
  draftSchedules = drafts;
  shareRequests = shares;
};

const persistCrossProgramStateToStorage = () => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    // Environment without localStorage – keep only in memory
    return;
  }

  const state: CrossProgramState = {
    drafts: draftSchedules,
    shares: shareRequests,
  };

  try {
    window.localStorage.setItem(CROSS_PROGRAM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in this dev/testing scenario
  }
};

export const createDraftSchedule = async (
  termId: string,
  batchId: string,
  sectionId: string,
  createdBy: string,
  createdByProgramId: string,
  courses: CourseOffering[],
  assignments: Assignment[]
): Promise<DraftSchedule> => {
  await delay(300);
  // Ensure we start from latest shared state
  syncCrossProgramStateFromStorage();

  const draft: DraftSchedule = {
    id: `draft-${sectionId}-${Date.now()}`,
    termId,
    batchId,
    sectionId,
    createdBy,
    createdByProgramId,
    status: 'draft',
    courses,
    assignments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  draftSchedules.push(draft);
  persistCrossProgramStateToStorage();
  return draft;
};

export const saveDraftSchedule = async (draft: DraftSchedule): Promise<DraftSchedule> => {
  await delay(200);
  syncCrossProgramStateFromStorage();
  const index = draftSchedules.findIndex(d => d.id === draft.id);
  if (index !== -1) {
    draftSchedules[index] = { ...draft, updatedAt: new Date().toISOString() };
    persistCrossProgramStateToStorage();
    return draftSchedules[index];
  }
  throw new Error('Draft not found');
};

export const fetchDraftScheduleById = async (draftId: string): Promise<DraftSchedule | null> => {
  await delay(200);
  syncCrossProgramStateFromStorage();
  return draftSchedules.find(d => d.id === draftId) || null;
};

export const fetchDraftScheduleBySection = async (sectionId: string, termId: string): Promise<DraftSchedule | null> => {
  await delay(200);
  syncCrossProgramStateFromStorage();
  return draftSchedules.find(d => d.sectionId === sectionId && d.termId === termId) || null;
};

export const shareScheduleWithProgram = async (
  draftScheduleId: string,
  courseOfferingIds: string[],
  targetProgramId: string,
  sourceProgramId: string,
  requestedDay?: string,
  requestedTime?: string
): Promise<ScheduleShareRequest> => {
  await delay(400);

  syncCrossProgramStateFromStorage();

  const draft = draftSchedules.find(d => d.id === draftScheduleId);
  if (!draft) throw new Error('Draft not found');

  const targetProgram = ACADEMIC_PROGRAMS.find(p => p.id === targetProgramId);
  const sourceProgram = ACADEMIC_PROGRAMS.find(p => p.id === sourceProgramId);
  if (!targetProgram || !sourceProgram) throw new Error('Program not found');

  const sharedCourses = draft.courses.filter(c => courseOfferingIds.includes(c.id));

  const request: ScheduleShareRequest = {
    id: `share-${Date.now()}`,
    draftScheduleId,
    sourceProgramId,
    sourceProgramName: sourceProgram.name,
    targetProgramId,
    targetProgramName: targetProgram.name,
    courseOfferingIds,
    courses: sharedCourses,
    status: 'pending',
    createdAt: new Date().toISOString(),
    requestedDay,
    requestedTime,
    draftAssignments: draft.assignments,
    allDraftCourses: draft.courses,
  };

  shareRequests.push(request);

  // Update draft status
  draft.status = 'pending_external';

  persistCrossProgramStateToStorage();
  return request;
};

export const fetchPendingShareRequests = async (programId: string): Promise<ScheduleShareRequest[]> => {
  await delay(300);
  syncCrossProgramStateFromStorage();
  return shareRequests.filter(r => r.targetProgramId === programId && r.status !== 'completed');
};

export const fetchOutgoingShareRequests = async (programId: string): Promise<ScheduleShareRequest[]> => {
  await delay(300);
  syncCrossProgramStateFromStorage();
  return shareRequests.filter(r => r.sourceProgramId === programId);
};

export const acceptShareRequest = async (requestId: string): Promise<ScheduleShareRequest> => {
  await delay(200);
  syncCrossProgramStateFromStorage();
  const request = shareRequests.find(r => r.id === requestId);
  if (!request) throw new Error('Request not found');
  request.status = 'in_progress';
  persistCrossProgramStateToStorage();
  return request;
};

export const submitExternalAssignment = async (
  requestId: string,
  instructorId: string,
  instructorName: string,
  assignments?: Assignment[]
): Promise<ScheduleShareRequest> => {
  await delay(400);
  syncCrossProgramStateFromStorage();
  const request = shareRequests.find(r => r.id === requestId);
  if (!request) throw new Error('Request not found');

  request.assignedInstructorId = instructorId;
  request.assignedInstructorName = instructorName;
  request.status = 'completed';
  if (assignments) {
    request.draftAssignments = assignments;
  }

  // Update the draft with the assigned instructor
  const draft = draftSchedules.find(d => d.id === request.draftScheduleId);
  if (draft) {
    draft.courses = draft.courses.map(c => {
      if (request.courseOfferingIds.includes(c.id)) {
        return { ...c, instructorId, instructorName, isAssigned: true };
      }
      return c;
    });

    // Check if all external courses are now assigned
    const allExternalCompleted = shareRequests
      .filter(r => r.draftScheduleId === draft.id)
      .every(r => r.status === 'completed');

    if (allExternalCompleted) {
      draft.status = 'draft'; // Ready for finalization
    }
  }

  persistCrossProgramStateToStorage();
  return request;
};

// Update only the working draft assignments for a given share request.
// This is used to push in-progress scheduling changes in real-time.
export const updateShareRequestDraftAssignments = async (
  requestId: string,
  assignments: Assignment[]
): Promise<ScheduleShareRequest> => {
  await delay(150);
  syncCrossProgramStateFromStorage();
  const request = shareRequests.find(r => r.id === requestId);
  if (!request) throw new Error('Request not found');

  request.draftAssignments = assignments;
  // Keep status as-is (pending/in_progress/completed)

  // Also mirror into the owning draft if available so owners see changes
  const draft = draftSchedules.find(d => d.id === request.draftScheduleId);
  if (draft) {
    draft.assignments = assignments;
    draft.updatedAt = new Date().toISOString();
  }

  persistCrossProgramStateToStorage();
  return request;
};

export const fetchInstructorsByProgram = async (programId: string): Promise<Instructor[]> => {
  await delay(200);
  return INSTRUCTORS.filter(i => INSTRUCTOR_PROGRAMS[i.id] === programId);
};

export const getAcademicProgramById = (programId: string): AcademicProgram | undefined => {
  return ACADEMIC_PROGRAMS.find(p => p.id === programId);
};
