from enum import Enum


class GetSettingsResponse200DataCitationsViewType(str, Enum):
    HIDE = "hide"
    SHOW = "show"
    USER = "user"

    def __str__(self) -> str:
        return str(self.value)
