
from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.assignment import (
    AssignmentStatusResponse, 
    GenericResponse, 
    HomebaseDisplayResponse
)
from ..services.spatial_service import spatial_service

router = APIRouter(prefix="/spatial", tags=["Spatial Mapping"])

@router.get("/status", response_model=AssignmentStatusResponse)
async def get_spatial_status():
    mappings = spatial_service.get_assignments_display()
    return {"isAssigned": len(mappings) > 0}

@router.post("/assign", response_model=GenericResponse)
async def run_assignment():
    result = spatial_service.run_auto_assignment()
    if not result["success"]:
        raise HTTPException(status_code=422, detail=result["message"])
    return result

@router.get("/assignments", response_model=List[HomebaseDisplayResponse])
async def get_assignments():
    return spatial_service.get_assignments_display()

@router.delete("/reset", response_model=GenericResponse)
async def reset_spatial():
    from ..repositories.spatial_repository import spatial_repo
    spatial_repo.clear_homebase_mappings()
    return {"success": True}
