import { streamText, convertToCoreMessages } from 'ai';
import { NextRequest } from 'next/server';
import { retrieveRelevantDocuments } from '@/lib/supabase/documents';
import { getSystemPrompt } from '@/lib/chat/personas';
import { resolveLlmModel } from '@/lib/chat/llm';
import { extractTextContent, publicErrorMessage, validateChatRequest } from '@/lib/chat/validate';

export const runtime = 'nodejs';
export const maxDuration = 60;

// TODO(rate-limit): Add per-IP or per-user rate limiting before scaling public traffic.
// Suggested: @upstash/ratelimit or Vercel KV — e.g. 20 requests/minute/IP, 200/day/user.
// Apply here before validateChatRequest; return 429 with Retry-After header.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateChatRequest(body);

    if (!validated.ok) {
      return new Response(JSON.stringify({ error: validated.error }), {
        status: validated.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, persona, customName } = validated.data;
    const { model, provider, label } = resolveLlmModel();

    let system = getSystemPrompt(persona, customName);

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content;
    const lastUserText = extractTextContent(lastUserMessage);

    if (lastUserText.trim()) {
      try {
        const relevantChunks = await retrieveRelevantDocuments(lastUserText, {
          limit: 4,
          philosopherSlug: persona,
          threshold: 0.04,
        });

        if (relevantChunks.length > 0) {
          const contextBlock = relevantChunks
            .map((chunk) => {
              const src = chunk.source ? ` — ${chunk.source}` : '';
              return `- "${chunk.content}"${src}`;
            })
            .join('\n');

          system = `${system}

RELEVANT PRIMARY SOURCE CONTEXT (use this to ground your answer):
${contextBlock}

Instructions: When your response aligns with or quotes the above passages, mention the source. If the retrieved context is not relevant, you may ignore it. Prioritize accuracy over completeness.`;
        }
      } catch (ragError) {
        console.warn('RAG retrieval failed, continuing without context:', ragError);
      }
    }

    const coreMessages = convertToCoreMessages(messages);

    const result = streamText({
      model,
      system,
      messages: coreMessages,
      temperature: 0.65,
      topP: 0.9,
      maxTokens: 1800,
    });

    return result.toDataStreamResponse({
      headers: {
        'X-LLM-Provider': provider,
        'X-LLM-Model': label,
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);

    const { message, status } = publicErrorMessage(error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}