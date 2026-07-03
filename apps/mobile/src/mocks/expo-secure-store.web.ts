/**
 * Web stub for expo-secure-store.
 * expo-secure-store is native-only. On web we fall back to localStorage.
 * This provides the same API surface so no code changes are needed.
 */

export async function getItemAsync(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
  } catch {
    // silently fail
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently fail
  }
}

// Alias used by some imports
export const getValueWithKeyAsync = getItemAsync;
export const setValueWithKeyAsync = setItemAsync;
export const deleteValueWithKeyAsync = deleteItemAsync;

const SecureStore = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  getValueWithKeyAsync,
  setValueWithKeyAsync,
  deleteValueWithKeyAsync,
};

export default SecureStore;
