import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

const getCollectionData = async (collectionName) => {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
};

export const getRooms = () => getCollectionData("rooms");
export const getBookings = () => getCollectionData("bookings");
export const getGuests = () => getCollectionData("guests");

export const getLogs = async () => {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate().toLocaleString()
        });
    });
    return logs;
};

export const updateRoomStatus = async (roomId, status) => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { status });
    await addDoc(collection(db, "logs"), {
        message: `Room ${roomId} status updated to ${status}`,
        timestamp: serverTimestamp()
    });
};

export const createBooking = async (bookingData) => {
    const newBooking = await addDoc(collection(db, "bookings"), {
        ...bookingData,
        createdAt: serverTimestamp()
    });

    await addDoc(collection(db, "logs"), {
        message: `Booking created for room ${bookingData.roomId}`,
        timestamp: serverTimestamp()
    });
    return { id: newBooking.id, ...bookingData };
};
