import Loader from "../../../pages/search/components/Loader";

import ImageWithPlaceholder from "./socialImgPlaceholder";
import ImageWithPlaceholder1 from "./gifPlaceholder";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  useFollowUserMutation,
  useLikePostMutation,
} from "../services/socialApi";
import { useDispatch } from "react-redux";
import { showToast } from "../../../pages/profile/error/ErrorSlice";
import { setAuthModel } from "../../../features/login/ModelSlice";
import { startTransition, useEffect, useRef, useState } from "react";
import CustomLightbox from "./CustomLightBox";

import lozad from "lozad";
import Player from "./Player";
import Social_details from "./Social_details";
import { useNavigate } from "react-router";
import AudioPlayer from "./AudioPlayer";
import {
  useGetShareQuery,
  useGetShareScanQuery,
} from "../../../features/share/ShareApi";
import Cookies from "js-cookie";
import axios from "axios";
import { convertToSecureUrl } from "../../../services/newEncryption";
import { decryptWithAes } from "../../../services/newEncryption";
import copy from "copy-to-clipboard";

const PostList = ({
  isRefreshing,
  data,
  loading,
  hasMore,
  fetchMoreData,
  setShowDetail,
  showDetail,
}: {
  isRefreshing: any;
  data: any;
  loading: boolean;
  hasMore: boolean;
  fetchMoreData: () => void;
  setShowDetail: (showDetail: boolean) => void;
  showDetail: boolean;
}) => {
  const [showCreatedTime, setShowCreatedTime] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [activePlayer, setActivePlayer] = useState<any>(null); // Track the active player

  const handleShowDetail = (post: any) => {
    setActivePost(post); // Set the active post
    setShowDetail(true); // Show the modal
  };
  const isLoggedIn = localStorage.getItem("authToken");
  const parsedLoggedIn = isLoggedIn ? JSON.parse(isLoggedIn) : null;
  const token = parsedLoggedIn?.data?.access_token;
  const [followStatus, setFollowStatus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [likeStatus, setLikeStatus] = useState<{
    [key: string]: { liked: boolean; count: number };
  }>({});

  //   const [showBottomSheet, setShowBottomSheet] = useState(false);

  //   const bottomSheetRef = useRef<HTMLDivElement | null>(null);

  const [followUser, { isLoading, isError, isSuccess }] =
    useFollowUserMutation(); // use the mutation hook
  const [likePost, { isLoading: isLikeloading }] = useLikePostMutation(); // use the mutation hook
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [lightboxStates, setLightboxStates] = useState<{
    [key: string]: { isOpen: boolean; currentIndex: number };
  }>({});
  let videoData = useRef<HTMLVideoElement[]>([]);
  const dispatch = useDispatch();
  // const { data: newData } = useGetShareQuery({});

  useEffect(() => {
    const newFollowStatus: { [key: string]: boolean } = {};
    const newLikeStatus: { [key: string]: { liked: boolean; count: number } } =
      {};
    data.forEach((post: any) => {
      newFollowStatus[post.user.id] = post.is_followed;
      newLikeStatus[post.post_id] = {
        liked: post.is_liked,
        count: post.like_count,
      };
    });
    setFollowStatus(newFollowStatus);
    setLikeStatus(newLikeStatus);
  }, [data]);

  // Open lightbox specific to a post and image index
  const openLightbox = (postId: any, index: any) => {
    const bodyElement = document.querySelector("body");
    if (bodyElement) {
      bodyElement.style.overflow = "hidden";
    }
    setLightboxStates({
      ...lightboxStates,
      [postId]: { isOpen: true, currentIndex: index },
    });
  };

  const closeLightbox = (postId: any) => {
    const bodyElement = document.querySelector("body");
    if (bodyElement) {
      bodyElement.style.removeProperty("overflow"); // Remove the overflow style
    }
    const newState = { ...lightboxStates };
    if (newState[postId]) {
      newState[postId].isOpen = false;
    }
    setLightboxStates(newState);
  };

  if (loading && !data.length) {
    return (
      <div className="text-center -mt-[100px] max-sm:h-[80vh]  h-[100vh] flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (isRefreshing) {
    return (
      <div className="text-center -mt-[100px] max-sm:h-[80vh]  h-[100vh] flex justify-center items-center">
        <Loader />
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="text-center -mt-[100px]  max-sm:h-[80vh]  h-[100vh] flex justify-center items-center">
        <div className="text-center flex flex-col justify-center items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.3245 0C5.58752 0 4.09952 1.24051 3.78449 2.9475L0.0599999 23.1674C0.0194995 23.3819 0 23.6009 0 23.8184V32.4C0 34.3875 1.61249 36 3.6 36H32.4C34.3875 36 36 34.3875 36 32.4V23.8184C36 23.6009 35.9805 23.3819 35.94 23.1674L32.2155 2.9475C31.9005 1.24051 30.4125 0 28.6755 0H7.3245ZM6.14401 3.3825C6.24901 2.81399 6.74551 2.4 7.3245 2.4H28.6756C29.2546 2.4 29.7512 2.81399 29.8561 3.3825L33.3226 22.2H25.797C25.161 22.2 24.5505 22.4535 24.1005 22.9035L21.003 25.9995H14.397L11.2996 22.9035C10.8495 22.4535 10.2391 22.2 9.60304 22.2H2.67761L6.14401 3.3825ZM2.40002 24.6V32.3998C2.40002 33.0628 2.937 33.5998 3.60001 33.5998H32.4C33.063 33.5998 33.6 33.0628 33.6 32.3998V24.6H25.7971L22.6996 27.6975C22.2496 28.1475 21.6391 28.3995 21.0031 28.3995H14.3972C13.7612 28.3995 13.1507 28.1475 12.7007 27.6975L9.60316 24.6H2.40002Z"
              fill="#888888"
            />
          </svg>
          <h1 className="not_found_text">快关注你喜欢的贴子吧！</h1>
        </div>
      </div>
    );
  }

  const handleFollowChange = async (userId: any, currentStatus: any) => {
    if (!token) {
      startTransition(() => {
        dispatch(setAuthModel(true));
      });
      return;
    }

    try {
      await followUser({
        follow_user_id: userId,
        is_follow: !currentStatus,
      }).unwrap();
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: !currentStatus,
      }));
    } catch (error) {
      dispatch(
        showToast({
          message: (error as any)?.data?.msg || "修改昵称失败",
          type: "error",
        })
      );
    }
  };

  const handleLikeChange = async (postId: any, currentStatus: any) => {
    if (!token) {
      dispatch(setAuthModel(true));
      return;
    }

    try {
      const response = await likePost({
        post_id: postId,
        is_like: !currentStatus.liked,
      }).unwrap();
      setLikeStatus((prev) => ({
        ...prev,
        [postId]: {
          liked: !currentStatus.liked,
          count: currentStatus.liked
            ? +currentStatus.count - 1
            : +currentStatus.count + 1,
        },
      }));
    } catch (error) {
      dispatch(
        showToast({
          message: (error as any)?.data?.msg || "修改昵称失败",
          type: "error",
        })
      );
    }
  };

  const toggleDescription = (postId: any) => {
    setExpanded((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle the state for the given post ID
    }));
  };

  const renderDescription = (post: any) => {
    const isExpanded = expanded[post.post_id];
    if (!isExpanded && post.description.length > 80) {
      // Assuming 300 characters as roughly four lines of text
      return (
        <>
          {post.description.substring(0, 80)}
          <button
            onClick={() => toggleDescription(post.post_id)}
            className="text-[#FFFFFF99]"
          >
            ...展开
          </button>
        </>
      );
    }
    return (
      <>
        {post.description}
        {post.description.length > 80 && (
          <button
            onClick={() => toggleDescription(post.post_id)}
            className="text-[#FFFFFF99]"
          >
            {/* 显示较少 */}
            收起
          </button>
        )}
      </>
    );
  };

  //   const openBottomSheet = async () => {
  //     // await requestPermissions(); // Request permissions before opening bottom sheet
  //     setShowBottomSheet(true);

  //     setTimeout(() => {
  //       const overlay = document.querySelector(".overlay_image");
  //       if (overlay) {
  //         overlay.classList.remove("hidden");
  //       }
  //     }, 0);
  //   };

  //   const closeBottomSheet = () => {
  //     const bottomSheet = bottomSheetRef.current;
  //     const overlay = document.querySelector(".overlay_image");

  //     if (bottomSheet) {
  //       bottomSheet.classList.remove("slide-in");
  //       bottomSheet.classList.add("slide-out");
  //       overlay?.classList.add("hidden");
  //       setShowBottomSheet(false);
  //     }
  //   };

  const sendEventToNative = ({ value }: { value: any }) => {
    if (
      (window as any).webkit &&
      (window as any).webkit.messageHandlers &&
      (window as any).webkit.messageHandlers.jsBridge
    ) {
      (window as any).webkit.messageHandlers.jsBridge.postMessage({
        eventName: "socialMediaShare",
        value: value,
      });
    }
  };

  const handleShare = async () => {
    const cookieKey = "shareContent";

    try {
      // Check if the cookie exists
      const cachedContent = Cookies.get(cookieKey);
      if (cachedContent) {
        copyToClipboard(JSON.parse(cachedContent).data.content);
        sendEventToNative(JSON.parse(cachedContent).data.content);
        return;
      }

      // Call the API if no cached content is found
      const response = await axios.get(
        convertToSecureUrl(`${process.env.REACT_APP_API_URL}/user/get_share`),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.data;
      const result: any = await decryptWithAes(data);

      if (data && result) {
        // Save to cookie with a 2-hour expiry
        Cookies.set(cookieKey, JSON.stringify(result), { expires: 1 / 12 }); // 1/12 day = 2 hours
        sendEventToNative(result?.data.content);
        copyToClipboard(result?.data.content);
      }
    } catch (error) {
      console.error("Error fetching share content:", error);
    } finally {
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      copy(text);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    } finally {
      dispatch(
        showToast({
          message: "已复制分享链接",
          type: "success",
        })
      );
    }
  };

  return (
    <div className="bg-black">
      {showDetail && (
        <Social_details
          followStatus={followStatus}
          handleFollowChange={handleFollowChange}
          post={activePost}
          setShowDetail={setShowDetail}
          openLightbox={openLightbox}
          lightboxStates={lightboxStates}
          closeLightbox={closeLightbox}
          showCreatedTime={showCreatedTime}
          likeStatus={likeStatus}
          sendEventToNative={handleShare}
          handleLikeChange={handleLikeChange}
          setActivePlayer={setActivePlayer}
          activePlayer={activePlayer}
        />
      )}
      {/* {!showDetail && ( */}
      <>
        {data.map((post: any, index: number) => (
          <div
            key={index}
            className="bg-background mt-2 rounded-lg p-0 text-white"
          >
            <div className="flex justify-between items-center mb-4 px-4 pt-4">
              <div className="flex items-center ">
                {post?.user?.avatar ? (
                  <img
                    src={post.user.avatar}
                    alt={post.user.nickname}
                    className="w-10 h-10 rounded-full mr-2 border border-[#4A4A4A]"
                  />
                ) : (
                  <div className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="56"
                      height="50"
                      viewBox="0 0 56 50"
                      fill="none"
                    >
                      <g filter="url(#filter0_d_1594_11143)">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M28.0605 0.013916C41.2937 0.013916 51.9873 10.7075 51.9873 24.0744C51.9873 31.1588 48.9129 37.575 44.1008 41.9861C40.8927 24.8764 15.2282 24.8764 12.0202 41.9861C7.07439 37.575 4 31.1588 4 24.0744C4 10.7075 14.6935 0.013916 28.0605 0.013916ZM28.0605 12.0441C32.6052 12.0441 36.348 15.7869 36.348 20.3316C36.348 24.8764 32.6052 28.6191 28.0605 28.6191C23.5157 28.6191 19.773 24.8764 19.773 20.3316C19.773 15.7869 23.5157 12.0441 28.0605 12.0441Z"
                          fill="white"
                          fill-opacity="0.8"
                          shape-rendering="crispEdges"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_d_1594_11143"
                          x="0"
                          y="0.013916"
                          width="55.9873"
                          height="49.9722"
                          filterUnits="userSpaceOnUse"
                          color-interpolation-filters="sRGB"
                        >
                          <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="4" />
                          <feGaussianBlur stdDeviation="2" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_1594_11143"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1594_11143"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                )}

                <div>
                  <div className="flex gap-1 items-center">
                    <h4 className="font-[500] text-[14px] truncate">
                      {post.user.nickname}
                    </h4>

                    {post?.type !== "ads" && post?.user?.level && (
                      <img
                        src={post?.user?.level}
                        alt=""
                        className="h-6 w-auto"
                      />
                    )}
                  </div>

                  {post?.type !== "ads" && post?.is_top === 1 && (
                    <div className="flex items-center gap-1">
                      <span className="pin">已置顶</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                      >
                        <path
                          d="M12.7754 6.14272L9.85753 3.22538C9.7861 3.15393 9.70129 3.09726 9.60795 3.05859C9.51461 3.01992 9.41457 3.00002 9.31353 3.00002C9.2125 3.00002 9.11246 3.01992 9.01912 3.05859C8.92578 3.09726 8.84097 3.15393 8.76954 3.22538L6.19114 5.81195C5.67864 5.65137 4.50843 5.45762 3.28726 6.44369C3.20309 6.51137 3.13411 6.59602 3.08483 6.69213C3.03554 6.78823 3.00704 6.89364 3.00119 7.00149C2.99534 7.10934 3.01227 7.21722 3.05087 7.31809C3.08947 7.41897 3.14889 7.51058 3.22524 7.58697L5.54835 9.90911L3.49736 11.9587C3.42519 12.0308 3.38464 12.1287 3.38464 12.2308C3.38464 12.3328 3.42519 12.4307 3.49736 12.5029C3.56953 12.5751 3.66741 12.6156 3.76948 12.6156C3.87154 12.6156 3.96943 12.5751 4.0416 12.5029L6.09114 10.4519L8.4128 12.7736C8.48417 12.8452 8.56898 12.9021 8.66237 12.941C8.75576 12.9798 8.85589 12.9999 8.95704 13C8.97531 13 8.9931 13 9.01137 13C9.12102 12.9924 9.22776 12.9613 9.32432 12.9088C9.42088 12.8563 9.50501 12.7836 9.57099 12.6957C10.5152 11.4409 10.4244 10.4207 10.2051 9.81104L12.7758 7.23072C12.8472 7.15925 12.9039 7.07442 12.9425 6.98106C12.9811 6.88771 13.001 6.78765 13.001 6.68662C13.0009 6.58559 12.981 6.48555 12.9423 6.39223C12.9035 6.29891 12.8468 6.21412 12.7754 6.14272ZM12.2311 6.68696L9.47772 9.44949C9.42086 9.50657 9.38335 9.58006 9.3705 9.65959C9.35765 9.73912 9.37009 9.82069 9.40608 9.89277C9.8609 10.8029 9.31954 11.7481 8.95704 12.2303L3.76948 7.04225C4.35025 6.57398 4.90603 6.45042 5.33104 6.45042C5.60071 6.44674 5.86817 6.49964 6.11614 6.60571C6.18848 6.64192 6.2704 6.65439 6.35024 6.64136C6.43008 6.62832 6.50378 6.59045 6.56086 6.53311L9.31377 3.76914L12.2311 6.68696Z"
                          fill="#555555"
                        />
                        <path
                          d="M12.2311 6.68696L9.47772 9.44949C9.42086 9.50657 9.38335 9.58006 9.3705 9.65959C9.35765 9.73912 9.37009 9.82069 9.40608 9.89277C9.8609 10.8029 9.31954 11.7481 8.95704 12.2303L3.76948 7.04225C4.35025 6.57398 4.90603 6.45042 5.33104 6.45042C5.60071 6.44674 5.86817 6.49964 6.11614 6.60571C6.18848 6.64192 6.2704 6.65439 6.35024 6.64136C6.43008 6.62832 6.50378 6.59045 6.56086 6.53311L9.31377 3.76914L12.2311 6.68696Z"
                          fill="#555555"
                        />
                      </svg>
                    </div>
                  )}
                  {post?.type === "ads" && (
                    <div className="flex items-center gap-1">
                      <span className="pin">
                        {post?.ads_info?.profile_text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {post?.type !== "ads" && (
                <button
                  onClick={() =>
                    handleFollowChange(post.user.id, followStatus[post.user.id])
                  }
                  className={`flex gap-2 follow_btn items-center ${
                    followStatus[post.user.id]
                      ? "border-[#F54100] border-[1px] text-[#F54100] bg-transparent"
                      : "bg-[#F54100]"
                  } rounded-[6px]`}
                >
                  {followStatus[post.user.id] ? (
                    <span className="text-sm">已关注</span>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="12"
                        viewBox="0 0 11 12"
                        fill="none"
                      >
                        <path
                          d="M5.92392 5.25532H9.40265C9.8198 5.25532 10.158 5.59349 10.158 6.01064C10.158 6.42779 9.8198 6.76596 9.40265 6.76596H5.92392V10.383C5.92392 10.806 5.58099 11.1489 5.15797 11.1489C4.73494 11.1489 4.39201 10.806 4.39201 10.383V6.76596H0.913287C0.496135 6.76596 0.157967 6.42779 0.157967 6.01064C0.157967 5.59349 0.496135 5.25532 0.913286 5.25532H4.39201V1.61702C4.39201 1.194 4.73494 0.851067 5.15797 0.851067C5.58099 0.851067 5.92392 1.194 5.92392 1.61702V5.25532Z"
                          fill="white"
                        />
                      </svg>
                      <span className="text-sm">关注</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="mb-2 px-4 social_des">{renderDescription(post)}</p>{" "}
            {post.file_type === "image" && (
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 px-4">
                {post.files.map((file: any, index: any) => (
                  <div
                    key={index}
                    className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md"
                    onClick={() => openLightbox(post.post_id, index)}
                  >
                    <ImageWithPlaceholder
                      src={file?.resourceURL}
                      alt={`Picture of social_image`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {lightboxStates[post.post_id]?.isOpen && (
                  <CustomLightbox
                    images={post.files}
                    isOpen={lightboxStates[post.post_id]?.isOpen}
                    onClose={() => closeLightbox(post.post_id)}
                    initialIndex={lightboxStates[post.post_id]?.currentIndex}
                  />
                )}
              </div>
            )}
            {post.file_type === "gif" && (
              <ImageWithPlaceholder1
                src={post.files[0]?.resourceURL}
                alt={`Picture of social_image`}
                className="w-full h-full object-cover"
              />
            )}
            {post.file_type === "video" && (
              <Player
                videoData={videoData}
                isCenterPlay={true}
                src={post?.files[0]?.resourceURL}
                thumbnail={post?.files[0].thumbnail}
                // status={false}
                status={post?.type === "ads" ? true : false}
              />
            )}
            {post.file_type === "audio" && (
              <AudioPlayer
                src={post?.files[0]?.resourceURL}
                index={index}
                setActivePlayer={setActivePlayer}
                activePlayer={activePlayer}
              />
            )}
            {post?.type === "post" || !post?.type ? (
              <div className="flex justify-between items-center px-4 py-3 text-[12px]">
                {showCreatedTime ? (
                  <div className="fixed top-0 left-0 flex h-screen items-center justify-center z-[1000] w-full">
                    <p className="text-[12px] text-white font-semibold bg-gradient-to-r from-background to-gray-800 px-3 py-1 rounded-md">
                      该功能还在开发中，敬请期待！
                    </p>
                  </div>
                ) : (
                  <></>
                )}

                <div>
                  <p className="text-gray-400 text-[12px]">{post?.create_time}</p>
                </div>

                <div className="flex gap-x-5  items-center justify-center">
                  <button
                    onClick={() =>
                      handleLikeChange(post.post_id, likeStatus[post.post_id])
                    }
                    className="flex -mt-[2px] items-center gap-x-2"
                  >
                    {likeStatus[post.post_id]?.liked ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="22"
                        viewBox="0 0 21 22"
                        fill="none"
                      >
                        <path
                          d="M4.2 9.098V18.698H1V9.098H4.2ZM7.4 18.698C6.97565 18.698 6.56869 18.5294 6.26863 18.2294C5.96857 17.9293 5.8 17.5223 5.8 17.098V9.098C5.8 8.658 5.976 8.258 6.272 7.97L11.536 2.698L12.384 3.546C12.6 3.762 12.736 4.058 12.736 4.386L12.712 4.642L11.952 8.298H17C17.4243 8.298 17.8313 8.46657 18.1314 8.76663C18.4314 9.06669 18.6 9.47365 18.6 9.898V11.498C18.6 11.706 18.56 11.898 18.488 12.082L16.072 17.722C15.832 18.298 15.264 18.698 14.6 18.698H7.4Z"
                          fill="#F54100"
                          stroke="#F54100"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="21"
                        viewBox="0 0 21 21"
                        fill="none"
                      >
                        <path
                          d="M4.2 8.79624V18.3962H1V8.79624H4.2ZM7.4 18.3962C6.97565 18.3962 6.56869 18.2277 6.26863 17.9276C5.96857 17.6276 5.8 17.2206 5.8 16.7962V8.79624C5.8 8.35624 5.976 7.95624 6.272 7.66824L11.536 2.39624L12.384 3.24424C12.6 3.46024 12.736 3.75624 12.736 4.08424L12.712 4.34024L11.952 7.99624H17C17.4243 7.99624 17.8313 8.16481 18.1314 8.46487C18.4314 8.76493 18.6 9.17189 18.6 9.59624V11.1962C18.6 11.4042 18.56 11.5962 18.488 11.7802L16.072 17.4202C15.832 17.9962 15.264 18.3962 14.6 18.3962H7.4Z"
                          stroke="white"
                        />
                      </svg>
                    )}{" "}
                    {likeStatus[post.post_id]?.count}
                  </button>

                  <button
                    onClick={() => handleShowDetail(post)}
                    // onClick={() => showCreatedTimeHandler()}
                    className="flex -mt-[2px] items-center gap-x-2"
                  >
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.23138 15.4075C3.00563 15.0242 2.85776 14.7672 2.78426 14.63C2.10331 13.3601 1.74795 11.941 1.75001 10.5C1.75001 5.66762 5.6676 1.75003 10.5 1.75003C15.3324 1.75003 19.25 5.66762 19.25 10.5C19.25 15.3324 15.3324 19.25 10.5 19.25C8.91718 19.2524 7.36362 18.8234 6.00623 18.0093C5.86948 17.9283 5.7324 17.8479 5.59498 17.768L3.45385 18.3521C2.96385 18.4855 2.51454 18.036 2.6482 17.5462L3.23138 15.4075ZM4.57057 15.4851L4.21663 16.7834L5.51491 16.4295C5.59892 16.4065 5.68665 16.4005 5.77299 16.4118C5.85933 16.4231 5.94256 16.4515 6.01782 16.4953C6.23951 16.6239 6.46067 16.7534 6.68129 16.8838C7.83476 17.5756 9.15499 17.9399 10.5 17.9375C14.6077 17.9375 17.9375 14.6077 17.9375 10.5C17.9375 6.39234 14.6077 3.06253 10.5 3.06253C6.39232 3.06253 3.06251 6.39234 3.06251 10.5C3.06251 11.7425 3.36701 12.9395 3.94079 14.0097C4.01692 14.1514 4.20592 14.4778 4.5021 14.9783C4.54686 15.0539 4.57598 15.1377 4.58774 15.2248C4.59951 15.3118 4.59367 15.4004 4.57057 15.4851ZM7.5646 14.0337C7.49715 13.979 7.44123 13.9114 7.40009 13.835C7.35894 13.7585 7.33339 13.6746 7.32491 13.5881C7.31643 13.5017 7.32519 13.4144 7.35069 13.3314C7.37618 13.2484 7.41791 13.1712 7.47344 13.1045C7.52897 13.0377 7.5972 12.9826 7.67419 12.9424C7.75117 12.9022 7.83537 12.8776 7.9219 12.8702C8.00844 12.8628 8.09559 12.8726 8.17829 12.8991C8.261 12.9256 8.33763 12.9683 8.40373 13.0246C8.9921 13.5149 9.73412 13.7828 10.5 13.7813C11.277 13.7813 12.0109 13.5111 12.5956 13.0248C12.6619 12.9697 12.7384 12.9282 12.8207 12.9027C12.903 12.8772 12.9895 12.8681 13.0754 12.876C13.1612 12.8839 13.2446 12.9086 13.3209 12.9488C13.3971 12.9889 13.4648 13.0437 13.5199 13.1099C13.575 13.1762 13.6165 13.2527 13.642 13.335C13.6675 13.4173 13.6766 13.5038 13.6687 13.5897C13.6608 13.6755 13.6361 13.7589 13.5959 13.8352C13.5558 13.9114 13.501 13.9791 13.4348 14.0342C12.6108 14.7202 11.5722 15.0952 10.5 15.0938C9.42756 15.0952 8.38866 14.7201 7.5646 14.0337Z"
                        fill="white"
                      />
                    </svg>{" "}
                    {post.comment_count}
                  </button>

                  <button
                    className="flex items-center gap-x-2"
                    onClick={handleShare}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                    >
                      <path
                        d="M17.2918 2.71541H13.0443C12.8491 2.71541 12.6819 2.78412 12.5441 2.92291C12.4768 2.9878 12.4236 3.06588 12.3878 3.15226C12.352 3.23863 12.3344 3.33146 12.3361 3.42494C12.3361 3.61961 12.4048 3.78589 12.5441 3.92422C12.6815 4.06301 12.8491 4.13218 13.0443 4.13218H15.5824L9.70869 10.0045C9.64197 10.0691 9.5894 10.1469 9.55432 10.233C9.51923 10.319 9.50239 10.4114 9.50485 10.5042C9.50485 10.7058 9.57219 10.8743 9.7064 11.0081C9.84061 11.1446 10.0096 11.2119 10.2126 11.2119C10.4118 11.2119 10.5795 11.1428 10.716 11.0058L16.5837 5.1335V7.67114C16.5837 7.86765 16.6524 8.03438 16.7912 8.17271C16.9295 8.31105 17.0963 8.38021 17.2918 8.38021C17.487 8.38021 17.6542 8.31151 17.792 8.17271C17.9308 8.03438 18 7.86765 18 7.67068V3.42448C18 3.23026 17.9313 3.06124 17.792 2.92291C17.7273 2.85596 17.6495 2.803 17.5635 2.76731C17.4774 2.73162 17.385 2.71396 17.2918 2.71541ZM9.4334 2.75434C8.48567 2.84687 7.56406 3.11575 6.71482 3.54587C5.00585 4.40599 3.67242 5.86397 2.9679 7.64274C2.60837 8.5532 2.4245 9.52352 2.42602 10.5024C2.42602 11.5601 2.63077 12.5701 3.03936 13.5329C3.41955 14.4435 3.97471 15.2699 4.7044 16.0096C5.44508 16.7407 6.27142 17.2945 7.18204 17.6751C8.14396 18.0837 9.15398 18.2889 10.2126 18.2889C11.1912 18.2904 12.1613 18.1062 13.0713 17.7461C13.9493 17.399 14.7571 16.8956 15.4555 16.2602C16.1603 15.618 16.7414 14.8519 17.17 14.0001C17.599 13.151 17.8671 12.2297 17.9606 11.2829C17.9789 11.0708 17.9194 10.889 17.7806 10.7333C17.7148 10.6585 17.6334 10.599 17.5422 10.5591C17.4509 10.5192 17.352 10.4999 17.2525 10.5024C17.072 10.5024 16.9144 10.5629 16.7797 10.6838C16.6441 10.8052 16.5681 10.9586 16.5498 11.1382C16.4752 11.9143 16.257 12.6698 15.9062 13.3662C15.556 14.0644 15.0783 14.691 14.4977 15.2135C13.9307 15.7376 13.2703 16.1506 12.5509 16.431C11.806 16.7239 11.0125 16.8737 10.2121 16.8726C9.34545 16.8726 8.51957 16.7059 7.734 16.3752C6.9892 16.0614 6.31264 15.6047 5.70434 15.0079C5.10704 14.4 4.65172 13.7253 4.33887 12.9787C4.00686 12.1955 3.83731 11.353 3.8405 10.5024C3.8405 9.6953 3.988 8.91477 4.28253 8.16172C4.56226 7.44208 4.97516 6.78163 5.49959 6.21497C6.55364 5.04562 8.00777 4.3139 9.57494 4.16425C9.75587 4.14501 9.90703 4.06943 10.0284 3.93293C10.1503 3.79917 10.2116 3.64114 10.2116 3.46158C10.2116 3.32096 10.1851 3.20187 10.131 3.10247C10.0832 3.00926 10.0094 2.93193 9.91848 2.87985C9.83904 2.83608 9.7544 2.80253 9.66655 2.77999C9.58929 2.76234 9.51035 2.75313 9.43111 2.75251L9.43294 2.75434H9.4334Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              post?.type === "ads" && (
                <div className="flex justify-between items-center px-4 py-3 text-[12px]">
                  <div className="flex items-center gap-2">
                    <div>
                      <img
                        src={post?.ads_info?.icon}
                        alt=""
                        width={36}
                        height={36}
                      />
                    </div>
                    <div>
                      <div className="flex flex-col">
                        <span className="ads-title">
                          {post?.ads_info?.title}
                        </span>
                        <span className="ads-description">
                          {post?.ads_info?.description}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      href={post?.ads_info?.jump_url}
                      className={`flex gap-2 px-2 py-1 items-center 
                    bg-[#F54100]
                rounded-[6px]`}
                    >
                      <span className="text-sm">
                        {post?.ads_info?.btn_text}
                      </span>
                    </a>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="flex bg-background justify-center items-center w-full py-5">
              <Loader />
            </div>
          }
          endMessage={
            <div className="flex bg-background justify-center items-center w-full py-5">
              <p style={{ textAlign: "center" }}>
                <b>快关注你喜欢的贴子吧！</b>
              </p>
            </div>
          }
        >
          <></>
        </InfiniteScroll>
      </>
      {/* )} */}
    </div>
  );
};

export default PostList;
