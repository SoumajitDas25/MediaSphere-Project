import React from 'react'
import { NoAvatarIcon } from '../../assets/icons';
import { useNavigate } from 'react-router-dom';

const VideoCard = (
    {
        _id,
        thumbnail="",
        title="",
        viewsCount=0,
        owner,
        duration='0:00',
        createdAt=""
    }
) => {

    const navigate = useNavigate();

    // Function to calculate time difference
    const timeSince = (date)=> {

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

    //function to compute duration in hh:mm:ss format
    const computeDuration = (duration)=> {

        if (duration < 60) 
        {
            if(duration<10)
                duration = '0'+String(duration);
            return `00:${duration}`;
        }
        if (duration < 3600) 
        {
            let minutes = Math.floor(duration / 60);
            let seconds = duration % 60;
            if(seconds<10)
                seconds = '0'+String(seconds);
            return `${minutes}:${seconds}`;
        }
        else
        {
            let hours = Math.floor(duration / 3600);
            let minutes = Math.floor(duration % 3600);
            if(minutes < 10)
                minutes = '0'+String(minutes);
            let seconds = minutes % 60;
            if(seconds < 10)
                seconds = '0'+String(seconds);
            return `${hours}:${minutes}:${seconds}`;
        }
    }

    
  return (
    <div 
    className="bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light grid grid-flow-col grid-cols-5 grid-rows-5 rounded-lg overflow-hidden w-full" 
    onClick={()=>navigate('/video')}>

        {/* Video Thumbnail */}
        <div className="col-span-full row-span-3 relative overflow-hidden flex justify-center">
            <img 
            src={thumbnail} 
            alt="Video Thumbnail" 
            className="rounded-lg z-5"
            />
            <div className="bg-black text-white absolute z-10 right-2 bottom-[5%] rounded-md px-2 text-[3.5vw] sm:text-[0.9rem]">{computeDuration(duration)}</div>
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
            <div className="col-span-10 grid grid-rows-2 gap-1 lg:gap-2">
                {/* title */}
                <h3 className="row-span-1 font-semibold text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem]  xl:text-[1rem] overflow-hidden">
                    {title}
                </h3>

                <div className="row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark text-[3.75vw] sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem] flex flex-col justify-center">
                    {/* Channel Name */}
                    <h3>
                        {owner && owner.channelName}
                    </h3>
                    {/* Views & timestamp */}
                    <h3 className='flex gap-4'>
                        <span>
                            {`${viewsCount} views`}
                        </span>
                        <span>
                            {`${timeSince(new Date(createdAt))}`}
                        </span>
                    </h3>
                </div>
            </div>
        </div>

    </div>
  )
}

export default VideoCard