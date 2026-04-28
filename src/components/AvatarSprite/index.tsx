import Image from "next/image";

import type { AvatarFrame } from "@/types/holdoumen";

import styles from "./AvatarSprite.module.scss";

type AvatarSpriteProps = {
  frame?: AvatarFrame;
  size: number;
  src: string;
};

export function AvatarSprite({ size, src }: AvatarSpriteProps) {
  return (
    <span
      className={styles.sprite}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <Image
        unoptimized
        className={styles.image}
        src={src}
        alt=""
        width={size}
        height={size}
      />
    </span>
  );
}
