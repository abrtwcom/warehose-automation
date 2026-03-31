import {
  ref,
  push,
  update,
  remove,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { database } from "../firebase/config";

// Service wrapper for Firebase product operations.
// Not a true React hook (no state/effects) — kept as `use` prefix for existing usage.
export const useProducts = () => {
  const createProduct = async (productData) => {
    if (!database) {
      throw new Error("Firebase Database is not initialized.");
    }
    const productsRef = ref(database, "products");
    const newProductRef = push(productsRef);

    const data = {
      ...productData,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    await update(newProductRef, data);
    return newProductRef.key;
  };

  const updateProduct = async (productId, updates) => {
    if (!database) {
      throw new Error("Firebase Database is not initialized.");
    }
    const productRef = ref(database, `products/${productId}`);
    await update(productRef, {
      ...updates,
      updated_date: new Date().toISOString(),
    });
  };

  const deleteProduct = async (productId) => {
    if (!database) {
      throw new Error("Firebase Database is not initialized.");
    }
    const productRef = ref(database, `products/${productId}`);
    await remove(productRef);
  };

  const getProductsByReceiver = async (receiverEmail) => {
    if (!database) {
      return [];
    }
    const productsRef = ref(database, "products");
    const q = query(
      productsRef,
      orderByChild("receiver_email"),
      equalTo(receiverEmail),
    );
    const snapshot = await get(q);

    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    }
    return [];
  };

  const getProductsBySender = async (senderEmail) => {
    if (!database) {
      return [];
    }
    const productsRef = ref(database, "products");
    const q = query(
      productsRef,
      orderByChild("sender_email"),
      equalTo(senderEmail),
    );
    const snapshot = await get(q);

    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    }
    return [];
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByReceiver,
    getProductsBySender,
  };
};
