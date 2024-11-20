import React, { startTransition, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setAuthModel,
  setLoginOpen,
  setOpenUserNameForm,
  setOtpOpen,
  setSignUpEmail,
  setSignupOpen,
} from "../../features/login/ModelSlice";
import { getOtp } from "../../services/userService";
import back from "../../assets/login/back.svg";
import { showToast } from "../../pages/profile/error/ErrorSlice";
import {
  useSignUpEmailMutation,
  useSignUpPhoneMutation,
} from "../../features/login/RegisterApi";
import ErrorToast from "../../pages/profile/error/ErrorToast";

interface OptProps {
  email?: string;
  password?: string;
  phone?: string;
  setIsVisible: (isVisible: boolean) => void;
}
interface messg {
  msg: string;
}

const Opt: React.FC<OptProps> = ({ email, password, phone, setIsVisible }) => {
  const [signUpEmail, { isLoading, error }] = useSignUpEmailMutation();
  const [signUpPhone] = useSignUpPhoneMutation();

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState<number>(59);
  const [buttonText, setButtonText] = useState<string>("59 s");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { captchaCode, captchaKey, openSignUpEmailModel } = useSelector(
    (state: any) => state.model
  );

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) setTimer((prev) => prev - 1);
    }, 1000);

    if (timer === 0) setButtonText("Resend Code");
    else setButtonText(`${timer} s`);

    return () => clearInterval(countdown);
  }, [timer]);

  useEffect(() => {
    if (email) {
      getOtp(captchaCode, captchaKey, email, "email");
    } else if (phone) {
      getOtp(captchaCode, captchaKey, phone, "phone");
    }
  }, [captchaCode, email]);

  const closeAllModals = () => {
    startTransition(() => {
      dispatch(setAuthModel(false));
      dispatch(setLoginOpen(false));
      dispatch(setSignupOpen(false));
    });
  };

  const handleOTPChange = async (index: number, value: string) => {
    const updatedOTP = [...otpDigits];
    updatedOTP[index] = value;
    setOtpDigits(updatedOTP);
  
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  
    // Handle OTP submission when all digits are filled
    if (updatedOTP.every((digit) => digit)) {
      // Remove focus from all inputs
      inputRefs.current.forEach((input) => input?.blur());
  
      const otpCode = updatedOTP.join("");
      try {
        if (email && password) {
          const result = await signUpEmail({
            email,
            password,
            email_code: otpCode,
          }).unwrap();
          if (result && result.msg) {
            dispatch(setOtpOpen(false));
            dispatch(showToast({ message: result.msg, type: "error" }));
            localStorage.setItem("authToken", JSON.stringify(result));
            setTimeout(() => closeAllModals(), 1000);
          }
        } else if (phone && password) {
          const result = await signUpPhone({
            phone,
            password,
            sms_code: otpCode,
          }).unwrap();
          if (result && result.msg) {
            dispatch(setOtpOpen(false));
            dispatch(showToast({ message: result.msg, type: "success" }));
            localStorage.setItem("authToken", JSON.stringify(result));
            setTimeout(() => closeAllModals(), 1000);
          }
        }
      } catch (error: any) {
        const errorMessage = error.data?.msg || "An error occurred";
        dispatch(showToast({ message: errorMessage, type: "error" }));
        inputRefs.current.forEach((input) => input?.focus()); // Optional: Refocus on inputs if needed
      }
    }
  };
  

  const resendOtp = () => {
    if (email) {
      setTimer(59);
      setOtpDigits(Array(6).fill(""));
      getOtp(captchaCode, captchaKey, email, "email");
      dispatch(showToast({ message: "验证码已成功重新发送", type: "success" }));
    } else if (phone) {
      setTimer(59);
      setOtpDigits(Array(6).fill(""));
      getOtp(captchaCode, captchaKey, phone, "phone");
      dispatch(showToast({ message: "验证码已成功重新发送", type: "success" }));
    }
  };

  const handleBack = () => {
    dispatch(setOtpOpen(false));
    setIsVisible(true);
  };

  return (
    <div className=" fixed top-0 w-screen h-screen  z-[9090900909] bg-[#161619] p-[20px]">
      <div className=" flex justify-center items-center">
        <img
          className=" absolute top-[20px] left-[20px] z-[9999008819]"
          onClick={handleBack}
          src={back}
          alt="Back"
        />{" "}
        <h1 className="text-white text-[16px] font-semibold leading-[20px]">
          验证码
        </h1>
      </div>

      <div className="py-20 flex flex-col justify-center items-center">
        <div>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              type="password"
              value={digit}
              maxLength={1}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              className="w-10 h-10 mx-1 text-center rounded-lg bg-[#303030] text-white text-[20px]"
            />
          ))}
        </div>

        <p className="text-[#888] text-[10px] font-light leading-[15px] p-3 text-center">
          验证码已发送至 <span className=" text-white">{email}</span>{" "}
          <span className="text-white">{phone}</span> Please
          检查您的邮件并确保检查您的垃圾邮件文件夹{" "}
        </p>
      </div>

      <div className="w-full flex justify-center items-center">
        <button
          disabled={timer > 0}
          onClick={resendOtp}
          className={`w-[320px] text-[14px] font-[600] leading-[22px]  mt-[20px] py-[10px] px-[16px] rounded-[80px] ${
            timer > 0 ? "next_button text-[#777]" : "login_button text-white"
          }`}
        >
          {buttonText}
        </button>
      </div>
      <ErrorToast />
    </div>
  );
};

export default Opt;
