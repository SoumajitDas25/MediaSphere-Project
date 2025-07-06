import React from "react";
import { LikeIcon,CommentIcon, LikedIcon } from "../../assets/icons";
import { useNavigate } from 'react-router-dom';

const TweetCard = ({
    data,
    viewType = "Grid",
    extraElements
}) => {

    const navigate = useNavigate();
    const {
        _id,
        owner,
        content,
        likesCount,
        commentsCount,
        isLiked,
        createdAt,
        updatedAt
    } = data;

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
        className="bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light rounded-lg overflow-hidden w-full flex gap-3 p-2 border-b border-gray-700 py-4 last:border-b-transparent"
        onClick={()=>navigate('/tweet')}
        >
            
            {/* avatar */}
            <div className="overflow-hidden flex justify-center items-start cursor-pointer" 
            onClick={(event)=>{
                event.stopPropagation();
                navigate(`/channel/@${owner.username}`);
            }}
            >
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

            {/* tweet info */}
            <div className="w-full flex flex-col justify-center gap-4">
                <h4 className="flex items-center gap-x-2 text-[3.5vw] sm:text-[0.75rem] md:text-[1rem]">
                    {/* Channel Name */}
                    <span className="font-semibold cursor-pointer" 
                    onClick={(event)=>{
                        event.stopPropagation();
                        navigate(`/channel/@${owner.username}`);
                    }}
                    >
                        {owner && owner.channelName}
                    </span>
                    {/* timestamp */}
                    <span className="inline-block text-sm text-gray-400">
                        {
                        createdAt===updatedAt?
                        `${timeSince(new Date(createdAt))}`:`${timeSince(new Date(updatedAt))} (edited)`
                        }
                    </span>
                </h4>
                {/* content */}
                <p>
                {content}
                </p>
                <div className="flex gap-4 text-[1rem]">
                    {/* likesCount */}
                    <button
                        className="inline-flex items-center gap-x-1 outline-none"
                    >
                        {
                            isLiked?
                            <LikedIcon/>:<LikeIcon/>
                        }
                        <span>{likesCount}</span>
                    </button>
                    {/* commentsCount */}
                    <button
                        className="inline-flex items-center gap-x-1 outline-none"
                    >
                        <CommentIcon/>
                        <span>{commentsCount}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TweetCard;
