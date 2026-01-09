// src/lib/storage-validation.ts
// Utilities for validating and sanitizing data from storage

export interface ComplaintData {
  id?: string;
  [key: string]: any;
}

export const validateComplaintData = (data: any): boolean => {
  // Minimal validation for complaint records
  if (!data || typeof data !== "object") return false;

  // Check if data has required structure
  if (typeof data !== "object" || Array.isArray(data)) return false;

  return true;
};

export const sanitizeComplaintsList = (complaints: any[]): ComplaintData[] => {
  if (!Array.isArray(complaints)) {
    console.warn("[Storage] Invalid complaints list:", typeof complaints);
    return [];
  }

  return complaints.filter((complaint) => {
    try {
      return validateComplaintData(complaint);
    } catch (e) {
      console.warn("[Storage] Invalid complaint:", e);
      return false;
    }
  });
};

export const validateStorageEntry = (_key: string, value: string): boolean => {
  // Check if entry looks corrupted
  if (!value || value === "undefined" || value === "null") {
    return false;
  }

  try {
    // Try to parse JSON if it looks like JSON
    if (value.startsWith("{") || value.startsWith("[")) {
      JSON.parse(value);
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const cleanCorruptedStorage = (): number => {
  let removed = 0;
  const keysToRemove: string[] = [];

  try {
    // Find corrupted entries
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key);
      if (!validateStorageEntry(key, value || "")) {
        keysToRemove.push(key);
      }
    }

    // Remove corrupted entries
    for (const key of keysToRemove) {
      try {
        localStorage.removeItem(key);
        removed++;
        console.log(`[Storage] Removed corrupted entry: ${key}`);
      } catch (e) {
        console.warn(`[Storage] Could not remove: ${key}`, e);
      }
    }
  } catch (e) {
    console.warn("[Storage] Error during cleanup:", e);
  }

  return removed;
};
