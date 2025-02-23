import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.exceptions import ValidationError
from .serializers import UserChatMessageSerializer
from chat.models import UserChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connection attempt started")  
        try:
            # Get token from url path
            token_str = self.scope['url_route']['kwargs']['token']
            print(f"Received token: {token_str}")  
            
            try:
                access_token = AccessToken(token_str)
                user_id = access_token['user_id']
                print("this is the connect user id : ", user_id)
                self.user = await self.get_user(user_id)
                
                if not self.user:
                    print("User not found")  
                    await self.close(code=4001)
                    return
                
                print(f"User authenticated: {self.user.id}")  
                
                # Set up user's personal channel
                self.room_group_name = f"chat_user_{self.user.id}"
                
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                
                await self.accept()
                print(f"WebSocket connected for user {self.user.id}")  
                
            except (InvalidToken, TokenError) as e:
                print(f"Token validation failed: {str(e)}")  
                await self.close()
                return
                
        except Exception as e:
            print(f"Connection error: {str(e)}")  
            await self.close(code=4000)

    @database_sync_to_async
    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        print(f"Disconnection with code: {close_code}")  
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
    async def receive(self, text_data=None):
        try :
            data = json.loads(text_data)
            
            if not all(key in data for key in ['receiver_id', 'message']):
                await self.send(text_data=json.dumps({
                    'status': 'error',
                    'message': 'Missing required fields'
                }))
                return
            
            message_info = await self.save_message(data)
            
            sender = await self.get_user(self.user.id)
            
            message_data = {
            'type': "chat_message",
            'sender_id': self.user.id,
            'sender_name': f"{sender.first_name} {sender.last_name}",
            'message': data['message'],
            'message_id': message_info['id'],
            'timestamp': message_info['timestamp'],
            }
            
            receiver_group = f"chat_user_{data['receiver_id']}"
            await self.channel_layer.group_send(
                receiver_group,
                message_data
            )
            await self.send(text_data=json.dumps({
                'status': 'sent',
                **message_data
            }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': str(e)
            }))
            
    async def chat_message(self, event):
        # send message to ws
        event_data = {k: v for k, v in event.items() if k != 'type'}
        event_data['status'] = 'received'
        
        await self.send(text_data=json.dumps(event_data))
            
    @database_sync_to_async
    def save_message(self, message_data):
        try:
            save_data = {
                'sender': self.user.id,
                'receiver': int(message_data['receiver_id']),
                'message': message_data['message']
            }
            
            serializer = UserChatMessageSerializer(data=save_data)
            
            if serializer.is_valid():
                message = serializer.save()
                
                return {
                    'id': message.id,
                    'timestamp': str(message.timestamp),
                    'sender_name': f"{message.sender.first_name} {message.sender.last_name}",
                    'receiver_name': f"{message.receiver.first_name} {message.receiver.last_name}",
                }
            raise ValidationError(serializer.errors)
        
        except Exception as e:
            raise ValidationError(str(e))


    @database_sync_to_async
    def mark_message_as_seen(self, sender_id):
        UserChatMessage.objects.filter(
            sender_id=sender_id,
            receiver=self.user,
            is_received=False
        ).update(is_received=True)
        
    @database_sync_to_async
    def mark_message_as_read(self, sender_id):
        UserChatMessage.objects.filter(
            sender_id=sender_id,
            receiver=self.user,
            is_read=False
        ).update(is_read=True)
        
    @database_sync_to_async
    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None