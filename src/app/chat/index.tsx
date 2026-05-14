import React from "react";
import styles from "./Chat.module.scss";
import { HOLDOUMEN_IMAGES } from "@/data/holdoumen/images";
import { AvatarSprite } from "@/components/AvatarSprite";
import { HOLDOUMEN_COPY } from "@/data/holdoumen/copy";
import type { Member } from "@/types/holdoumen";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
interface ChatScreenProps {
  selectedMember: Pick<Member, "id" | "name" | "rank">;
  currentMessages: Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
  }>;
  draft: string;
  setDraft: (value: string) => void;
  isStreaming: boolean;
  messageEndRef: React.RefObject<HTMLDivElement | null>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleSwitchRole: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  selectedMember,
  currentMessages,
  draft,
  setDraft,
  isStreaming,
  messageEndRef,
  handleSubmit,
  handleSwitchRole,
}) => {
  const { logout, user } = useAuth();
  const avatarSrc =
    HOLDOUMEN_IMAGES.memberAvatars[
      selectedMember.id as keyof typeof HOLDOUMEN_IMAGES.memberAvatars
    ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <section className={`${styles.screen} ${styles.chatScreen}`}>
      <header className={styles.chatHeader}>
        <div className={styles.chatMember}>
          <span className={styles.chatAvatar} aria-hidden="true">
            <AvatarSprite size={48} src={avatarSrc} />
          </span>
          <div>
            <span className={styles.eyebrow}>{selectedMember.rank}</span>
            <h2 className={styles.name}>{selectedMember.name}</h2>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.switchButton} type="button" onClick={handleSwitchRole}>
            {HOLDOUMEN_COPY.switchRoleLabel}
          </button>
          <button className={styles.logoutButton} type="button" onClick={handleLogout}>
            退出
          </button>
        </div>
      </header>

      <div className={styles.userInfo}>
        当前用户: {user?.username}
      </div>

      <div className={styles.messages}>
        {currentMessages.length === 0 ? (
          <p className={styles.emptyState}>{HOLDOUMEN_COPY.emptyPrompt}</p>
        ) : null}

        {currentMessages.map((message) => {
          const roleClass =
            message.role === "assistant" ? styles.messageAssistant : styles.messageUser;

          return (
            <article className={`${styles.message} ${roleClass}`} key={message.id}>
              {message.role === "assistant" ? (
                <span className={styles.messageAvatar} aria-hidden="true">
                  <AvatarSprite size={34} src={avatarSrc} />
                </span>
              ) : null}

              <div className={styles.messageBubble}>{message.text}</div>
            </article>
          );
        })}

        <div ref={messageEndRef} />
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={HOLDOUMEN_COPY.inputPlaceholder}
          disabled={isStreaming}
        />
        <button
          className={styles.sendButton}
          type="submit"
          aria-label={HOLDOUMEN_COPY.sendLabel}
          disabled={isStreaming}
        >
          <Image
            className={styles.sendIcon}
            src={HOLDOUMEN_IMAGES.sendIcon}
            alt=""
            width={22}
            height={22}
          />
        </button>
      </form>
    </section>
  );
};

export default ChatScreen;
