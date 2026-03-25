import api from "./api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/";
const CHAT_PATH = "/api/v1/chat";

type ChatResponse = {
  answer?: string;
  [key: string]: unknown;
};

type SendMessageStreamOptions = {
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
};

function resolveRequestUrl(path: string) {
  return new URL(path, BASE_URL).toString();
}

function extractTextFromArray(values: unknown[]) {
  return values
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }
      if (!value || typeof value !== "object") {
        return "";
      }
      const textValue = (value as { text?: unknown }).text;
      return typeof textValue === "string" ? textValue : "";
    })
    .join("");
}

function extractText(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;

  const candidates = [
    record.answer,
    record.content,
    record.text,
    record.delta,
    record.token,
    record.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      return candidate;
    }
    if (Array.isArray(candidate)) {
      const joinedText = extractTextFromArray(candidate);
      if (joinedText) {
        return joinedText;
      }
    }
    if (candidate && typeof candidate === "object") {
      const nestedText = extractText(candidate);
      if (nestedText) {
        return nestedText;
      }
    }
  }

  const choices = record.choices;
  if (Array.isArray(choices)) {
    for (const choice of choices) {
      const parsedChoiceText = extractText(choice);
      if (parsedChoiceText) {
        return parsedChoiceText;
      }
    }
  }

  return "";
}

function parseSSEEvent(rawEvent: string) {
  const payload = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();

  if (!payload || payload === "[DONE]") {
    return "";
  }

  try {
    const parsedPayload = JSON.parse(payload);
    const parsedText = extractText(parsedPayload);
    return parsedText || (typeof parsedPayload === "string" ? parsedPayload : "");
  } catch {
    return payload;
  }
}

function consumeSSEBuffer(buffer: string, onChunk: (chunk: string) => void) {
  let remaining = buffer;

  while (true) {
    const delimiterIndex = remaining.indexOf("\n\n");
    if (delimiterIndex === -1) {
      break;
    }

    const rawEvent = remaining.slice(0, delimiterIndex).trim();
    remaining = remaining.slice(delimiterIndex + 2);
    if (!rawEvent) {
      continue;
    }

    const parsedChunk = parseSSEEvent(rawEvent);
    if (parsedChunk) {
      onChunk(parsedChunk);
    }
  }

  return remaining;
}

export const sendMessage = async (content: string) => {
  return api.post<ChatResponse>(CHAT_PATH, { content });
};

export const sendMessageStream = async (
  content: string,
  options: SendMessageStreamOptions
): Promise<ChatResponse> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "text/event-stream, application/json, text/plain",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveRequestUrl(CHAT_PATH), {
    method: "POST",
    headers,
    body: JSON.stringify({ content, stream: true }),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!response.body || contentType.includes("application/json")) {
    const payload = (await response.json()) as ChatResponse;
    const text = extractText(payload);
    if (text) {
      options.onChunk(text);
    }
    return payload;
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let aggregatedText = "";
  let sseBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }

    const chunkText = decoder.decode(value, { stream: true });
    if (!chunkText) {
      continue;
    }

    if (contentType.includes("text/event-stream")) {
      sseBuffer += chunkText.replace(/\r\n/g, "\n");
      sseBuffer = consumeSSEBuffer(sseBuffer, (parsedChunk) => {
        aggregatedText += parsedChunk;
        options.onChunk(parsedChunk);
      });
      continue;
    }

    aggregatedText += chunkText;
    options.onChunk(chunkText);
  }

  const remainingText = decoder.decode();
  if (remainingText) {
    if (contentType.includes("text/event-stream")) {
      sseBuffer += remainingText.replace(/\r\n/g, "\n");
    } else {
      aggregatedText += remainingText;
      options.onChunk(remainingText);
    }
  }

  if (contentType.includes("text/event-stream") && sseBuffer.trim()) {
    const parsedChunk = parseSSEEvent(sseBuffer.trim());
    if (parsedChunk) {
      aggregatedText += parsedChunk;
      options.onChunk(parsedChunk);
    }
  }

  return { answer: aggregatedText };
};
