import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users } from "lucide-react";
import { format } from "date-fns";
import useAuthStore from "@/store/useAuthStore";

interface ChatMessage {
  id: string;
  judgeId: string;
  judgeName: string;
  message: string;
  timestamp: Date;
  isPublic: boolean;
}

interface JudgeChatProps {
  matchId: string;
  judges: Array<{ id: string; fullName: string }>;
  messages?: ChatMessage[];
  onSendMessage: (message: string, isPublic: boolean) => void;
}

export const JudgeChat = ({
  matchId,
  judges,
  messages = [],
  onSendMessage,
}: JudgeChatProps) => {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    onSendMessage(message.trim(), isPublic);
    setMessage("");
    setIsPublic(false);
  };

  return (
    <Card className="bg-white border-[#E0E0E0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Judge Collaboration
            </CardTitle>
            <CardDescription className="text-[#4A4A4A]">
              Internal chat with co-judges ({judges.length} judges)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-[#4A4A4A] text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.judgeId === user?.id
                      ? "bg-[#0077CC]/10 ml-auto max-w-[80%]"
                      : "bg-[#F5F7FA] mr-auto max-w-[80%]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm text-[#1A1A1A]">
                      {msg.judgeName}
                      {msg.judgeId === user?.id && (
                        <span className="text-xs text-[#4A4A4A] ml-2">(You)</span>
                      )}
                    </div>
                    <div className="text-xs text-[#4A4A4A]">
                      {format(new Date(msg.timestamp), "HH:mm")}
                    </div>
                  </div>
                  <div className="text-sm text-[#1A1A1A]">{msg.message}</div>
                  {msg.isPublic && (
                    <div className="mt-1">
                      <span className="text-xs bg-[#22C55E]/20 text-[#22C55E] px-2 py-0.5 rounded">
                        Public
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="space-y-2 border-t border-[#E0E0E0] pt-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to co-judges..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#4A4A4A] cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-[#E0E0E0]"
              />
              <span>Make message public (visible to teams)</span>
            </label>
            <Button
              onClick={handleSend}
              className="bg-[#0077CC] hover:bg-[#005FA3]"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

