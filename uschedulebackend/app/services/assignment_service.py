
from typing import List, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from ..repositories.assignment_repository import assignment_repo

class AssignmentService:
    def get_status(self) -> bool:
        return assignment_repo.get_assignment_count() > 0

    def perform_greedy_assignment(self) -> Dict[str, Any]:
        if self.get_status():
            raise HTTPException(status_code=400, detail="Assignments already exist.")

        sections = assignment_repo.get_sections()
        rooms = [r for r in assignment_repo.get_rooms() if r["type"] in ["classroom", "hall"] and r["status"] == "available"]

        # Greedy Algorithm:
        # Sort sections by size DESC
        sorted_sections = sorted(sections, key=lambda x: x["no_of_students"], reverse=True)
        # Sort rooms by capacity ASC for tightest fit
        sorted_rooms = sorted(rooms, key=lambda x: x["capacity"])

        temp_assignments = []
        used_room_ids = set()

        for section in sorted_sections:
            match = next((r for r in sorted_rooms if r["capacity"] >= section["no_of_students"] and r["id"] not in used_room_ids), None)
            
            if not match:
                raise HTTPException(status_code=422, detail=f"No suitable room for section {section['name']}")

            temp_assignments.append({
                "id": f"hb-{section['id']}",
                "section_id": section["id"],
                "room_id": match["id"],
                "assigned_at": datetime.now()
            })
            used_room_ids.add(match["id"])

        assignment_repo.create_assignments(temp_assignments)
        return {"success": True, "count": len(temp_assignments)}

    def get_formatted_assignments(self) -> List[Dict[str, Any]]:
        raw_hb = assignment_repo.get_homebase_assignments()
        sections = assignment_repo.get_sections()
        rooms = assignment_repo.get_rooms()
        
        results = []
        for hb in raw_hb:
            section = next(s for s in sections if s["id"] == hb["section_id"])
            room = next(r for r in rooms if r["id"] == hb["room_id"])
            results.append({
                "id": hb["id"],
                "sectionName": f"{section['department_code']} {section['name']}",
                "departmentName": section["department_id"],
                "studentCount": section["no_of_students"],
                "roomName": room["name"],
                "buildingName": room["building_name"],
                "floor": room["floor"]
            })
        return results

    def reset_assignments(self) -> Dict[str, bool]:
        assignment_repo.clear_assignments()
        return {"success": True}

assignment_service = AssignmentService()
