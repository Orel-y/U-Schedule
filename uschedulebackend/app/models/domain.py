
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class RoomType(str, Enum):
    CLASSROOM = "classroom"
    HALL = "hall"
    LAB = "lab"

class Day(str, Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"

class HourType(str, Enum):
    LECTURE = "lecture"
    LAB = "lab"
    TUTORIAL = "tutorial"
    FIELD = "field"

class Instructor(BaseModel):
    id: str
    name: str
    remaining_load: int = Field(default=18, ge=0, le=21)

class LabAssistant(BaseModel):
    id: str
    name: str

class AcademicProgram(BaseModel):
    id: str
    name: str
    code: str

class Section(BaseModel):
    id: str
    name: str
    academic_program_id: str
    year_level: int
    student_count: int
    assigned_room_id: Optional[str] = None

class Room(BaseModel):
    id: str
    building_id: str
    building_name: str
    name: str
    capacity: int
    floor: int
    type: RoomType
    status: str = "available"

class CourseOffering(BaseModel):
    id: str
    course_code: str
    course_title: str
    credit_hours: int
    
    # Curriculum hours
    lecture_hours: int = 0
    lab_hours: int = 0
    tutorial_hours: int = 0
    field_hours: int = 0
    
    # Remaining hours
    remaining_lecture: int = 0
    remaining_lab: int = 0
    remaining_tutorial: int = 0
    remaining_field: int = 0

    instructor_id: str
    instructor_name: str
    lab_assistant_id: Optional[str] = None
    section_id: str
    color: Optional[str] = "bg-blue-500"

class TimetableAssignment(BaseModel):
    id: str
    section_id: str
    course_offering_id: str
    hour_type: HourType
    instructor_id: str
    lab_assistant_id: Optional[str] = None
    day: Day
    start_time: str
    end_time: str
    room_id: Optional[str] = None
