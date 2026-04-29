import Image from "next/image";

import styles from "./AvatarSprite.module.scss";

type AvatarSpriteProps = {
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
