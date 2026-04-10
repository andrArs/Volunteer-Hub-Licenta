import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, Pressable, FlatList,
  Animated, TouchableWithoutFeedback, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { aiStyles, DRAWER_WIDTH } from "@/src/styles/ai.chat.styles";
import { ConversationDto, MessageDto } from "@/src/types/chat";
import { aiService } from "@/src/api/ai.chat.api";

function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

type Segment =
  | { type: "text"; content: string }
  | { type: "event"; eventId: string; label: string }
  | { type: "join"; eventId: string; status: "going" | "interested" };


  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[aiStyles.aiBubble, aiStyles.messageBubble]}>
      <View style={aiStyles.typingContainer}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[aiStyles.typingDot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

  function JoinConfirmCard({
    eventId,
    status,
    onConfirm,
  }: {
    eventId: string;
    status: "going" | "interested";
    onConfirm: (eventId: string, status: "going" | "interested") => void;
  }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(eventId, status);
      setDone(true);
    } catch {
      Alert.alert("Error", "Could not update attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={aiStyles.joinCard}>
        <FontAwesome
          name="check-circle"
          size={16}
          color="#4CAF50"
          style={{ marginRight: 8 }}
        />
        <Text style={aiStyles.joinCardDoneText}>
          {status === "going" ? "You're going!" : "Marked as interested!"}
        </Text>
      </View>
    );
  }

  return (
    <View style={aiStyles.joinCard}>
      <View style={aiStyles.joinCardInfo}>
        <FontAwesome
          name={status === "going" ? "calendar-check-o" : "star-o"}
          size={14}
          color="#3F5E95"
        />
        <Text style={aiStyles.joinCardText}>
          Mark as{" "}
          <Text style={{ fontWeight: "700" }}>
            {status === "going" ? "Going" : "Interested"}
          </Text>
          ?
        </Text>
      </View>
      <Pressable
        style={[aiStyles.joinCardBtn, loading && { opacity: 0.6 }]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={aiStyles.joinCardBtnText}>Confirm</Text>
        )}
      </Pressable>
    </View>
  );
}


function MessageBubble({
  msg,
  onEventPress,
  onJoinConfirm,
}: {
  msg: MessageDto;
  onEventPress: (id: string) => void;
  onJoinConfirm: (eventId: string, status: "going" | "interested") => Promise<void>;
}) {
  const isUser = msg.role === "user";
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <View style={[aiStyles.messageBubble, aiStyles.userBubble]}>
        <Text style={aiStyles.userBubbleText}>{msg.content}</Text>
        <Text style={aiStyles.timestampText}>{time}</Text>
      </View>
    );
  }

  const EVENT_CARD_REGEX = /\[EVENT_CARD:\s*([a-zA-Z0-9\-]+)\]/g;
  const JOIN_EVENT_REGEX = /\[JOIN_EVENT:\s*([a-zA-Z0-9\-]+)\s*\|\s*(going|interested)\]/g;

  const cleanText = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(EVENT_CARD_REGEX, "")
    .replace(JOIN_EVENT_REGEX, "")
    .trim();

  type Segment =
    | { type: "text"; content: string }
    | { type: "event"; eventId: string; label: string }
    | { type: "join"; eventId: string; status: "going" | "interested" };

  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const COMBINED_REGEX = /\[EVENT_CARD:\s*([a-zA-Z0-9\-]+)\]|\[JOIN_EVENT:\s*([a-zA-Z0-9\-]+)\s*\|\s*(going|interested)\]/g;
  COMBINED_REGEX.lastIndex = 0;


  while ((match = COMBINED_REGEX.exec(msg.content)) !== null) {
    if (match.index > lastIndex) {
    const textBefore = msg.content.slice(lastIndex, match.index)
      .replace(/\*\*(.*?)\*\*/g, "$1").trim();
        if (textBefore) segments.push({ type: "text", content: textBefore });
          }

      if (match[1]) {
        segments.push({ type: "event", eventId: match[1].trim(), label: "" });
      } else if (match[2]) {
        segments.push({
          type: "join",
          eventId: match[2].trim(),
          status: match[3] as "going" | "interested",
        });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < msg.content.length) {
      const textAfter = msg.content.slice(lastIndex)
        .replace(/\*\*(.*?)\*\*/g, "$1").trim();
      if (textAfter) segments.push({ type: "text", content: textAfter });
    }

  if (!segments.some((s) => s.type === "event")) {
    return (
      <View style={[aiStyles.messageBubble, aiStyles.aiBubble]}>
        <Text style={aiStyles.aiBubbleText}>{cleanText(msg.content)}</Text>
        <Text style={aiStyles.timestampText}>{time}</Text>
      </View>
    );
  }

  return (
    <View style={[aiStyles.messageBubble, aiStyles.aiBubble]}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <Text key={i} style={aiStyles.aiBubbleText}>
            {seg.content}
          </Text>
        ) : (
          <View key={i} style={aiStyles.inlineEventCard}>
            <View style={aiStyles.inlineEventInfo}>
              <Text style={aiStyles.inlineEventTitle} numberOfLines={1}>
                {getEventTitle(segments, i)}
              </Text>
            </View>
            <Pressable
              style={aiStyles.inlineEventBtn}
              onPress={() => onEventPress(seg.eventId)}
            >
              <Text style={aiStyles.inlineEventBtnText}>View Event</Text>
            </Pressable>
          </View>
        )
      )}
      <Text style={aiStyles.timestampText}>{time}</Text>
    </View>
  );
}

function getEventTitle(
  segments: Array<{ type: string; content?: string; eventId?: string; label?: string }>,
  eventIndex: number
): string {
  for (let i = eventIndex - 1; i >= 0; i--) {
    if (segments[i].type === "text" && segments[i].content) {
      const lines = segments[i].content!.split("\n").filter((l) => l.trim());
      const lastLine = lines[lines.length - 1] ?? "";
      return lastLine.replace(/^\d+\.\s*/, "").trim();
    }
  }
  return "Event";
}

export default function AiChatScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState(q ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (q?.trim()) sendMessage(q.trim());
  }, []);

  const openDrawer = useCallback(async () => {
    setDrawerOpen(true);
    Animated.spring(drawerAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    await loadConversations();
  }, []);

  const closeDrawer = useCallback(() => {
    Animated.timing(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  }, []);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await aiService.getConversations();
      setConversations(data);
    } catch {
    } finally {
      setLoadingConversations(false);
    }
  };

  const selectConversation = async (conv: ConversationDto) => {
    closeDrawer();
    setIsLoading(true);
    try {
      const full = await aiService.getConversation(conv.id);
      setConversationId(full.id);
      setMessages(full.messages);
    } catch {
      Alert.alert("Error", "Could not load conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    closeDrawer();
    setMessages([]);
    setConversationId(null);
    setInputText("");
  };

  const deleteConversation = async (id: string) => {
    Alert.alert("Delete", "Delete this conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await aiService.deleteConversation(id);
          setConversations((prev) => prev.filter((c) => c.id !== id));
          if (conversationId === id) startNewChat();
        },
      },
    ]);
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? inputText).trim();
    if (!messageText || isSending) return;

    const userMsg: MessageDto = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const res = await aiService.sendMessage(messageText, conversationId ?? undefined);
      setConversationId(res.conversationId);

      const aiMsg: MessageDto = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: res.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      Alert.alert("Error", "Could not get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinConfirm = async (eventId: string, status: "going" | "interested") => {
    await aiService.updateAttendance(eventId, status);
  };

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, isSending]);

  const suggestions = [
    "Suggest events this weekend 🗓️",
    "Animal care volunteering 🐾",
    "Environment events 🌱",
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short" });

  return (
    <View style={aiStyles.container}>

      <View style={aiStyles.header}>
        <Pressable
            onPress={() => router.replace("/")}
            style={aiStyles.headerBtn}>
        <FontAwesome name="arrow-left" size={18} color="#3F5E95" />
        </Pressable>
        
        <Pressable style={aiStyles.headerBtn} onPress={openDrawer}>
          <FontAwesome name="bars" size={18} color="#3F5E95" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={aiStyles.headerTitle}>AI Assistant</Text>
          <Text style={aiStyles.headerSubtitle}>VolunteerHub helper</Text>
        </View>
        {conversationId && (
          <Pressable style={aiStyles.headerBtn} onPress={startNewChat}>
            <FontAwesome name="plus" size={16} color="#3F5E95" />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={aiStyles.emptyState}>
            <ActivityIndicator size="large" color="#3F5E95" />
          </View>
        ) : messages.length === 0 ? (
          <ScrollView contentContainerStyle={aiStyles.emptyState}>
            <View style={aiStyles.emptyIcon}>
              <FontAwesome name="comment" size={30} color="#3F5E95" />
            </View>
            <Text style={aiStyles.emptyTitle}>How can I help?</Text>
            <Text style={aiStyles.emptySubtitle}>
              Ask me anything about volunteer events. I'll find the best ones for you!
            </Text>
            <View style={aiStyles.suggestionsRow}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  style={aiStyles.suggestionChip}
                  onPress={() => sendMessage(s)}
                >
                  <Text style={aiStyles.suggestionChipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            renderItem={({ item }) => (
              <MessageBubble
                msg={item}
                onEventPress={(id) => router.push(`/event.view?id=${id}` as any)}
                onJoinConfirm={handleJoinConfirm}
              />
            )}
            ListFooterComponent={isSending ? <TypingIndicator /> : null}
            onContentSizeChange={scrollToBottom}
          />
        )}

        <View style={aiStyles.inputBar}>
          <TextInput
            style={aiStyles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about volunteer events..."
            placeholderTextColor="#8B93A7"
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <Pressable
            style={[
              aiStyles.sendBtn,
              (!inputText.trim() || isSending) && aiStyles.sendBtnDisabled,
            ]}
            disabled={!inputText.trim() || isSending}
            onPress={() => sendMessage()}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <FontAwesome name="send" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={aiStyles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[aiStyles.drawer, { transform: [{ translateX: drawerAnim }] }]}
      >
        <Text style={aiStyles.drawerTitle}>Conversations</Text>

        <Pressable style={aiStyles.newChatBtn} onPress={startNewChat}>
          <FontAwesome name="plus" size={14} color="#FFF" />
          <Text style={aiStyles.newChatText}>New Chat</Text>
        </Pressable>

        <Text style={aiStyles.drawerSectionTitle}>History</Text>

        {loadingConversations ? (
          <ActivityIndicator color="#3F5E95" style={{ marginTop: 20 }} />
        ) : conversations.length === 0 ? (
          <Text style={{ color: "#8B93A7", fontSize: 13, marginTop: 8 }}>
            No conversations yet.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {conversations.map((conv) => (
              <Pressable
                key={conv.id}
                style={[
                  aiStyles.conversationItem,
                  conv.id === conversationId && aiStyles.conversationItemActive,
                ]}
                onPress={() => selectConversation(conv)}
              >
                <View style={aiStyles.conversationRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={aiStyles.conversationItemText}
                      numberOfLines={1}
                    >
                      {conv.summary
                        ? conv.summary.slice(0, 40) + "..."
                        : (conv.messages[0]?.content.slice(0, 40) ?? "Conversation") + "..."}
                    </Text>
                    <Text style={aiStyles.conversationItemDate}>
                      {formatDate(conv.createdAt)}
                    </Text>
                  </View>
                  <Pressable
                    style={aiStyles.deleteBtn}
                    onPress={() => deleteConversation(conv.id)}
                  >
                    <FontAwesome name="trash" size={13} color="#C0C8D8" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}