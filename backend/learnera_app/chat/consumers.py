import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.exceptions import ValidationError
from .serializers import UserChatMessageSerializer
from chat.models import UserChatMessage
from loguru import logger  # type: ignore

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("WebSocket connection initiated")

        try:
            # Get token from URL
            token_str = self.scope["url_route"]["kwargs"]["token"]
            access_token = AccessToken(token_str)
            user_id = access_token["user_id"]

            self.user = await self.get_user(user_id)
            if not self.user:
                await self.close(code=4001)
                return

            self.room_group_name = f"chat_user_{self.user.id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

            # Join global user status group
            await self.channel_layer.group_add("user_status", self.channel_name)

            # Mark user online in DB
            await self.set_user_online(True)

            # Notify everyone that user is online
            await self.channel_layer.group_send(
                "user_status",
                {
                    "type": "user_status_update",
                    "user_id": self.user.id,
                    "is_online": True,
                },
            )

            await self.accept()
            logger.info(f"User {self.user.username} connected and marked online.")

        except (InvalidToken, TokenError) as e:
            logger.error(f"Invalid token: {str(e)}")
            await self.close(code=4002)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        logger.info(
            f"User {getattr(self.user, 'username', 'unknown')} disconnected with code {close_code}"
        )

        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

        # Leave user_status group
        await self.channel_layer.group_discard("user_status", self.channel_name)

        if hasattr(self, "user"):
            await self.set_user_online(False)

            # Broadcast offline status
            await self.channel_layer.group_send(
                "user_status",
                {
                    "type": "user_status_update",
                    "user_id": self.user.id,
                    "is_online": False,
                },
            )

    async def receive(self, text_data=None):
        logger.info(f"Received message: {text_data}")

        try:
            data = json.loads(text_data)
            if not all(key in data for key in ["receiver_id", "message"]):
                await self.send(
                    json.dumps(
                        {"status": "error", "message": "Missing required fields"}
                    )
                )
                return

            message_info = await self.save_message(data)
            sender = await self.get_user(self.user.id)

            message_data = {
                "type": "chat_message",
                "sender_id": self.user.id,
                "sender_name": f"{sender.first_name} {sender.last_name}",
                "message": data["message"],
                "message_id": message_info["id"],
                "timestamp": message_info["timestamp"],
            }

            receiver_group = f"chat_user_{data['receiver_id']}"
            await self.channel_layer.group_send(receiver_group, message_data)

            await self.channel_layer.group_send(
                self.room_group_name, {**message_data, "status": "send"}
            )

        except json.JSONDecodeError:
            await self.send(
                json.dumps({"status": "error", "message": "Invalid JSON format"})
            )
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            await self.send(json.dumps({"status": "error", "message": str(e)}))

    async def chat_message(self, event):
        event_data = {k: v for k, v in event.items() if k != "type"}
        if "status" not in event_data:
            event_data["status"] = "received"
        await self.send(text_data=json.dumps(event_data))

    async def user_status_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_status",
                    "user_id": event["user_id"],
                    "is_online": event["is_online"],
                }
            )
        )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def set_user_online(self, online):
        self.user.is_online = online
        self.user.save()

    @database_sync_to_async
    def save_message(self, message_data):
        save_data = {
            "sender": self.user.id,
            "receiver": int(message_data["receiver_id"]),
            "message": message_data["message"],
        }
        serializer = UserChatMessageSerializer(data=save_data)
        if serializer.is_valid():
            message = serializer.save()
            return {
                "id": message.id,
                "timestamp": message.timestamp.isoformat(),
                "sender_name": f"{message.sender.first_name} {message.sender.last_name}",
                "receiver_name": f"{message.receiver.first_name} {message.receiver.last_name}",
            }
        else:
            raise ValidationError(serializer.errors)
