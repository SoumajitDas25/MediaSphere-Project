import { LikeIcon,ReplyIcon, LikedIcon, EditIcon,DeleteIcon } from "../../assets/icons";
import { useNavigate } from 'react-router-dom';
import {commentAPI,likeAPI} from "../../api"
import { useSelector } from "react-redux";
import {InputModal,ConfirmModal, Like} from "../";
import { useRef, useState } from "react";

const CommentCard = ({
    data,
    onClick=null,
    hideRepliesCount=false,
    listRef,
    extraElements
}) => {

    const navigate = useNavigate();
    const [enableEdit,setEnableEdit] = useState(false);
    const [enableDelete,setEnableDelete] = useState(false);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const [isCommentLiked,setIsCommentLiked] = useState(data?.isLiked);
    const [commentLikesCount,setCommentLikesCount] = useState(data?.likesCount);
    const userId = useSelector(state=>state.user?.user?._id);
    const editRef = useRef();
    const {
        _id,
        owner,
        content,
        likesCount,
        repliesCount,
        isLiked,
        createdAt,
        updatedAt
    } = data;
    const {updateComment,deleteComment} = commentAPI;
    const {toggleCommentLike} = likeAPI;

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
        const prevIsLiked = isCommentLiked; 
        const prevLikesCount = commentLikesCount;

        try
        {
            //toggle the state before api call
            setCommentLikesCount(state=>( 
                prevIsLiked?state-1:state+1
            ));
            setIsCommentLiked(state=>!state);
            const response = await toggleCommentLike(_id);
            console.log(response.data.data);  

            //sync with backend response to maintain consistency
            setIsCommentLiked(response.data.data.isLiked);
            setCommentLikesCount(response.data.data.likesCount);
            console.log(response.data.data.likesCount,response.data.data.isLiked);
        }
        catch(error)
        {   
            //if any error occurs, then revert the state
            setCommentLikesCount(prevLikesCount);
            setIsCommentLiked(prevIsLiked);  
            console.log(error);     
        }
    }
    
    const updateHandler = async () => {
        try
        {
            setIsEditModalButtonLoading(true);
            const response = await updateComment(_id,editRef.current.getValue());
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
            const response = await deleteComment(_id);
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
        onClick={()=>onClick?onClick({...data,isLiked:isCommentLiked,likesCount:commentLikesCount}):null}
        >
            {
                enableEdit && (
                    <InputModal 
                    setIsModalOpened={setEnableEdit} 
                    heading='Edit Comment'
                    defaultValue={content}
                    placeholder='Edit Comment'
                    submitButtonText='Save'
                    submitHandler={updateHandler}
                    isSubmitButtonLoading = {isEditModalButtonLoading}
                    ref={editRef}
                    />
                )
            }
            {
                enableDelete && (
                    <ConfirmModal 
                    setIsModalOpened={setEnableDelete}
                    heading="Delete Comment" 
                    message="Are you sure to delete this comment ?" 
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
            <div className="flex-grow flex flex-col justify-center gap-4">
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
                <div className="grid grid-cols-12 text-[1rem]">
                    {/* likeOption */}
                    <div
                    className="col-span-5 xsm:col-span-4 md:col-span-3 xl:col-span-2 flex items-center gap-x-1 outline-none cursor-pointer"
                    >
                        {/* Like Icon */}
                        <Like 
                        isLiked={isCommentLiked}
                        likeToggleHandler={toggleLike}  
                        />
                        {/* Likes Count */}
                        <span>{commentLikesCount}</span>
                    </div>
                    {/* repliesOption */}
                    {
                        !hideRepliesCount && (
                            <div
                            className="col-span-5 xsm:col-span-4 md:col-span-3 xl:col-span-2 flex items-center gap-x-1 outline-none cursor-pointer"
                            >
                                {/* Reply Icon */}
                                <span className='text-[1.5rem]'>
                                    <ReplyIcon/>
                                </span>
                              
                                {/* Replies Count */}
                                <span>{repliesCount}</span>
                                {/* <span>{`Replies >`}</span> */}
                            </div>
                        )
                    }

                    {
                        userId === owner._id && (
                        <div className="col-span-2 xsm:col-span-4 md:col-span-6 xl:col-span-8 flex flex-row gap-6 items-center justify-end text-[1.25rem] mr-2">
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

export default CommentCard;
