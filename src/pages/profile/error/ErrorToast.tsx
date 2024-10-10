// ErrorToast.tsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideToast } from "./ErrorSlice";
import logo from "../../../assets/logo.svg";

const ErrorToast: React.FC = () => {
  const dispatch = useDispatch();
  const { message, type, showToast } = useSelector((state: any) => state.error);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer); // Clear the timer on unmount
    }
  }, [showToast, dispatch]);

  if (!showToast) return null;

  return (
    <div className="flex justify-center items-center ">
      <div
        className={`text-[8px] fixed w-fit  bottom-10 mx-auto left-0 right-0  py-2 px-4  flex items-center justify-center gap-1 rounded-full toast  text-white text-center z-[999999]`}
      >
        <img src={logo} alt="" className="w-3 h-3" />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ErrorToast;
