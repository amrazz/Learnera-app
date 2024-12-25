import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction } from "../../redux/features/auth/actions";

const Logout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const performLogout = async () => {
            await dispatch(logoutAction());
            navigate("/login", { replace: true });
        };
        
        performLogout();
    }, [dispatch, navigate]);

    return null;
};

export default Logout;