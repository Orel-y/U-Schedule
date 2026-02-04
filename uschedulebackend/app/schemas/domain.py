
from pydantic import BaseModel
from typing import List, Optional
from ..models.domain import RoomType, Day, HourType

class InstructorOut(BaseModel):
    id: str
    name: str
    remainingLoad: int

class LabAssistantOut(BaseModel):
    id: str
    name: str

class AcademicProgramOut(BaseModel):
    id: str
    name: str
    code: str

class SectionOut(BaseModel):
    id: str
    name: str
    academicProgramId: str
    yearLevel: int
    studentCount: int
    assignedRoomId: Optional[str] = None
    assignedRoomName: Optional[str] = None

class CourseOfferingOut(BaseModel):
    id: str
    courseCode: str
    courseTitle: str
    creditHours: int
    
    lectureHours: int
    labHours: int
    tutorialHours: int
    fieldHours: int
    
    remainingLecture: int
    remainingLab: int
    remainingTutorial: int
    remainingField: int
    
    instructorId: str
    instructorName: str
    labAssistantId: Optional[str] = None
    color: Optional[str]

class CourseCreate(BaseModel):
    courseCode: str
    courseTitle: str
    creditHours: int
    lectureHours: int
    labHours: int
    tutorialHours: int
    fieldHours: int
    instructorId: str
    sectionId: str
    color: Optional[str] = "bg-indigo-500"

class InstructorUpdate(BaseModel):
    instructorId: str

class AssignmentCreate(BaseModel):
    sectionId: str
    courseOfferingId: str
    hourType: HourType
    instructorId: str
    labAssistantId: Optional[str] = None
    day: Day
    startTime: str

class AssignmentOut(BaseModel):
    id: str
    sectionId: str
    courseOfferingId: str
    hourType: HourType
    instructorId: str
    labAssistantId: Optional[str] = None
    day: Day
    startTime: str
    endTime: str

class RoomOut(BaseModel):
    id: str
    buildingName: str
    name: str
    capacity: int
    type: RoomType
