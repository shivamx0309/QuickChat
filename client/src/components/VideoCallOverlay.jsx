import { useContext } from "react";
import { CallContext } from "../../context/CallContext";

const VideoCallOverlay = () => {
    const {
        callState,
        callInfo,
        localVideoRef,
        remoteVideoRef,
        isVideoMuted,
        isAudioMuted,
        answerCall,
        rejectCall,
        toggleVideo,
        toggleAudio
    } = useContext(CallContext);

    if (callState === "idle") return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 text-white">
            
            {/* 1. CALLING STATE (Outbound) */}
            {callState === "calling" && (
                <div className="flex flex-col items-center gap-6 p-8 bg-zinc-900/90 border border-zinc-700/50 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 animate-pulse">
                        <i className="fa-solid fa-phone-volume text-4xl text-indigo-400"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-wide">Calling</h2>
                        <p className="text-zinc-400 mt-1">{callInfo.name || "User"}</p>
                    </div>
                    <button 
                        onClick={rejectCall}
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-lg shadow-red-600/30"
                    >
                        <i className="fa-solid fa-phone-slash text-xl"></i>
                    </button>
                </div>
            )}

            {/* 2. INCOMING CALL STATE (Inbound) */}
            {callState === "incoming" && (
                <div className="flex flex-col items-center gap-6 p-8 bg-zinc-900/90 border border-zinc-700/50 rounded-2xl max-w-sm w-full text-center shadow-2xl animate-bounce-short">
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
                        <i className="fa-solid fa-video text-4xl text-emerald-400"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-wide">Incoming Call</h2>
                        <p className="text-zinc-400 mt-1">{callInfo.name || "User"}</p>
                    </div>
                    <div className="flex gap-6 w-full mt-2">
                        <button 
                            onClick={rejectCall}
                            className="flex-1 py-3 px-6 rounded-full bg-red-600 hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20"
                        >
                            <i className="fa-solid fa-phone-slash"></i> Decline
                        </button>
                        <button 
                            onClick={answerCall}
                            className="flex-1 py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                        >
                            <i className="fa-solid fa-phone"></i> Accept
                        </button>
                    </div>
                </div>
            )}

            {/* 3. CONNECTED STATE (Active Call) */}
            {callState === "connected" && (
                <div className="relative w-full max-w-4xl aspect-video bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    
                    {/* Remote Stream Frame (Big View) */}
                    <div className="absolute inset-0 w-full h-full bg-zinc-900">
                        <video 
                            ref={remoteVideoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        {!remoteVideoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                                <p className="text-zinc-500 text-sm">Connecting video stream...</p>
                            </div>
                        )}
                    </div>

                    {/* Local Stream Frame (Picture in Picture Float) */}
                    <div className="absolute top-4 right-4 w-40 sm:w-52 aspect-video bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden shadow-xl z-20">
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                    </div>

                    {/* Bottom Floating Call HUD Controls */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6 px-6 py-4 bg-zinc-900/85 backdrop-blur-md border border-zinc-800/80 rounded-full shadow-2xl z-30">
                        {/* Audio Toggle */}
                        <button 
                            onClick={toggleAudio}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                            title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                            <i className={`fa-solid ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                        </button>

                        {/* Video Toggle */}
                        <button 
                            onClick={toggleVideo}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                            title={isVideoMuted ? "Enable Camera" : "Disable Camera"}
                        >
                            <i className={`fa-solid ${isVideoMuted ? 'fa-video-slash' : 'fa-video'}`}></i>
                        </button>

                        {/* End Call Button */}
                        <button 
                            onClick={rejectCall}
                            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-md shadow-red-600/30"
                            title="End Call"
                        >
                            <i className="fa-solid fa-phone-slash text-xl"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCallOverlay;
