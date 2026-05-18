import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    content: null,
    type: null,
    enableIcon: null
}

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setSuccessMessage: (state,action)=>{
            state.content = action.payload.content;
            state.type = 'Success';
            if(action.payload.enableIcon===false)
            state.enableIcon=false;
            else
            state.enableIcon=true;
        },
        setFailureMessage: (state,action)=>{
            state.content = action.payload.content;
            state.type = 'Failure';
            if(action.payload.enableIcon===false)
            state.enableIcon=false;
            else
            state.enableIcon=true;
        },
        clearMessage: (state,action)=>{
            state.content = null;
            state.type=null;
            state.enableIcon=null;
        }
    }
});

export const {setSuccessMessage,setFailureMessage,clearMessage} = messageSlice.actions;
export default messageSlice.reducer;