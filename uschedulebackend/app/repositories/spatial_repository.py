
from typing import List, Optional, Dict
from ..core.database import db
from ..models.domain import Room, RoomType

class SpatialRepository:
    def get_rooms(self, room_type: Optional[RoomType] = None) -> List[Room]:
        if room_type:
            return [r for r in db.rooms if r.type == room_type]
        return db.rooms

    def get_room_by_id(self, room_id: str) -> Optional[Room]:
        return next((r for r in db.rooms if r.id == room_id), None)

    def set_homebase_mapping(self, section_id: str, room_id: str):
        db.homebase_mappings[section_id] = room_id

    def clear_homebase_mappings(self):
        db.homebase_mappings.clear()

    def get_homebase_mappings(self) -> Dict[str, str]:
        return db.homebase_mappings

spatial_repo = SpatialRepository()
