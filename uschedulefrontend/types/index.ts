
export type HourType = 'lecture' | 'lab' | 'tutorial' | 'field';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'HEAD' | 'VIEWER';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Batch {
  id: string;
  entry_year: number;
  academic_program_id: string;
  program: string;
  admission_type: 'Regular' | 'Weekend' | 'Evening';
  batch_type: 'Normal' | 'MEAK';
  is_active: boolean;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
}

export interface Instructor {
  id: string;
  name: string;
  remainingLoad: number;
}

export interface LabAssistant {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
  academicProgramId: string;
  yearLevel: number;
  studentCount: number;
  assignedRoomId?: string | null;
  assignedRoomName?: string | null;
}

export interface Room {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  capacity: number;
  floor: number;
  type: 'classroom' | 'hall' | 'lab';
  status: 'available' | 'occupied';
}

export interface CourseOffering {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditHours: number;

  // Course ownership - which program manages instructors for this course
  owningProgramId: string;
  owningProgramCode?: string;

  // Base requirements from curriculum
  lectureHours: number;
  labHours: number;
  tutorialHours: number;
  fieldHours: number;

  // Runtime tracking
  remainingLecture: number;
  remainingLab: number;
  remainingTutorial: number;
  remainingField: number;

  instructorId: string;
  instructorName: string;
  labAssistantId?: string;
  labAssistantName?: string;
  color?: string;
  isAssigned?: boolean;
}

export interface Assignment {
  id: string;
  sectionId: string;
  courseOfferingId: string;
  hourType: HourType;
  instructorId: string;
  labAssistantId?: string;
  day: string;
  startTime: string;
  endTime: string;
  roomId?: string;
}

export interface HomebaseAssignment {
  id: string;
  sectionName: string;
  academicProgramName: string;
  studentCount: number;
  roomName: string;
  buildingName: string;
  floor: number;
}

// Cross-Program Scheduling Types
export type DraftScheduleStatus = 'draft' | 'pending_external' | 'finalized';
export type ShareRequestStatus = 'pending' | 'in_progress' | 'completed';

export interface DraftSchedule {
  id: string;
  termId: string;
  batchId: string;
  sectionId: string;
  createdBy: string;
  createdByProgramId: string;
  status: DraftScheduleStatus;
  courses: CourseOffering[];
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleShareRequest {
  id: string;
  draftScheduleId: string;
  sourceProgramId: string;
  sourceProgramName: string;
  targetProgramId: string;
  targetProgramName: string;
  courseOfferingIds: string[];
  courses: CourseOffering[];
  status: ShareRequestStatus;
  createdAt: string;
  requestedDay?: string;
  requestedTime?: string;
  assignedInstructorId?: string;
  assignedInstructorName?: string;
}

export interface UserProgramScope {
  programId: string;
  programCode: string;
  role: 'owner' | 'viewer';
}

export enum Days {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];