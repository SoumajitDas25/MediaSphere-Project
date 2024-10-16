import { createAsyncThunk, createSlice, } from "@reduxjs/toolkit";
import { userAPI } from "../api";

const {signup,getUser} = userAPI;

const initialState = {
    user:null,
    loading: false,
    error: null
}

export const signupThunk = createAsyncThunk(
    'auth/signup',
    async (data,{ rejectWithValue })=>{
        try
        {
            const response = await signup(data);
            if (response.status < 200 || response.status >= 300) 
            {
                return rejectWithValue(response.data);
            }
            return response.data;
        }
        catch(err)
        {
            // console.log(err);
            return rejectWithValue(err.message);
        }
    }
)

export const getCurrentUserThunk = createAsyncThunk(
    'user/getUser',
    async ({},{rejectWithValue})=>{
        try
        {
            const response = await getUser();
            if (response.status < 200 || response.status >= 300) 
            {
                return rejectWithValue(response.data)
            }
            return response.data;
        }
        catch(err)
        {
            // console.log(err);
            return rejectWithValue(err.message);
        }
    }
)

const userSlice = createSlice({
     name:'user',
     initialState,
     reducers:{
        setUser: (state,action) =>{
            state.user = action.payload;
        }
     },
     extraReducers: (builder)=>{

         //get User
         builder.addCase(getCurrentUserThunk.pending,(state,action)=>{
            state.loading = true;
        })
        builder.addCase(getCurrentUserThunk.fulfilled,(state,action)=>{
            state.user = action.payload.data;
            // state.hasTokens = true;
            state.loading = false;
            state.error = null;
        })
        builder.addCase(getCurrentUserThunk.rejected,(state,action)=>{
            if(!action.payload || !action.payload.statusCode)
            { //if any network error occurs
                    state.error = 'Network Error'
            }
            else 
            {
                state.error = action.payload.error;              
            }
            state.loading = false;
        })

        //signup
        builder.addCase(signupThunk.pending,(state,action)=>{
            state.loading = true;
        })
        builder.addCase(signupThunk.fulfilled,(state,action)=>{
            state.user = action.payload.data;
            state.loading = false;
            state.error = null;
        })
        builder.addCase(signupThunk.rejected,(state,action)=>{
            if(!action.payload || !action.payload.statusCode)
            { //if any network error occurs
                state.error = 'Network Error'
            }
            else 
            {
                state.error = action.payload.error;              
            }
            console.log(action.payload);
            console.log(state.error);
            state.loading = false;
            state.user=null;
        })
     }
});

export const {setUser} = userSlice.actions;
export default userSlice.reducer;