import "firebase/firestore"
import {initializeApp} from 'firebase/app';
import {getFirestore} from "firebase/firestore/lite";

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

export {db}