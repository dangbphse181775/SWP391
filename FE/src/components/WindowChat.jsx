import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import disputeApi from "@/service/disputeApi";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessToken } from "@/service/auth";
import { Image as ImageIcon, X } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "");

export default function WindowChat({ disputeId, channel, onClose, onMessageSent }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const connectionRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [unread, setUnread] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);
  const initedRef = useRef(false);
  const [stagedImage, setStagedImage] = useState(null);   // { file, previewUrl }
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null); // image URL to show full-screen

  // Emoji sticker data grouped by category
  const EMOJI_CATEGORIES = [
    { name: "Smileys", emojis: ["😀", "😂", "🤣", "😊", "😍", "🥰", "😘", "😜", "🤪", "😎", "🥳", "😇", "🤗", "🤔", "😏", "😢", "😭", "😤", "🤬", "😱", "🥺", "😴", "🤮", "🤡"] },
    { name: "Gestures", emojis: ["👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "👌", "🤙", "💪", "🙏", "👋", "🫡", "🫶", "☝️", "👆", "👇", "👈", "👉", "✋", "🤚", "🖐️", "🫰", "🤌"] },
    { name: "Hearts", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❤️‍🔥", "💕", "💞", "💓", "💗", "💖", "💘", "💝"] },
    { name: "Objects", emojis: ["🎉", "🎊", "🎁", "🏆", "⭐", "🌟", "💯", "🔥", "💰", "💸", "🏍️", "🚗", "🚙", "🏎️", "🛵", "📦", "📋", "✅", "❌", "⚠️", "📸", "🔑", "🏠", "📞"] },
    { name: "Animals", emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦋", "🐛"] },
  ];

  // Check if a message is a single emoji (sticker-style)
  const isSingleEmoji = (text) => {
    if (!text) return false;
    const trimmed = text.trim();
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|[\u200d\uFE0F])+$/u;
    return emojiRegex.test(trimmed) && [...trimmed].length <= 3;
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Load chat history + connect SignalR
  useEffect(() => {
    if (!disputeId || !channel) return;
    // Prevent double-init caused by React StrictMode
    if (initedRef.current) return;
    initedRef.current = true;

    let connection;
    let disposed = false;

    const init = async () => {
      // 1. Load existing chat history via REST
      try {
        const res = await disputeApi.getChatHistory(disputeId, channel);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!disposed) setMessages(list);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }

      if (disposed) return;

      // 2. Build SignalR connection
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/dispute-chat`, {
          accessTokenFactory: () => getAccessToken(),
        })
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;

      // Listen for incoming messages
      // Re-fetch history from REST instead of using the raw SignalR payload directly,
      // because the SignalR broadcast may lack senderName/senderAvatar (shows "User #N").
      // The history API always returns the full, enriched message objects.
      connection.on("ReceiveMessage", async (msg) => {
        try {
          const res = await disputeApi.getChatHistory(disputeId, channel);
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (!disposed) setMessages(list);
        } catch {
          // Fallback: append raw message if history fetch fails
          setMessages((prev) => {
            if (msg.disputeChatId && prev.some((m) => m.disputeChatId === msg.disputeChatId)) {
              return prev;
            }
            return [...prev, msg];
          });
        }
        setUnread((prev) => prev + 1);
      });

      connection.on("UserJoined", (info) => {
        console.log("UserJoined:", info);
      });

      connection.onreconnected(async () => {
        setIsConnected(true);
        try {
          await connection.invoke("JoinDisputeChannel", disputeId, channel);
        } catch (e) {
          console.error("Re-join after reconnect failed:", e);
        }
      });

      connection.onclose(() => {
        if (!disposed) setIsConnected(false);
      });

      // 3. Start connection and join channel
      try {
        await connection.start();
        if (!disposed) {
          setIsConnected(true);
          await connection.invoke("JoinDisputeChannel", disputeId, channel);
        }
      } catch (err) {
        console.error("SignalR connection failed:", err);
      }
    };

    init();

    return () => {
      disposed = true;
      initedRef.current = false;
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection
          .invoke("LeaveDisputeChannel", disputeId, channel)
          .catch(() => { })
          .finally(() => connection.stop());
      } else if (connection) {
        connection.stop();
      }
    };
  }, [disputeId, channel]);

  // Pick image from file input
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setStagedImage({ file, previewUrl });
    // Reset file input so same file can be re-selected
    e.target.value = "";
  };

  // Clear staged image and revoke object URL
  const clearStagedImage = () => {
    if (stagedImage?.previewUrl) URL.revokeObjectURL(stagedImage.previewUrl);
    setStagedImage(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    const hasImage = !!stagedImage;
    const hasText = !!text;
    if ((!hasText && !hasImage) || !connectionRef.current || !isConnected) return;

    if (hasImage) {
      // ── Optimistic image send ──
      const { file, previewUrl } = stagedImage;
      const captionText = hasText ? text : undefined;
      const tempId = `temp-${Date.now()}`;

      // 1. Add placeholder message immediately (local blob URL + spinner flag)
      setMessages(prev => [...prev, {
        disputeChatId: tempId,
        senderId: user?.userId,
        senderName: user?.fullName || user?.userName || "Bạn",
        senderAvatar: user?.avatar || null,
        imageUrl: previewUrl,
        message: captionText || null,
        sentAt: new Date().toISOString(),
        _uploading: true,
      }]);

      // 2. Clear staged image + input immediately for snappy UX
      setStagedImage(null);          // don't revoke yet — blob still used in temp msg
      if (hasText) setInput("");
      setIsUploading(true);

      try {
        await disputeApi.uploadChatImage(disputeId, channel, file, captionText);

        // 3. Re-fetch real history (replaces temp message with Cloudinary URL)
        const res = await disputeApi.getChatHistory(disputeId, channel);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMessages(list);

        if (typeof onMessageSent === 'function') onMessageSent();
      } catch (err) {
        console.error("Image send failed:", err);
        // Remove temp placeholder on error
        setMessages(prev => prev.filter(m => m.disputeChatId !== tempId));
      } finally {
        URL.revokeObjectURL(previewUrl);
        setIsUploading(false);
        inputRef.current?.focus();
      }
      return;
    }

    // ── Text-only via SignalR ──
    try {
      setIsUploading(true);
      await connectionRef.current.invoke("SendMessage", disputeId, channel, text);
      setInput("");
      inputRef.current?.focus();
      if (typeof onMessageSent === 'function') onMessageSent();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendEmoji = async (emoji) => {
    if (!connectionRef.current || !isConnected) return;
    try {
      await connectionRef.current.invoke("SendMessage", disputeId, channel, emoji);
      setShowEmoji(false);
    } catch (err) {
      console.error("Send emoji failed:", err);
    }
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setUnread(0);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMe = (senderId) => {
    const isMatch = String(senderId) === String(user?.userId);
    return isMatch;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 h-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  {channel === "buyer" ? "B" : "S"}
                </div>
                {isConnected && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-xs text-slate-900 leading-none">
                  Dispute #{disputeId}
                </h2>
                <span className="text-[9px] text-slate-400 font-medium capitalize">
                  {channel} channel
                  {!isConnected && " • Connecting…"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 bg-slate-50 chat-scroll"
          >
            {messages.length === 0 && (
              <div className="text-center text-[10px] text-slate-400 mt-12">
                Chưa có tin nhắn nào
              </div>
            )}

            {messages.map((msg, idx) => {
              const me = isMe(msg.senderId);
              const showTime =
                idx === 0 ||
                new Date(msg.sentAt) - new Date(messages[idx - 1].sentAt) > 300000;

              return (
                <div key={msg.disputeChatId || idx}>
                  {showTime && (
                    <div className="text-center my-1">
                      <span className="text-[9px] font-medium text-slate-400">
                        {formatTime(msg.sentAt)}
                      </span>
                    </div>
                  )}

                  {me ? (
                    <div className="flex flex-col items-end gap-0.5 ml-auto max-w-[80%]">
                      {msg.imageUrl && (
                        <div className="relative max-w-full">
                          <img
                            src={msg.imageUrl}
                            alt=""
                            onClick={!msg._uploading ? () => setLightboxUrl(msg.imageUrl) : undefined}
                            className={`max-w-full rounded-lg ${msg._uploading ? 'opacity-60' : 'cursor-zoom-in hover:brightness-95 transition-all active:scale-95'}`}
                          />
                          {msg._uploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25 backdrop-blur-[1px]">
                              <svg className="h-7 w-7 animate-spin text-white drop-shadow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                      {msg.message && (
                        isSingleEmoji(msg.message) ? (
                          <div className="text-4xl leading-none py-1" title={formatTime(msg.sentAt)}>
                            {msg.message}
                          </div>
                        ) : (
                          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-2xl rounded-br-sm text-xs leading-relaxed">
                            {msg.message}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-1.5 max-w-[80%]">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-5 h-5 rounded-full object-cover self-end"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-600 self-end">
                          {(msg.senderName || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400">{msg.senderName}</span>
                        {msg.imageUrl && (
                          <div className="relative max-w-full">
                            <img
                              src={msg.imageUrl}
                              alt=""
                              onClick={!msg._uploading ? () => setLightboxUrl(msg.imageUrl) : undefined}
                              className={`max-w-full rounded-lg ${msg._uploading ? 'opacity-60' : 'cursor-zoom-in hover:brightness-95 transition-all active:scale-95'}`}
                            />
                            {msg._uploading && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25 backdrop-blur-[1px]">
                                <svg className="h-7 w-7 animate-spin text-white drop-shadow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                        {msg.message && (
                          isSingleEmoji(msg.message) ? (
                            <div className="text-4xl leading-none py-1" title={formatTime(msg.sentAt)}>
                              {msg.message}
                            </div>
                          ) : (
                            <div className="bg-white text-slate-900 px-3 py-1.5 rounded-2xl rounded-bl-sm text-xs leading-relaxed border border-slate-200">
                              {msg.message}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Emoji Picker */}
          {showEmoji && (
            <div ref={emojiRef} className="border-t border-slate-100 bg-white px-2 py-2 shrink-0">
              <div className="h-36 overflow-y-auto chat-scroll">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="mb-2">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">{cat.name}</p>
                    <div className="grid grid-cols-8 gap-0.5">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleSendEmoji(emoji)}
                          className="h-7 w-7 flex items-center justify-center text-lg rounded hover:bg-slate-100 active:scale-90 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image preview strip */}
          {stagedImage && (
            <div className="px-2 pt-2 bg-white border-t border-slate-100 shrink-0">
              <div className="relative inline-block">
                <img
                  src={stagedImage.previewUrl}
                  alt="preview"
                  className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                />
                <button
                  onClick={clearStagedImage}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  title="Xoá ảnh"
                >
                  <X size={9} />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-2 py-2 bg-white border-t border-slate-100 shrink-0">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              {/* Emoji button */}
              <button
                onClick={() => setShowEmoji((prev) => !prev)}
                className={`p-1 rounded-full transition-colors ${showEmoji ? "text-slate-900 bg-slate-200" : "text-slate-400 hover:text-slate-600"
                  }`}
                title="Sticker"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
              </button>
              {/* Image upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected || isUploading}
                className={`p-1 rounded-full transition-colors ${stagedImage ? "text-blue-500 bg-blue-50" : "text-slate-400 hover:text-slate-600"
                  } disabled:opacity-30`}
                title="Gửi ảnh"
              >
                <ImageIcon size={14} />
              </button>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-xs text-slate-900 placeholder:text-slate-400"
                placeholder={stagedImage ? "Thêm chú thích... (tuỳ chọn)" : "Nhập tin nhắn..."}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected || isUploading}
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !stagedImage) || !isConnected || isUploading}
                className="text-slate-900 hover:opacity-70 transition-opacity disabled:opacity-30 p-1"
              >
                {isUploading ? (
                  <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Lightbox ─── */}
      {lightboxUrl && (
        <div
          className="chat-lightbox-overlay"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="chat-lightbox-img"
          />
        </div>
      )}

      {/* ─── Floating Bubble ─── */}
      <button
        onClick={toggleOpen}
        className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center relative"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
          </svg>
        )}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        .chat-lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
          animation: lb-fade-in 0.18s ease;
        }
        .chat-lightbox-img {
          max-width: min(90vw, 900px);
          max-height: 88vh;
          border-radius: 12px;
          object-fit: contain;
          box-shadow: 0 25px 60px rgba(0,0,0,0.6);
          animation: lb-scale-in 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes lb-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lb-scale-in {
          from { transform: scale(0.82); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
