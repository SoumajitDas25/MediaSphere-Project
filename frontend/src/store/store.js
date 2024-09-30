import { configureStore } from "@reduxjs/toolkit";
import {themeSlice,authSlice,userSlice} from "../slices";

export const store = configureStore({
    reducer: {
        theme: themeSlice,
        auth: authSlice,
        user: userSlice
    }
})