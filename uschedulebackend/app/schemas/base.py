from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class AuditResponse(BaseSchema):
    created_at: datetime
    updated_at: datetime | None
    deleted_at: datetime | None
    created_by_id: UUID | None
    updated_by_id: UUID | None