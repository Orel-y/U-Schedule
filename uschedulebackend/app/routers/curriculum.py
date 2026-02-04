
from fastapi import APIRouter, HTTPException, Query
from typing import List
from ..schemas.domain import DepartmentOut, SectionOut, CourseOfferingOut, CourseCreate, TeacherUpdate
from ..services.curriculum_service import curriculum_service

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])

@router.get("/departments", response_model=List[DepartmentOut])
async def get_departments():
    return curriculum_service.list_departments()

@router.get("/sections", response_model=List[SectionOut])
async def get_sections(
    department_id: str = Query(..., alias="departmentId"),
    year: int = Query(...)
):
    sections = curriculum_service.list_sections(department_id, year)
    return [SectionOut(
        id=s.id,
        name=s.name,
        departmentId=s.department_id,
        yearLevel=s.year_level,
        studentCount=s.student_count,
        assignedRoomId=s.assigned_room_id
    ) for s in sections]

@router.get("/course-offerings/{section_id}", response_model=List[CourseOfferingOut])
async def get_offerings(section_id: str):
    return curriculum_service.get_offerings_for_section(section_id)

@router.post("/course-offerings", response_model=CourseOfferingOut)
async def create_offering(offering: CourseCreate):
    try:
        return curriculum_service.add_course_offering(offering)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/course-offerings/{course_id}/teacher", response_model=CourseOfferingOut)
async def update_teacher(course_id: str, data: TeacherUpdate):
    updated = curriculum_service.change_teacher(course_id, data.teacherId)
    if not updated:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseOfferingOut(
        id=updated.id,
        courseCode=updated.course_code,
        courseTitle=updated.course_title,
        creditHours=updated.credit_hours,
        sessionsPerWeek=updated.sessions_per_week,
        teacherId=updated.teacher_id,
        teacherName=updated.teacher_name,
        color=updated.color
    )
