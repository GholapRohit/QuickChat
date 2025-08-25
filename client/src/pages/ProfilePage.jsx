import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import AuthContext from "../../context/authContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      // If no new image is chosen -> update only name and bio
      await updateProfile({ fullName: name, bio });
    } else {
      // If new image selected -> convert to Base64 string and update
      const render = new FileReader();
      render.readAsDataURL(selectedImg);
      render.onload = async () => {
        const base64Image = render.result;
        await updateProfile({
          profilePicture: base64Image,
          fullName: name,
          bio,
        });
      };
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-lg text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        {/* left */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-2xl text-white">Profile Details</h3>
          {/* Upload profile image */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer border border-gray-700 p-2 rounded-md bg-gray-500/10"
          >
            <input
              onChange={(e) => {
                setSelectedImg(e.target.files[0]);
              }}
              type="file"
              name="profile-pic"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
            />
            Upload Profile Picture
          </label>
          {/* name */}
          <input
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* bio */}
          <textarea
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a short bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          {/* save button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save Changes
          </button>
        </form>
        {/* right */}
        <img
          className={`max-w-44 aspect-square mx-10 max-sm:mt-10 ${
            authUser.profilePicture ? "rounded-full" : ""
          }`}
          src={authUser.profilePicture || assets.logo_icon}
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfilePage;
