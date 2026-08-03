import { openDB } from 'idb';

const DB_NAME = 'collaborative_whiteboard_db';
const STORE_NAME = 'offline_ops';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveOfflineOp = async (op: { boardId: string; opType: string; element: any; timestamp: number }) => {
  const db = await initDB();
  await db.add(STORE_NAME, op);
};

export const getOfflineOps = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const clearOfflineOps = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
