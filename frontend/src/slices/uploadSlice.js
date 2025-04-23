import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isUploading: false,
  hasCompleted: false,
  // mediaType: null,
  data: null,
  filesCount:0
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    startUpload: (state, action) => {
      // const { video ,metadata } = action.payload;
      state.isUploading = true;
      // state.mediaType = 'Video';
      // console.log(action.payload);
      state.data=action.payload.data;
      state.filesCount=action.payload.filesCount;
    },
    // finishUpload: (state, action) => {
    //   state.hasCompleted=true;  
    // },
    clearUpload: (state, action) => {
      state.hasCompleted=false;
      state.isUploading=false; 
      if (state.data?.tempUrl) 
      {
        URL.revokeObjectURL(state.data.tempUrl);
      }
      state.data=null; 
      state.filesCount=0;
    }
  }
});

export const { startUpload,clearUpload } = uploadSlice.actions;
export default uploadSlice.reducer;