import {collection, deleteDoc, doc, getDoc, getDocs, setDoc} from "firebase/firestore/lite";
import {db} from "@/firebase_config";
import {deleteObject, getStorage, ref} from "firebase/storage";

export class UsersService {
    async fetchAll() {
        // From Axios request
        // return (await axios.get('/users')).data;
        // console.log((await axios.get('/api/companies')).data.data, 'companies')
        // return (await axios.get('/users.json')).data;

        // From firebase request
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        return userSnapshot.docs.map(doc => {
            let data = doc.data()
            data.id = doc.id
            return data
        });
    }

    async create(user,_id) {
        // return (await axios.post('/users', user)).data;
        // return (await axios.post('/companies', user)).data.data;

        await setDoc(doc(db, "users", _id), user);
    }

    async fetchOne(_id) {
        // return (await axios.get('/users/' + id)).data;
        // return (await axios.get('/companies/' + id)).data.data;

        const docRef = doc(db, "users", _id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data()
            data.id = docSnap.id
            return data
        } else {
            console.log("No such document!");
        }
    }

    async update(user, _id) {
        // return (await axios.patch('/users', user)).data;
        // return (await axios.patch('/companies/'+ user.id, user)).data.data;

        const studentsRef = collection(db, "users");
        await setDoc(doc(studentsRef, _id), user);
    }

    async delete(user) {
        // return (await axios.delete('/users/' + user.id)).data;
        // return (await axios.delete('/companies/' + user.id)).data.data;

        if(user.image) {
            const desertRef = ref(getStorage(), user.image);

            deleteObject(desertRef).then(() => {
                // File deleted successfully
            }).catch((error) => {
                console.log(error, 'error')
            });
        }

        await deleteDoc(doc(db, "users", user.id));
    }
}
