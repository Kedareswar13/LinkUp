"use client";
import store from "@/store/store";
import React, { ReactNode, useEffect, useState } from "react"; // Fixed import syntax
import { Provider } from "react-redux";
import { Persistor, persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

const ClientProvider = ({ children }: { children: ReactNode }) => {
    const [persistor, setPersistor] = useState<Persistor | null>(null);

    useEffect(() => {
        const clientPersistor = persistStore(store);
        setPersistor(clientPersistor);
    }, []);

    if (!persistor) return null; // Fixed condition

    return <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            {children}
        </PersistGate>
    </Provider>; // Render children instead of placeholder text
};

export default ClientProvider;