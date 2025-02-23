import React, { useEffect, useRef, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";
import Picker from "@emoji-mart/react";
import {
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  SendHorizonal,
  Video,
} from "lucide-react";
import { MdEmojiEmotions } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserList = ({ users, onSelectUser, selectedUser, onBackPress }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-[100%] border-r max-h-[32rem] bg-gradient-to-b from-indigo-50 to-blue-50 overflow-y-auto shadow-xl max-md:mt-36">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">Messages</h1>
          <div className="p-2 hover:bg-indigo-100 rounded-full cursor-pointer">
            <MoreVertical className="text-indigo-600" size={24} />
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-0 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>
      <div className="p-2">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`group flex items-center p-4 mb-2 rounded-2xl transition-all duration-300 ${
              selectedUser?.id === user.id
                ? "bg-indigo-600 shadow-lg"
                : "hover:bg-white hover:shadow-md"
            } cursor-pointer`}
          >
            <div
              className={` w-14 h-14 rounded-full flex items-center justify-center 
                  ${
                    selectedUser?.id === user.id ? "bg-white" : "bg-indigo-100"
                  } 
                  group-hover:bg-white transition-colors shadow-sm`}
            >
              <Avatar className="">
                <AvatarImage className="object-cover" src={`http://127.0.0.1:8000${user.profile_image}`} />
                <AvatarFallback>{user.first_name[0]} {user.last_name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-4 flex-1">
              <h3
                className={`font-semibold ${
                  selectedUser?.id === user.id ? "text-white" : "text-gray-800"
                }`}
              >
                {user.display_name}
              </h3>
              <p
                className={`text-sm ${
                  selectedUser?.id === user.id
                    ? "text-indigo-100"
                    : "text-gray-500"
                } truncate`}
              >
                {user.last_message || ""}
              </p>
            </div>
            <ChevronRight
              className={`ml-2 ${
                selectedUser?.id === user.id ? "text-white" : "text-gray-400"
              }`}
              size={20}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
const ChatWindow = ({
  selectedUser,
  messages,
  sendMessage,
  currentUser,
  onBackToContacts,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null)
  const buttonRef = useRef(null)
  const endOfMessageRef = useRef(null)

  useEffect(() => {
    if (endOfMessageRef.current) {
      endOfMessageRef.current.scrollIntoView({ behaviour : "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: { id: currentUser.id },
        message: messageInput,
        timestamp: new Date().toISOString(),
        isOptimistic: true,
      };
      messages.push(tempMessage);

      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput((prev) => prev + emoji.native);
  };

  return (
    <div className="flex-1 flex flex-col h-[32rem] bg-gradient-to-br from-gray-50 to-blue-50 -z-10 max-md:mt-36">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                  onClick={onBackToContacts}
                >
                  <ArrowLeft className="text-gray-600" size={24} />
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                    <span className="text-xl font-bold text-indigo-600">
                      {selectedUser.first_name[0]}
                      {selectedUser.last_name[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-800">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                  <p className="text-sm text-green-500 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-full text-indigo-600">
                  <Video size={24} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-indigo-600">
                  <Phone size={24} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-indigo-600">
                  <MoreVertical size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages?.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${
                  msg.sender.id === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[75%] p-3 rounded-md shadow-sm ${
                    msg.sender.id === currentUser.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <div className="text-sm">{msg.message}</div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      msg.sender.id === currentUser.id
                        ? "text-indigo-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <div ref={endOfMessageRef} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 pl-6 bg-gray-100 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
              <div className="absolute flex item-center right-24 gap-3">
                <button>
                  <Paperclip color="gray" size={18} />
                </button>
                <button 
                  ref={buttonRef}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <MdEmojiEmotions
                    className="text-gray-500 hover:text-yellow-400"
                    size={18}
                  />
                </button>
              </div>

              {showEmojiPicker && (
                <div 
                ref={emojiPickerRef}
                className="absolute bottom-14 right-24 z-50">
                  <Picker onEmojiSelect={handleEmojiSelect} />
                </div>
              )}
              <button
                onClick={handleSendMessage}
                className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              >
                <SendHorizonal size={24} className="" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-24 h-24 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Select a chat</h2>
            <p className="text-gray-500">
              Start a new conversation or continue an existing one
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [websocket, setWebsocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileView, setIsMobileView] = useState(true);

  const websocketRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserLastMessage = (userId, message, timestamp) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            last_message: message,
            last_message_timestamp: timestamp
          };
        }
        return user;
      });
      return sortContactList(updatedUsers);
    });
  };

  const initializeWebSocket = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token || websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    try {
      const wsUrl = `ws://127.0.0.1:8000/ws/chat/${token}/`;
      const ws = new W3CWebSocket(wsUrl);
      console.log("Connecting to WebSocket:", wsUrl);

      websocketRef.current = ws;

      ws.onopen = (e) => {
        console.log("WebSocket Connected Successfully");
        setWebsocket(ws);

        if (e.code !== 1000 && e.code !== 1001) {
          setTimeout(() => {
            if (currentUser) {
              initializeWebSocket();
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.status === "send") {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.isOptimistic && msg.message === data.message) {
                  updateUserLastMessage(data.receiver_id, data.message, data.timestamp);
                  return {
                    id: data.message_id,
                    sender: { id: data.sender_id },
                    message: data.message,
                    timestamp: data.timestamp,
                  };
                }
                return msg;
              })
            );
          } else if (data.status === "received") {
            // Update contact list for received message
            updateUserLastMessage(data.sender_id, data.message, data.timestamp);
            
            setMessages((prev) => {
              const messageExists = prev.some(
                (msg) => msg.id === data.message_id
              );
              if (!messageExists) {
                return [
                  ...prev,
                  {
                    id: data.message_id,
                    sender: { id: data.sender_id },
                    message: data.message,
                    timestamp: data.timestamp,
                  },
                ];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
    }
  };

  useEffect(() => {
    if (currentUser && (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN)) {
      initializeWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close(1000, "Component unmounting");
      }
    };
  }, [currentUser]);

  const sortContactList = (contacts) => {
    return [...contacts].sort((a, b) => {
      if (!a.last_message_timestamp && !b.last_message_timestamp) return 0;
      if (!a.last_message_timestamp) return 1;
      if (!b.last_message_timestamp) return -1;
      return new Date(b.last_message_timestamp) - new Date(a.last_message_timestamp);
    });
  };

  const fetchData = async () => {
    try {
      const userResponse = await api.get("chat/my-info/");
      setCurrentUser(userResponse.data);

      const contactsResponse = await api.get("chat/contact-list/");
      setUsers(sortContactList(contactsResponse.data));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChatHistory = async (userId) => {
    try {
      const response = await api.get(`chat/messages/${userId}/`);
      const formattedMessages = response.data.map((msg) => ({
        ...msg,
        sender: { id: msg.sender },
        receiver: { id: msg.receiver },
      }));
      setMessages(formattedMessages);
    } catch (error) {
      toast.error("Failed to fetch chat history");
      console.error(error);
    }
  };

  const sendMessage = (message) => {
    if (
      !websocketRef.current ||
      websocketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    if (!selectedUser) {
      return;
    }

    try {
      websocketRef.current.send(
        JSON.stringify({
          receiver_id: selectedUser.id,
          message: message,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchChatHistory(user.id);
    setIsMobileView(false);
  };

  const handleBackToContacts = () => {
    setIsMobileView(true);
    setSelectedUser(null);
  };

  return (
    <div className="flex max-md:h-[28rem] h-">
      <ToastContainer/>
      <div
        className={`absolute inset-0 bg-white 
        ${isMobileView ? "block" : "hidden md:block"} 
        md:static md:w-1/3 md:block`}
      >
        <UserList
          users={users}
          onSelectUser={handleSelectUser}
          selectedUser={selectedUser}
        />
      </div>

      <div
        className={`absolute inset-0 bg-white 
        ${!isMobileView ? "block" : "hidden md:block"} 
        md:static md:w-2/3`}
      >
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          sendMessage={sendMessage}
          currentUser={currentUser}
          onBackToContacts={handleBackToContacts}
          fetchChatHistory={fetchChatHistory}
        />
      </div>
    </div>
  );
};

export default ChatPage;
