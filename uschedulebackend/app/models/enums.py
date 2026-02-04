from enum import Enum

class UserStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "DISABLED"
    SUSPENDED = "SUSPENDED"


class Role(str, Enum):
    ADMIN = "ADMIN"
    DATA_MANAGER = "DATA_MANAGER"
    VIEWER = "VIEWER"