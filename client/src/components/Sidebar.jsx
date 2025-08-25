import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // state for menu toggle

  useEffect(() => {
    getUsers();
  }, [onlineUsers, unseenMessages]);

  return (
    <div
      className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        {/* Logo and Menu */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <img src={assets.logo} alt="logo" className="max-w-40" />
          {/* Menu button */}
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)} // toggle on click
            />
            {menuOpen && (
              <div className="absolute top-full right-0 w-32 z-20 p-5 rounded-md bg-[#282142] border border-gray-600">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false); // close after click
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  onClick={() => {
                    logout();
                    setMenuOpen(false); // close after click
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Search Bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>
      {/* User List */}
      <div className="flex flex-col">
        {filteredUsers.map((user, index) => {
          return (
            <div
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
              }}
              key={index}
              className={`relative flex flex-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
                selectedUser?._id === user._id && "bg-[#282142]/60"
              }`}
            >
              {/* User avatar */}
              <img
                src={user?.profilePicture || assets.avatar_icon}
                alt="user avatar"
                className="w-[35px] aspect-square rounded-full"
              />
              {/* User status */}
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral text-xs">Offline</span>
                )}
              </div>
              {/* Number of messages received */}
              {unseenMessages[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
