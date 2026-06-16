import type { Message } from 'ai';

const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_CUSTOM_NAME_LENGTH = 120;
const MAX_PERSONA_LENGTH = 64;
const PERSONA_PATTERN = /^[a-z0-9-]+$/;

export interface ChatRequestBody {
  messages: Omit<Message, 'id'>[];
  persona?: string;
  customName?: string;
}

export function validateChatRequest(body: unknown):
  | { ok: true; data: { messages: Omit<Message, 'id'>[]; persona: string; customName?: string } }
  | { ok: false; error: string; status: number } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body.', status: 400 };
  }

  const { messages, persona = 'socrates', customName } = body as ChatRequestBody;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: 'Messages array is required.', status: 400 };
  }

  if (messages.length > MAX_MESSAGES) {
    return { ok: false, error: 'Too many messages in conversation.', status: 400 };
  }

  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      return { ok: false, error: 'Invalid message format.', status: 400 };
    }
    const content = message.content;
    if (typeof content === 'string' && content.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, error: 'Message exceeds maximum length.', status: 400 };
    }
    if (Array.isArray(content)) {
      const text = content
        .filter((part) => part && typeof part === 'object' && 'text' in part)
        .map((part) => String((part as { text: unknown }).text))
        .join('');
      if (text.length > MAX_MESSAGE_LENGTH) {
        return { ok: false, error: 'Message exceeds maximum length.', status: 400 };
      }
    }
  }

  if (typeof persona !== 'string' || persona.length === 0 || persona.length > MAX_PERSONA_LENGTH) {
    return { ok: false, error: 'Invalid persona.', status: 400 };
  }

  if (!PERSONA_PATTERN.test(persona)) {
    return { ok: false, error: 'Invalid persona identifier.', status: 400 };
  }

  let sanitizedCustomName: string | undefined;
  if (customName !== undefined && customName !== null && customName !== '') {
    if (typeof customName !== 'string' || customName.length > MAX_CUSTOM_NAME_LENGTH) {
      return { ok: false, error: 'Invalid custom persona name.', status: 400 };
    }
    sanitizedCustomName = customName.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }

  return {
    ok: true,
    data: {
      messages,
      persona,
      customName: sanitizedCustomName,
    },
  };
}

export function extractTextContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(
        (part): part is { text: string } =>
          typeof part === 'object' &&
          part !== null &&
          'text' in part &&
          typeof (part as { text: unknown }).text === 'string'
      )
      .map((part) => part.text)
      .join('');
  }
  return '';
}

export function publicErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    const msg = error.message;

    if (
      msg.includes('No LLM configured') ||
      msg.includes('GROQ_API_KEY') ||
      msg.includes('not configured') ||
      msg.includes('not available')
    ) {
      return { message: 'Chat service is temporarily unavailable.', status: 503 };
    }

    // Dev-only detail for local debugging
    if (process.env.NODE_ENV === 'development') {
      return { message: msg, status: 500 };
    }
  }

  return { message: 'Unable to generate a response. Please try again.', status: 500 };
}