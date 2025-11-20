import { useState } from 'react'
import { PlaylistIcon } from '../../assets/icons';
import {Button} from "..";
import {playlistAPI} from '../../api'

const PlaylistCard2 = ({
    videoId=null,
    data,
    viewType = "Grid",
    extraElements
}) => {

    const {
        _id,
        thumbnail="",
        name="",
        videosCount=0,
        owner,
        createdAt="",
        updatedAt="",
        isVideoPresent=false
    } = data;

    const [isVideoAdded,setIsVideoAdded] = useState(isVideoPresent);
    const [isButtonLoading,setIsButtonLoading] = useState(false);

    const {addVideoToPlaylist,removeVideoFromPlaylist} = playlistAPI;

    // Function to calculate time difference
    function timeSince(date) 
    {
        const isoDate = new Date(date.toISOString());
        const now = new Date();

        const secondsPast = Math.abs(Math.floor((now - isoDate) / 1000));

        if (secondsPast < 60) {
            return `${secondsPast} ${secondsPast==1?'second':'seconds'} ago`;
        }
        if (secondsPast < 3600) {
            const minutes = Math.floor(secondsPast / 60);
            return `${minutes} ${minutes==1?'minute':'minutes'} ago`;
        }
        if (secondsPast < 86400) {
            const hours = Math.floor(secondsPast / 3600);
            return `${hours} ${hours==1?'hour':'hours'} ago`;
        }
        if (secondsPast < 604800) {
            const days = Math.floor(secondsPast / 86400);
            return `${days} ${days==1?'day':'days'} ago`;
        }
        if (secondsPast < 2592000) {
            const weeks = Math.floor(secondsPast / 604800);
            return `${weeks} ${weeks==1?'week':'weeks'} ago`;
        }
        if (secondsPast < 31536000) {
            const months = Math.floor(secondsPast / 2592000);
            return `${months} ${months==1?'month':'months'} ago`;
        }
        const years = Math.floor(secondsPast / 31536000);
        return `${years} ${years==1?'year':'years'} ago`;
    }

    const buttonHandler = async () =>{
        try
        {
            setIsButtonLoading(true);
            let response;
            if(isVideoAdded)
            {
                response = await removeVideoFromPlaylist(videoId,_id);
                setIsVideoAdded(false);
            }
            else
            {
                response = await addVideoToPlaylist(videoId,_id);
                setIsVideoAdded(true);
            } 
            console.log(response.data);
        }
        catch(err)
        {
            console.log(err);
        }
        finally 
        {
            setIsButtonLoading(false);
        }
    }

    return (
        <div className={`w-full relative transform transition-transform duration-300 shadow-custom shadow-light-btn1_color rounded-lg`}>
            
            {/* <input 
            type="checkbox" 
            className='absolute top-1/2 -translate-y-1/2 right-4 md:top-4 md:left-4 md:translate-y-0 z-40 h-8 w-8 scale-200 accent-color-yellow'
            checked={isVideoAdded}
            readOnly
            /> */}
            {
                isVideoAdded && <span className='absolute  bottom-2 left-4 md:top-4 md:bottom-auto z-40 bg-color-yellow text-light-font_color_dark text-[4vw] sm:text-[1rem] px-4 py-2 rounded-2xl font-semibold shadow-custom shadow-dark-btn1_color dark:shadow-light-btn1_color'>Added</span>
            }

            <div 
            className={`w-full md:aspect-1`} 
            >
                {/* <div className='bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light grid grid-flow-col grid-cols-5 grid-rows-5 rounded-lg overflow-hidden w-full'> */}
                <div 
                className={`bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light flex  ${viewType==='Grid'?'flex-row h-[25vw] sm:h-[18vw] md:flex-col md:h-full':'flex-row h-[25vw] sm:h-[18vw] lg:h-[10vw] max-h-[150px]'} gap-2 rounded-lg overflow-hidden w-full ${isVideoAdded?'opacity-60':'opacity-100'}`} 
                >

                    {/* <div className={`${viewType==='Grid'?'col-span-3 row-span-full md:col-span-full md:row-span-3':'col-span-full row-span-3'} relative overflow-hidden flex justify-center`}> */}
                    <div className={`${viewType==='Grid'?'h-full md:w-full md:h-auto':'h-full'} relative overflow-hidden`}>

                        {/* Playlist Thumbnail */}
                        {/* <img 
                        src={thumbnail} 
                        alt="Playlist Thumbnail" 
                        className="rounded-lg z-5"
                        /> */}
                        <img className={`aspect-[8/5]  ${viewType==='Grid'?'h-full md:w-full':'h-full'} rounded-lg z-5`} src={thumbnail} alt="Playlist Thumbnail" />

                        <div className="bg-light-btn1_color dark:bg-dark-bg_light text-light-bg_light font-semibold absolute z-10 left-0 bottom-0 w-full rounded-md px-2 py-4 text-[3vw] sm:text-[0.9rem] flex flex-row justify-between gap-2 md:gap-4 
                        bg-opacity-70 dark:bg-opacity-70  fill-transparent">
                            {/* Playlist icon*/}
                            <span className='flex flex-row gap-1 md:gap-2'>
                                <span className='text-[1.5rem]'>
                                    <PlaylistIcon/>
                                </span>
                                Playlist
                            </span>
                            {/* Videos Count */}
                            <span>
                                {`${videosCount} videos`}
                            </span>
                        </div>
                    </div>

                    {/* Playlist Info*/}
                    {/* <div className="col-span-full row-span-2 grid grid-cols-12 overflow-hidden p-2 gap-2"> */}
                    <div className={`${viewType==='Grid'?'w-full':''} grid grid-cols-12 overflow-hidden p-2 gap-2 flex-1`}>
                        {/* avatar */}
                        {/* <div className="col-span-2 overflow-hidden flex justify-center items-start cursor-pointer" 
                        >
                            {
                                owner && owner.avatar?
                                <img 
                                src={owner.avatar} 
                                alt="Playlist Thumbnail" 
                                className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
                                />
                                :
                                <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
                                    <NoAvatarIcon/>
                                </span>    
                            }
                            
                        </div> */}
                        {
                            viewType==='Grid' && (<div className={`hidden  md:col-span-2 md:overflow-hidden md:flex md:justify-center md:items-start md:cursor-pointer`}>
                            {
                                owner && owner.avatar?
                                <img 
                                src={owner.avatar} 
                                alt="Playlist Thumbnail" 
                                className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
                                />
                                :
                                <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
                                    <NoAvatarIcon/>
                                </span>    
                            }                                  
                            </div>)
                        }
                        {/* info */}
                        {/* <div className="col-span-10 grid grid-rows-2 gap-2"> */}
                        <div className={`${viewType==='Grid'?'col-span-10':'col-span-full'} grid grid-rows-2 gap-1 lg:gap-2`}>
                            {/* title */}
                            {/* <h3 className="row-span-1 font-semibold text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem] overflow-hidden">
                                {name}
                            </h3> */}
                            <h3 className={`row-span-1 font-semibold ${viewType==='Grid'?'text-[3.4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem]':'text-[3.2vw] sm:text-[0.75rem] md:text-[1rem]'} overflow-hidden`}>
                                {name}
                            </h3>

                            {/* <div className="row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark text-[3.75vw] sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem] flex flex-col justify-center"> */}
                            <div className={`row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark ${viewType==='Grid'?'text-[3vw]  sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem]':'text-[2.5vw] sm:text-[0.6rem] md:text-[0.75rem] xl:text-[0.85rem]'} flex flex-col justify-center`}>
                                {/* Channel Name */}
                                <h3 className='hidden md:block cursor-pointer'>
                                    {owner && owner.channelName}
                                </h3>
                                {/* timestamp */}
                                <h3 className='flex gap-4'>                     
                                {
                                    createdAt===updatedAt?
                                    `${timeSince(new Date(createdAt))}`:`${timeSince(new Date(updatedAt))} (edited)`
                                }
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='px-4 py-2 grid grid-cols-6 border-t'>
                <Button 
                className='col-start-5 col-span-2 md:col-start-4 md:col-span-3' 
                onClick={buttonHandler}
                isLoading={isButtonLoading}
                >
                    {isVideoAdded?'Remove':'Add'}
                </Button>
            </div>
        </div>
    )
}

export default PlaylistCard2;