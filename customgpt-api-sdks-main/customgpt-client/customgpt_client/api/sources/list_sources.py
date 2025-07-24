import json
from http import HTTPStatus
from typing import Any, Dict, Optional, Union

import requests

from ... import errors
from ...models.list_sources_response_200 import ListSourcesResponse200
from ...models.list_sources_response_400 import ListSourcesResponse400
from ...models.list_sources_response_401 import ListSourcesResponse401
from ...models.list_sources_response_404 import ListSourcesResponse404
from ...models.list_sources_response_500 import ListSourcesResponse500
from ...types import Response


def _get_kwargs(
    project_id: int,
    *,
    client: {},
) -> Dict[str, Any]:
    url = "{}/api/v1/projects/{projectId}/sources".format(client.base_url, projectId=project_id)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    return {
        "method": "get",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
        "allow_redirects": client.follow_redirects,
    }


def _parse_response(
    *, client: {}, response: None
) -> Optional[
    Union[
        ListSourcesResponse200,
        ListSourcesResponse400,
        ListSourcesResponse401,
        ListSourcesResponse404,
        ListSourcesResponse500,
    ]
]:
    if response.status_code == HTTPStatus.OK:
        response_200 = ListSourcesResponse200.from_dict(json.loads(response.text))

        return response_200
    if response.status_code == HTTPStatus.BAD_REQUEST:
        response_400 = ListSourcesResponse400.from_dict(json.loads(response.text))

        return response_400
    if response.status_code == HTTPStatus.UNAUTHORIZED:
        response_401 = ListSourcesResponse401.from_dict(json.loads(response.text))

        return response_401
    if response.status_code == HTTPStatus.NOT_FOUND:
        response_404 = ListSourcesResponse404.from_dict(json.loads(response.text))

        return response_404
    if response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR:
        response_500 = ListSourcesResponse500.from_dict(json.loads(response.text))

        return response_500
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: {}, response: None, content: Optional[bytes] = None
) -> Response[
    Union[
        ListSourcesResponse200,
        ListSourcesResponse400,
        ListSourcesResponse401,
        ListSourcesResponse404,
        ListSourcesResponse500,
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
    *,
    client: {},
):
    """List a certain project's sources.

     Retrieve a list of all sources associated with a given project. This endpoint provides a collection
    of sources that are linked to a specific project. Sources serve as references or contexts for the
    project.

    Args:
        project_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[ListSourcesResponse200, ListSourcesResponse400, ListSourcesResponse401, ListSourcesResponse404, ListSourcesResponse500]]
    """

    kwargs = _get_kwargs(
        project_id=project_id,
        client=client,
    )

    response = requests.request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    project_id: int,
    *,
    client: {},
) -> Optional[
    Union[
        ListSourcesResponse200,
        ListSourcesResponse400,
        ListSourcesResponse401,
        ListSourcesResponse404,
        ListSourcesResponse500,
    ]
]:
    """List a certain project's sources.

     Retrieve a list of all sources associated with a given project. This endpoint provides a collection
    of sources that are linked to a specific project. Sources serve as references or contexts for the
    project.

    Args:
        project_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ListSourcesResponse200, ListSourcesResponse400, ListSourcesResponse401, ListSourcesResponse404, ListSourcesResponse500]
    """

    return sync_detailed(
        project_id=project_id,
        client=client,
    ).parsed


async def asyncio_detailed(
    project_id: int,
    *,
    client: {},
) -> Response[
    Union[
        ListSourcesResponse200,
        ListSourcesResponse400,
        ListSourcesResponse401,
        ListSourcesResponse404,
        ListSourcesResponse500,
    ]
]:
    kwargs = _get_kwargs(
        project_id=project_id,
        client=client,
    )

    response = requests.request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


async def asyncio(
    project_id: int,
    *,
    client: {},
) -> Optional[
    Union[
        ListSourcesResponse200,
        ListSourcesResponse400,
        ListSourcesResponse401,
        ListSourcesResponse404,
        ListSourcesResponse500,
    ]
]:
    """List a certain project's sources.

     Retrieve a list of all sources associated with a given project. This endpoint provides a collection
    of sources that are linked to a specific project. Sources serve as references or contexts for the
    project.

    Args:
        project_id (int):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[ListSourcesResponse200, ListSourcesResponse400, ListSourcesResponse401, ListSourcesResponse404, ListSourcesResponse500]
    """

    return (
        await asyncio_detailed(
            project_id=project_id,
            client=client,
        )
    ).parsed
