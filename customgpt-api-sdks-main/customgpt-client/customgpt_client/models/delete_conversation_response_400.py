from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.delete_conversation_response_400_data import DeleteConversationResponse400Data


T = TypeVar("T", bound="DeleteConversationResponse400")


@attr.s(auto_attribs=True)
class DeleteConversationResponse400:
    """
    Attributes:
        status (Union[Unset, DeleteConversationResponse400Status]): The status of the response Example: error.
        url (Union[Unset, str]): The URL of the request Example: https://app.customgpt.ai/api/v1/projects/1.
        data (Union[Unset, DeleteConversationResponse400Data]):
    """

    status: Union[Unset, str] = "error"
    url: Union[Unset, str] = UNSET
    data: Union[Unset, "DeleteConversationResponse400Data"] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status

        url = self.url
        data: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.data, Unset):
            data = self.data.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if status is not UNSET:
            field_dict["status"] = status
        if url is not UNSET:
            field_dict["url"] = url
        if data is not UNSET:
            field_dict["data"] = data

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.delete_conversation_response_400_data import DeleteConversationResponse400Data

        status = src_dict.get("status")

        url = src_dict.get("url")

        _data = src_dict.get("data")
        data: Union[Unset, DeleteConversationResponse400Data]
        if isinstance(_data, Unset):
            data = UNSET
        else:
            data = DeleteConversationResponse400Data.from_dict(_data)

        delete_conversation_response_400 = cls(
            status=status,
            url=url,
            data=data,
        )

        delete_conversation_response_400.additional_properties = src_dict
        return delete_conversation_response_400

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
