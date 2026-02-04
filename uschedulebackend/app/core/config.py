
from pydantic_settings import BaseSettings
from typing import List, Set
from datetime import datetime

class Settings(BaseSettings):
    PROJECT_NAME: str = "USchedule Pro API"
    API_V1_STR: str = "/api"
    
    class Config:
        case_sensitive = True

settings = Settings()

# Mock Database State (Moved from main.py)
# In a real app, this would be replaced by a database connection pool
class MockDB:
    def __init__(self):
        self.sections = [
            {"id": "sec-1", "department_id": "dept-1", "department_code": "SE", "name": "Section 1", "no_of_students": 45},
            {"id": "sec-2", "department_id": "dept-1", "department_code": "SE", "name": "Section 2", "no_of_students": 42},
            {"id": "sec-3", "department_id": "dept-1", "department_code": "SE", "name": "Section 3", "no_of_students": 38},
        ]
        
        self.rooms = [
            {"id": "r-1", "name": "T-101", "capacity": 50, "building_id": "b-1", "building_name": "Tech", "floor": 1, "type": "classroom", "status": "available"},
            {"id": "r-2", "name": "T-102", "capacity": 45, "building_id": "b-1", "building_name": "Tech", "floor": 1, "type": "classroom", "status": "available"},
            {"id": "r-3", "name": "Hall-1", "capacity": 150, "building_id": "b-1", "building_name": "Tech", "floor": 0, "type": "hall", "status": "available"},
        ]
        
        self.homebase = []

db = MockDB()
