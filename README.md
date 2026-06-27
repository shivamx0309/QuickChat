# QuickChat - Full-Stack Real-Time Chat & Video Calling Application

QuickChat is a modern, premium full-stack real-time chat application featuring built-in 1-on-1 audio/video calling and media sharing. Built using the **MERN Stack** (MongoDB, Express, React, Node.js), it utilizes **Socket.io** for real-time messaging updates and **WebRTC** for secure, serverless peer-to-peer video streams.

## Live Demo & Repository
* **Frontend Web App**: [https://client-five-mu-41.vercel.app](https://client-five-mu-41.vercel.app)
* **Backend Server API**: [https://server-tau-rosy.vercel.app](https://server-tau-rosy.vercel.app)

---

## Key Features

1. **WebRTC Video Calling**:
   * Initiate high-quality 1-on-1 video calls with online users.
   * Leverages Socket.io signaling to establish peer connections.
   * Premium glassmorphism HUD interface with mic/camera toggle controls and picture-in-picture local view.
2. **Real-Time Messaging**:
   * Dynamic instant messaging using bidirectional WebSocket connections (Socket.io).
   * Typing indicators and online/offline status highlights.
3. **Media Sharing**:
   * Send photos directly inside the chat window.
   * Secure, optimized image uploads managed via **Cloudinary API**.
4. **Secure Authentication**:
   * Stateful user accounts powered by JSON Web Tokens (JWT).
   * Password encryption via bcryptjs.
5. **Modern Glassmorphic UI**:
   * Fully responsive interface crafted using Tailwind CSS and custom glass overlays.

---

## Architecture & Tech Stack
* **Frontend**: React.js, Tailwind CSS, React Router DOM, Socket.io-Client, Context API.
* **Backend**: Node.js, Express.js, Socket.io, mongoose.
* **Database**: MongoDB Atlas.
* **Media Cloud**: Cloudinary API.
* **Real-time Call Engine**: WebRTC (RTCPeerConnection with Google STUN).

---

## Setup & Local Installation

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your system.

### 1. Environment Configurations

#### Backend Environment (`server/.env`)
Create a `.env` file inside the `server/` directory and configure the following variables:
```env
PORT=5000
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Frontend Environment (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 2. Run the Application

#### Start Backend Server
```bash
cd server
npm install
npm run server
```

#### Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) or the displayed port in your browser to interact with the application.
