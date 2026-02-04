
from typing import List, Optional
import uuid
from ..repositories.curriculum_repository import curriculum_repo
from ..models.domain import CourseOffering, Teacher
from ..schemas.domain import CourseCreate, CourseOfferingOut

class CurriculumService:
    def list_departments(self):
        return curriculum_repo.get_departments()

    def list_sections(self, dept_id: str, year: int):
        return curriculum_repo.get_sections(dept_id, year)

    def get_offerings_for_section(self, section_id: str) -> List[CourseOfferingOut]:
        offerings = curriculum_repo.get_course_offerings(section_id)
        return [CourseOfferingOut(
            id=o.id,
            courseCode=o.course_code,
            courseTitle=o.course_title,
            creditHours=o.credit_hours,
            sessionsPerWeek=o.sessions_per_week,
            teacherId=o.teacher_id,
            teacherName=o.teacher_name,
            color=o.color
        ) for o in offerings]

    def add_course_offering(self, data: CourseCreate) -> CourseOfferingOut:
        teacher = curriculum_repo.get_teacher_by_id(data.teacherId)
        if not teacher:
            raise ValueError("Teacher not found")
        
        new_id = str(uuid.uuid4())
        offering = CourseOffering(
            id=new_id,
            course_code=data.courseCode,
            course_title=data.courseTitle,
            credit_hours=data.creditHours,
            sessions_per_week=data.sessionsPerWeek,
            teacher_id=teacher.id,
            teacher_name=teacher.name,
            section_id=data.sectionId,
            color=data.color
        )
        curriculum_repo.create_course_offering(offering)
        return CourseOfferingOut(
            id=offering.id,
            courseCode=offering.course_code,
            courseTitle=offering.course_title,
            creditHours=offering.credit_hours,
            sessionsPerWeek=offering.sessions_per_week,
            teacherId=offering.teacher_id,
            teacherName=offering.teacher_name,
            color=offering.color
        )

    def change_teacher(self, course_id: str, teacher_id: str):
        teacher = curriculum_repo.get_teacher_by_id(teacher_id)
        if not teacher:
            raise ValueError("Teacher not found")
        return curriculum_repo.update_course_teacher(course_id, teacher)

curriculum_service = CurriculumService()
