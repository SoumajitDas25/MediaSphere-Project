import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isCropperOpened: false,
    image: null,
    aspectRatio: 1,
    cropSource: null,
    // croppedImage: null,
    isCompleted: null,
    error: null,
    isLoading: false
}

const cropSlice = createSlice({
    name: 'crop',
    initialState,
    reducers: {
        setIsCropperOpened: (state,action) =>{
            state.isCropperOpened = action.payload;
        },
        setCropProperties: (state,action) =>{
            if(action.payload.image && action.payload.aspectRatio && action.payload.cropSource)
            {
                state.image = action.payload.image;
                state.aspectRatio = action.payload.aspectRatio;
                state.cropSource = action.payload.cropSource;
            }
            else
                state.error = true;
        },
        setCropComplete: (state) =>{
                state.isCompleted = true;
                // state.isCropperOpened = false;
        },
        setCropError: (state) =>{
            state.error = true;
            state.isCropperOpened = false;
            state.isLoading = false;
        },
        setCropReset: (state) =>{
            state.isCropperOpened = false;
            state.image = null,
            state.aspectRatio = 1;
            // state.croppedImage = null;
            state.isCompleted = null;
            state.error = null;
            state.isLoading = false;
        },
        setCropLoading: (state,action)=>{
            console.log(action.payload);
            state.isLoading = action.payload;
        }
    }
});

export const {setIsCropperOpened,setCropProperties,setCropComplete,setCropError,setCropReset,setCropLoading} = cropSlice.actions;
export default cropSlice.reducer;