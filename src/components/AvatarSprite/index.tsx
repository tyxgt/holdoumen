import Image from "next/image";
import type { CSSProperties } from "react";

import { HOLDOUMEN_IMAGES } from "@/data/holdoumen/images";
import type { AvatarFrame } from "@/types/holdoumen";

import styles from "./AvatarSprite.module.scss";

const SHEET_WIDTH = 1070;
const SHEET_HEIGHT = 1480;

type AvatarSpriteProps = {
  frame: AvatarFrame;
  size: number;
};

export function AvatarSprite({ frame, size }: AvatarSpriteProps) {
  const scale = size / frame.size;
  const width = Math.ceil(SHEET_WIDTH * scale);
  const height = Math.ceil(SHEET_HEIGHT * scale);
  const imageStyle: CSSProperties = {
    transform: `translate(${-frame.x * scale}px, ${-frame.y * scale}px)`,
  };

  return (
    <span
      className={styles.sprite}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <Image
        unoptimized
        className={styles.image}
        src={HOLDOUMEN_IMAGES.avatarSheet}
        alt=""
        width={width}
        height={height}
        style={imageStyle}
      />
    </span>
  );
}
