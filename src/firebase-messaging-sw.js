import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";
import { onBackgroundMessage } from "firebase/messaging/sw";

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
const firebaseApp = initializeApp({
    apiKey: "AIzaSyCNWRLBvGd8uhVKUG1SdoXKxWE_BQhPufQ",
    authDomain: "fir-api-a34d5.firebaseapp.com",
    databaseURL: "https://fir-api-a34d5-default-rtdb.firebaseio.com",
    projectId: "fir-api-a34d5",
    storageBucket: "fir-api-a34d5.appspot.com",
    messagingSenderId: "822572907739",
    appId: "1:822572907739:web:32829707b5d46fad4560fe"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = getMessaging(firebaseApp);
console.log(messaging, 'message')

onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
});

onBackgroundMessage(messaging, (payload) => {
    // console.log('[firebase-messaging-sw.js] Received background message ', payload);
    console.log(payload, 'payload')
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions).then(r => console.log(r, 'after showing notifications!'));
});

export default messaging;
