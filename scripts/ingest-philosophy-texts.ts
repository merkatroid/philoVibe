/**
 * Basic RAG Ingest Script for PhiloVibe
 *
 * Ingests public domain (or short fair-use excerpts of) philosophical texts
 * into the `documents` table with simple embeddings.
 *
 * Usage:
 *   npm run db:ingest
 *
 * Prerequisites:
 *   1. Run the SQL in supabase/01_enable_pgvector.sql and supabase/02_documents_table.sql
 *   2. Have SUPABASE_SERVICE_ROLE_KEY set (for insert)
 */

import { createServiceClient } from '../lib/supabase/server';
import { getSimpleEmbedding } from '../lib/embeddings';
import type { Database } from '../lib/supabase/types';

const supabase = await createServiceClient();

// === Public domain / classic short excerpts ===
// These are well-known passages. For production you would pull full books
// from Project Gutenberg / Perseus / Wikisource and chunk them properly.

const rawDocuments: Array<{
  content: string;
  philosopher_slug: string;
  source: string;
}> = [
  // Socrates / Plato - Apology
  {
    philosopher_slug: 'socrates',
    source: 'Plato, Apology',
    content: `I say again that the greatest good for a man is to discuss virtue every day and the other things about which you hear me conversing and examining myself and others, for the unexamined life is not worth living for men.`,
  },
  {
    philosopher_slug: 'socrates',
    source: 'Plato, Apology',
    content: `I am that gadfly which the god has attached to the state, and all day long and in all places am always fastening upon you, arousing and persuading and reproaching you.`,
  },
  {
    philosopher_slug: 'socrates',
    source: 'Plato, Apology',
    content: `I know that I am wise in this one small respect: I do not think that I know what I do not know.`,
  },

  // Marcus Aurelius - Meditations
  {
    philosopher_slug: 'marcus-aurelius',
    source: 'Meditations, Book 2',
    content: `You have power over your mind - not outside events. Realize this, and you will find strength. Very little is needed to make a happy life; it is all within yourself, in your way of thinking.`,
  },
  {
    philosopher_slug: 'marcus-aurelius',
    source: 'Meditations',
    content: `The happiness of your life depends upon the quality of your thoughts: therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.`,
  },
  {
    philosopher_slug: 'marcus-aurelius',
    source: 'Meditations, Book 4',
    content: `Do not act as if you had ten thousand years to throw away. Death stands at your elbow. Be good for something while you live and it is in your power.`,
  },

  // Nietzsche
  {
    philosopher_slug: 'nietzsche',
    source: 'Thus Spoke Zarathustra',
    content: `Man is something that shall be overcome. What have you done to overcome him? All beings so far have created something beyond themselves; and do you want to be the ebb of this great flood and even go back to the beasts rather than overcome man?`,
  },
  {
    philosopher_slug: 'nietzsche',
    source: 'Beyond Good and Evil',
    content: `He who fights with monsters might take care lest he thereby become a monster. And if you gaze for long into an abyss, the abyss also gazes into you.`,
  },
  {
    philosopher_slug: 'nietzsche',
    source: 'The Gay Science',
    content: `God is dead. God remains dead. And we have killed him. How shall we comfort ourselves, the murderers of all murderers? What was holiest and mightiest of all that the world has yet owned has bled to death under our knives.`,
  },

  // Simone de Beauvoir (short representative excerpts - ideas from public discussion of her work)
  {
    philosopher_slug: 'simone-de-beauvoir',
    source: 'The Second Sex (core thesis)',
    content: `One is not born, but rather becomes, a woman. No biological, psychological, or economic fate determines the figure that the human female presents in society; it is civilization as a whole that produces this creature, intermediate between male and eunuch, which is described as feminine.`,
  },
  {
    philosopher_slug: 'simone-de-beauvoir',
    source: 'The Ethics of Ambiguity',
    content: `To will oneself free is also to will others free. This will is not an abstract formula; it must be realized in the singularity of each individual.`,
  },
];

// Simple chunker (by sentence or ~450 chars)
function chunkText(text: string, maxLength = 450): string[] {
  if (text.length <= maxLength) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += ' ' + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

async function main() {
  console.log('📚 Ingesting philosophy texts for basic RAG...');

  const rowsToInsert: any[] = [];

  for (const doc of rawDocuments) {
    const chunks = chunkText(doc.content);

    for (const chunk of chunks) {
      const embedding = getSimpleEmbedding(chunk);

      rowsToInsert.push({
        content: chunk,
        embedding,
        metadata: {
          philosopher: doc.philosopher_slug,
        },
        source: doc.source,
        philosopher_slug: doc.philosopher_slug,
      });
    }
  }

  console.log(`Prepared ${rowsToInsert.length} chunks for ingestion.`);

  // Clear previous ingest for these sources (optional - good for re-runs)
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .in('source', rawDocuments.map((d) => d.source));

  if (deleteError) {
    console.warn('Could not clear old documents (maybe first run):', deleteError.message);
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(rowsToInsert);

  if (error) {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully ingested ${rowsToInsert.length} document chunks.`);
  console.log('You can now ask questions in /chat and relevant passages should be retrieved.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
