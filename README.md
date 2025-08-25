# QuickChat - Chat anytime, anywhere

## Brief Overview

QuickChat is a full-stack real-time chat application that enables users to communicate instantly through text and images. It supports _one-to-one messaging_, _online/offline user status_, _message delivery with seen/unseen states_, and _profile customization_.

The application has:

- **Frontend**: Built with React (context API for global state, socket.io-client for live updates).
- **Backend**: Built with Node.js + Express, connected to MongoDB, powered by Socket.IO for real-time communication.
- **Authentication**: JWT-based login/signup with secure password hashing.
- **Media Support**: Image uploads handled via Cloudinary.

## Technologies Used

### Frontend (React)

1. **React.js** – Component-based UI library.
2. **Context API** – Global state management (`AuthContext`, `ChatContext`).
3. **Axios** – HTTP client for API communication.
4. **Socket.IO Client** – Real-time bidirectional communication with backend.
5. **TailwindCSS** – Utility-first CSS framework for styling.
6. **React Hot Toast** – Toast notifications for feedback.

### Backend (Node.js + Express)

1. **Node.js** – Runtime environment for server-side logic.
2. **Express.js** – Web framework for API routing.
3. **MongoDB + Mongoose** – Database for persisting users and messages.
4. **Socket.IO** – Real-time communication for online users and new messages.
5. **bcryptjs** – Password hashing.
6. **jsonwebtoken (JWT)** – Authentication via tokens.
7. **Cloudinary** – Media storage for profile pictures and chat images.
8. **dotenv** – Secure environment variable management.
9. **CORS** – Cross-origin support for frontend-backend communication.
