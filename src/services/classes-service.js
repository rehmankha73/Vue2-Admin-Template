import {db} from "@/firebase_config"

import {collection, deleteDoc, doc, getDoc, getDocs, setDoc} from 'firebase/firestore/lite';
import {deleteObject, getStorage, ref} from "firebase/storage";

export class ClassesService {
    async fetchAll() {
        const classesCol = collection(db, 'classes');
        const classSnapshot = await getDocs(classesCol);
        return classSnapshot.docs.map(doc => {
            let data = doc.data()
            data.id = doc.id
            return data
        });
    }

    async create(classes, _id) {
        console.log(classes, 'data')
        await setDoc(doc(db, "classes", _id), classes);
    }

    async fetchOne(_id) {
        const docRef = doc(db, "classes", _id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data()
            data.id = docSnap.id
            return data
        } else {
            console.log("No such document!");
        }
    }

    async update(classes, _id) {
        const classesRef = collection(db, "classes");
        await setDoc(doc(classesRef, _id), classes);
    }

    async delete(classes) {
        if(classes.image) {
            const desertRef = ref(getStorage(), classes.image);

            deleteObject(desertRef).then(() => {
                // File deleted successfully
            }).catch((error) => {
                console.log(error, 'error')
            });
        }

        await deleteDoc(doc(db, "classes", classes.id));
    }
}


