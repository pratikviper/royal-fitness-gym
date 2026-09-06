import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { calculateBmi } from "./bmi";

export interface UserProfileDetails {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  joiningDate: string; // YYYY-MM-DD
  membershipId: string; // RF-XXXXX
  photoURL?: string | null;
  role?: string;
  status?: string;
  address?: string;
  dob?: string;
  emergencyContact?: string;
  heightCm?: number;
  weightKg?: number;
  bmiScore?: number;
  gender?: string;
  age?: number;
}

export interface UserMembership {
  planId: string; // weight-training, weight-cardio, all-in-one
  planName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationMonths: number;
  pricePaid: number;
  status?: string;
}

export interface UserBmiDetails {
  weightKg: number;
  heightCm: number;
  calculatedAt: string; // YYYY-MM-DD
  bmiScore: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
}

const isBrowser = typeof window !== "undefined";

const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const getFutureDateStr = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
};

// Generates a random 5 digit membership ID
const generateMembershipId = () => {
  return `RF-${Math.floor(10000 + Math.random() * 90000)}`;
};

export function getDefaultProfile(
  uid: string, 
  email: string | null, 
  displayName: string | null,
  phoneNumber?: string | null
): UserProfileDetails {
  return {
    uid,
    fullName: displayName || "Elite Member",
    email: email || "",
    phoneNumber: phoneNumber || "",
    joiningDate: new Date().toISOString().split("T")[0],
    membershipId: generateMembershipId(),
    photoURL: null,
    role: "member",
    status: "Active",
  };
}

/** Get default membership details — returns a "no plan" sentinel when admin hasn't assigned one yet. */
export function getDefaultMembership(): UserMembership {
  return {
    planId: "none",
    planName: "No Plan Assigned",
    startDate: "",
    endDate: "",
    durationMonths: 0,
    pricePaid: 0,
  };
}

/** Get default BMI details — returns zero sentinels so the profile page shows the first-time setup form. */
export function getDefaultBmi(): UserBmiDetails {
  return {
    heightCm: 0,
    weightKg: 0,
    calculatedAt: "",
    bmiScore: 0,
    category: "Normal",
  };
}

/** 1. FETCH PROFILE DETAILS */
export async function getProfileDetails(
  uid: string,
  email: string | null = null,
  displayName: string | null = null,
  phoneNumber: string | null = null
): Promise<UserProfileDetails> {
  // If Firestore is available, try fetching
  if (db) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const existingData = docSnap.data() as UserProfileDetails;
        let needsUpdate = false;
        const updates: Partial<UserProfileDetails> = {};
        
        if (phoneNumber && (!existingData.phoneNumber || existingData.phoneNumber === "+91 98765 43210")) {
          updates.phoneNumber = phoneNumber;
          needsUpdate = true;
        }
        if (displayName && (existingData.fullName === "Elite Member" || !existingData.fullName)) {
          updates.fullName = displayName;
          needsUpdate = true;
        }
        if (email && (!existingData.email || existingData.email === "member@royalfitness.com")) {
          updates.email = email;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await setDoc(docRef, updates, { merge: true });
          return { ...existingData, ...updates };
        }
        return existingData;
      } else {
        // Document does not exist yet, seed in Firestore
        const defaultProfile = getDefaultProfile(uid, email, displayName, phoneNumber);
        await setDoc(docRef, defaultProfile);
        return defaultProfile;
      }
    } catch (e) {
      console.warn("Error reading profile from Firestore, using localStorage fallback:", e);
    }
  }

  // LocalStorage fallback
  if (isBrowser) {
    const cached = localStorage.getItem(`rf_profile_${uid}`);
    if (cached) {
      try {
        const existing = JSON.parse(cached) as UserProfileDetails;
        if (phoneNumber && !existing.phoneNumber) {
          existing.phoneNumber = phoneNumber;
          localStorage.setItem(`rf_profile_${uid}`, JSON.stringify(existing));
        }
        return existing;
      } catch {
        // Ignore JSON error
      }
    }
    // Seed new profile in localStorage
    const defaultProfile = getDefaultProfile(uid, email, displayName, phoneNumber);
    localStorage.setItem(`rf_profile_${uid}`, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  return getDefaultProfile(uid, email, displayName, phoneNumber);
}

/** 2. FETCH MEMBERSHIP DETAILS */
export async function getMembershipDetails(uid: string): Promise<UserMembership> {
  if (db) {
    try {
      const docRef = doc(db, "memberships", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserMembership;
      } else {
        const defaultMembership = getDefaultMembership();
        await setDoc(docRef, defaultMembership);
        return defaultMembership;
      }
    } catch (e) {
      console.warn("Error reading membership from Firestore, using localStorage fallback:", e);
    }
  }

  if (isBrowser) {
    const cached = localStorage.getItem(`rf_membership_${uid}`);
    if (cached) {
      try {
        return JSON.parse(cached) as UserMembership;
      } catch {
        // Ignore JSON error
      }
    }
    const defaultMembership = getDefaultMembership();
    localStorage.setItem(`rf_membership_${uid}`, JSON.stringify(defaultMembership));
    return defaultMembership;
  }

  return getDefaultMembership();
}

/** 3. FETCH BMI DETAILS */
export async function getBmiDetails(uid: string): Promise<UserBmiDetails> {
  if (db) {
    try {
      const docRef = doc(db, "bmi", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserBmiDetails;
      } else {
        const defaultBmi = getDefaultBmi();
        await setDoc(docRef, defaultBmi);
        return defaultBmi;
      }
    } catch (e) {
      console.warn("Error reading BMI from Firestore, using localStorage fallback:", e);
    }
  }

  if (isBrowser) {
    const cached = localStorage.getItem(`rf_bmi_${uid}`);
    if (cached) {
      try {
        return JSON.parse(cached) as UserBmiDetails;
      } catch {
        // Ignore JSON error
      }
    }
    const defaultBmi = getDefaultBmi();
    localStorage.setItem(`rf_bmi_${uid}`, JSON.stringify(defaultBmi));
    return defaultBmi;
  }

  return getDefaultBmi();
}

/** 4. UPDATE PROFILE DETAILS */
export async function updateProfileDetails(
  uid: string,
  fullName: string,
  phoneNumber: string,
  extras?: { age?: number; gender?: string; dob?: string }
): Promise<UserProfileDetails> {
  // Fetch first to get joiningDate, email, membershipId
  const current = await getProfileDetails(uid);
  const updated: UserProfileDetails = {
    ...current,
    fullName,
    phoneNumber,
    ...(extras?.age !== undefined && { age: extras.age }),
    ...(extras?.gender && { gender: extras.gender }),
    ...(extras?.dob && { dob: extras.dob }),
  };

  if (db) {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.error("Error writing profile to Firestore:", e);
    }
  }

  if (isBrowser) {
    localStorage.setItem(`rf_profile_${uid}`, JSON.stringify(updated));
    // Trigger custom storage event so other components (like navbar) know to refresh
    window.dispatchEvent(new Event("storage"));
  }

  return updated;
}

export async function updateBmiDetails(
  uid: string,
  heightCm: number,
  weightKg: number
): Promise<UserBmiDetails> {
  const result = calculateBmi(heightCm, weightKg);
  const todayStr = new Date().toISOString().split("T")[0];
  const updated: UserBmiDetails = {
    weightKg,
    heightCm,
    calculatedAt: todayStr,
    bmiScore: result.bmi,
    category: result.category,
  };

  if (db) {
    try {
      // 1. Write to bmi document
      const docRef = doc(db, "bmi", uid);
      await setDoc(docRef, updated);

      // 2. Also log entry to bmi_reports for historical progression
      const reportId = `${uid}_${Date.now()}`;
      await setDoc(doc(db, "bmi_reports", reportId), {
        uid,
        weightKg,
        heightCm,
        bmiScore: result.bmi,
        category: result.category,
        calculatedAt: todayStr,
      });

      // 3. Update user profile document
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        heightCm,
        weightKg,
        bmiScore: result.bmi
      }, { merge: true });
    } catch (e) {
      console.error("Error writing BMI to Firestore:", e);
    }
  }

  if (isBrowser) {
    localStorage.setItem(`rf_bmi_${uid}`, JSON.stringify(updated));

    // Update history array
    const historyJson = localStorage.getItem(`rf_bmi_history_${uid}`) || "[]";
    const history = JSON.parse(historyJson);
    history.push({
      uid,
      weightKg,
      heightCm,
      bmiScore: result.bmi,
      category: result.category,
      calculatedAt: todayStr,
    });
    localStorage.setItem(`rf_bmi_history_${uid}`, JSON.stringify(history));

    // Also update cached profile
    const cachedProfile = localStorage.getItem(`rf_profile_${uid}`);
    if (cachedProfile) {
      try {
        const prof = JSON.parse(cachedProfile);
        prof.heightCm = heightCm;
        prof.weightKg = weightKg;
        prof.bmiScore = result.bmi;
        localStorage.setItem(`rf_profile_${uid}`, JSON.stringify(prof));
      } catch {}
    }
  }

  return updated;
}

/** 6. RENEW MEMBERSHIP */
export async function renewMembershipPlan(
  uid: string,
  planId: string,
  planName: string,
  durationMonths: number,
  pricePaid: number,
  setExpiredState = false // Optional test helper
): Promise<UserMembership> {
  const startDate = new Date().toISOString().split("T")[0];
  
  let endDate: string;
  if (setExpiredState) {
    // End date is in the past for testing expired warning
    endDate = getPastDateStr(2);
  } else {
    const end = new Date();
    end.setMonth(end.getMonth() + durationMonths);
    endDate = end.toISOString().split("T")[0];
  }

  const updated: UserMembership = {
    planId,
    planName,
    startDate,
    endDate,
    durationMonths,
    pricePaid,
  };

  if (db) {
    try {
      const docRef = doc(db, "memberships", uid);
      await setDoc(docRef, updated);
    } catch (e) {
      console.error("Error writing membership to Firestore:", e);
    }
  }

  if (isBrowser) {
    localStorage.setItem(`rf_membership_${uid}`, JSON.stringify(updated));
  }

  return updated;
}

/** 7. UPLOAD PROFILE PHOTO */
export async function uploadUserProfilePhoto(
  uid: string,
  file: File,
  progressCallback?: (pct: number) => void
): Promise<string> {
  let photoURL = "";

  if (storage) {
    try {
      // Firebase Storage upload
      const fileExtension = file.name.split(".").pop() || "jpg";
      const storageRef = ref(storage, `users/${uid}/profile_${Date.now()}.${fileExtension}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      photoURL = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) progressCallback(Math.round(progress));
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } catch (e) {
      console.error("Firebase storage upload failed, falling back to mock upload:", e);
      photoURL = await uploadMockPhoto(file, progressCallback);
    }
  } else {
    // LocalStorage fallback mock upload
    photoURL = await uploadMockPhoto(file, progressCallback);
  }

  // Save the photoURL to user details
  const current = await getProfileDetails(uid);
  const updated: UserProfileDetails = {
    ...current,
    photoURL,
  };

  if (db) {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.error("Error updating profile photoURL in Firestore:", e);
    }
  }

  if (isBrowser) {
    localStorage.setItem(`rf_profile_${uid}`, JSON.stringify(updated));
    // Trigger custom storage event so other components (like navbar) know to refresh
    window.dispatchEvent(new Event("storage"));
  }

  return photoURL;
}

/** Simulated upload for LocalStorage base64 photo */
async function uploadMockPhoto(
  file: File,
  progressCallback?: (pct: number) => void
): Promise<string> {
  // Simulate progress bar over 800ms
  await new Promise<void>((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progressCallback) progressCallback(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 120);
  });

  // Read file as Base64 Data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as base64 string"));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error("FileReader error"));
    };
    reader.readAsDataURL(file);
  });
}

/** 8. DELETE PROFILE PHOTO */
export async function deleteUserProfilePhoto(uid: string): Promise<void> {
  const current = await getProfileDetails(uid);
  const oldPhotoURL = current.photoURL;

  const updated: UserProfileDetails = {
    ...current,
    photoURL: null,
  };

  // 1. Update Firestore if configured
  if (db) {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.error("Error clearing photoURL in Firestore:", e);
    }
  }

  // 2. Delete from Firebase Storage if it's a cloud storage URL
  if (storage && oldPhotoURL && oldPhotoURL.startsWith("http")) {
    try {
      const fileRef = ref(storage, oldPhotoURL);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn("Could not delete file from Firebase Storage (might have been deleted already):", e);
    }
  }

  // 3. Update local storage
  if (isBrowser) {
    localStorage.setItem(`rf_profile_${uid}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }
}
