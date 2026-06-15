import { vi } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  auth: {},
  firestore: {},
}));

vi.mock('@/lib/use-firebase-auth', () => ({
  useFirebaseAuth: () => ({ user: null, loading: false }),
}));
