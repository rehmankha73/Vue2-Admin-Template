import "firebase/firestore";
import {initializeApp} from 'firebase/app';
import {getFirestore} from "firebase/firestore/lite";
import {getAuth} from "firebase/auth";
import {getMessaging, getToken} from "firebase/messaging";


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



export { db, auth, messaging }