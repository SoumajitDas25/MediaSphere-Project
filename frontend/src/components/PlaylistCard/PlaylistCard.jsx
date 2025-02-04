import React from 'react'
import { PlaylistIcon } from '../../assets/icons';
import { useNavigate } from 'react-router-dom';

const PlaylistCard = ({
    _id,
    thumbnail="",
    name="",
    videosCount=0,
    owner,
    createdAt="",
    updatedAt=""
}) => {

    const navigate = useNavigate();

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

    return (
        <div 
        className="bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light grid grid-flow-col grid-cols-5 grid-rows-5 rounded-lg overflow-hidden w-full" 
        onClick={()=>navigate(`/playlist/${_id}`)}
        >

            <div className="col-span-full row-span-3 relative overflow-hidden flex justify-center">
                {/* Playlist Thumbnail */}
                <img 
                src={thumbnail} 
                alt="Video Thumbnail" 
                className="rounded-lg z-5"
                />
                <div className="bg-light-btn1_color dark:bg-dark-bg_light text-light-bg_light font-semibold absolute z-10 left-0 bottom-0 w-full rounded-md px-2 py-4 text-[3.5vw] sm:text-[0.9rem] flex flex-row justify-between gap-4 
                bg-opacity-70 dark:bg-opacity-70  fill-transparent">
                    {/* Playlist icon*/}
                    <span className='flex flex-row gap-2'>
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

            {/* Video Info*/}
            <div className="col-span-full row-span-2 grid grid-cols-12 overflow-hidden p-2 gap-2">
                {/* avatar */}
                <div className="col-span-2 overflow-hidden flex justify-center items-start">
                    {
                        owner && owner.avatar?
                        <img 
                        src={owner.avatar} 
                        alt="Video Thumbnail" 
                        className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
                        />
                        :
                        <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
                            <NoAvatarIcon/>
                        </span>    
                    }
                    
                </div>
                {/* info */}
                <div className="col-span-10 grid grid-rows-2 gap-2">
                    {/* title */}
                    <h3 className="row-span-1 font-semibold text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem] overflow-hidden">
                        {name}
                    </h3>

                    <div className="row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark text-[3.75vw] sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem] flex flex-col justify-center">
                        {/* Channel Name */}
                        <h3>
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
    )
}

export default PlaylistCard