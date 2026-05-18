import { useRef, useState } from "react";
import { CommentIcon, EditIcon,DeleteIcon } from "../../assets/icons";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { ConfirmModal, InputModal, Like, Button, Switch } from "..";
import {tweetAPI,likeAPI} from "../../api";

const TweetCard = ({
    data,
    enableOptions=false,
    enabledOptions={
        editOption:false,
        deleteOption:false,
        togglePublishOption:false
    },
    listRef,
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
        isPublished,
        createdAt,
        updatedAt
    } = data;
    const {editOption,deleteOption,togglePublishOption} = enabledOptions;

    const [isTweetLiked,setIsTweetLiked] = useState(isLiked);
    const [tweetLikesCount,setTweetLikesCount] = useState(likesCount);
    const [isTweetPublished,setIsTweetPublished] = useState(isPublished);
    const [isTogglePublishButtonLoading,setIsTogglePublishButtonLoading] = useState(false);
    const [enableEdit,setEnableEdit] = useState(null);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const editRef = useRef(null);
    const [enableDelete,setEnableDelete] = useState(null);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const userId = useSelector(state=>state.user.user?._id);
    
    const {updateTweet,deleteTweet,toggleTweetPublishStatus} = tweetAPI;
    const {toggleTweetLike} = likeAPI;

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
        const prevIsLiked = isTweetLiked; 
        const prevLikesCount = tweetLikesCount;

        try
        {
            //toggle the state before api call
            setTweetLikesCount(state=>( 
                prevIsLiked?state-1:state+1
            ));
            setIsTweetLiked(state=>!state);
            const response = await toggleTweetLike(_id);
            console.log(response.data.data);  

            //sync with backend response to maintain consistency
            setIsTweetLiked(response.data.data.isLiked);
            setTweetLikesCount(response.data.data.likesCount);
            console.log(response.data.data.likesCount,response.data.data.isLiked);
        }
        catch(error)
        {   
            //if any error occurs, then revert the state
            setTweetLikesCount(prevLikesCount);
            setIsTweetLiked(prevIsLiked);  
            console.log(error);     
        }
    }

    const updateHandler = async ()=>{
        try
        {
            setIsEditModalButtonLoading(true);
            const response = await updateTweet(_id,editRef.current.getValue());
            console.log(response.data.data);
            setEnableEdit(false);
            listRef.current.reload('current');
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

    const deleteHandler = async ()=>{
        try
        {
            setIsDeleteModalButtonLoading(true);
            const response = await deleteTweet(_id);
            console.log(response.data.data);
            setEnableDelete(false);
            listRef.current.reload('deleteOne');
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

    const togglePublishStatus = async ()=>{
        try
        {
            setIsTogglePublishButtonLoading(true)
            const response = await toggleTweetPublishStatus(_id);
            // console.log(response.data.data);
            setIsTweetPublished(response.data.data);
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            setIsTogglePublishButtonLoading(false);
        }
    }

    return (
        <div 
        className="bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light rounded-lg w-full"
        >
            {
                enableEdit && (
                    <InputModal 
                    setIsModalOpened={setEnableEdit} 
                    heading='Edit Tweet'
                    defaultValue={content}
                    placeholder='Write a tweet'
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
                    heading="Delete Tweet" 
                    message="Are you sure to delete this tweet ?" 
                    confirmHandler={deleteHandler}
                    isConfirmButtonLoading={isDeleteModalButtonLoading}
                    />
                )
            }

            <div className="flex gap-3 p-2 py-4 overflow-hidden" onClick={()=>navigate(`/tweet/${_id}`)}>
            
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
                    <div className="grid grid-cols-12 text-[1rem]">
                        {/* like option */}
                        <div
                        className="col-span-5 xsm:col-span-4 md:col-span-3 xl:col-span-2 flex items-center gap-x-1 outline-none cursor-pointer"
                        >
                            {/* Like Icon */}
                            <Like 
                            isLiked={isTweetLiked}
                            likeToggleHandler={toggleLike}  
                            />
                            {/* Likes Count */}
                            <span>{tweetLikesCount}</span>
                        </div>
                        {/* comments count */}
                        <div
                        className="col-span-5 xsm:col-span-4 md:col-span-3 xl:col-span-2 flex items-center gap-x-1 outline-none cursor-pointer"
                        >
                            {/* Comment Icon */}
                            <span className='text-[1.5rem]'>
                                <CommentIcon/>
                            </span>
                                                    
                            {/* Comments Count */}
                            <span>{commentsCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Options */}
            {
                enableOptions ? 
                    (owner && owner._id === userId) ? 
                    (
                        <div className='grid grid-cols-12 gap-4 p-4 border-t border-light-btn1_color dark:border-light-bg_dark bg-dark-font_color_dark dark:bg-dark-bg_light'>
                            {/* toggle publish option*/}
                            {
                                togglePublishOption && (
                                    <div className='col-span-6 flex items-center'>
                                        <span className='mr-2 md:mr-4 text-[1rem] md:text-[1.25rem]'>Published</span>
                                        <Switch 
                                        isSwitchOn={isTweetPublished} 
                                        isLoading={isTogglePublishButtonLoading}
                                        onSwitchOn={togglePublishStatus}
                                        onSwitchOff={togglePublishStatus}
                                        />
                                    </div>
                                )
                            }
                            {/* edit option */}
                            {
                                editOption && (
                                    <Button 
                                    className='col-span-3' 
                                    fontSize='text-[0.75rem] md:text-[1rem]' 
                                    onClick={(event)=>{
                                        event.stopPropagation();
                                        setEnableEdit(true);
                                    }}
                                    >
                                        <span className='flex flex-row gap-1 justify-center items-center'>
                                            <span className='text-[1.2rem] md:text-[1.5rem]'>
                                                <EditIcon/>
                                            </span>
                                            <span className='hidden sm:block'>Edit</span>
                                        </span>
                                    </Button>
                                )
                            }
                            
                            {/* delete option */}
                            {
                                deleteOption && (
                                    <Button 
                                    className='col-span-3' 
                                    fontSize='text-[0.75rem] md:text-[1rem]' 
                                    onClick={(event)=>{
                                        event.stopPropagation();
                                        setEnableDelete(true);
                                    }}
                                    >
                                        <span className='flex flex-row gap-1 justify-center items-center'>
                                            <span className='text-[1.2rem] md:text-[1.5rem] '>
                                                <DeleteIcon/>
                                            </span>
                                            <span className='hidden sm:block'>Delete</span>
                                        </span>
                                    </Button>
                                )
                            }
                        </div>
                    ):''
                :''
            }
        </div>
    );
};

export default TweetCard;
