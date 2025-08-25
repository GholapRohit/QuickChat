import { createRoot } from "react-dom/client"; // React 18+ API to create and render app root
import "./index.css"; // Global styles for the application
import App from "./App.jsx"; // Main application component
import { BrowserRouter } from "react-router-dom"; // Enables client-side routing
import { AuthProvider } from "../context/AuthContext.jsx"; // Provides authentication state and functions to the app
import { ChatProvider } from "../context/ChatContext.jsx";

// Render the root React component inside the HTML element with id 'root'
createRoot(document.getElementById("root")).render(
  // Wrap the app in BrowserRouter for routing
  <BrowserRouter>
    {/* Wrap the app in AuthProvider to make auth state available globally */}
    <AuthProvider>
      <ChatProvider>
        <App /> {/* Main application entry point */}
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
);
