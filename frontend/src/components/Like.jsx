import { LikedIcon, LikeIcon } from "../assets/icons";

const Like = ({
    isLiked=false,
    likeToggleHandler=null,
    className=''
}) => {
    return (
        <span
        className={`text-[2rem] transition-colors duration-700 ${
            isLiked
            ? "animate-[rotateOnceClockWise_0.5s_linear_forwards] text-color-dark_yellow"
            : "animate-[rotateOnceAntiClockWise_0.5s_linear_forwards]"
        } ${className}`}
        onClick={async (event)=>{
            event.stopPropagation();
            if(likeToggleHandler)
            await likeToggleHandler();
        }}
        >
        {isLiked ? <LikedIcon /> : <LikeIcon />}
        </span>
    );
};

export default Like;
