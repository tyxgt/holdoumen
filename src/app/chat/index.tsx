import React from "react";
import styles from "./Chat.module.scss";
import { HOLDOUMEN_IMAGES } from "@/data/holdoumen/images";
import { AvatarSprite } from "@/components/AvatarSprite";
import { HOLDOUMEN_COPY } from "@/data/holdoumen/copy";
import type { Member } from "@/types/holdoumen";
import Image from "next/image";
interface ChatScreenProps {
  selectedMember: Pick<Member, "id" | "name" | "rank" | "avatarFrame">;
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
  return (
    <section className={`${styles.screen} ${styles.chatScreen}`}>
      <header className={styles.chatHeader}>
        <div className={styles.chatMember}>
          <span className={styles.chatAvatar} aria-hidden="true">
            <AvatarSprite frame={selectedMember.avatarFrame} size={48} />
          </span>
          <div>
            <span className={styles.eyebrow}>{selectedMember.rank}</span>
            <h2 className={styles.name}>{selectedMember.name}</h2>
          </div>
        </div>

        <button className={styles.switchButton} type="button" onClick={handleSwitchRole}>
          {HOLDOUMEN_COPY.switchRoleLabel}
        </button>
      </header>

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
                  <AvatarSprite frame={selectedMember.avatarFrame} size={34} />
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
