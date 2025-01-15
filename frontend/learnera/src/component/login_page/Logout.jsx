import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction } from "../../redux/features/auth/actions";
import { HashLoader } from "react-spinners";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      setLoading(true);
      await dispatch(logoutAction());
      navigate("/login", { replace: true });
      setLoading(false);
    };

    performLogout();
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }
};

export default Logout;
