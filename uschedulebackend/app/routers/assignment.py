
from fastapi import APIRouter, Depends
from typing import List
from ..schemas.assignment import (
    AssignmentStatusResponse, 
    GenericResponse, 
    HomebaseDisplayResponse
)
from ..services.assignment_service import assignment_service

router = APIRouter(prefix="/class-assignment", tags=["Class Assignment"])

@router.get("/status", response_model=AssignmentStatusResponse)
async def get_assignment_status():
    return {"isAssigned": assignment_service.get_status()}

@router.post("/assign", response_model=GenericResponse)
async def assign_classes():
    return assignment_service.perform_greedy_assignment()

@router.get("/", response_model=List[HomebaseDisplayResponse])
async def get_assignments():
    return assignment_service.get_formatted_assignments()

@router.delete("/reset", response_model=GenericResponse)
async def reset_assignments():
    return assignment_service.reset_assignments()
