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
  MessageCircle,
  Users,
  Settings,
  X,
} from "lucide-react";
import { MdEmojiEmotions } from "react-icons/md";

// Avatar component
const Avatar = ({ children, className = "" }) => (
  <div className={`relative inline-block ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt = "", className = "" }) => (
  <img
    src={src}
    alt={alt}
    className={`w-full h-full object-cover ${className}`}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
);

const AvatarFallback = ({ children, className = "" }) => (
  <div className={`w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium ${className}`}>
    {children}
  </div>
);

const UserList = ({ users, onSelectUser, selectedUser, onBackPress }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex-none p-4 lg:p-6 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="text-white" size={20} />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
              <Users className="text-gray-600" size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
              <Settings className="text-gray-600" size={18} />
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-0 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:shadow-md focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 transition-colors" size={18} />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-sm">No conversations found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`group flex items-center p-3 lg:p-4 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                selectedUser?.id === user.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 scale-[1.02]"
                  : "hover:bg-white hover:shadow-md hover:scale-[1.01]"
              }`}
            >
              {selectedUser?.id === user.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-10 rounded-2xl"></div>
              )}
              
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden ring-2 transition-all ${
                  selectedUser?.id === user.id ? "ring-white/50" : "ring-gray-200"
                }`}>
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      className="object-cover"
                      src={`${import.meta.env.VITE_IMAGE_LOADING_URL}${user.profile_image}`}
                    />
                    <AvatarFallback className={`text-sm font-semibold ${
                      selectedUser?.id === user.id ? "bg-white text-blue-600" : "bg-gray-100"
                    }`}>
                      {user.first_name[0]}{user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {user.is_online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                )}
              </div>

              <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                <h3 className={`font-semibold text-sm lg:text-base truncate ${
                  selectedUser?.id === user.id ? "text-white" : "text-gray-900"
                }`}>
                  {user.display_name}
                </h3>
                <p className={`text-xs lg:text-sm mt-1 truncate ${
                  selectedUser?.id === user.id ? "text-blue-100" : "text-gray-500"
                }`}>
                  {user.last_message || "Start a conversation"}
                </p>
              </div>

              <div className="flex-shrink-0 ml-2">
                <ChevronRight
                  className={`transition-all duration-200 ${
                    selectedUser?.id === user.id 
                      ? "text-white transform rotate-90" 
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                  size={18}
                />
              </div>
            </div>
          ))
        )}
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
  const emojiPickerRef = useRef(null);
  const buttonRef = useRef(null);
  const endOfMessageRef = useRef(null);

  useEffect(() => {
    if (endOfMessageRef.current) {
      endOfMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="flex-none p-4 lg:p-6 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                  onClick={onBackToContacts}
                >
                  <ArrowLeft className="text-gray-600" size={20} />
                </button>
                
                <div className="relative">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden ring-2 ring-gray-200">
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        className="object-cover"
                        src={`${import.meta.env.VITE_IMAGE_LOADING_URL}${selectedUser.profile_image}`}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                        {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {selectedUser.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${selectedUser.is_online ? 'bg-green-400' : 'bg-gray-400'}`} />
                    <p className={`text-sm ${selectedUser.is_online ? 'text-green-600' : 'text-gray-500'}`}>
                      {selectedUser.is_online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 text-gray-600">
                  <Video size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 text-gray-600">
                  <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 text-gray-600">
                  <MoreVertical size={20} />
                </button> */}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gradient-to-b from-transparent to-blue-50/20">
            {messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="text-blue-500" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Start the conversation</h3>
                <p className="text-gray-500 text-sm">Send a message to get started</p>
              </div>
            ) : (
              messages?.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.sender.id === currentUser.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] lg:max-w-[75%] p-3 lg:p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                      msg.sender.id === currentUser.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-auto"
                        : "bg-white text-gray-800 border border-gray-100"
                    }`}
                  >
                    <div className="text-sm lg:text-base leading-relaxed break-words">
                      {msg.message}
                    </div>
                    <div
                      className={`text-[10px] lg:text-xs mt-2 text-right ${
                        msg.sender.id === currentUser.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {msg.isOptimistic && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={endOfMessageRef} />
          </div>

          {/* Message Input */}
          <div className="flex-none p-4 lg:p-6 bg-white/90 backdrop-blur-md border-t border-gray-100">
            <div className="flex items-end gap-3 relative">
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full p-3 lg:p-4 pr-20 bg-gray-50 rounded-2xl border-0 resize-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:shadow-md focus:outline-none transition-all duration-200 text-sm lg:text-base"
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    overflowY: messageInput.length > 100 ? 'auto' : 'hidden'
                  }}
                />
                
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {/* <button className="p-1 hover:bg-gray-200 rounded-full transition-all duration-200">
                    <Paperclip className="text-gray-500" size={16} />
                  </button> */}
                  <button
                    ref={buttonRef}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-all duration-200"
                  >
                    <MdEmojiEmotions className="text-gray-500 hover:text-yellow-500 transition-colors" size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`p-3 lg:p-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 ${
                  messageInput.trim()
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <SendHorizonal size={20} />
              </button>

              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden"
                >
                  <div className="bg-white p-2 rounded-t-2xl border-b flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Choose emoji</span>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <Picker 
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    set="native"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <MessageCircle className="w-16 h-16 text-blue-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome to Chat
              </h2>
              <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
                Select a conversation from the sidebar to start messaging, or begin a new conversation with someone.
              </p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-500" size={20} />
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="text-green-500" size={20} />
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="text-purple-500" size={20} />
              </div>
            </div>
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
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const websocketRef = useRef(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (!isMobile) {
        setIsMobileView(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserLastMessage = (userId, message, timestamp) => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            last_message: message,
            last_message_timestamp: timestamp,
          };
        }
        return user;
      });
      return sortContactList(updatedUsers);
    });
  };

  const updateUserStatus = (userId, isOnline) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, is_online: isOnline } : user
      )
    );
    setSelectedUser((prevSelectedUser) =>
      prevSelectedUser && prevSelectedUser.id === userId
        ? { ...prevSelectedUser, is_online: isOnline }
        : prevSelectedUser
    );
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
      const wsUrl = `wss://api.learnerapp.site/ws/chat/${token}/`;
      // const wsUrl = `ws://localhost:8000/ws/chat/${token}/`;
      const ws = new W3CWebSocket(wsUrl);

      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket Connected Successfully");
        setWebsocket(ws);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onclose = (event) => {
        if (event.code !== 1000 && event.code !== 1001 && currentUser) {
          console.log("Attempting to reconnect in 3 seconds...");
          setTimeout(() => {
            if (currentUser) {
              initializeWebSocket();
            }
          }, 3000);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.status === "send") {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.isOptimistic && msg.message === data.message) {
                  updateUserLastMessage(
                    data.receiver_id,
                    data.message,
                    data.timestamp
                  );
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
          } else if (data.type === "user_status") {
            console.log("User status update:", data.user_id, data.is_online);
            updateUserStatus(data.user_id, data.is_online);
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
    if (
      currentUser &&
      (!websocketRef.current ||
        websocketRef.current.readyState !== WebSocket.OPEN)
    ) {
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
      return (
        new Date(b.last_message_timestamp) - new Date(a.last_message_timestamp)
      );
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
    if (window.innerWidth < 768) {
      setIsMobileView(false);
    }
  };

  const handleBackToContacts = () => {
    if (window.innerWidth < 768) {
      setIsMobileView(true);
      setSelectedUser(null);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-21vh)] flex bg-gray-100 overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      />
      
      {/* Mobile: Toggle between user list and chat */}
      <div className="md:hidden w-full h-full">
        {isMobileView ? (
          <UserList
            users={users}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
          />
        ) : (
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            sendMessage={sendMessage}
            currentUser={currentUser}
            onBackToContacts={handleBackToContacts}
          />
        )}
      </div>

      {/* Desktop: Side by side layout */}
      <div className="hidden md:flex w-full h-full">
        <div className="w-1/3 border-r border-gray-200 bg-white shadow-lg">
          <UserList
            users={users}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
          />
        </div>
        <div className="flex-1 bg-white">
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            sendMessage={sendMessage}
            currentUser={currentUser}
            onBackToContacts={handleBackToContacts}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;