
import { db, storage } from "./firebase";
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { VideoDocument } from "../types";

// 1. User Management
export const ensureUserExists = async (user: { uid: string; email: string | null }) => {
  if (!user.email) return;
  const userRef = doc(db, "User", user.uid);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
  }
};

// 2. Video Lifecycle
export const initVideoGeneration = async (uid: string, title: string, duration: string): Promise<string> => {
  const videosRef = collection(db, "videos");
  try {
      const docRef = await addDoc(videosRef, {
        uid,
        title: title || "Untitled Project",
        status: "processing",
        duration,
        videoUrl: "",
        createdAt: serverTimestamp()
      });
      return docRef.id;
  } catch (error) {
      console.error("Error init video:", error);
      throw error;
  }
};

export const completeVideoGeneration = async (videoId: string, uid: string, blob: Blob) => {
  try {
    // Upload to Storage
    const storageRef = ref(storage, `videos/${uid}/${videoId}.mp4`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    // Update Firestore
    const videoRef = doc(db, "videos", videoId);
    await updateDoc(videoRef, {
      status: "completed",
      videoUrl: downloadURL
    });
    return downloadURL;
  } catch (error) {
    console.error("Upload failed", error);
    await failVideoGeneration(videoId);
    throw error;
  }
};

export const failVideoGeneration = async (videoId: string) => {
  try {
      const videoRef = doc(db, "videos", videoId);
      await updateDoc(videoRef, {
        status: "failed"
      });
  } catch (error) {
      console.error("Error failing video:", error);
  }
};

// 3. Fetch History
export const getUserVideos = async (uid: string): Promise<VideoDocument[]> => {
  try {
    const q = query(
        collection(db, "videos"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            uid: data.uid,
            title: data.title,
            status: data.status,
            duration: data.duration,
            videoUrl: data.videoUrl,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as VideoDocument;
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

// Helper placeholders to satisfy potential legacy imports if any (though we are replacing them)
export const uploadVideoToFirebase = async () => {};
export const deleteVideoFromFirebase = async () => {};
export const renameVideoInFirebase = async () => {};
