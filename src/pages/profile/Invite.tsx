import { useDispatch, useSelector } from "react-redux";
import "./profile.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useCreateInviteMutation,
  useLazyGetUserQuery,
} from "../profile/services/profileApi"; // import the hook
import { showToast } from "./error/ErrorSlice";
import { setUser } from "./components/slice/UserSlice";

const Invite = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [active, setActive] = useState(false);
  const [createInvite, { isLoading, isError, isSuccess }] =
    useCreateInviteMutation(); // use the mutation hook
  const [triggerUser] = useLazyGetUserQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createInvite({ invite_code: text }).unwrap();
      const users = await triggerUser().unwrap();

      if (users?.data) {
        const {
          id,
          username,
          nickname,
          avatar,
          level,
          integral,
          email,
          phone,
          active,
          social_accounts,
          inviter_id,
          invite_code,
          invite_user_num,
        } = users.data;

        dispatch(
          setUser({
            id,
            username,
            nickname,
            avatar,
            level,
            integral,
            social_accounts,
            email,
            phone,
            active,
            inviter_id,
            invite_code,
            invite_user_num,
          })
        );
      }
      dispatch(
        showToast({
          message: "Invited!",
          type: "success",
        })
      );
      navigate("/profile");
    } catch (error) {
      dispatch(
        showToast({
          message: (error as any)?.data?.msg || "修改昵称失败",
          type: "error",
        })
      );
    }
  };

  useEffect(() => {
    if (text) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [text]);

  const handleRemove = () => {
    setText("");
  };

  return (
    <div>
      <div className="fixed-bg"></div>
      <div>
        <div className="flex fixed top-0 w-full z-10 bg-[#161619] justify-between items-center p-5">
          <Link to="/profile">
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
          </Link>
          <div className="history-title">填写邀请码</div>
          <div className="edit-title cursor-pointer"></div>{" "}
          {/* Trigger form submit */}
        </div>
        <div className="mt-[80px] p-4 relative">
          <form onSubmit={handleSubmit} className="w-full">
            <input
              type="text"
              className="new-input"
              placeholder="请输入邀请码"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading} // Disable input during submission
            />
            <button
              className={`submit_btn`}
              style={{
                background: active ? "#F54100" : "rgba(255, 255, 255, 0.04)",
                color: active ? "white" : "rgba(255, 255, 255, 0.20)",
              }}
            >
              保存
            </button>
          </form>
          <button className="close-btn-input" onClick={handleRemove}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M5 3.88906L8.88906 0L10 1.11094L6.11094 5L10 8.88906L8.88906 10L5 6.11094L1.11094 10L0 8.88906L3.88906 5L0 1.11094L1.11094 0L5 3.88906Z"
                fill="white"
                fill-opacity="0.8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invite;