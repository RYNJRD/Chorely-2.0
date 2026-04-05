import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import { api, buildUrl } from "@shared/routes";
import type { Message, User } from "@shared/schema";
import { useStore } from "@/store/useStore";
import { apiFetch } from "@/lib/apiFetch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export default function Chat() {
  const queryClient = useQueryClient();
  const { family, currentUser } = useStore();
  const [content, setContent] = useState("");
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: [buildUrl(api.families.getUsers.path, { id: family?.id || 0 })],
    enabled: !!family,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [buildUrl(api.messages.list.path, { id: family?.id || 0 })],
    enabled: !!family,
  });

  const sendMessage = useMutation({
    mutationFn: async (msg: { familyId: number; userId: number; senderName: string; content: string }) => {
      const res = await apiFetch(api.messages.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onMutate: async (msg) => {
      const queryKey = [buildUrl(api.messages.list.path, { id: msg.familyId })];
      const optimistic: Message = {
        id: Date.now() * -1,
        familyId: msg.familyId,
        userId: msg.userId,
        senderName: msg.senderName,
        content: msg.content,
        isSystem: false,
        createdAt: new Date(),
      };
      queryClient.setQueryData<Message[]>(queryKey, (old = []) => [...old, optimistic]);
      return { queryKey };
    },
    onError: (_e, _v, ctx) => { if (ctx?.queryKey) queryClient.invalidateQueries({ queryKey: ctx.queryKey }); },
    onSuccess: (_r, _v, ctx) => { if (ctx?.queryKey) queryClient.invalidateQueries({ queryKey: ctx.queryKey }); setContent(""); },
  });

  useEffect(() => {
    if (!scrollRef.current || !shouldAutoScroll) return;
    const vp = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (vp) vp.scrollTop = vp.scrollHeight;
  }, [messages, shouldAutoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const vp = e.currentTarget.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (!vp) return;
    setShouldAutoScroll(vp.scrollHeight - vp.scrollTop <= vp.clientHeight + 100);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !currentUser || !content.trim()) return;
    sendMessage.mutate({ familyId: family.id, userId: currentUser.id, senderName: currentUser.username, content: content.trim() });
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4.5rem)] bg-background">

      {/* ── Header ── */}
      <div className="flex-none px-5 pt-6 pb-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Family Chat</h1>
              <p className="text-xs text-muted-foreground">
                {users.length > 0 ? `${users.length} members` : "Keep the family in sync"}
              </p>
            </div>
          </div>
          {/* Online dots */}
          <div className="flex -space-x-1.5">
            {users.slice(0, 3).map((u) => (
              <div key={u.id} className="w-7 h-7 rounded-full border-2 border-background overflow-hidden bg-primary/10">
                <UserAvatar user={u} size="sm" />
              </div>
            ))}
            {users.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-black text-muted-foreground">
                +{users.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef} onScroll={handleScroll}>
        <div className="space-y-3 py-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isMe = message.userId === currentUser?.id;
              const sender = users.find((u) => u.id === message.userId);

              if (message.isSystem) {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center my-2"
                  >
                    <div className={cn(
                      "px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 max-w-[85%] text-center",
                      message.content.includes("ROYALTY")
                        ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 text-yellow-950 shadow-lg shadow-amber-300/50 py-3 px-5 rounded-3xl"
                        : "bg-primary/10 text-primary border border-primary/20",
                    )}>
                      <span>{message.content.includes("ROYALTY") ? "👑" : "🤖"}</span>
                      <span>{message.content}</span>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={cn("flex gap-2 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 self-end mb-1">
                    <UserAvatar
                      user={sender || ({ ...currentUser!, id: message.userId, username: message.senderName } as User)}
                      size="sm"
                    />
                  </div>

                  {/* Bubble */}
                  <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
                      {isMe ? "You" : message.senderName} · {format(new Date(message.createdAt), "HH:mm")}
                    </span>
                    <div className={cn(
                      "px-4 py-2.5 text-sm font-medium shadow-sm leading-relaxed",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-primary/20"
                        : "bg-card text-card-foreground border border-border rounded-2xl rounded-bl-md",
                    )}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="font-display text-lg font-bold mb-1">Start the conversation</p>
              <p className="text-sm text-muted-foreground">Say hi to your family!</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* ── Floating input bar ── */}
      <div className="flex-none px-4 py-3 border-t border-border/40 bg-background/90 backdrop-blur-sm">
        <form onSubmit={handleSend} className="flex gap-2">
          <motion.div
            animate={isFocused ? { boxShadow: "0 0 0 2px rgb(139 92 246 / 0.4)" } : { boxShadow: "0 0 0 0px transparent" }}
            className="flex-1 rounded-2xl overflow-hidden border-2 border-border bg-muted/40 transition-colors"
          >
            <input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message…"
              className="w-full h-12 px-4 bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 outline-none"
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={sendMessage.isPending || !content.trim()}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-md",
              content.trim()
                ? "bg-primary text-primary-foreground shadow-primary/30 active:scale-95"
                : "bg-muted text-muted-foreground",
            )}
          >
            <motion.div animate={content.trim() ? { rotate: -30 } : { rotate: 0 }} transition={{ type: "spring", stiffness: 400 }}>
              <Send className="w-[18px] h-[18px]" />
            </motion.div>
          </motion.button>
        </form>
      </div>
    </div>
  );
}
