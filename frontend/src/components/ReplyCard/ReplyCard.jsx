import { useSelector } from "react-redux";
import { LikeIcon,LikedIcon,EditIcon,DeleteIcon } from "../../assets/icons";
import { useNavigate } from 'react-router-dom';
import {replyAPI,likeAPI} from "../../api"
import { useRef, useState } from "react";
import {InputModal,ConfirmModel, Like} from "../";

const ReplyCard = ({
    data,
    listRef,
    extraElements
}) => {

    const navigate = useNavigate();
    const [enableEdit,setEnableEdit] = useState(false);
    const [enableDelete,setEnableDelete] = useState(false);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const [isReplyLiked,setIsReplyLiked] = useState(data?.isLiked);
    const [replyLikesCount,setReplyLikesCount] = useState(data?.likesCount);
    const userId = useSelector(state=>state.user?.user?._id);
    const editRef = useRef(null);
    const {
        _id,
        owner,
        content,
        likesCount,
        // repliesCount,
        isLiked,
        createdAt,
        updatedAt
    } = data;
    const {updateReply,deleteReply} = replyAPI;
    const {toggleReplyLike} = likeAPI;

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

    const toggleLike = async () =>{

        // backup for reverting in catch
        const prevIsLiked = isReplyLiked; 
        const prevLikesCount = replyLikesCount;
        try
        {
            //toggle the state before api call
            setReplyLikesCount(state=>( 
                prevIsLiked?state-1:state+1
            ));
            setIsReplyLiked(state=>!state);
            const response = await toggleReplyLike(_id);
            console.log(response.data.data);  

            //sync with backend response to maintain consistency
            setIsReplyLiked(response.data.data.isLiked);
            setReplyLikesCount(response.data.data.likesCount);
            console.log(response.data.data.likesCount,response.data.data.isLiked);
        }
        catch(error)
        {   
            //if any error occurs, then revert the state
            setReplyLikesCount(prevLikesCount);
            setIsReplyLiked(prevIsLiked); 
            console.log(error);       
        }
    }

    const updateHandler = async () => {
        try
        {
            setIsEditModalButtonLoading(true);
            const response = await updateReply(_id,editRef.current.getValue());
            // console.log(response.data.data);
            editRef.current.reset();
            setEnableEdit(false);
            listRef.current.reload('current'); //let the list to reload the current page
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsEditModalButtonLoading(false);
        }
    }

    const deleteHandler = async () => {
        try
        {
            setIsDeleteModalButtonLoading(true);
            const response = await deleteReply(_id);
            // console.log(response.data.data);
            setEnableDelete(false);
            listRef.current.reload('deleteOne'); //let the list to reload the current page while checking underflow case
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setIsDeleteModalButtonLoading(false);
        }
    }

    return (
        <div 
        className="bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light rounded-lg overflow-hidden w-full flex gap-3 p-2 border-b border-gray-700 py-4 last:border-b-transparent"
        >

            {
                enableEdit && (
                    <InputModal 
                    setIsModalOpened={setEnableEdit} 
                    heading='Delete Reply'
                    defaultValue={content}
                    placeholder='Edit Reply'
                    submitButtonText='Save'
                    submitHandler={updateHandler}
                    isSubmitButtonLoading = {isEditModalButtonLoading}
                    ref={editRef}
                    />
                )
            }
            {
                enableDelete && (
                    <ConfirmModel 
                    setIsModalOpened={setEnableDelete}
                    heading="Delete Reply" 
                    message="Are you sure to delete this reply ?" 
                    confirmHandler={deleteHandler}
                    isConfirmButtonLoading={isDeleteModalButtonLoading}
                    />
                )
            }
            
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

            {/* comment info */}
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
                    <span className="inline-block text-sm text-gray-600 dark:text-gray-400">
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
                <div className="flex items-center justify-between text-[1rem]">
                    {/* likeOption */}
                    <div
                        className="flex items-center gap-x-1 outline-none cursor-pointer"
                    >
                        {/* Like Icon */}
                        <Like 
                        isLiked={isReplyLiked}
                        likeToggleHandler={toggleLike}  
                        />
                        {/* Likes Count */}
                        <span>{replyLikesCount}</span>
                    </div>
                    
                    {
                        userId === owner._id && (
                            <div className="flex flex-row gap-6 items-center justify-end text-[1.25rem] mr-2">
                                {/* Edit Option */}
                                <span className="cursor-pointer" 
                                onClick={(event)=>{
                                    event.stopPropagation();
                                    setEnableEdit(true);
                                }}
                                >
                                    <EditIcon/>
                                </span>
                                {/* Delete Icon */}
                                <span className="cursor-pointer" 
                                onClick={(event)=>{
                                    event.stopPropagation();
                                    setEnableDelete(true);
                                }}
                                >
                                    <DeleteIcon/>
                                </span>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default ReplyCard;