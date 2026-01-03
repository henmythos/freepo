"use client";

import { useEffect } from "react";
import { initFirebase } from "@/lib/firebase";
import { setUserProperties, logEvent } from "firebase/analytics";

interface FirebaseTrackerProps {
    city: string;
}

export default function FirebaseTracker({ city }: FirebaseTrackerProps) {
    useEffect(() => {
        const setupFirebase = async () => {
            const { analytics } = await initFirebase() || {};

            if (analytics) {
                // Set the user_city property for In-App Messaging targeting
                if (city && city !== "All") {
                    setUserProperties(analytics, { user_city: city });
                    logEvent(analytics, "view_city_listings", {
                        city_name: city,
                    });
                    console.log(`[Firebase] User Property 'user_city' set to: ${city}`);
                } else {
                    // Optionally clear or set to generic if needed, but usually we just leave it or overwrite
                    // setUserProperties(analytics, { user_city: "generic" });
                }
            }
        };

        setupFirebase();
    }, [city]);

    return null; // This component handles side effects only
}
