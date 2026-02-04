
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoomBase(BaseModel):
    id: str
    name: str
    capacity: int
    building_id: str
    building_name: str
    floor: int
    type: str
    status: str

class SectionBase(BaseModel):
    id: str
    department_id: str
    department_code: str
    name: str
    no_of_students: int

class HomebaseAssignmentCreate(BaseModel):
    section_id: str
    room_id: str

class HomebaseAssignment(BaseModel):
    id: str
    section_id: str
    room_id: str
    assigned_at: datetime

class AssignmentStatusResponse(BaseModel):
    isAssigned: bool

class HomebaseDisplayResponse(BaseModel):
    id: str
    sectionName: str
    departmentName: str
    studentCount: int
    roomName: str
    buildingName: str
    floor: int

class GenericResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    count: Optional[int] = None
