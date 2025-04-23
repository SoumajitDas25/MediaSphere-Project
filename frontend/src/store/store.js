import { configureStore } from "@reduxjs/toolkit";
import {themeSlice,authSlice,userSlice,uploadSlice,messageSlice} from "../slices";

export const store = configureStore({
    reducer: {
        theme: themeSlice,
        auth: authSlice,
        user: userSlice,
        upload: uploadSlice,
        message:messageSlice
    }
})