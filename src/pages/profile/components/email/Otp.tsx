import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useChangeEmailMutation,
  useChangePhnumberMutation,
  useLazySendCodeQuery, // Add the sendCode mutation
} from "../../services/profileApi"; // Import your mutation
import { useDispatch, useSelector } from "react-redux";
import {
  setOtpOpen,
  setCaptchaOpen,
} from "../../../../features/login/ModelSlice";
import { setUser } from "../slice/UserSlice";
import { showToast } from "../../error/ErrorSlice";

const Otp: React.FC<{ data: string; type: string }> = ({ data, type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]); // For 6 OTP digits
  const [timer, setTimer] = useState(60); // Set timer to 60 seconds

  const [changeEmail] = useChangeEmailMutation(); // RTK Mutation for email change
  const [changePhumber] = useChangePhnumberMutation(); // RTK Mutation for phone number change
  const [triggerSendCode, { isLoading: isResending }] = useLazySendCodeQuery(); // Add sendCode mutation for resending OTP
  const user = useSelector((state: any) => state.user.user);

  // Countdown for resending OTP
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (
    value: string,
    index: number,
    event: React.KeyboardEvent
  ) => {
    const newOtp = [...otp];

    if (event.key === "Backspace") {
      if (!newOtp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        newOtp[index - 1] = "";
        if (prevInput) {
          (prevInput as HTMLInputElement).focus();
        }
      } else {
        newOtp[index] = "";
      }
    } else if (value.length <= 1) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Automatically move to the next input if the current one is filled
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput && value) {
        (nextInput as HTMLInputElement).focus();
      }

      // If the OTP is fully filled, automatically call the API
      if (newOtp.every((digit) => digit.length === 1)) {
        handleSubmit(newOtp.join(""));
      }
    }
  };

  // Function to handle OTP submission automatically when fully filled
  const handleSubmit = async (otpString: string) => {
    try {
      if (otpString.length === 6) {
        if (type === "email") {
          await changeEmail({
            new_email: data, // The email passed from the parent component
            email_code: otpString, // The 6-digit OTP
          }).unwrap();
          dispatch(setUser({ ...user, email: data }));
        } else {
          await changePhumber({
            new_phone: data, // The phone number passed from the parent component
            sms_code: otpString, // The 6-digit OTP
          }).unwrap();
          dispatch(setUser({ ...user, phone: data }));
        }

        dispatch(setOtpOpen(false));
        dispatch(setCaptchaOpen(false));
        navigate("/info");

        dispatch(
          showToast({
            message: `${type} 修改成功`,
            type: "success",
          })
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          message: (error as any)?.data?.msg || "发生错误",
          type: "error",
        })
      );
    }
  };

  // Function to handle OTP resend
  const handleResend = () => {
    dispatch(setOtpOpen(false));
    dispatch(setCaptchaOpen(true));
  };

  return (
    <div className="text-white">
      <div className="flex items-center justify-between w-full mt-5 px-4">
        <button
          onClick={() => {
            dispatch(setOtpOpen(false));
            dispatch(setCaptchaOpen(false));
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="14"
            viewBox="0 0 10 14"
            fill="none"
          >
            <path
              d="M9.2651 0.490513C9.16609 0.406457 9.04848 0.339768 8.91899 0.294266C8.7895 0.248764 8.65069 0.225342 8.51049 0.225342C8.3703 0.225342 8.23148 0.248764 8.102 0.294266C7.97251 0.339768 7.85489 0.406457 7.75589 0.490513L0.670255 6.49096C0.59121 6.55776 0.528499 6.63711 0.485711 6.72446C0.442923 6.81181 0.420898 6.90545 0.420898 7.00002C0.420898 7.09459 0.442923 7.18823 0.485711 7.27558C0.528499 7.36293 0.59121 7.44228 0.670255 7.50908L7.75589 13.5095C8.17369 13.8633 8.8473 13.8633 9.2651 13.5095C9.68291 13.1557 9.68291 12.5853 9.2651 12.2315L3.09182 6.99641L9.27363 1.76136C9.68291 1.41477 9.68291 0.837109 9.2651 0.490513Z"
              fill="white"
            />
          </svg>
        </button>
        <div className="text-lg font-semibold">验证码</div>
        <div />
      </div>
      <div className="flex flex-col justify-center items-center mt-10 p-3">
        {/* OTP Input Boxes */}
        <div className="flex mt-8 space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              className="w-10 h-10 otp-input text-center text-white border-b-2 focus:outline-none"
              value={digit}
              onChange={(e) =>
                handleChange(
                  e.target.value,
                  index,
                  e as unknown as React.KeyboardEvent
                )
              }
              onKeyDown={(e) => handleChange("", index, e)}
            />
          ))}
        </div>

        {/* OTP Verification Message */}
        <p className="mt-4 text-center text-sm text-gray-400">
          验证码已发送至 <span className="text-white">{data}</span>.
          请检查您的邮件，如果没有收到，请务必再次检查您的垃圾邮件
        </p>

        {/* Resend OTP Timer */}
        <div className="mt-6 otp_btn">
          {timer > 0 ? (
            <p className="text-gray-400">{timer} s</p>
          ) : (
            <button
              className="text-white"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "重新发送..." : "重新发送代码"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Otp;