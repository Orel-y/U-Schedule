
from typing import List, Dict, Any
from ..repositories.spatial_repository import spatial_repo
from ..repositories.curriculum_repository import curriculum_repo
from ..models.domain import RoomType
from ..schemas.assignment import HomebaseDisplayResponse

class SpatialService:
    def run_auto_assignment(self) -> Dict[str, Any]:
        sections = curriculum_repo.get_sections()
        rooms = spatial_repo.get_rooms()
        
        # Greedy logic: Match largest sections to tightest possible rooms
        sections_sorted = sorted(sections, key=lambda s: s.student_count, reverse=True)
        rooms_sorted = sorted([r for r in rooms if r.type != RoomType.LAB], key=lambda r: r.capacity)

        spatial_repo.clear_homebase_mappings()
        assigned_room_ids = set()
        count = 0

        for sec in sections_sorted:
            # Find smallest room that fits section count and is not taken
            match = next((r for r in rooms_sorted if r.capacity >= sec.student_count and r.id not in assigned_room_ids), None)
            if match:
                spatial_repo.set_homebase_mapping(sec.id, match.id)
                assigned_room_ids.add(match.id)
                count += 1
            else:
                return {"success": False, "message": f"Insufficient rooms for section {sec.name}"}

        return {"success": True, "count": count}

    def get_assignments_display(self) -> List[HomebaseDisplayResponse]:
        mappings = spatial_repo.get_homebase_mappings()
        results = []
        for sec_id, room_id in mappings.items():
            sec = curriculum_repo.get_section_by_id(sec_id)
            room = spatial_repo.get_room_by_id(room_id)
            if sec and room:
                results.append(HomebaseDisplayResponse(
                    id=f"map-{sec_id}",
                    sectionName=sec.name,
                    departmentName=sec.department_id,
                    studentCount=sec.student_count,
                    roomName=room.name,
                    buildingName=room.building_name,
                    floor=room.floor
                ))
        return results

spatial_service = SpatialService()
