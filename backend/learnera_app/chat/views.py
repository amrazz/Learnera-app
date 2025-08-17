from datetime import timezone
from .models import UserChatMessage
from users.models import CustomUser
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import CustomUserSerializer
from .serializers import UserChatMessageSerializer
from rest_framework import generics, permissions, status
from django.db.models import Q, Max, F, OuterRef, Subquery

# Create your views here.


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)


class UserChatMessageView(generics.ListAPIView):
    serializer_class = UserChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["viewer"] = self.request.user
        return context

    def get_queryset(self):
        user = self.request.user
        receiver_id = self.kwargs.get("receiver_id")

        receiver = CustomUser.objects.get(id=receiver_id)

        if user.is_teacher:
            if not (receiver.is_student or receiver.is_parent):
                return UserChatMessage.objects.none()

        if user.is_parent:
            if not receiver.is_teacher:
                return UserChatMessage.objects.none()

        if user.is_student:
            if not receiver.is_teacher:
                return UserChatMessage.objects.none()

        return UserChatMessage.objects.filter(
            Q(sender=user, receiver_id=receiver_id)
            | Q(sender_id=receiver_id, receiver=user)
        ).order_by("timestamp")


class ContactListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        contacts = self.get_allowed_contacts(request.user)

        latest_messages = UserChatMessage.objects.filter(
            Q(sender=OuterRef("pk"), receiver=request.user)
            | Q(sender=request.user, receiver=OuterRef("pk"))
        ).order_by("-timestamp")

        contacts = contacts.annotate(
            last_message=Subquery(latest_messages.values("message")[:1]),
            last_message_timestamp=Subquery(latest_messages.values("timestamp")[:1]),
        ).order_by("-last_message_timestamp")

        serializer = CustomUserSerializer(
            contacts, many=True, context={"viewer": request.user}
        )
        return Response(serializer.data)

    def get_allowed_contacts(self, user):
        if user.is_teacher:
            return CustomUser.objects.filter(Q(is_student=True) | Q(is_parent=True))
        elif user.is_parent:
            return CustomUser.objects.filter(is_teacher=True)
        elif user.is_student:
            return CustomUser.objects.filter(is_teacher=True)
        return CustomUser.objects.none()
