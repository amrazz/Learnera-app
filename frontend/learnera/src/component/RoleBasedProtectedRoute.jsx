import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { logoutAction } from "../redux/features/auth/actions";
import { jwtDecode } from "jwt-decode";
import { current } from "@reduxjs/toolkit";
import { HashLoader } from "react-spinners";
import { Navigate } from "react-router-dom";

const RoleBasedProtectedRoute =  ({ children, allowedRoles })  => {
    const dispatch = useDispatch();
    const [isValidating, setIsValidating] = useState(true);
    const validationAttempted = useRef(false);
    const { isAuthenticated, Role } = useSelector((state) => state.auth);

  useEffect(() => {
    const validateToken = async () => {
      if (validationAttempted.current) return;
      validationAttempted.current = true;

      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        if (!accessToken && !refreshToken && isAuthenticated) {
          dispatch(logoutAction());
          setIsValidating(false);
          return;
        }

        if (!accessToken && !refreshToken) {
          setIsValidating(false);
          return;
        }

        if (accessToken) {
          try {
            const decoded = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime) {
              setIsValidating(false);
              return;
            }
          } catch (e) {
            console.error("Error decoding access token:", e);
          }
        }

        if (refreshToken) {
          try {
            const response = await api.post("/api/token/refresh/", {
              refresh: refreshToken,
            });

            if (response.status === 200 && response.data.access) {
              localStorage.setItem(ACCESS_TOKEN, response.data.access);
              setIsValidating(false);
              return;
            }
          } catch (error) {
            console.error("Token refresh failed:", error);
          }
        }

        dispatch(logoutAction());
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
      } catch (error) {
        console.error("Token validation failed:", error);
        dispatch(logoutAction());
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [dispatch, isAuthenticated]);

  if (isValidating) {
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(Role)) {
    const routes = {
        is_student : "/students",
        is_teacher: "/teachers",
        is_parent: "/parents",
    };

    return <Navigate to={routes[Role] || "/login"} replace />
  }



  return children;
};

export default RoleBasedProtectedRoute;
