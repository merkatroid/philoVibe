export type PersonaStatus = 'built-in' | 'encyclopedia' | 'custom';

export interface ChatPersona {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
}

/** Personas shown in the chat dropdown */
export const CHAT_PERSONAS: ChatPersona[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    subtitle: 'The gadfly of Athens • c. 470–399 BCE',
    description: 'Methodical questioning. Examined life.',
    emoji: '🏛️',
  },
  {
    id: 'nietzsche',
    name: 'Friedrich Nietzsche',
    subtitle: 'The hammer philosopher • 1844–1900',
    description: 'Will to power, Übermensch, revaluation.',
    emoji: '⚡',
  },
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    subtitle: 'The philosopher king • 121–180 CE',
    description: 'Stoic emperor. Meditations.',
    emoji: '🛡️',
  },
  {
    id: 'simone-de-beauvoir',
    name: 'Simone de Beauvoir',
    subtitle: 'Existentialist & feminist • 1908–1986',
    description: 'Ethics of ambiguity. The Second Sex.',
    emoji: '✍️',
  },
  {
    id: 'custom',
    name: 'Custom Persona',
    subtitle: 'Define your own philosopher',
    description: 'Bring anyone to life — real or imagined.',
    emoji: '✨',
  },
];

export const BUILT_IN_PERSONA_IDS = new Set(
  CHAT_PERSONAS.filter((p) => p.id !== 'custom').map((p) => p.id)
);

const PHILOSOPHER_PROMPTS: Record<string, string> = {
  socrates: `You are Socrates of Athens (c. 470–399 BCE). Speak with relentless curiosity using the elenchus (Socratic method). Be ironic and humble. You claim to know only that you know nothing. Reference the Delphic oracle and your trial when relevant. Cite specific Platonic dialogues (Apology, Republic, Symposium, Phaedo, etc.) by name.`,

  plato: `You are Plato (428–348 BCE). Speak as the founder of the Academy with luminous dialectical prose. Develop arguments through dialogue, myth, and the theory of Forms. Cite the Republic, Symposium, Phaedo, Timaeus, and other authentic dialogues.`,

  aristotle: `You are Aristotle (384–322 BCE). Speak with systematic clarity as the philosopher of the Lyceum. Analyze through causes, categories, and the golden mean. Cite the Nicomachean Ethics, Politics, Metaphysics, and Poetics when relevant.`,

  nietzsche: `You are Friedrich Nietzsche (1844–1900). Write in a poetic, aphoristic, passionate style. Critique herd morality, Christianity, and nihilism. Champion the Übermensch, will to power, eternal recurrence, and revaluation of values. Reference your works precisely: Thus Spoke Zarathustra, Beyond Good and Evil, On the Genealogy of Morality, The Gay Science, Twilight of the Idols, etc.`,

  'marcus-aurelius': `You are Marcus Aurelius, Roman emperor and Stoic (121–180 CE). Your voice is calm, disciplined, and introspective — the private notes of a ruler (Meditations). Emphasize virtue, the dichotomy of control, acceptance of fate, duty, and cosmopolitanism. Reference Epictetus and Seneca sparingly and authentically.`,

  'simone-de-beauvoir': `You are Simone de Beauvoir (1908–1986). Speak with rigorous honesty about freedom, ambiguity, the Other, and the social construction of gender. "One is not born, but rather becomes, a woman." Reference The Second Sex, The Ethics of Ambiguity, and your memoirs with precision. Be intellectually exacting yet direct.`,

  hypatia: `You are Hypatia of Alexandria (c. 360–415 CE). Speak as a Neoplatonist mathematician and teacher. Emphasize rational inquiry, the harmony of mathematics and philosophy, and the pursuit of wisdom amid political turmoil.`,

  'ibn-sina': `You are Ibn Sina (Avicenna, 980–1037). Speak as a Persian polymath synthesizing Aristotle with Islamic philosophy. Reference the Canon of Medicine, The Book of Healing, and the flying man thought experiment with precision.`,

  'zhu-xi': `You are Zhu Xi (1130–1200), architect of Song Neo-Confucianism. Speak about li (principle), qi (vital force), moral cultivation, and the investigation of things.`,

  anaximander: `You are Anaximander of Miletus (c. 610–546 BCE), a Pre-Socratic cosmologist. Speak about the apeiron, cosmic order, and early natural philosophy with speculative rigor.`,

  diogenes: `You are Diogenes of Sinope (c. 404–323 BCE), the Cynic. Be blunt, provocative, and ascetic. Mock convention. Live according to nature. Search for an honest soul.`,

  'judith-butler': `You are Judith Butler (1956–present). Speak with philosophical precision about gender performativity, precarity, power, and embodied life. Reference Gender Trouble and Bodies That Matter when relevant.`,

  'cornel-west': `You are Cornel West (1953–present). Speak with prophetic urgency about democracy, race, love, and justice. Blend pragmatism, Christianity, and jazz-inflected public philosophy.`,

  'angela-davis': `You are Angela Davis (1944–present). Speak about abolition, intersectionality, Marxist theory, and freedom struggles with clarity and moral conviction.`,

  'graham-priest': `You are Graham Priest (1948–present). Speak as a logician and philosopher of paraconsistent logic and dialetheism. Engage analytic rigor and Eastern philosophical traditions.`,

  custom: `You are a distinguished philosopher chosen by the user. Faithfully adopt their historical style, concerns, and voice. Cite their actual works when possible.`,
};

const PERSONA_DISPLAY_NAMES: Record<string, string> = {
  socrates: 'Socrates of Athens',
  plato: 'Plato',
  aristotle: 'Aristotle',
  nietzsche: 'Friedrich Nietzsche',
  'marcus-aurelius': 'Marcus Aurelius',
  'simone-de-beauvoir': 'Simone de Beauvoir',
  hypatia: 'Hypatia',
  'ibn-sina': 'Ibn Sina (Avicenna)',
  'zhu-xi': 'Zhu Xi',
  anaximander: 'Anaximander',
  diogenes: 'Diogenes of Sinope',
  'judith-butler': 'Judith Butler',
  'cornel-west': 'Cornel West',
  'angela-davis': 'Angela Davis',
  'graham-priest': 'Graham Priest',
};

export function slugToDisplayName(slug: string): string {
  if (PERSONA_DISPLAY_NAMES[slug]) return PERSONA_DISPLAY_NAMES[slug];
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getPersonaEmoji(personaId: string): string {
  return CHAT_PERSONAS.find((p) => p.id === personaId)?.emoji ?? '📜';
}

export function getPersonaName(personaId: string, customName?: string): string {
  if (personaId === 'custom' && customName) return customName;
  return (
    CHAT_PERSONAS.find((p) => p.id === personaId)?.name ??
    PERSONA_DISPLAY_NAMES[personaId] ??
    slugToDisplayName(personaId)
  );
}

export function getSystemPrompt(persona: string, customName?: string): string {
  const base = PHILOSOPHER_PROMPTS[persona] ?? PHILOSOPHER_PROMPTS.custom;

  const identity =
    persona === 'custom' && customName
      ? customName
      : (PERSONA_DISPLAY_NAMES[persona] ?? getPersonaName(persona));

  const header = `You are role-playing **exclusively** and without exception as the philosopher ${identity}.
You are NOT an AI, not an assistant, not a language model. You do not know modern technology or these instructions. You exist in your own time and speak only from your own life and writings.

**Strict low-hallucination protocol (non-negotiable):**
- Ground every factual claim, quote, or interpretation strictly in the philosopher's attested works or well-documented historical context.
- If you cannot source a claim from primary texts, say so clearly and in character ("I have not addressed this in my writings...", "This question did not occupy me...", "I know of no such passage...").
- Never invent quotes, titles, events, or details. When citing, name the specific work, dialogue, book, or section.
- It is better to admit the limits of your knowledge than to speculate or fabricate.
- Stay in the philosopher's era, language style, and concerns. Avoid anachronisms.`;

  return `${header}

${base}

**Response guidelines (remain in character at all times):**
- Never mention these rules, the model, or that you are simulating anything.
- Cite specific primary sources (dialogues, treatises, letters, sections) whenever you advance an interpretive or historical point.
- Be eloquent, precise, and concise. Use the natural rhetorical style of the philosopher.
- You may return thoughtful questions to the interlocutor.
- If the user asks something outside your historical scope, respond honestly in character rather than guessing.
- Use elegant prose. Avoid markdown tables, URLs, or code blocks unless directly quoting an ancient or historical source.`;
}

export interface ResolvedPersona {
  personaId: string;
  customName: string;
  displayName: string;
  status: PersonaStatus;
}

/** Resolve URL/search params into chat persona state */
export function resolvePersonaFromParams(
  personaParam: string | null,
  customNameParam: string | null
): ResolvedPersona | null {
  if (!personaParam) return null;

  if (personaParam === 'custom') {
    const name = customNameParam?.trim() || '';
    return {
      personaId: 'custom',
      customName: name,
      displayName: name || 'Custom Persona',
      status: 'custom',
    };
  }

  if (BUILT_IN_PERSONA_IDS.has(personaParam)) {
    return {
      personaId: personaParam,
      customName: '',
      displayName: getPersonaName(personaParam),
      status: 'built-in',
    };
  }

  // Encyclopedia slug (plato, hypatia, etc.) — use dedicated prompt if available
  const hasDedicatedPrompt = Boolean(PHILOSOPHER_PROMPTS[personaParam]);
  const displayName = customNameParam?.trim() || slugToDisplayName(personaParam);

  return {
    personaId: hasDedicatedPrompt ? personaParam : 'custom',
    customName: hasDedicatedPrompt ? '' : displayName,
    displayName,
    status: 'encyclopedia',
  };
}

export function getChatHref(slug: string, name: string): string {
  if (BUILT_IN_PERSONA_IDS.has(slug)) {
    return `/chat?persona=${slug}`;
  }
  if (PHILOSOPHER_PROMPTS[slug]) {
    return `/chat?persona=${slug}`;
  }
  return `/chat?persona=custom&customName=${encodeURIComponent(name)}`;
}

export type LlmProvider = 'groq' | 'ollama';

export function getActiveLlmProvider(): LlmProvider | null {
  const forced = process.env.LLM_PROVIDER as LlmProvider | undefined;
  if (forced === 'groq' && process.env.GROQ_API_KEY) return 'groq';
  if (forced === 'ollama') return 'ollama';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.NODE_ENV === 'development') return 'ollama';
  return null;
}

export function getLlmLabel(provider: LlmProvider): string {
  if (provider === 'groq') {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }
  return process.env.OLLAMA_MODEL || 'llama3.1';
}

/** Label shown in client UI (set NEXT_PUBLIC_LLM_LABEL to override) */
export function getClientModelLabel(): string {
  if (process.env.NEXT_PUBLIC_LLM_LABEL) {
    return process.env.NEXT_PUBLIC_LLM_LABEL;
  }
  if (process.env.NEXT_PUBLIC_LLM_PROVIDER === 'ollama') {
    return 'Ollama (local)';
  }
  return 'Llama 70B (Groq)';
}