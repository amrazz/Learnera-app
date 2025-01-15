import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../constants";

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        console.log(credentials);

        const response = await api.post('users/user_login/', credentials);
        console.log(response);
        if (response.status === 200) {
            const { access_token, refresh_token, role, resetPassword, userEmail } = response.data;

            localStorage.setItem(ACCESS_TOKEN, access_token);
            localStorage.setItem(REFRESH_TOKEN, refresh_token);
            localStorage.setItem("USER_ROLE", role);
            localStorage.setItem("isAuthenticated", true);
            localStorage.setItem("userEmail", userEmail)
            localStorage.setItem("resetPassword", resetPassword)

            return { accessToken: access_token, refreshToken: refresh_token, Role: role };
        } else {
            return rejectWithValue("Invalid credentials, please try again.");
        }
    } catch (error) {
        if (error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const schooladmin_login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        console.log(credentials);


        const response = await api.post('school_admin/login/', credentials);
        console.log(response);

        if (response.status === 200) {



            const { access_token, refresh_token, role, userEmail } = response.data;


            localStorage.setItem(ACCESS_TOKEN, access_token);
            localStorage.setItem(REFRESH_TOKEN, refresh_token);
            localStorage.setItem("USER_ROLE", role);
            localStorage.setItem("isAuthenticated", true);


            return { accessToken: access_token, refreshToken: refresh_token, Role: role };
        } else {
            return rejectWithValue("Invalid credentials, please try again.");
        }
    } catch (error) {

        if (error.response) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const logoutAction = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (refreshToken) {
                await api.post("users/user_logout/", {
                    refreshToken: refreshToken,
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.clear();
        }
        return true;
    }
);