import { doc, setDoc} from "firebase/firestore/lite";
import { db } from "@/firebase_config";

export class MediaService {
    async create(_payload,_id) {
        await setDoc(doc(db, "media", _id), _payload);
    }
}
