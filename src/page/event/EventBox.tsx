import React, { useState, useEffect, useRef } from "react";

import "./event.css";
import logo from "./img/logoBox.png";
import light from "./img/light.json";

import btn2 from "./img/btn2.json";
import card from "./img/red.png";
import AsyncDecryptedImage from "@/utils/asyncDecryptedImage";
import Animation from "./Animation";
import { useVerifyCaptchaMutation } from "./eventApi";
import EventResultBox from "./EventResultBox";
import AnimationCard from "./AnimationCard";
import { getDeviceInfo } from "@/lib/deviceInfo";

declare global {
  interface Window {
    initGeetest4?: (
      config: { captchaId: string; product: string },
      callback: (gt: any) => void
    ) => void;
  }
}

interface EventBoxProps {
  eventData: any;
  setBox: any;
  referCode: any;
  isOpen: any;
  setIsOpen: any;
  setCode: any;
  shownextBox: any;
  setshownextBox: any;
  newData: any;
  setnewData: any;
  setEvent: any;
}

const EventBox: React.FC<EventBoxProps> = ({
  eventData,
  setBox,
  referCode,
  isOpen,
  setIsOpen,
  shownextBox,
  setshownextBox,
  setCode,
  newData,
  setnewData,
  setEvent,
}) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [gt, setGt] = useState<any>(null);

  const data = [
    {
      name: "五一劳动节",
      start_date: "2025-05-01",
      end_date: "2025-05-05",
      text: "🎉 劳动最光荣，赢好礼！🎉",
      image: "laborday.png",
    },
    {
      name: "端午节",
      start_date: "2025-05-31",
      end_date: "2025-06-02",
      text: "🎏 端午安康，粽享红包 🎏",
      image: "dragonboat.png",
    },
    {
      name: "中秋节",
      start_date: "2025-10-06",
      end_date: "2025-10-08",
      text: "🌕 中秋团圆，红包满月 🌕",
      image: "midautumn.png",
    },
    {
      name: "国庆节",
      start_date: "2025-10-01",
      end_date: "2025-10-07",
      text: "🇨🇳 国庆狂欢，亿万红包等你 🇨🇳",
      image: "nationalday.png",
    },
  ];

  // Use the mutation hook from RTK Query
  const [verifyCaptcha] = useVerifyCaptchaMutation();

  useEffect(() => {
    if (showCaptcha) {
      const script = document.createElement("script");
      script.src = "https://static.geetest.com/v4/gt4.js";
      script.async = true;
      script.onload = initializeCaptcha;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        if (gt) {
          gt.destroy();
        }
      };
    }
  }, [showCaptcha]);

  const initializeCaptcha = () => {
    if (window.initGeetest4 && captchaRef.current) {
      const captchaId = import.meta.env.VITE_CAPTCHA_ID; // Replace with your actual CAPTCHA ID
      const product = "bind"; // Set the product to "bind" to skip the "Click to verify" button

      window.initGeetest4(
        {
          captchaId: captchaId,
          product: product,
        },
        (gtInstance) => {
          setGt(gtInstance);
          gtInstance.appendTo("#captcha");

          // Directly show the CAPTCHA box without the "Click to verify" button
          gtInstance.showBox();
          gtInstance.onClose(() => {
            setShowCaptcha(false); // This will be called when CAPTCHA is closed
          });

          gtInstance.onSuccess(() => {
            const result = gtInstance.getValidate();
            const device = getDeviceInfo();

            const resultData = {
              event_id: eventData?.data?.event?.id,
              device_id: device.uuid,
              refer_code: referCode,
              lot_number: result?.lot_number,
              captcha_output: result?.captcha_output,
              pass_token: result?.pass_token,
              gen_time: result?.gen_time,

              // additional data
              userAgent: device.userAgent,
              screenResolution: device.screenResolution,
              colorDepth: device.colorDepth,
              timezone: device.timezone,
              language: device.language,
              fonts: device.fonts,
              canvas: device.canvas,
              webgl: device.webgl,
              plugins: device.plugins,
              platform: device.platform,
              hardwareConcurrency: device.hardwareConcurrency,
              deviceMemory: device.deviceMemory,
              touchPoints: device.touchPoints,
              devicePixelRatio: device.devicePixelRatio,
              env_flags: device.env_flags,
            };

            setShowCaptcha(false); // This will be called when CAPTCHA is closed
            setshownextBox(true);

            try {
              const fetchData = async () => {
                const res = await verifyCaptcha(resultData);

                const result1 = res.data?.data;

                setnewData(result1);
                setCode(result1?.geetest);
              };
              fetchData();
            } catch (error) {
              console.log(error);
            }
          });
        }
      );
    }
  };

  // Prevent closing when clicking inside CAPTCHA
  const handleCaptchaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEvent = () => {
    setShowCaptcha(true); // Trigger CAPTCHA to show when the event button is clicked
  };

  return (
    <div className="dheight bg-black/80 w-screen flex justify-center items-center fixed top-0 z-[9999]">
      {!shownextBox && (
        <div className="flex flex-col  gap-[0px] justify-center items-center">
          <div className="absolute z-[-2] top-[150px]">
            <Animation animate={light} />
          </div>
          <div className="flex flex-col justify-between items-center  event_bo">
            <div className="absolute z-[-1] mt-[-20px]">
              <img src={card} alt="" className="w-[293.33px] h-[445px]" />
            </div>
            <div className="w-[400px] h-full pt-[90px] flex flex-col justify-between  items-center media-w1">
              <div className="flex flex-col justify-center items-center px-[30px] mt-20">
                <AsyncDecryptedImage
                  imageUrl={eventData.data.avatar}
                  className="w-[58px] h-[58px] rounded-full object-cover object-center"
                  alt="Profile"
                />
                <h1 className="user_invite_text font-sfPro mt-3 px-10 w-[320px]">
                  "<span className="event_name">{eventData.data.name}</span>"
                  邀请您一起使用笔盒，邀请好友瓜分百万现金红包！
                </h1>
              </div>
              <div className="mt-14">
                <button onClick={handleEvent} className="event_btn">
                  打开红包
                  {/* <Animation animate={btn2} /> */}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {shownextBox && (
        <>
          <EventResultBox
            eventData={eventData}
            newData={newData}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            setBox={setBox}
            setEvent={setEvent}
          />
        </>
      )}

      {/* Hidden captcha container */}
      {showCaptcha && (
        <div
          id="captcha"
          ref={captchaRef}
          onClick={handleCaptchaClick} // Add click handler to prevent closing
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            visibility: "visible", // Ensure it is visible
            height: "auto",
            width: "auto",
          }}
        ></div>
      )}
    </div>
  );
};

export default EventBox;
