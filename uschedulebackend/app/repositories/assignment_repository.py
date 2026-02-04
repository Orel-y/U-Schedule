
from typing import List, Dict, Any
from ..core.config import db
from datetime import datetime

class AssignmentRepository:
    def get_sections(self) -> List[Dict[str, Any]]:
        return db.sections

    def get_rooms(self) -> List[Dict[str, Any]]:
        return db.rooms

    def get_homebase_assignments(self) -> List[Dict[str, Any]]:
        return db.homebase

    def clear_assignments(self) -> None:
        db.homebase = []

    def create_assignments(self, assignments: List[Dict[str, Any]]) -> None:
        db.homebase = assignments

    def get_assignment_count(self) -> int:
        return len(db.homebase)

assignment_repo = AssignmentRepository()
