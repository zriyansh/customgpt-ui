# Imports

import ssl
from typing import Any, Dict, Union

import attr

from customgpt_client.api.citations import get_citation
from customgpt_client.api.conversations import (
    create_conversation,
    delete_conversation,
    get_conversations,
    messages_conversation,
    send_message,
    update_conversation,
)
from customgpt_client.api.page_metadata import get_page_metadata, update_page_metadata
from customgpt_client.api.pages import delete_page, get_pages, preview_citation, reindex_page
from customgpt_client.api.project_plugins import create_plugin, get_plugin, update_plugin
from customgpt_client.api.project_settings import get_settings, update_settings
from customgpt_client.api.projects import (
    create_project,
    delete_project,
    get_project,
    list_projects,
    stats_project,
    update_project,
)
from customgpt_client.api.sources import create_source, delete_source, list_sources
from customgpt_client.api.users import get_user, update_user
from customgpt_client.models import (
    CreateConversationJsonBody,
    CreatePluginJsonBody,
    CreateProjectMultipartData,
    CreateSourceMultipartData,
    SendMessageJsonBody,
    UpdateConversationJsonBody,
    UpdatePageMetadataJsonBody,
    UpdatePluginJsonBody,
    UpdateProjectMultipartData,
    UpdateSettingsMultipartData,
    UpdateUserMultipartData,
)

# Initialize the client

def set_client():
    api_key = CustomGPT.api_key if hasattr(CustomGPT, "api_key") else ""
    base_url = CustomGPT.base_url if hasattr(CustomGPT, "base_url") else "https://app.customgpt.ai"
    timeout = CustomGPT.timeout if hasattr(CustomGPT, "timeout") else 100.0
    return CustomGPT(api_key=api_key, base_url=base_url, timeout=timeout)

# Function to retrieve data from kwargs

def pluck_data(fields, kwargs):
    json = {}
    for field in fields:
        if field in kwargs:
            json[field] = kwargs.pop(field)
    return json


@attr.s(auto_attribs=True)
class CustomGPT:
    """A Client which has been authenticated for use on secured endpoints
    Attributes:
        base_url: The base URL for the API, all requests are made to a relative path to this URL
        cookies: A dictionary of cookies to be sent with every request
        headers: A dictionary of headers to be sent with every request
        timeout: The maximum amount of a time in seconds a request can take. API functions will raise
            httpx.TimeoutException if this is exceeded.
        verify_ssl: Whether or not to verify the SSL certificate of the API server. This should be True in production,
            but can be set to False for testing purposes.
        raise_on_unexpected_status: Whether or not to raise an errors.UnexpectedStatus if the API returns a
            status code that was not documented in the source OpenAPI document.
        follow_redirects: Whether or not to follow redirects. Default value is False.
    """

    api_key: str
    prefix: str = "Bearer"
    auth_header_name: str = "Authorization"
    base_url: str = attr.ib("https://app.customgpt.ai")
    cookies: Dict[str, str] = attr.ib(factory=dict, kw_only=True)
    headers: Dict[str, str] = attr.ib(factory=dict, kw_only=True)
    timeout: float = attr.ib(5.0, kw_only=True)
    verify_ssl: Union[str, bool, ssl.SSLContext] = attr.ib(True, kw_only=True)
    raise_on_unexpected_status: bool = attr.ib(False, kw_only=True)
    follow_redirects: bool = attr.ib(False, kw_only=True)

    def with_headers(self, headers: Dict[str, str]) -> "CustomGPT":
        """Get a new client matching this one with additional headers"""
        return attr.evolve(self, headers={**self.headers, **headers})

    def get_cookies(self) -> Dict[str, str]:
        return {**self.cookies}

    def with_cookies(self, cookies: Dict[str, str]) -> "CustomGPT":
        """Get a new client matching this one with additional cookies"""
        return attr.evolve(self, cookies={**self.cookies, **cookies})

    def get_timeout(self) -> float:
        return self.timeout

    def with_timeout(self, timeout: float) -> "CustomGPT":
        """Get a new client matching this one with a new timeout (in seconds)"""
        return attr.evolve(self, timeout=timeout)

    def get_headers(self) -> Dict[str, str]:
        """Get headers to be used in authenticated endpoints"""
        auth_header_value = f"{self.prefix} {self.api_key}" if self.prefix else self.api_key
        return {self.auth_header_name: auth_header_value, **self.headers}

# Class for representing the Project object of the CustomGPT API
# The Project object contains methods for creating, updating, deleting, and listing projects, 
# both synchronously and asynchronously

    class Project:
        def list(*args: Any, **kwargs: Any):
            client = set_client()

            return list_projects.sync_detailed(client=client, *args, **kwargs)

        def alist(*args: Any, **kwargs: Any):
            client = set_client()

            return list_projects.asyncio_detailed(client=client, *args, **kwargs)

        def create(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["project_name", "sitemap_path", "file_data_retension", "file"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = CreateProjectMultipartData(**json)

            return create_project.sync_detailed(client=client, *args, **kwargs)

        def acreate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["project_name", "sitemap_path", "file_data_retension", "file"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = CreateProjectMultipartData(**json)

            return create_project.asyncio_detailed(client=client, *args, **kwargs)

        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_project.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_project.asyncio_detailed(client=client, *args, **kwargs)

        def update(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["project_name", "is_shared", "sitemap_path", "file_data_retension", "file"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = UpdateProjectMultipartData(**json)

            return update_project.sync_detailed(client=client, *args, **kwargs)

        def aupdate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["project_name", "is_shared", "sitemap_path", "file_data_retension", "file"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = UpdateProjectMultipartData(**json)

            return update_project.asyncio_detailed(client=client, *args, **kwargs)

        def delete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_project.sync_detailed(client=client, *args, **kwargs)

        def adelete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_project.asyncio_detailed(client=client, *args, **kwargs)

        def stats(*args: Any, **kwargs: Any):
            client = set_client()

            return stats_project.sync_detailed(client=client, *args, **kwargs)

        def astats(*args: Any, **kwargs: Any):
            client = set_client()

            return stats_project.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the Page object of the CustomGPT API
# The Page object contains methods for getting, deleting, reindexing, and previewing pages,
# both synchronously and asynchronously

    class Page:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_pages.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_pages.asyncio_detailed(client=client, *args, **kwargs)

        def delete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_page.sync_detailed(client=client, *args, **kwargs)

        def adelete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_page.asyncio_detailed(client=client, *args, **kwargs)

        def reindex(*args: Any, **kwargs: Any):
            client = set_client()

            return reindex_page.sync_detailed(client=client, *args, **kwargs)

        def areindex(*args: Any, **kwargs: Any):
            client = set_client()

            return reindex_page.asyncio_detailed(client=client, *args, **kwargs)

        def preview(*args: Any, **kwargs: Any):
            client = set_client()

            return preview_citation.sync_detailed(client=client, *args, **kwargs)

        def apreview(*args: Any, **kwargs: Any):
            client = set_client()

            return preview_citation.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the PageMetadata object of the CustomGPT API
# The PageMetadata object contains methods for getting and updating page metadata,
# both synchronously and asynchronously

    class PageMetadata:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_page_metadata.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_page_metadata.asyncio_detailed(client=client, *args, **kwargs)

        def update(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["title", "url", "description", "image"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = UpdatePageMetadataJsonBody(**json)

            return update_page_metadata.sync_detailed(client=client, *args, **kwargs)

        def aupdate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["title", "url", "description", "image"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = UpdatePageMetadataJsonBody(**json)

            return update_page_metadata.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the ProjectSettings object of the CustomGPT API
# The ProjectSettings object contains methods for getting and updating project settings,
# both synchronously and asynchronously

    class ProjectSettings:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_settings.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_settings.asyncio_detailed(client=client, *args, **kwargs)

        def update(*args: Any, **kwargs: Any):
            client = set_client()
            fields = [
                "chat_bot_avatar",
                "chat_bot_bg",
                "default_prompt",
                "example_questions",
                "response_source",
                "chatbot_msg_lang",
                "chatbot_color",
                "persona_instructions",
                "citations_answer_source_label_msg",
                "citations_sources_label_msg",
                "hang_in_there_msg",
                "chatbot_siesta_msg",
                "is_loading_indicator_enabled",
                "enable_citations",
                "citations_view_type",
                "no_answer_message",
                "ending_message",
                "remove_branding",
            ]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = UpdateSettingsMultipartData(**json)

            return update_settings.sync_detailed(client=client, *args, **kwargs)

        def aupdate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = [
                "chat_bot_avatar",
                "chat_bot_bg",
                "default_prompt",
                "example_questions",
                "response_source",
                "chatbot_msg_lang",
                "chatbot_color",
                "persona_instructions",
                "citations_answer_source_label_msg",
                "citations_sources_label_msg",
                "hang_in_there_msg",
                "chatbot_siesta_msg",
                "is_loading_indicator_enabled",
                "enable_citations",
                "citations_view_type",
                "no_answer_message",
                "ending_message",
                "remove_branding",
            ]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = UpdateSettingsMultipartData(**json)

            return update_settings.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the ProjectPlugins object of the CustomGPT API
# The ProjectPlugins object contains methods for getting, updating, and creating project plugins,
# both synchronously and asynchronously
# Note: The ProjectPlugins object has been deprecated and will be removed soon

    class ProjectPlugins:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_plugin.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_plugin.asyncio_detailed(client=client, *args, **kwargs)

        def update(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["model_name", "human_name", "keywords", "description", "is_active"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = UpdatePluginJsonBody(**json)

            return update_plugin.sync_detailed(client=client, *args, **kwargs)

        def aupdate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["model_name", "human_name", "keywords", "description", "is_active"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = UpdatePluginJsonBody(**json)

            return update_plugin.asyncio_detailed(client=client, *args, **kwargs)

        def create(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["model_name", "human_name", "keywords", "description", "is_active"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = CreatePluginJsonBody(**json)

            return create_plugin.sync_detailed(client=client, *args, **kwargs)

        def acreate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["model_name", "human_name", "keywords", "description", "is_active"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = CreatePluginJsonBody(**json)

            return create_plugin.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the Conversation object of the CustomGPT API
# The Conversation object contains methods for creating, updating, deleting, 
# listing, and sending messages to conversations,
# both synchronously and asynchronously

    class Conversation:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_conversations.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_conversations.asyncio_detailed(client=client, *args, **kwargs)

        def create(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["name"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = CreateConversationJsonBody(**json)

            return create_conversation.sync_detailed(client=client, *args, **kwargs)

        def acreate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["name"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = CreateConversationJsonBody(**json)

            return create_conversation.asyncio_detailed(client=client, *args, **kwargs)

        def update(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["name"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = UpdateConversationJsonBody(**json)

            return update_conversation.sync_detailed(client=client, *args, **kwargs)

        def aupdate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["name"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = UpdateConversationJsonBody(**json)

            return update_conversation.asyncio_detailed(client=client, *args, **kwargs)

        def delete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_conversation.sync_detailed(client=client, *args, **kwargs)

        def adelete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_conversation.asyncio_detailed(client=client, *args, **kwargs)

        def messages(*args: Any, **kwargs: Any):
            client = set_client()

            return messages_conversation.sync_detailed(client=client, *args, **kwargs)

        def amessages(*args: Any, **kwargs: Any):
            client = set_client()

            return messages_conversation.asyncio_detailed(client=client, *args, **kwargs)

        def send(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["prompt", "custom_persona"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = SendMessageJsonBody(**json)

            return send_message.sync_detailed(client=client, *args, **kwargs)

        def asend(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["prompt", "custom_persona"]
            json = pluck_data(fields, kwargs)
            kwargs["json_body"] = SendMessageJsonBody(**json)

            return send_message.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the Citation object of the CustomGPT API
# The Citation object contains methods for getting citations both synchronously and asynchronously

    class Citation:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_citation.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_citation.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the Source object of the CustomGPT API
# The Source object contains methods for creating, deleting, and listing sources,
# both synchronously and asynchronously

    class Source:
        def list(*args: Any, **kwargs: Any):
            client = set_client()

            return list_sources.sync_detailed(client=client, *args, **kwargs)

        def alist(*args: Any, **kwargs: Any):
            client = set_client()

            return list_sources.asyncio_detailed(client=client, *args, **kwargs)

        def create(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["sitemap_path", "file_data_retension", "file"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = CreateSourceMultipartData(**json)

            return create_source.sync_detailed(client=client, *args, **kwargs)

        def acreate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["sitemap_path", "file_data_retension", "file"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = CreateSourceMultipartData(**json)

            return create_source.asyncio_detailed(client=client, *args, **kwargs)

        def delete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_source.sync_detailed(client=client, *args, **kwargs)

        def adelete(*args: Any, **kwargs: Any):
            client = set_client()

            return delete_source.asyncio_detailed(client=client, *args, **kwargs)

# Class for representing the User object of the CustomGPT API
# The User object contains methods for getting and updating user information,
# both synchronously and asynchronously

    class User:
        def get(*args: Any, **kwargs: Any):
            client = set_client()

            return get_user.sync_detailed(client=client, *args, **kwargs)

        def aget(*args: Any, **kwargs: Any):
            client = set_client()

            return get_user.asyncio_detailed(client=client, *args, **kwargs)

        def update(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["profile_photo", "name"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = UpdateUserMultipartData(**json)

            return update_user.sync_detailed(client=client, *args, **kwargs)

        def aupdate(*args: Any, **kwargs: Any):
            client = set_client()
            fields = ["profile_photo", "name"]
            json = pluck_data(fields, kwargs)
            kwargs["multipart_data"] = UpdateUserMultipartData(**json)

            return update_user.asyncio_detailed(client=client, *args, **kwargs)
