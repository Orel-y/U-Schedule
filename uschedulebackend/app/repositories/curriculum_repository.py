
from typing import List, Optional
from ..core.database import db
from ..models.domain import Department, Section, CourseOffering, Teacher

class CurriculumRepository:
    def get_departments(self) -> List[Department]:
        return db.departments

    def get_sections(self, department_id: Optional[str] = None, year_level: Optional[int] = None) -> List[Section]:
        secs = db.sections
        if department_id:
            secs = [s for s in secs if s.department_id == department_id]
        if year_level:
            secs = [s for s in secs if s.year_level == year_level]
        return secs

    def get_section_by_id(self, section_id: str) -> Optional[Section]:
        return next((s for s in db.sections if s.id == section_id), None)

    def get_course_offerings(self, section_id: str) -> List[CourseOffering]:
        return [c for c in db.course_offerings if c.section_id == section_id]

    def create_course_offering(self, offering: CourseOffering) -> CourseOffering:
        db.course_offerings.append(offering)
        return offering

    def get_teacher_by_id(self, teacher_id: str) -> Optional[Teacher]:
        return next((t for t in db.teachers if t.id == teacher_id), None)

    def update_course_teacher(self, course_id: str, teacher: Teacher) -> Optional[CourseOffering]:
        for c in db.course_offerings:
            if c.id == course_id:
                c.teacher_id = teacher.id
                c.teacher_name = teacher.name
                return c
        return None

curriculum_repo = CurriculumRepository()
