import json
from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import requests

from ... import errors
from ...models.update_page_metadata_json_body import UpdatePageMetadataJsonBody
from ...models.update_page_metadata_response_200 import UpdatePageMetadataResponse200
from ...models.update_page_metadata_response_400 import UpdatePageMetadataResponse400
from ...models.update_page_metadata_response_401 import UpdatePageMetadataResponse401
from ...models.update_page_metadata_response_404 import UpdatePageMetadataResponse404
from ...models.update_page_metadata_response_500 import UpdatePageMetadataResponse500
from ...types import Response


def _get_kwargs(
    project_id: int,
    page_id: int,
    *,
    client: {},
    json_body: UpdatePageMetadataJsonBody,
) -> Dict[str, Any]:
    url = "{}/api/v1/projects/{projectId}/pages/{pageId}/metadata".format(
        client.base_url, projectId=project_id, pageId=page_id
    )

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    json_json_body = json_body.to_dict()

    return {
        "method": "put",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
        "allow_redirects": client.follow_redirects,
        "json": json_json_body,
    }


def _parse_response(
    *, client: {}, response: None
) -> Optional[
    Union[
        UpdatePageMetadataResponse200,
        UpdatePageMetadataResponse400,
        UpdatePageMetadataResponse401,
        UpdatePageMetadataResponse404,
        UpdatePageMetadataResponse500,
    ]
]:
    if response.status_code == HTTPStatus.OK:
        response_200 = UpdatePageMetadataResponse200.from_dict(json.loads(response.text))

        return response_200
    if response.status_code == HTTPStatus.BAD_REQUEST:
        response_400 = UpdatePageMetadataResponse400.from_dict(json.loads(response.text))

        return response_400
    if response.status_code == HTTPStatus.UNAUTHORIZED:
        response_401 = UpdatePageMetadataResponse401.from_dict(json.loads(response.text))

        return response_401
    if response.status_code == HTTPStatus.NOT_FOUND:
        response_404 = UpdatePageMetadataResponse404.from_dict(json.loads(response.text))

        return response_404
    if response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR:
        response_500 = UpdatePageMetadataResponse500.from_dict(json.loads(response.text))

        return response_500
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: {}, response: None, content: Optional[bytes] = None
) -> Response[
    Union[
        UpdatePageMetadataResponse200,
        UpdatePageMetadataResponse400,
        UpdatePageMetadataResponse401,
        UpdatePageMetadataResponse404,
        UpdatePageMetadataResponse500,
    ]
]:
    parse = _parse_response(client=client, response=response)
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content if content is None else content,
        headers=response.headers,
        parsed=parse,
    )


def sync_detailed(
    project_id: int,
    page_id: int,
    *,
    client: {},
    json_body: UpdatePageMetadataJsonBody,
):
    """Update metadata for a certain page.

     Update the metadata for a specific page identified by its unique pageId. This endpoint allows you to
    update the associated metadata of the page.

    Args:
        project_id (int):
        page_id (int):
        json_body (UpdatePageMetadataJsonBody):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[UpdatePageMetadataResponse200, UpdatePageMetadataResponse400, UpdatePageMetadataResponse401, UpdatePageMetadataResponse404, UpdatePageMetadataResponse500]]
    """

    kwargs = _get_kwargs(
        project_id=project_id,
        page_id=page_id,
        client=client,
        json_body=json_body,
    )

    response = requests.request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    project_id: int,
    page_id: int,
    *,
    client: {},
    json_body: UpdatePageMetadataJsonBody,
) -> Optional[
    Union[
        UpdatePageMetadataResponse200,
        UpdatePageMetadataResponse400,
        UpdatePageMetadataResponse401,
        UpdatePageMetadataResponse404,
        UpdatePageMetadataResponse500,
    ]
]:
    """Update metadata for a certain page.

     Update the metadata for a specific page identified by its unique pageId. This endpoint allows you to
    update the associated metadata of the page.

    Args:
        project_id (int):
        page_id (int):
        json_body (UpdatePageMetadataJsonBody):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[UpdatePageMetadataResponse200, UpdatePageMetadataResponse400, UpdatePageMetadataResponse401, UpdatePageMetadataResponse404, UpdatePageMetadataResponse500]
    """

    return sync_detailed(
        project_id=project_id,
        page_id=page_id,
        client=client,
        json_body=json_body,
    ).parsed


async def asyncio_detailed(
    project_id: int,
    page_id: int,
    *,
    client: {},
    json_body: UpdatePageMetadataJsonBody,
) -> Response[
    Union[
        UpdatePageMetadataResponse200,
        UpdatePageMetadataResponse400,
        UpdatePageMetadataResponse401,
        UpdatePageMetadataResponse404,
        UpdatePageMetadataResponse500,
    ]
]:
    kwargs = _get_kwargs(
        project_id=project_id,
        page_id=page_id,
        client=client,
        json_body=json_body,
    )

    response = requests.request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


async def asyncio(
    project_id: int,
    page_id: int,
    *,
    client: {},
    json_body: UpdatePageMetadataJsonBody,
) -> Optional[
    Union[
        UpdatePageMetadataResponse200,
        UpdatePageMetadataResponse400,
        UpdatePageMetadataResponse401,
        UpdatePageMetadataResponse404,
        UpdatePageMetadataResponse500,
    ]
]:
    """Update metadata for a certain page.

     Update the metadata for a specific page identified by its unique pageId. This endpoint allows you to
    update the associated metadata of the page.

    Args:
        project_id (int):
        page_id (int):
        json_body (UpdatePageMetadataJsonBody):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[UpdatePageMetadataResponse200, UpdatePageMetadataResponse400, UpdatePageMetadataResponse401, UpdatePageMetadataResponse404, UpdatePageMetadataResponse500]
    """

    return (
        await asyncio_detailed(
            project_id=project_id,
            page_id=page_id,
            client=client,
            json_body=json_body,
        )
    ).parsed
