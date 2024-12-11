import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setPanding } from "../features/login/ModelSlice";
import { useGetAdsQuery } from "../services/helperService";
import land from "../assets/login/land.png";

import ad1 from "../assets/login/ad1.png";
import { Link } from "react-router-dom";

const Landing: React.FC<any> = ({ data }) => {
  const dispatch = useDispatch();
  const [cc, setCc] = useState<any>();
  const [skip, setSkip] = useState(3);
  const [image, setImage] = useState('');
  // const { data, isLoading } = useGetAdsQuery();
  const [imgLoad, setImgLoad] = useState(false);

  useEffect(() => {
    if (data?.data) {
      const cur = data?.data["start"];
      if(cur && cur.length > 0) {
        setCc(cur[0])
        setImage(cur[0]?.data?.image)
      } else {
        setImage(land);
      }
      const timer = setTimeout(() => {
        dispatch(setPanding(false));
        sendMessageToNative();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [data]);

  useEffect(() => {
    if (imgLoad) {
      const countdown = setInterval(() => {
        if (skip > 0) {
          setSkip((prev) => prev - 1);
        } else {
          dispatch(setPanding(false));
          sendMessageToNative();
        }
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [skip, imgLoad]);
  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.src = land; // Set default image if API image fails
  };

  const sendMessageToNative = () => {
    if ((window as any).webkit && (window as any).webkit.messageHandlers && (window as any).webkit.messageHandlers.jsBridge) {
      (window as any).webkit.messageHandlers.jsBridge.postMessage("showHomeScreen");
    }
  };
  
  return (
        <>
          <Link target="_blink" to={cc?.data?.url}>
            <img
              className="h-screen w-screen object-cover"
              onLoad={() => setImgLoad(true)}
              src={image}
              alt=""
            />
          </Link>
          {imgLoad && (
            <div
              onClick={() => {dispatch(setPanding(false)); sendMessageToNative()}}
              style={{
                borderRadius: "52px",
                background: "rgba(0, 0, 0, 0.98)",
                backdropFilter: "blur(2px)",
              }}
              className="absolute top-[2vh] right-[2vh]"
            >
              <h1 className="text-white text-xs md:text-sm font-[400] py-[4px] px-[12px]">
                跳过广告 <span>{skip}</span>
              </h1>
            </div>
          )}
        </>
  );
};

export default Landing;
