import React from 'react'
import { NoAvatarIcon } from '../../assets/icons';
import { useNavigate } from 'react-router-dom';
import { VideoThumbnail } from '../../assets/images';

const VideoCard = (
    {
        _id,
        thumbnail="",
        title="",
        viewsCount=0,
        owner,
        duration='0:00',
        createdAt="",
        viewType = "Grid"
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
    // <div 
    // className={`bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light grid grid-flow-col ${viewType==='Grid'?'grid-cols-5 ':'grid-cols-12'} grid-rows-5 rounded-lg overflow-hidden w-full`} 
    // onClick={()=>navigate('/video')}>

    //     {/* Video Thumbnail */}
    //     <div className={`${viewType==='Grid'?'col-span-full row-span-3':'col-span-5 lg:col-span-4 xl:col-span-3 row-span-full'} relative  bg-red-400`}>
    //         <div className={`${viewType==='List' && 'aspect-w-8 aspect-h-5'} overflow-hidden flex items-center justify-center h-full`}>
    //             <img 
    //             src={thumbnail} 
    //             alt="Video Thumbnail" 
    //             className="rounded-lg z-5"
    //             />
    //         </div>
    //         <div className="bg-black text-white absolute z-10 right-2 bottom-[5%] rounded-md px-2 text-[3.5vw] sm:text-[0.9rem]">
    //             {computeDuration(duration)}
    //         </div>
    //     </div>

    //     {/* Video Info*/}
    //     <div className={`${viewType==='Grid'?'col-span-full row-span-2':'col-span-7 row-span-full'} grid grid-cols-12 overflow-hidden p-2 gap-2`}>
    //         {/* avatar - Grid View*/}
    //         {
    //             viewType==='Grid' && (<div className="col-span-2 overflow-hidden flex justify-center items-start">
    //                 {
    //                     owner && owner.avatar?
    //                     <img 
    //                     src={owner.avatar} 
    //                     alt="Video Thumbnail" 
    //                     className="rounded-[50%] max-h-[12vw] sm:max-h-[3rem]"
    //                     />
    //                     :
    //                     <span className="text-[7vw] sm:text-[2.5rem] text-light-font_color_light dark:text-dark-font_color_light">
    //                         <NoAvatarIcon/>
    //                     </span>    
    //                 }
                      
    //             </div>)
    //         }
    //         {/* info */}
    //         <div className={`${viewType==='Grid'?'col-span-10':'col-span-full'} grid grid-rows-2 gap-1 lg:gap-2`}>
    //             {/* title */}
    //             <h3 className={`row-span-1 font-semibold ${viewType==='Grid'?'text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem]':'text-[3.2vw] sm:text-[1rem] md:text-[0.75rem] lg:text-[1rem]'} overflow-hidden`}>
    //                 {title}
    //             </h3>

    //             <div className={`row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark ${viewType==='Grid'?'text-[3.75vw]  sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem]':'text-[2.5vw]  sm:text-[0.75rem] md:text-[0.55rem] lg:text-[0.75rem] xl:text-[0.85rem]'} flex flex-col justify-center`}>

    //                 <div className='flex flex-row gap-2'>
    //                     {/* avatar - List View*/}
    //                     {/* {
    //                         viewType==='List' && (<div className="hidden lg:block overflow-hidden">
    //                             {
    //                                 owner && owner.avatar?
    //                                 <img 
    //                                 src={owner.avatar} 
    //                                 alt="Video Thumbnail" 
    //                                 className="rounded-[50%] max-h-[2rem]"
    //                                 />
    //                                 :
    //                                 <span className="text-[2rem] text-light-font_color_light dark:text-dark-font_color_light">
    //                                     <NoAvatarIcon/>
    //                                 </span>    
    //                             }
                                
    //                         </div>)
    //                     } */}
    //                     {/* Channel Name */}
    //                     <h3 className='flex items-center'>
    //                         {owner && owner.channelName}
    //                     </h3>
    //                 </div>
    //                 {/* Views & timestamp */}
    //                 <h3 className='flex gap-4'>
    //                     <span>
    //                         {`${viewsCount} views`}
    //                     </span>
    //                     <span>
    //                         {`${timeSince(new Date(createdAt))}`}
    //                     </span>
    //                 </h3>
    //             </div>
    //         </div>
    //     </div>

    // </div>
    <div 
    className={`bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light flex  ${viewType==='Grid'?'flex-col':'flex-row h-[25vw] sm:h-[18vw] lg:h-[10vw] max-h-[150px]'} gap-2 rounded-lg overflow-hidden w-full`} 
    onClick={()=>navigate('/video')}>

        {/* thumbnail */}
        <div className={`${viewType==='Grid'?'w-full':'h-full'} relative overflow-hidden`}>
            
            <img className={`aspect-[8/5] ${viewType==='Grid'?'w-full':'h-full'} rounded-lg z-5`} src={thumbnail} alt="Playlist Thumbnail" />

            <div className="bg-black text-white absolute z-10 right-2 bottom-[5%] rounded-md px-2 text-[3.5vw] sm:text-[0.9rem]">
                {computeDuration(duration)}
            </div>
        </div>   
          
         {/* Video Info*/}
        <div className={`${viewType==='Grid'?'w-full':''} grid grid-cols-12 overflow-hidden p-2 gap-2 flex-1`}>
            {/* avatar - Grid View*/}
            {
                viewType==='Grid' && (<div className="col-span-2 overflow-hidden flex justify-center items-start">
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
                </div>)
            }
            {/* info */}
            <div className={`${viewType==='Grid'?'col-span-10':'col-span-full'} grid grid-rows-2 gap-1 lg:gap-2`}>
                {/* title */}
                <h3 className={`row-span-1 font-semibold ${viewType==='Grid'?'text-[4vw] sm:text-[1rem] md:text-[0.85rem] lg:text-[0.75rem] xl:text-[1rem]':'text-[3.2vw] sm:text-[0.75rem] md:text-[1rem]'} overflow-hidden`}>
                    {title}
                </h3>

                <div className={`row-span-1 text-light-font_color_dark dark:text-dark-font_color_dark ${viewType==='Grid'?'text-[3.75vw]  sm:text-[0.85rem] md:text-[0.7rem] lg:text-[0.65rem] xl:text-[0.85rem]':'text-[2.5vw] sm:text-[0.6rem] md:text-[0.75rem] xl:text-[0.85rem]'} flex flex-col justify-center`}>

                    <div className='flex flex-row gap-2'>
                        {/* avatar - List View*/}
                        {
                            // viewType==='List' && (<div className="hidden lg:block overflow-hidden">
                            //     {
                            //         owner && owner.avatar?
                            //         <img 
                            //         src={owner.avatar} 
                            //         alt="Video Thumbnail" 
                            //         className="rounded-[50%] max-h-[2rem]"
                            //         />
                            //         :
                            //         <span className="text-[2rem] text-light-font_color_light dark:text-dark-font_color_light">
                            //             <NoAvatarIcon/>
                            //         </span>    
                            //     }
                                
                            // </div>)
                        }
                        {/* Channel Name */}
                        <h3 className='flex items-center'>
                            {owner && owner.channelName}
                        </h3>
                    </div>
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