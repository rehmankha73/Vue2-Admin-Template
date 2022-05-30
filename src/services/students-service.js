import {db} from "../firebase_config"

import {collection, deleteDoc, doc, getDoc, getDocs, setDoc} from 'firebase/firestore/lite';

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
        console.log(student, 'data')
        await setDoc(doc(db, "students", _id), student);
    }

    async fetchOne(_id) {
        const docRef = doc(db, "students", _id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
        }
    }

    async update(student, _id) {
        const studentsRef = collection(db, "students");
        await setDoc(doc(studentsRef, _id), student);
    }

    async delete(_id) {
        await deleteDoc(doc(db, "students", _id));
    }
}


