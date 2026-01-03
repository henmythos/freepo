import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;

export const initFirebase = async () => {
    if (typeof window === "undefined") return;

    if (!getApps().length) {
        try {
            app = initializeApp(firebaseConfig);
        } catch (error) {
            console.error("Firebase initialization error", error);
            return;
        }
    } else {
        app = getApp();
    }

    // Initialize Analytics
    try {
        if (await isSupported()) {
            analytics = getAnalytics(app);
        }
    } catch (error) {
        console.error("Firebase Analytics initialization error", error);
    }

    return { app, analytics };
};

export const getFirebaseServices = () => ({ app, analytics });
