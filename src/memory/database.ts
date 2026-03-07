import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config.js';

let db: FirebaseFirestore.Firestore;

export const initializeFirestore = () => {
  if (!db) {
    db = getFirestore();
  }
};

export interface MessageRow {
  id?: string;
  user_id: number;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: string | null;
  tool_call_id?: string | null;
  created_at?: Date;
}

export const dbAddUser = async (userId: number, username?: string, firstName?: string, lastName?: string) => {
  if (!db) initializeFirestore();
  const userRef = db.collection('users').doc(userId.toString());
  const doc = await userRef.get();
  if (!doc.exists) {
    await userRef.set({
      username: username || null,
      first_name: firstName || null,
      last_name: lastName || null,
      created_at: new Date()
    });
  }
};

export const dbAddMessage = async (msg: MessageRow) => {
  if (!db) initializeFirestore();
  const messagesRef = db.collection('messages');
  await messagesRef.add({
    user_id: msg.user_id,
    role: msg.role,
    content: msg.content,
    tool_calls: msg.tool_calls || null,
    tool_call_id: msg.tool_call_id || null,
    created_at: new Date()
  });
};

export const dbGetMessages = async (userId: number, limit: number = 50): Promise<MessageRow[]> => {
  if (!db) initializeFirestore();
  const messagesRef = db.collection('messages');
  const snapshot = await messagesRef
    .where('user_id', '==', userId)
    .orderBy('created_at', 'asc')
    .limitToLast(limit)
    .get();

  const messages: MessageRow[] = [];
  snapshot.forEach(doc => {
    messages.push({
      id: doc.id,
      ...doc.data()
    } as MessageRow);
  });
  return messages;
};
