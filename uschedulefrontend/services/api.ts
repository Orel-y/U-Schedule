
import { Department, Section, CourseOffering, Room, Homebase, HomebaseAssignment } from '../types';

const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Software Engineering', code: 'SE' },
  { id: 'dept-2', name: 'Computer Science', code: 'CS' },
  { id: 'dept-3', name: 'Electrical Engineering', code: 'EE' },
  { id: 'dept-4', name: 'Information Systems', code: 'IS' },
];

const SECTIONS: Section[] = [
  { id: 'sec-1', name: 'Section 1', departmentId: 'dept-1', yearLevel: 1, studentCount: 45 },
  { id: 'sec-2', name: 'Section 2', departmentId: 'dept-1', yearLevel: 1, studentCount: 42 },
  { id: 'sec-3', name: 'Section 3', departmentId: 'dept-1', yearLevel: 2, studentCount: 38 },
  { id: 'sec-4', name: 'Section 1', departmentId: 'dept-2', yearLevel: 4, studentCount: 30 },
  { id: 'sec-5', name: 'Section 1', departmentId: 'dept-3', yearLevel: 1, studentCount: 60 },
  { id: 'sec-6', name: 'Section 1', departmentId: 'dept-4', yearLevel: 2, studentCount: 25 },
];

const ROOMS: Room[] = [
  { id: 'r-1', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-101', capacity: 50, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-2', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-102', capacity: 45, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-3', buildingId: 'b-1', buildingName: 'Tech Building', name: 'Lab-A', capacity: 30, floor: 2, type: 'lab', status: 'available' },
  { id: 'r-4', buildingId: 'b-2', buildingName: 'Main Hall', name: 'Grand Hall', capacity: 150, floor: 0, type: 'hall', status: 'available' },
  { id: 'r-5', buildingId: 'b-2', buildingName: 'Main Hall', name: 'Lecture Room 1', capacity: 65, floor: 1, type: 'classroom', status: 'available' },
  { id: 'r-6', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-201', capacity: 40, floor: 2, type: 'classroom', status: 'available' },
  { id: 'r-7', buildingId: 'b-1', buildingName: 'Tech Building', name: 'T-202', capacity: 35, floor: 2, type: 'classroom', status: 'available' },
];

let homebaseAssignments: Homebase[] = [];

const COURSE_OFFERINGS: Record<string, CourseOffering[]> = {
  'sec-1': [
    { id: 'co-1', courseCode: 'SE101', courseTitle: 'Intro to SE', creditHours: 3, sessionsPerWeek: 2, teacherId: 't-1', teacherName: 'Mr. Eliyas Jarso', color: 'bg-blue-500' },
    { id: 'co-2', courseCode: 'MATH101', courseTitle: 'Calculus I', creditHours: 4, sessionsPerWeek: 3, teacherId: 't-2', teacherName: 'Dr. Zerihun Kinfe', color: 'bg-emerald-500' },
    { id: 'co-3', courseCode: 'PHYS101', courseTitle: 'Physics I', creditHours: 4, sessionsPerWeek: 2, teacherId: 't-3', teacherName: 'Mr. Anteneh', color: 'bg-violet-500' },
  ],
  'sec-3': [
    { id: 'co-4', courseCode: 'SE201', courseTitle: 'Data Structures', creditHours: 4, sessionsPerWeek: 2, teacherId: 't-4', teacherName: 'Dr. Belay', color: 'bg-orange-500' },
    { id: 'co-5', courseCode: 'SE202', courseTitle: 'OOP', creditHours: 3, sessionsPerWeek: 2, teacherId: 't-1', teacherName: 'Dr Fasika', color: 'bg-blue-500' },
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDepartments = async (): Promise<Department[]> => {
  await delay(400);
  return DEPARTMENTS;
};

export const fetchYearLevels = async (deptId: string): Promise<number[]> => {
  await delay(200);
  if (!deptId) return [];
  return [1, 2, 3, 4, 5];
};

export const fetchSections = async (deptId: string, yearLevel: number): Promise<Section[]> => {
  await delay(300);
  return SECTIONS.filter(s => s.departmentId === deptId && s.yearLevel === yearLevel);
};

export const fetchCourseOfferings = async (sectionId: string): Promise<CourseOffering[]> => {
  await delay(400);
  return COURSE_OFFERINGS[sectionId] || [];
};

// --- Class Assignment Endpoints ---

export const getClassAssignmentStatus = async (): Promise<{ isAssigned: boolean }> => {
  await delay(500);
  return { isAssigned: homebaseAssignments.length > 0 };
};

export const assignClasses = async (): Promise<{ success: boolean; message: string }> => {
  await delay(1500);
  if (homebaseAssignments.length > 0) {
    return { success: false, message: "Assignments already exist." };
  }

  // Fetch sections and eligible rooms
  const sections = [...SECTIONS];
  const rooms = ROOMS.filter(r => (r.type === 'classroom' || r.type === 'hall') && r.status === 'available');

  // Greedy Assignment Logic:
  // Sort sections by descending size
  sections.sort((a, b) => b.studentCount - a.studentCount);
  // Sort rooms by ascending capacity
  rooms.sort((a, b) => a.capacity - b.capacity);

  const newAssignments: Homebase[] = [];
  const assignedRoomIds = new Set<string>();

  for (const section of sections) {
    // Find smallest possible room that fits
    const fittingRoom = rooms.find(r => r.capacity >= section.studentCount && !assignedRoomIds.has(r.id));
    
    if (!fittingRoom) {
      return { success: false, message: `Could not find a suitable room for section ${section.name} (Students: ${section.studentCount})` };
    }

    newAssignments.push({
      id: `hb-${Date.now()}-${section.id}`,
      sectionId: section.id,
      roomId: fittingRoom.id,
      assignedAt: new Date().toISOString()
    });
    assignedRoomIds.add(fittingRoom.id);
  }

  homebaseAssignments = newAssignments;
  return { success: true, message: "Classes assigned successfully." };
};

export const fetchHomebaseAssignments = async (): Promise<HomebaseAssignment[]> => {
  await delay(600);
  return homebaseAssignments.map(hb => {
    const section = SECTIONS.find(s => s.id === hb.sectionId)!;
    const room = ROOMS.find(r => r.id === hb.roomId)!;
    const dept = DEPARTMENTS.find(d => d.id === section.departmentId)!;
    return {
      id: hb.id,
      sectionName: `${dept.code} ${section.name}`,
      departmentName: dept.name,
      studentCount: section.studentCount,
      roomName: room.name,
      buildingName: room.buildingName,
      floor: room.floor
    };
  });
};

export const resetClassAssignment = async (): Promise<{ success: boolean }> => {
  await delay(800);
  homebaseAssignments = [];
  return { success: true };
};
