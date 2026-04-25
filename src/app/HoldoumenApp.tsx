"use client";

import Image from "next/image";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { HOLDOUMEN_COPY } from "@/data/holdoumen/copy";
import { HOLDOUMEN_IMAGES } from "@/data/holdoumen/images";
import { HOLDOUMEN_MEMBERS } from "@/data/holdoumen/members";
import { HOLDOUMEN_THEME } from "@/data/holdoumen/theme";
import type { ChatMessage, Member } from "@/types/holdoumen";

import { MemberCard } from "../components/MemberCard";
import styles from "./HoldoumenApp.module.scss";
import { sendMessageStream } from "@/service";
import { BallGame } from "./ball-game/BallGame";
import ChatScreen from "./chat";

type ViewMode = "picker" | "chat";

type AppStyle = CSSProperties & {
  "--page-gradient": string;
  "--shell-gradient": string;
  "--warm-glow": string;
  "--cool-glow": string;
  "--text-primary": string;
  "--text-secondary": string;
  "--text-muted": string;
  "--divider": string;
  "--surface": string;
  "--surface-soft": string;
  "--strong-surface": string;
  "--button-text": string;
  "--input-border": string;
  "--shell-shadow": string;
  "--selected-member-rgb": string;
};
function createWelcomeMessage(member: Member): ChatMessage {
  return {
    id: `${member.id}-welcome`,
    role: "assistant",
    text: member.greeting,
  };
}

function buildInitialMessages() {
  return HOLDOUMEN_MEMBERS.reduce<Record<string, ChatMessage[]>>((accumulator, member) => {
    accumulator[member.id] = [createWelcomeMessage(member)];
    return accumulator;
  }, {});
}

function buildInitialReplyState() {
  return HOLDOUMEN_MEMBERS.reduce<Record<string, number>>((accumulator, member) => {
    accumulator[member.id] = 0;
    return accumulator;
  }, {});
}

function nextMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function HoldoumenApp() {
  const [viewMode, setViewMode] = useState<ViewMode>("picker");
  const [selectedMemberId, setSelectedMemberId] = useState(HOLDOUMEN_MEMBERS[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messagesByMember, setMessagesByMember] = useState(buildInitialMessages);
  const replyIndexRef = useRef(buildInitialReplyState());
  const replyTimerRef = useRef<number | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const selectedMember =
    HOLDOUMEN_MEMBERS.find((member) => member.id === selectedMemberId) ?? HOLDOUMEN_MEMBERS[0];

  const currentMessages = selectedMember ? (messagesByMember[selectedMember.id] ?? []) : [];

  const appStyle: AppStyle = {
    "--page-gradient": HOLDOUMEN_THEME.pageGradient,
    "--shell-gradient": HOLDOUMEN_THEME.shellGradient,
    "--warm-glow": HOLDOUMEN_THEME.warmGlow,
    "--cool-glow": HOLDOUMEN_THEME.coolGlow,
    "--text-primary": HOLDOUMEN_THEME.textPrimary,
    "--text-secondary": HOLDOUMEN_THEME.textSecondary,
    "--text-muted": HOLDOUMEN_THEME.textMuted,
    "--divider": HOLDOUMEN_THEME.divider,
    "--surface": HOLDOUMEN_THEME.surface,
    "--surface-soft": HOLDOUMEN_THEME.surfaceSoft,
    "--strong-surface": HOLDOUMEN_THEME.strongSurface,
    "--button-text": HOLDOUMEN_THEME.buttonText,
    "--input-border": HOLDOUMEN_THEME.inputBorder,
    "--shell-shadow": HOLDOUMEN_THEME.shellShadow,
    "--selected-member-rgb": selectedMember?.supportRgb ?? HOLDOUMEN_MEMBERS[0]?.supportRgb ?? "226, 164, 99",
  };

  useEffect(() => {
    if (viewMode !== "chat") {
      return;
    }

    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [currentMessages.length, selectedMember?.id, viewMode]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        window.clearTimeout(replyTimerRef.current);
      }
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
    };
  }, []);

  function clearReplyTimer() {
    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
  }

  function abortActiveRequest() {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    setIsStreaming(false);
  }

  function handleSelectMember(member: Member) {
    clearReplyTimer();
    abortActiveRequest();
    setDraft("");
    setSelectedMemberId(member.id);
    setViewMode("chat");
  }

  function handleSwitchRole() {
    clearReplyTimer();
    abortActiveRequest();
    setDraft("");
    setViewMode("picker");
  }

  function getFallbackReply(memberId: string) {
    const member = HOLDOUMEN_MEMBERS.find((item) => item.id === memberId);
    if (!member || member.replies.length === 0) {
      return "";
    }

    const nextIndex = replyIndexRef.current[memberId] ?? 0;
    const reply = member.replies[nextIndex % member.replies.length];
    replyIndexRef.current[memberId] = nextIndex + 1;
    return reply;
  }

  function setAssistantMessageText(memberId: string, messageId: string, content: string) {
    setMessagesByMember((previous) => ({
      ...previous,
      [memberId]: (previous[memberId] ?? []).map((message) =>
        message.id === messageId ? { ...message, text: content } : message
      ),
    }));
  }

  function removeMessage(memberId: string, messageId: string) {
    setMessagesByMember((previous) => ({
      ...previous,
      [memberId]: (previous[memberId] ?? []).filter((message) => message.id !== messageId),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMember || isStreaming) {
      return;
    }

    const content = draft.trim();
    if (!content) {
      return;
    }

    const memberId = selectedMember.id;
    const userMessageId = nextMessageId();
    const assistantMessageId = nextMessageId();

    setDraft("");
    clearReplyTimer();
    setMessagesByMember((previous) => ({
      ...previous,
      [memberId]: [
        ...(previous[memberId] ?? [createWelcomeMessage(selectedMember)]),
        {
          id: userMessageId,
          role: "user",
          text: content,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          text: "",
        },
      ],
    }));

    const controller = new AbortController();
    activeRequestRef.current = controller;
    setIsStreaming(true);
    let streamedText = "";

    try {
      const result = await sendMessageStream(content, {
        signal: controller.signal,
        onChunk: (chunk) => {
          streamedText += chunk;
          setAssistantMessageText(memberId, assistantMessageId, streamedText);
        },
      });

      if (!streamedText.trim()) {
        const answer = typeof result.answer === "string" ? result.answer : "";
        const fallback = getFallbackReply(memberId);
        setAssistantMessageText(memberId, assistantMessageId, answer || fallback);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        if (!streamedText.trim()) {
          removeMessage(memberId, assistantMessageId);
        }
        return;
      }
      console.error(error);
      setAssistantMessageText(memberId, assistantMessageId, getFallbackReply(memberId));
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
      setIsStreaming(false);
    }

    replyTimerRef.current = window.setTimeout(() => {
      replyTimerRef.current = null;
    }, 420);
  }

  if (!selectedMember) {
    return null;
  }

  return (
    <div className={styles.app} style={appStyle}>
      <main className={styles.phoneShell}>
        {viewMode === "picker" ? (
          <section className={`${styles.screen} ${styles.homeScreen}`}>
            <div className={styles.hero}>
              <div className={styles.signWrap} aria-hidden="true">
                <Image
                  className={styles.sign}
                  src={HOLDOUMEN_IMAGES.roadSign}
                  alt=""
                  width={200}
                  height={123}
                />
              </div>

              <p className={styles.marquee}>{HOLDOUMEN_COPY.heroDescription}</p>
            </div>

            <BallGame />

            <div className={styles.memberList} aria-label="成员列表">
              {HOLDOUMEN_MEMBERS.map((member) => (
                <MemberCard key={member.id} member={member} onSelect={handleSelectMember} />
              ))}
            </div>
          </section>
        ) : <ChatScreen
          selectedMember={selectedMember}
          currentMessages={currentMessages}
          draft={draft}
          setDraft={setDraft}
          isStreaming={isStreaming}
          messageEndRef={messageEndRef}
          handleSubmit={handleSubmit}
          handleSwitchRole={handleSwitchRole}
        />}
      </main>


    </div>
  );
}
