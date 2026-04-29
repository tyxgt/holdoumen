import type { CSSProperties } from "react";

import { HOLDOUMEN_IMAGES } from "@/data/holdoumen/images";
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
  const handleClick = () => {
    onSelect(member);
  };
  const avatarSrc =
    HOLDOUMEN_IMAGES.memberAvatars[member.id as keyof typeof HOLDOUMEN_IMAGES.memberAvatars];

  return (
    <button
      className={styles.card}
      style={cardStyle}
      type="button"
      onClick={handleClick}
      onTouchStart={handleClick}
      tabIndex={0}
      aria-label={`选择${member.name}`}
    >
      <span className={styles.avatar} aria-hidden="true">
        <AvatarSprite size={62} src={avatarSrc} />
      </span>

      <span className={styles.content}>
        <span className={styles.rank}>{member.rank}</span>
        <strong className={styles.name}>{member.name}</strong>
        <span className={styles.quote}>&quot;{member.catchphrases[0]}&quot;</span>
      </span>
    </button>
  );
}
