import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';
import { MediaBookmark } from '../types';

const BOOKMARKS_COLLECTION = 'bookmarks';
const CATEGORIES_COLLECTION = 'userCategories';

// Subscribe to real-time updates for all bookmarks
export function subscribeToBookmarks(
  onUpdate: (bookmarks: MediaBookmark[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, BOOKMARKS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaBookmark[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          platform: data.platform || 'youtube',
          url: data.url || '',
          embedId: data.embedId || '',
          title: data.title || '',
          comment: data.comment || '',
          category: data.category || '기타',
          tags: data.tags || [],
          startTime: Number(data.startTime) || 0,
          endTime: data.endTime != null ? Number(data.endTime) : null,
          createdAt: Number(data.createdAt) || Date.now(),
          isFavorite: Boolean(data.isFavorite),
          hasVideo: data.hasVideo !== undefined ? Boolean(data.hasVideo) : true,
          author: data.author || '',
          authorAvatarUrl: data.authorAvatarUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
        };
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Error fetching bookmarks from Firestore:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, BOOKMARKS_COLLECTION);
    }
  );
}

// Save or update a single bookmark in Firestore
export async function saveBookmarkToFirestore(bookmark: MediaBookmark): Promise<void> {
  const currentUid = auth.currentUser?.uid || 'guest';

  const docPath = `${BOOKMARKS_COLLECTION}/${bookmark.id}`;
  try {
    const docRef = doc(db, BOOKMARKS_COLLECTION, bookmark.id);
    const dataToSave = {
      ...bookmark,
      userId: currentUid,
    };
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Save bulk bookmarks to Firestore (e.g. initial seed or sync)
export async function seedBookmarksToFirestore(bookmarks: MediaBookmark[]): Promise<void> {
  const currentUid = auth.currentUser?.uid || 'guest';

  for (const bookmark of bookmarks) {
    try {
      const docRef = doc(db, BOOKMARKS_COLLECTION, bookmark.id);
      await setDoc(docRef, { ...bookmark, userId: currentUid }, { merge: true });
    } catch (error) {
      console.warn('Failed to seed bookmark:', bookmark.id, error);
    }
  }
}

// Delete a bookmark from Firestore
export async function deleteBookmarkFromFirestore(id: string): Promise<void> {
  const docPath = `${BOOKMARKS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, BOOKMARKS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Subscribe to custom categories in Firestore
export function subscribeToCategories(
  userId: string,
  onUpdate: (categories: string[]) => void
) {
  const docPath = `${CATEGORIES_COLLECTION}/${userId}`;
  const docRef = doc(db, CATEGORIES_COLLECTION, userId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.categories)) {
          onUpdate(data.categories);
        }
      }
    },
    (error) => {
      console.error('Error fetching user categories:', error);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
}

// Save custom categories in Firestore
export async function saveCategoriesToFirestore(
  userId: string,
  categories: string[]
): Promise<void> {
  const docPath = `${CATEGORIES_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, userId);
    await setDoc(docRef, {
      categories,
      updatedAt: Date.now(),
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
