import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";


const persistConfig = {
    key: "auth",
    storage,
};


const persistedAuthReducer = persistReducer(persistConfig, authReducer)

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});


export const persistor = persistStore(store);
export default store