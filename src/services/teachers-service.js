import {db} from "@/firebase_config"

import {collection, deleteDoc, doc, getDoc, getDocs, setDoc} from 'firebase/firestore/lite';
import {deleteObject, getStorage, ref} from "firebase/storage";

export class TeachersService {
    async fetchAll() {
        const teachersCol = collection(db, 'teachers');
        const teacherSnapshot = await getDocs(teachersCol);
        return teacherSnapshot.docs.map(doc => {
            let data = doc.data()
            data.id = doc.id
            return data
        });
    }

    async create(teachers, _id) {
        console.log(teachers, 'data')
        await setDoc(doc(db, "teachers", _id), teachers);
    }

    async fetchOne(_id) {
        const docRef = doc(db, "teachers", _id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data()
            data.id = docSnap.id
            return data
        } else {
            console.log("No such document!");
        }
    }

    async update(teachers, _id) {
        const teachersRef = collection(db, "teachers");
        await setDoc(doc(teachersRef, _id), teachers);
    }

    async delete(teachers) {
        if(teachers.image) {
            const desertRef = ref(getStorage(), teachers.image);

            deleteObject(desertRef).then(() => {
                // File deleted successfully
            }).catch((error) => {
                console.log(error, 'error')
            });
        }

        await deleteDoc(doc(db, "teachers", teachers.id));
    }
}