import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { KnowledgeBaseEntry } from '../lib/types';

const COLLECTION = 'knowledge_base';

function docToEntry(docSnap: any): KnowledgeBaseEntry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    category: data.category ?? '',
    content: data.content ?? '',
    source: data.source ?? '',
    is_active: data.is_active ?? true,
    created_at: data.created_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    updated_at: data.updated_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function useKnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map(docToEntry));
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (entry: {
    title: string;
    category: string;
    content: string;
    source: string;
  }) => {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...entry,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const newEntry: KnowledgeBaseEntry = {
      id: docRef.id,
      ...entry,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const updateEntry = useCallback(async (
    id: string,
    updates: Partial<Pick<KnowledgeBaseEntry, 'title' | 'category' | 'content' | 'source' | 'is_active'>>
  ) => {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { ...updates, updated_at: serverTimestamp() });

    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
    ));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh: fetchEntries,
  };
}
