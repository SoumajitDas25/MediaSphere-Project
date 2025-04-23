import React, { useRef, useState } from 'react'
import {BgFreezer,CreateTweetModal,UploadVideoModal} from "../"
import { PlusIcon,CreateTweetIcon,VideoUploadIcon } from '../../assets/icons'

const PublishButton = () => {

    const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);
    const [isVideoOptionClicked,setIsVideoOptionClicked] = useState(false);
    const [isTweetOptionClicked,setIsTweetOptionClicked] = useState(false);
    // const optionMenuRef = useRef(null);

  return (
    <>
        {isOptionMenuOpen && (<BgFreezer/>)}

        {/* Create Tweet Modal */}
        {isTweetOptionClicked && (
            <CreateTweetModal 
            setIsModalOpened={setIsTweetOptionClicked}
            />
        )}

        {/* Upload Video Modal */}
        {isVideoOptionClicked && (
            <UploadVideoModal 
            setIsModalOpened={setIsVideoOptionClicked}
            />
        )}

        
        <div className='fixed right-[2rem] bottom-[2rem] z-[60] transition-all'>
            {/* Publish Button */}
            <button
            onClick={() => setIsOptionMenuOpen(!isOptionMenuOpen)}
            className="rounded-full bg-color-yellow text-black text-[2.5rem] md:text-[3rem] p-2"
            >
                <div className={`${isOptionMenuOpen?'rotate-45':''} transition-all`}>
                    <PlusIcon/>
                </div>
            </button>
        
            {/* Option Menu */}
            {isOptionMenuOpen && (
                <div className="absolute w-48 bottom-16 right-0 p-3 rounded-lg shadow-lg  bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_dark">
                    <button 
                    className="flex w-full gap-2 py-2 px-3 hover:bg-color-yellow hover:text-dark-bg_light rounded" 
                    onClick={()=>{
                        setIsTweetOptionClicked(!isTweetOptionClicked);
                        setIsOptionMenuOpen(!isOptionMenuOpen);
                    }}
                    >
                        <div className="text-[1.5rem]">
                            <CreateTweetIcon/>
                        </div>
                        Create Tweet
                    </button>
                    <button 
                    className="flex w-full gap-2 py-2 px-3 hover:bg-color-yellow hover:text-dark-bg_light rounded mt-2" 
                    onClick={()=>{
                        setIsVideoOptionClicked(!isVideoOptionClicked);
                        setIsOptionMenuOpen(!isOptionMenuOpen);
                    }}
                    >
                        <div className="text-[1.5rem]">
                            <VideoUploadIcon/>
                        </div>
                        Upload Video
                    </button>
                </div>          
            )}
        </div>
    </>
    
  )
}

export default PublishButton