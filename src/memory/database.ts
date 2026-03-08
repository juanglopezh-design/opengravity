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

export interface RemoteCommand {
  id?: string;
  command: string;
  args?: any;
  status: 'pending' | 'completed' | 'failed';
  result?: string;
  created_at: Date;
  updated_at?: Date;
}

export const dbAddRemoteCommand = async (command: string, args: any = {}): Promise<string> => {
  if (!db) initializeFirestore();
  const commandsRef = db.collection('remote_commands');
  const docRef = await commandsRef.add({
    command,
    args,
    status: 'pending',
    created_at: new Date()
  });
  return docRef.id;
};

export const dbGetPendingCommands = async (): Promise<RemoteCommand[]> => {
  if (!db) initializeFirestore();
  const snapshot = await db.collection('remote_commands')
    .where('status', '==', 'pending')
    .get();

  const commands: RemoteCommand[] = [];
  snapshot.forEach(doc => {
    commands.push({ id: doc.id, ...doc.data() } as RemoteCommand);
  });
  
  // Sort in-memory to avoid Firestore Index requirement
  return commands.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
};

export const dbUpdateCommandResult = async (commandId: string, status: 'completed' | 'failed', result: string) => {
  if (!db) initializeFirestore();
  await db.collection('remote_commands').doc(commandId).update({
    status,
    result,
    updated_at: new Date()
  });
};
