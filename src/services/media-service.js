import {collection, deleteDoc, doc, getDoc, getDocs, setDoc} from "firebase/firestore/lite";
import {db} from "@/firebase_config";
import {deleteObject, getStorage, ref} from "firebase/storage";

export class MediaService {

    async fetchAll() {
        const mediaCol = collection(db, 'media');
        const mediaSnapshot = await getDocs(mediaCol);
        return mediaSnapshot.docs.map(doc => {
            let data = doc.data()
            data.id = doc.id
            return data
        });
    }

    async fetchOne(_id) {
        const docRef = doc(db, "media", _id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data()
            data.id = docSnap.id
            return data
        } else {
            console.log("No such document!");
        }
    }

    async create(_payload, _id) {
        await setDoc(doc(db, "media", _id), _payload);
    }

    async update(media, _id) {
        const mediaRef = collection(db, "media");
        await setDoc(doc(mediaRef, _id), media);
    }

    async delete(media) {
        if (media.files && media.files.length > 0) {
            for (let i = 0; i < media.files.length; i++) {
                try {
                    if(media.files[i].thumbnail_url){
                    await deleteObject(ref(getStorage(), media.files[i].thumbnail_url))
                    }
                    await deleteObject(ref(getStorage(), media.files[i].url))
                } catch (error) {
                    console.log(error, 'error')
                }
            }
        }

        await deleteDoc(doc(db, "media", media.id));
    }
}
