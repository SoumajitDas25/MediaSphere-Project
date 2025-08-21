import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authAPI,userAPI } from "../api";

const {login,logout,refreshToken} = authAPI;
const {getUser} = userAPI;

const initialState = {
    isloggedIn: false,
    hasTokens: null,
    isTokenExpired: null,
    user: null,
    loading: true,
    error: null
}

export const verifyAndGetUserThunk = createAsyncThunk(
    'auth/verifyAndGetUser',
    async (_,{rejectWithValue})=>{
        try
        {
            const response1 = await getUser();
            console.log(response1.status);
            if(response1.status === 404)
            { // when user has no tokens
                console.log('No Tokens');
                return rejectWithValue(response1.data);
            }
            else if(response1.status < 200 || response1.status >= 300) 
            { // when user has tokens but access token is invalid or expired, then refresh the token
                console.log('Trying to refresh Tokens');

                const response2 = await refreshToken();
                if(response2.status < 200 || response2.status >= 300) 
                { //when user has invalid or expired refresh token too
                    console.log('Invalid Tokens');
                    return rejectWithValue(response2.data);
                }
                else
                { //when tokens are refreshed, then get the user
                    console.log('Tokens Refreshed');
                   
                    const response3 = await getUser();
                    if(response3.status < 200 || response3.status >= 300) 
                    { //when something gets wrong while getting the user
                        rejectWithValue(response3.data);
                    }
                    else
                    { //when user is successfully fetched
                        console.log('Successfully Fetched User after refreshing tokens');
                        return response3.data;
                    }
                }
            }
            else
            {
                //when user is successfully fetched
                console.log('Sucessfullly Fetched User without refreshing tokens');
                return response1.data;
            }
        }
        catch(error)
        {   //if any network error or any other error occurs
            return rejectWithValue(err.message);
        }
    }
)

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (data,{ rejectWithValue })=>{
        try
        {
            const response = await login(data);
            console.log(response.data);
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

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async (_,{ rejectWithValue })=>{
        try
        {
            
            const response = await logout();
            console.log(response.data);
            if (response.status < 200 || response.status >= 300) 
            {
                // console.log(data.error);
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

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder)=>{

        //login
        builder.addCase(loginThunk.pending,(state,action)=>{
            state.loading = true;
        })
        builder.addCase(loginThunk.fulfilled,(state,action)=>{
            state.user = action.payload.data.user;
            state.loading = false;
            state.isloggedIn = true;
            state.hasTokens = true;
            state.isTokenExpired= false;
            state.error = null;
        })
        builder.addCase(loginThunk.rejected,(state,action)=>{
            if(!action.payload || !action.payload.statusCode)
            { //if any network error occurs
                state.error = 'Network Error'
            }
            else 
            {
                state.error = 'Invalid Credentials';              
            }
            console.log(state.error);
            state.loading = false;
            state.isloggedIn = false;
        })

        //logout
        builder.addCase(logoutThunk.pending,(state,action)=>{
            state.loading = true;
        })
        builder.addCase(logoutThunk.fulfilled,(state,action)=>{
            state.user = null;
            state.loading = false;
            state.isloggedIn = false;
            state.hasTokens = false;
            state.isTokenExpired = null;
            state.error = null;
        })
        builder.addCase(logoutThunk.rejected,(state,action)=>{
            if(!action.payload || !action.payload.statusCode)
            { //if any network error occurs
                state.error = 'Network Error'
            }
            else 
            {
                state.error = action.payload;              
            }
            state.loading = false;
        })

        //verifyAndGetUser
        builder.addCase(verifyAndGetUserThunk.pending,(state,action)=>{
            state.loading = true;
        })
        builder.addCase(verifyAndGetUserThunk.fulfilled,(state,action)=>{
            state.user = action.payload.data;
            state.loading = false;
            state.hasTokens = true;
            state.isTokenExpired = false;
            state.isloggedIn = true;
            state.error = null;
        })
        builder.addCase(verifyAndGetUserThunk.rejected,(state,action)=>{
            if(!action.payload || !action.payload.statusCode)
            { //if any network error occurs
                state.error = 'Network Error'
            }
            else 
            {
                if(action.payload.statusCode === 404)
                { //when user does not have tokens
                    state.hasTokens = false;
                    state.isTokenExpired = null;
                }
                else
                {  //when user has tokens but they are invalid or expired
                    state.hasTokens = true;
                    state.isTokenExpired = true;
                }
                state.error = action.payload;               
            }
            console.log(state.error);
            state.isloggedIn = false;
            state.loading = false;
        })
    }
});

export default authSlice.reducer;