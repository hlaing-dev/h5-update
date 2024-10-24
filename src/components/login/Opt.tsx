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
      const otpCode = updatedOTP.join("");

      if (email && password) {
        try {
          const result = await signUpEmail({
            email,
            password,
            email_code: otpCode,
          }).unwrap(); // Unwrap the promise to handle errors
          if (result && result.msg) {
            // console.log("Result message:", result.msg);
            dispatch(setOtpOpen(false));
            // navigate("/profile");
            dispatch(showToast({ message: result?.msg, type: "error" }));
            localStorage.setItem("authToken", JSON.stringify(result));
            setTimeout(() => {
              closeAllModals();
            }, 1000);
          }
          // console.log("Result", result);

          // console.log(result?.msg)
        } catch (error: any) {
          if (error.data.msg === "无效验证码") {
            // console.log("code error", error.data.msg);
            dispatch(showToast({ message: error.data.msg, type: "error" }));
          } else if (error.data.msg) {
            dispatch(setOtpOpen(false));
            navigate("/profile");
            dispatch(showToast({ message: error.data.msg, type: "error" }));
          }
          // console.log("pok ka ya error :", error);
        }
      } else if (phone && password) {
        try {
          // console.log(phone, otpCode);
          // console.log(otpCode)
          const result = await signUpPhone({
            phone,
            password,
            sms_code: otpCode,
          }).unwrap();
          if (result && result.msg) {
            // console.log("Result message:", result.msg);
            dispatch(setOtpOpen(false));
            // navigate("/profile");
            dispatch(showToast({ message: result?.msg, type: "success" }));
            localStorage.setItem("authToken", JSON.stringify(result));
            setTimeout(() => {
              closeAllModals();
            }, 1000);
          }
          console.log("Result", result);

          // console.log(result?.msg)
        } catch (error: any) {
          if (
            error.data.msg === "无效验证码" ||
            error.data.msg === "验证码不正确"
          ) {
            // console.log("code error", error.data.msg);
            dispatch(showToast({ message: error.data.msg, type: "error" }));
          } else if (error.data.msg) {
            // console.log('nom=e')
            dispatch(setOtpOpen(false));
            navigate("/profile");
            dispatch(showToast({ message: error.data.msg, type: "error" }));
          }
          // console.log("pok ka ya error :", error);
        }
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
      <div className="flex justify-between w-2/3">
        <img src={back} alt="Back" onClick={handleBack} />
        <h1 className="text-white text-[16px] font-semibold leading-[20px]">
          OTP Verification
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
          Verification code sent to <span className=" text-white">{email}</span>  <span className="text-white">{phone}</span> Please
          check your messages and be sure to check your spam folder
        </p>
      </div>

      <div className="w-full">
        <button
          disabled={timer > 0}
          onClick={resendOtp}
          className={`w-full px-[15px] py-[10px] text-[16px] font-semibold leading-[22px] ${
            timer > 0
              ? "otp_button text-white"
              : "bg-white rounded-full text-black"
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
