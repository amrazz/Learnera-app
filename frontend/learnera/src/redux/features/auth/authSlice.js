import { createSlice } from "@reduxjs/toolkit";
import { login, logoutAction } from "./actions";
const initialState = {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    Role: null,
    status: 'idle',
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.accessToken = action.payload.access_token;
            state.refreshToken = action.payload.refresh_token;
            state.isAuthenticated = true;
            state.Role = action.payload.Role
            state.error = null;
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.Role = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
                state.Role = action.payload.Role;
                    state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'login failed';
            })
            .addCase(logoutAction.fulfilled, (state, action) => {
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.Role = null;
                state.status = 'idle';
                state.error = null;
            })
            .addCase(logoutAction.rejected, (state, action) => {
                state.error = action.payload || 'Logout failed';
            });
    }
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
