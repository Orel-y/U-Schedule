
import { 
  AcademicProgram, Section, CourseOffering, Room, 
  HomebaseAssignment, AuthResponse, User, Batch, Instructor, LabAssistant 
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

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  await delay(800);
  if (username === "head_admin" && password === "password") {
    return {
      access_token: "mock_jwt_head_token",
      token_type: "bearer",
      user: { id: "u-1", username: "head_admin", fullName: "Dr. Zerihun Kinfe", role: "HEAD" }
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
  { id: 'prog-1', name: 'Software Engineering', code: 'SE' },
  { id: 'prog-2', name: 'Computer Science', code: 'CS' },
  { id: 'prog-3', name: 'Electrical Engineering', code: 'EE' },
  { id: 'prog-4', name: 'Information Systems', code: 'IS' },
];

export const INSTRUCTORS: Instructor[] = [
  { id: 't-1', name: 'Dr. Abebe', remainingLoad: 18 },
  { id: 't-2', name: 'Prof. Martha', remainingLoad: 21 },
  { id: 't-3', name: 'Dr. Solomon', remainingLoad: 12 },
  { id: 't-4', name: 'Dr. Kebede', remainingLoad: 15 },
];

export const QUALIFIED_INSTRUCTORS: Record<string, string[]> = {
  'SE101': ['t-1', 't-4'],
  'MATH101': ['t-2', 't-3'],
  'SE201': ['t-4', 't-1'],
};

export const LAB_ASSISTANTS: LabAssistant[] = [
  { id: 'la-1', name: 'Aschalew Tadesse' },
  { id: 'la-2', name: 'Mulugeta Berhe' },
  { id: 'la-3', name: 'Tigist G/Mariam' },
];

const SECTIONS: Section[] = [
  { id: 'sec-1', name: 'Section 1', academicProgramId: 'prog-1', yearLevel: 1, studentCount: 45 },
  { id: 'sec-2', name: 'Section 2', academicProgramId: 'prog-1', yearLevel: 1, studentCount: 42 },
  { id: 'sec-3', name: 'Section 3', academicProgramId: 'prog-1', yearLevel: 2, studentCount: 38 },
];

const ROOMS: Room[] = [
  { id: 'r-1', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-101', capacity: 50, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-2', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-102', capacity: 45, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-3', buildingId: 'b-1', buildingName: 'Tech Building', name: 'Lab-A', capacity: 30, floor: 2, type: 'lab', status: 'available' },
  { id: 'r-4', buildingId: 'b-2', buildingName: 'Main Hall', name: 'Grand Hall', capacity: 150, floor: 0, type: 'hall', status: 'available' },
];

const COURSE_OFFERINGS_BY_FILTER: Record<string, CourseOffering[]> = {
  'b-2023-degree-regular-prog-1-1-1': [
    { 
      id: 'co-1', courseCode: 'SE101', courseTitle: 'Intro to SE', creditHours: 3, 
      lectureHours: 3, labHours: 2, tutorialHours: 1, fieldHours: 0,
      remainingLecture: 3, remainingLab: 2, remainingTutorial: 1, remainingField: 0,
      instructorId: '', instructorName: '', color: 'bg-blue-500' 
    },
    { 
      id: 'co-2', courseCode: 'MATH101', courseTitle: 'Calculus I', creditHours: 4, 
      lectureHours: 4, labHours: 0, tutorialHours: 2, fieldHours: 0,
      remainingLecture: 4, remainingLab: 0, remainingTutorial: 2, remainingField: 0,
      instructorId: '', instructorName: '', color: 'bg-emerald-500' 
    },
  ],
  'b-2022-degree-regular-prog-1-2-1': [
    { 
      id: 'co-4', courseCode: 'SE201', courseTitle: 'Data Structures', creditHours: 4, 
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

export const fetchAcademicPrograms = async () => { await delay(400); return ACADEMIC_PROGRAMS; };
export const fetchInstructors = async () => { await delay(200); return INSTRUCTORS; };
export const fetchLabAssistants = async () => { await delay(200); return LAB_ASSISTANTS; };
export const fetchYearLevels = async (programId: string) => { await delay(200); return [1, 2, 3, 4, 5]; };
export const fetchSections = async (programId: string, year: number) => { 
  await delay(300); 
  return SECTIONS.filter(s => s.academicProgramId === programId && s.yearLevel === year); 
};
export const fetchCourseOfferings = async (batchId: string, programId: string, year: number, term: string) => {
  await delay(400);
  const key = `${batchId}-${programId}-${year}-${term}`;
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
