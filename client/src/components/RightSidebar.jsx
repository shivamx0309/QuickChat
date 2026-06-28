import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const RightSidebar = () => {

    const {selectedUser, messages} = useContext(ChatContext)
    const {logout, onlineUsers} = useContext(AuthContext)
    const [msgImages, setMsgImages] = useState([])

    // Get all the images from the messages and set them to state
    useEffect(()=>{
        setMsgImages(
            messages.filter(msg => msg.image).map(msg=>msg.image)
        )
    },[messages])

  return selectedUser && (
    <div className={`bg-[#1e1f2c]/60 backdrop-blur-md border-l border-zinc-800 text-white w-full relative flex flex-col h-full ${selectedUser ? "max-md:hidden" : ""}`}>

        {/* User Info Header */}
        <div className='pt-12 pb-6 flex flex-col items-center gap-3 text-xs font-light text-center px-4'>
            <div className="relative">
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                     className='w-24 h-24 rounded-full border-2 border-indigo-500/30 object-cover shadow-lg' />
                {onlineUsers.includes(selectedUser._id) && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#1e1f2c] animate-pulse"></span>
                )}
            </div>
            <div>
                <h1 className='text-lg font-semibold tracking-wide text-zinc-100'>
                    {selectedUser.fullName}
                </h1>
                <p className='text-zinc-400 text-xs mt-1 italic max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap'>
                    {selectedUser.bio || "No bio updated"}
                </p>
            </div>
        </div>

        <hr className="border-zinc-800 mx-5 my-2"/>

        {/* Shared Media Gallery */}
        <div className="px-5 py-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-3">
                <span className="uppercase tracking-wider">Shared Media</span>
                <span className="bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full font-bold">
                    {msgImages.length} {msgImages.length === 1 ? 'file' : 'files'}
                </span>
            </div>

            {msgImages.length > 0 ? (
                <div className='flex-1 overflow-y-auto pr-1 grid grid-cols-3 gap-2 align-content-start scrollbar-thin scrollbar-thumb-zinc-800'>
                    {msgImages.map((url, index)=>(
                        <div 
                            key={index} 
                            onClick={()=> window.open(url)} 
                            className='group cursor-pointer aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative hover:border-indigo-500/50 transition-all'
                        >
                            <img src={url} alt="" className='w-full h-full object-cover group-hover:scale-110 transition-all duration-300'/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                <i className="fa-solid fa-expand text-white text-sm"></i>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 px-4">
                    <i className="fa-regular fa-image text-3xl mb-2 text-zinc-500"></i>
                    <p className="text-xs">No media shared yet</p>
                </div>
            )}
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-zinc-850">
            <button 
                onClick={()=> logout()} 
                className='w-full py-2.5 bg-zinc-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 border border-transparent rounded-xl text-xs font-medium tracking-wide transition-all shadow-md cursor-pointer'
            >
                <i className="fa-solid fa-right-from-bracket mr-2"></i> Logout
            </button>
        </div>
    </div>
  )
}

export default RightSidebar
