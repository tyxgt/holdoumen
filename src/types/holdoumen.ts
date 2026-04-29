export type Member = {
  id: string;
  rank: string;
  name: string;
  supportRgb: string;
  aliases: string[];
  catchphrases: string[];
  greeting: string;
  replies: string[];
  avatarImage?: string;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};
