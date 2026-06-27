import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
    const { socket, authUser } = useContext(AuthContext);

    const [callState, setCallState] = useState("idle"); // idle, calling, incoming, connected
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callInfo, setCallInfo] = useState({ id: "", name: "" }); // caller or receiver details
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);

    const peerConnection = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pendingCandidates = useRef([]);

    // WebRTC STUN configurations
    const rtcConfig = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

    // Clean up streams and peer connection
    const resetCallState = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setCallState("idle");
        setCallInfo({ id: "", name: "" });
        pendingCandidates.current = [];
        setIsVideoMuted(false);
        setIsAudioMuted(false);
    };

    // Initialize Local Media Stream
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            toast.error("Camera and Microphone permissions are required to call.");
            console.error("Local media error:", err);
            return null;
        }
    };

    // Initialize RTCPeerConnection
    const createPeerConnection = (targetUserId, stream) => {
        const pc = new RTCPeerConnection(rtcConfig);
        peerConnection.current = pc;

        // Add local tracks
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // ICE candidate handler
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("iceCandidate", { to: targetUserId, candidate: event.candidate });
            }
        };

        // Remote stream track handler
        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        return pc;
    };

    // 1. Start a call
    const callUser = async (targetUserId, targetUserName) => {
        const stream = await startLocalStream();
        if (!stream) return;

        setCallState("calling");
        setCallInfo({ id: targetUserId, name: targetUserName });

        const pc = createPeerConnection(targetUserId, stream);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (socket) {
                socket.emit("callUser", {
                    userToCall: targetUserId,
                    signalData: offer,
                    from: authUser._id,
                    name: authUser.fullName
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate call offer.");
            resetCallState();
        }
    };

    // 2. Answer incoming call
    const answerCall = async () => {
        if (callState !== "incoming") return;

        const stream = await startLocalStream();
        if (!stream) {
            rejectCall();
            return;
        }

        setCallState("connected");
        const pc = createPeerConnection(callInfo.id, stream);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(callInfo.signal));
            
            // Add any pending candidates gathered before answering
            while (pendingCandidates.current.length > 0) {
                const candidate = pendingCandidates.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (socket) {
                socket.emit("answerCall", { to: callInfo.id, signal: answer });
            }
        } catch (err) {
            console.error(err);
            toast.error("Error connecting the call.");
            resetCallState();
        }
    };

    // 3. Reject / Cancel call
    const rejectCall = () => {
        if (socket && callInfo.id) {
            socket.emit("endCall", { to: callInfo.id });
        }
        resetCallState();
    };

    // 4. Mute / Toggle settings
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoMuted(!videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    // Setup Socket Listeners
    useEffect(() => {
        if (!socket) return;

        // Incoming call listener
        socket.on("callUser", ({ signal, from, name }) => {
            setCallState("incoming");
            setCallInfo({ id: from, name, signal });
        });

        // Call accepted listener
        socket.on("callAccepted", async (signal) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                    setCallState("connected");
                } catch (err) {
                    console.error("Accept description error:", err);
                }
            }
        });

        // ICE candidate listener
        socket.on("iceCandidate", async (candidate) => {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Add candidate error:", err);
                }
            } else {
                pendingCandidates.current.push(candidate);
            }
        });

        // Call ended listener
        socket.on("callEnded", () => {
            toast("Call ended.");
            resetCallState();
        });

        return () => {
            socket.off("callUser");
            socket.off("callAccepted");
            socket.off("iceCandidate");
            socket.off("callEnded");
        };
    }, [socket, localStream]);

    // Bind local video element stream object updates
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Bind remote video element stream object updates
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <CallContext.Provider value={{
            callState,
            callInfo,
            localStream,
            remoteStream,
            localVideoRef,
            remoteVideoRef,
            isVideoMuted,
            isAudioMuted,
            callUser,
            answerCall,
            rejectCall,
            toggleVideo,
            toggleAudio
        }}>
            {children}
        </CallContext.Provider>
    );
};
