import React from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  isEditMode: boolean;
  onEditClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isEditMode, onEditClick }) => {
  return (
    <div className="flex fixed top-0 w-full z-10 bg-[#161619] justify-between items-center p-2 pr-5">
      <Link to="/profile" className="back-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M7.828 11H20V13H7.828L13.192 18.364L11.778 19.778L4 12L11.778 4.22198L13.192 5.63598L7.828 11Z"
            fill="white"
          />
        </svg>
      </Link>
      <div className="history-title pr-4">观看历史</div>
      <div className="edit-title" onClick={onEditClick}>
        {isEditMode ? "取消" : "编辑"}
      </div>
    </div>
  );
};

export default Navbar;
