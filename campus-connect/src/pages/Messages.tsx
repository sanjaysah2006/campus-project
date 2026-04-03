import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/lib/api";
import { useSearchParams } from "react-router-dom";

/* TYPES */
interface User {
  id: number;
  username: string;
}

interface Message {
  id: number;
  sender: User;
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  participants: User[];
  last_message?: Message | null;
}

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversation");

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* 🔹 FETCH CONVERSATIONS */
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await API.get("chat/conversations/");
      return res.data;
    },
  });

  /* 🔥 AUTO OPEN CHAT */
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const found = conversations.find(
        (c: Conversation) => c.id === Number(conversationId)
      );
      if (found) setSelectedConversation(found);
    }
  }, [conversationId, conversations]);

  /* 🔹 FETCH MESSAGES */
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConversation?.id],
    queryFn: async () => {
      const res = await API.get(
        `chat/messages/${selectedConversation?.id}/`
      );
      return res.data;
    },
    enabled: !!selectedConversation,
  });

  /* 🔹 SEND MESSAGE */
  const sendMessage = useMutation({
    mutationFn: async () => {
      return API.post("chat/send/", {
        conversation_id: selectedConversation?.id,
        content: messageInput,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversation?.id],
      });
      setMessageInput("");
    },
  });

  /* 🔥 AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 🔹 GET NAME */
  const getName = (conv) => {
    return conv.club_name || conv.participants.find(P => P.username !== user?.username)?.username || "chat";
  };

  const filtered = conversations.filter((c: Conversation) =>
    getName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-2xl overflow-hidden border bg-card">

      {/* LEFT SIDEBAR */}
      <div className="w-80 border-r flex flex-col bg-muted/30">

        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">Messages</h2>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filtered.map((conv: Conversation) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={cn(
                "p-4 cursor-pointer border-b hover:bg-muted transition",
                selectedConversation?.id === conv.id && "bg-muted"
              )}
            >
              <div className="font-semibold">
                {getName(conv)}
              </div>

              <p className="text-sm text-muted-foreground truncate">
                {conv.last_message?.content || "Start chatting..."}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* RIGHT CHAT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b flex items-center gap-3 bg-muted/40">
          {selectedConversation ? (
            <>
              <Avatar>
                <AvatarFallback>
                  {getName(selectedConversation).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="font-semibold">
                {getName(selectedConversation)}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">
              Select a chat
            </div>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">

          {!selectedConversation && (
            <div className="text-center text-muted-foreground mt-20">
              Select a conversation to start chatting 💬
            </div>
          )}

          {messages.map((msg: Message) => {
            const isOwn = msg.sender.username === user?.username;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl max-w-xs shadow-sm",
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-muted rounded-bl-none"
                  )}
                >
                  <p>{msg.content}</p>

                  <p className="text-[10px] opacity-70 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {selectedConversation && (
          <div className="p-3 border-t flex gap-2 bg-background sticky bottom-0">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage.mutate()
              }
            />

            <Button
              onClick={() => sendMessage.mutate()}
              disabled={!messageInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}