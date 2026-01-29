
export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
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

export interface Homebase {
  id: string;
  sectionId: string;
  roomId: string;
  assignedAt: string;
}

export interface HomebaseAssignment {
  id: string;
  sectionName: string;
  departmentName: string;
  studentCount: number;
  roomName: string;
  buildingName: string;
  floor: number;
}

export interface CourseOffering {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  sessionsPerWeek: number;
  teacherId: string;
  teacherName: string;
  color?: string;
}

export interface Assignment {
  id: string;
  sectionId: string;
  courseOfferingId: string;
  day: string;
  startTime: string;
  endTime: string;
  roomId?: string;
}

export enum Days {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday'
}

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];
