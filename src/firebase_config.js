import "firebase/firestore";
import {initializeApp} from 'firebase/app';
import {getFirestore} from "firebase/firestore/lite";
import {getAuth} from "firebase/auth";
import {getMessaging, getToken, onMessage } from "firebase/messaging";

export const firebaseConfig = {
    apiKey: "AIzaSyCNWRLBvGd8uhVKUG1SdoXKxWE_BQhPufQ",
    authDomain: "fir-api-a34d5.firebaseapp.com",
    databaseURL: "https://fir-api-a34d5-default-rtdb.firebaseio.com",
    projectId: "fir-api-a34d5",
    storageBucket: "fir-api-a34d5.appspot.com",
    messagingSenderId: "822572907739",
    appId: "1:822572907739:web:32829707b5d46fad4560fe"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const messaging = getMessaging(app);

console.log('Requesting permission...');
Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
        console.log('Notification permission granted.');
    }
})

getToken(messaging, {vapidKey: 'BEODX0vXv-bAG0J9aMNuvig0tZsFowJhTRUdzHFgX9I0zDFG-Mi6vm4wIiA0EAvz1J3SBq7PI7X9lK7ZOOrNtfs'}).then((currentToken) => {
    if (currentToken) {
        console.log(currentToken, 'token')
        localStorage.setItem('messaging_token', currentToken)
    } else {
        console.log('No registration token available. Request permission to generate one.');
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
});

onMessage(messaging, (payload) => {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        console.log('Message received. ', payload);

        let notification = new Notification(payload.notification.title,
            {body: payload.notification.body},
        );

        notification.onclick = function (event) {
            // have to specify base url for
            // only for redirecting same url of app
            // if (window.location.href === 'http://localhost:8080/') {
            //     event.preventDefault()
            //     return;
            // }

            event.preventDefault();
            console.log(payload.fcmOptions.link, 'click action')
            window.open(payload.fcmOptions.link, '_blank')
            notification.close();
        }
    }
});

export {db, auth, messaging}