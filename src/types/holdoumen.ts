export type AvatarFrame = {
  x: number;
  y: number;
  size: number;
};

export type Member = {
  id: string;
  rank: string;
  name: string;
  supportRgb: string;
  aliases: string[];
  catchphrases: string[];
  greeting: string;
  replies: string[];
  avatarFrame: AvatarFrame;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};
