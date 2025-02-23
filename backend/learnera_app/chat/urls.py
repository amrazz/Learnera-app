from django.urls import path
from .views import ContactListView, CurrentUserView, UserChatMessageView

urlpatterns = [
    path('messages/<int:receiver_id>/', UserChatMessageView.as_view(), name='chat-messages'),
    path("contact-list/", ContactListView.as_view(), name="contact-list"),
    path("my-info/", CurrentUserView.as_view(), name="my-info")
]