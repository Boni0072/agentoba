import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { KnowledgeBaseEntry } from './types';

export async function fetchKnowledgeContext(): Promise<string> {
  try {
    const q = query(
      collection(db, 'knowledge_base'),
      where('is_active', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return '';

    const entries = snapshot.docs.map(doc => ({
      title: doc.data().title as string,
      category: doc.data().category as string,
      content: doc.data().content as string,
      source: doc.data().source as string,
    }));

    // Ordenação manual para evitar a necessidade de índices compostos no Firestore
    entries.sort((a, b) => (a.category || '').localeCompare(b.category || ''));

    const grouped: Record<string, typeof entries> = {};
    for (const entry of entries) {
      const cat = entry.category || 'Geral';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(entry);
    }

    let context = '\n\n---\n**IMPORTANTE: BASE DE CONHECIMENTO INTERNA (PRIORIDADE MÁXIMA):**\nUtilize as informações abaixo como fonte principal de verdade. Se houver políticas internas aqui, elas prevalecem sobre as normas gerais.\n\n';

    for (const [category, items] of Object.entries(grouped)) {
      context += `### ${category}\n\n`;
      for (const item of items) {
        context += `**${item.title}**`;
        if (item.source) context += ` (Fonte: ${item.source})`;
        context += `\n${item.content}\n\n`;
      }
    }

    return context;
  } catch (error) {
    console.error("Erro ao carregar base de conhecimento:", error);
    return '';
  }
}
