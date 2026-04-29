export const VALID_CHARACTERS = [
  "蒋敦豪",
  "鹭卓",
  "李耕耘",
  "李昊",
  "赵一博",
  "卓沅",
  "赵小童",
  "何浩楠",
  "陈少熙",
  "王一珩",
] as const;

export type CharacterName = (typeof VALID_CHARACTERS)[number];

export type Member = {
  id: string;
  rank: string;
  name: CharacterName;
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

export type ChatRequest = {
  message: string;
  character: CharacterName;
  stream?: boolean;
};

export type ChatResponse = {
  answer: string;
  model: string;
  provider: string;
};
