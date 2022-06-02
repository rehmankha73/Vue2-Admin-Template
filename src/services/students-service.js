import {db} from "../firebase_config"

import {collection, deleteDoc, doc, getDoc, getDocs, setDoc} from 'firebase/firestore/lite';
// import {deleteObject, getStorage, ref} from "firebase/storage";

export class StudentsService {
    async fetchAll() {
        const studentsCol = collection(db, 'students');
        const studentSnapshot = await getDocs(studentsCol);
        return studentSnapshot.docs.map(doc => {
            let data = doc.data()
            data.id = doc.id
            return data
        });
    }

    async create(student, _id) {
        await setDoc(doc(db, "students", _id), student);
    }

    async fetchOne(_id) {
        const docRef = doc(db, "students", _id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data()
            data.id = docSnap.id
            return data
        } else {
            console.log("No such document!");
        }
    }

    async update(student, _id) {
        const studentsRef = collection(db, "students");
        await setDoc(doc(studentsRef, _id), student);
    }

    async delete(student) {
        // if(student.image) {
        //     const desertRef = ref(getStorage(), student.image);
        //
        //     deleteObject(desertRef).then(() => {
        //         // File deleted successfully
        //     }).catch((error) => {
        //         console.log(error, 'error')
        //     });
        // }

        await deleteDoc(doc(db, "students", student.id));
    }
}


