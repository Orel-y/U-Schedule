
from typing import List, Dict, Any
from ..models.domain import Department, Section, Room, Teacher, CourseOffering, TimetableAssignment, RoomType

class InMemoryDB:
    def __init__(self):
        self.departments: List[Department] = [
            Department(id='dept-1', name='Software Engineering', code='SE'),
            Department(id='dept-2', name='Computer Science', code='CS'),
            Department(id='dept-3', name='Electrical Engineering', code='EE'),
            Department(id='dept-4', name='Information Systems', code='IS'),
        ]
        
        self.teachers: List[Teacher] = [
            Teacher(id='t-1', name='Dr. Abebe'),
            Teacher(id='t-2', name='Prof. Martha'),
            Teacher(id='t-3', name='Dr. Solomon'),
            Teacher(id='t-4', name='Dr. Kebede'),
        ]

        self.sections: List[Section] = [
            Section(id='sec-1', name='Section 1', department_id='dept-1', year_level=1, student_count=45),
            Section(id='sec-2', name='Section 2', department_id='dept-1', year_level=1, student_count=42),
            Section(id='sec-3', name='Section 3', department_id='dept-1', year_level=2, student_count=38),
        ]

        self.rooms: List[Room] = [
            Room(id='r-1', building_id='b-1', building_name='Tech Building', name='T-101', capacity: 50, floor=1, type=RoomType.CLASSROOM),
            Room(id='r-2', building_id='b-1', building_name='Tech Building', name='T-102', capacity: 45, floor=1, type=RoomType.CLASSROOM),
            Room(id='r-3', building_id='b-1', building_name='Tech Building', name='Lab-A', capacity: 30, floor=2, type=RoomType.LAB),
            Room(id='r-4', building_id='b-2', building_name='Main Hall', name='Grand Hall', capacity: 150, floor=0, type=RoomType.HALL),
        ]

        self.course_offerings: List[CourseOffering] = [
            CourseOffering(id='co-1', course_code='SE101', course_title='Intro to SE', credit_hours=3, sessions_per_week=2, teacher_id='t-1', teacher_name='Dr. Abebe', section_id='sec-1', color='bg-blue-500'),
            CourseOffering(id='co-2', course_code='MATH101', course_title='Calculus I', credit_hours=4, sessions_per_week=3, teacher_id='t-2', teacher_name='Prof. Martha', section_id='sec-1', color='bg-emerald-500'),
        ]

        self.assignments: List[TimetableAssignment] = []
        self.homebase_mappings: Dict[str, str] = {} # section_id -> room_id

db = InMemoryDB()
