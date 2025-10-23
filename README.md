# StreamVault Frontend 🚀

**StreamVault** is a next-generation video streaming and social media frontend built with **React** and **Tailwind CSS**. It delivers a seamless, feature-rich user experience with an immersive dark theme, exceptional **responsiveness** across all screen sizes, and **real-time communication** powered by Socket.IO.

This application is designed to give both viewers and creators a platform for content discovery, social interaction, and powerful channel management.

---

## ✨ Features Spotlight

StreamVault is not just a video player; it's a complete ecosystem for content creation and social engagement.

### 💬 Real-Time Communication & Social
The core features are built around high-speed, reliable communication:

* **Fully Responsive:** The UI adjusts dynamically and scales elegantly across all devices, from mobile screens up to large desktop monitors.
* **Real-Time Chat:** Immediate, bi-directional messaging between users via **Socket.IO**. The chat interface includes live connection indicators and a clean, responsive layout.
* **Message Requests:** A controlled inbox for accepting or declining messages from new contacts before a chat is established, maintaining user privacy.
* **Conversations Management:** A dedicated page allows users to list, access, and manage all ongoing chats.
* **Social Feed (Tweets):** Users can post short-form content and view a personalized timeline populated by channels they subscribe to.

### 🎥 Content & Creator Tools
Empowering creators with necessary tools and robust content delivery.

* **Custom Video Player:** A highly interactive player featuring integrated controls for playback speed adjustment, seek, mobile orientation hints, and one-click fullscreen mode.
* **Video Upload Pipeline:** Seamless video and thumbnail uploading, using `multipart/form-data` and integrating with a backend/Cloudinary workflow for media storage.
* **Channel Analytics Dashboard:** Dedicated pages for creators to track channel performance metrics, including total views, subscriber count, and content performance ratios.
* **Profile Management:** Users can edit their personal profile information, upload a new avatar, and change their cover image.

### 📚 Discovery & User Library
Organized, personalized content access for every user.

* **Personalized Library:** A central hub showing recent watch history, liked videos, and custom playlists.
* **Playlists:** Full CRUD capability for video collections, with dedicated modals for creating and editing playlists.
* **Dynamic Feeds:** Responsive home feed utilizing a lazy-loading concept for an endless scrolling experience, and a dedicated **Trending** page sorted by video views.

---

## ⚙️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React & Vite** | Core UI library and modern build tooling. |
| **Styling** | **Tailwind CSS** | Utility-first framework ensuring high responsiveness and a dark theme aesthetic. |
| **State Mgt** | **Zustand** | Lightweight and performant state management for complex application state. |
| **Real-time** | **Socket.IO Client** | Reliable, real-time bi-directional events for chat. |
| **API Layer** | **Axios** | HTTP client with built-in token interceptors for authenticated API calls. |

---

## 🚀 Getting Started

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd StreamVault-Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a file named **`.env.local`** in the root directory. Configure the backend URL for API requests and Socket.IO connections.

    ```env
    # .env.local content
    
    # Base URL for REST API calls (must point to your StreamVault backend /api/v1 endpoint)
    VITE_API_BASE_URL="http://localhost:8000/api/v1"
    
    # Base URL for Socket.IO connection (used by src/socket.js)
    VITE_SERVER_URL="http://localhost:8000/" 
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

    The application will launch on your local machine.

---

## 📸 Screenshots & Visuals

To view the application's design, replace the placeholders below with high-resolution screenshots from your live demo.

### **Instructions for Adding Images**

1.  Create a folder named **`images`** in the root directory of your project.
    ```bash
    mkdir images
    ```
2.  Save your screenshots inside the `images` folder (e.g., `homepage.png`).
3.  Replace the `(images/filename.png)` placeholders below with the correct paths.

---

### 1. Home Feed & Responsive Layout

*A view of the immersive dark theme, responsive navigation, and content grid, emphasizing the application's visual appeal and ability to adapt to **any size of screen**.*

![Home Page Screenshot](images/homepage.png)

### 2. Real-Time Chat & Messaging

*Showcases the core chat feature, message bubbles, and the dedicated messages interface.*

| Conversations List | Dedicated Chat Window |
| :--- | :--- |
| **![Conversations List](images/conversations_list.png)** | **![Chat Window](images/chat_window.png)** |

### 3. Creator Dashboard & Analytics

*Highlights the visual, centralized statistics and creator tools.*

![Creator Dashboard Screenshot](images/creator_dashboard.png)

### 4. Video Playback & Interactivity

*The video detail page featuring the custom player, subscription status, and action buttons.*

![Video Detail Page Screenshot](images/video_detail.png)

### 5. Library & Playlists

*A view of the personalized library page, displaying lists of content and custom playlist cards.*

![Playlists Management Screenshot](images/playlists.png)

---
