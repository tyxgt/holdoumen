import type { CSSProperties } from "react";

import type { Member } from "@/types/holdoumen";

import { AvatarSprite } from "../AvatarSprite";
import styles from "./MemberCard.module.scss";

type MemberCardProps = {
  member: Member;
  onSelect: (member: Member) => void;
};

type CardStyle = CSSProperties & {
  "--member-rgb": string;
};

export function MemberCard({ member, onSelect }: MemberCardProps) {
  const cardStyle: CardStyle = {
    "--member-rgb": member.supportRgb,
  };

  return (
    <button className={styles.card} style={cardStyle} type="button" onClick={() => onSelect(member)}>
      <span className={styles.avatar} aria-hidden="true">
        <AvatarSprite frame={member.avatarFrame} size={62} />
      </span>

      <span className={styles.content}>
        <span className={styles.rank}>{member.rank}</span>
        <strong className={styles.name}>{member.name}</strong>
        <span className={styles.quote}>“{member.catchphrases[0]}”</span>
      </span>
    </button>
  );
}
