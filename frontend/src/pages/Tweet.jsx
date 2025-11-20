import { useState,useEffect,useRef } from 'react';
import {Button, CommentPanel, ConfirmModal, InputModal, Like, Loader} from "../components";
import { DeleteIcon, EditIcon } from "../assets/icons"
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { connectionAPI, likeAPI, tweetAPI } from '../api';
import { useUserEvents,useTweetEvents } from '../events/hooks';

const Tweet = () => {

    let {tweetId:paramTweetId} = useParams();
    const navigate = useNavigate();
    const [loading,setLoading] = useState(true);
    const [data,setData] = useState(null);
    const [tweetContent,setTweetContent] = useState(null);
    const [tweetId,setTweetId] = useState(paramTweetId);
    const [tweetOwner,setTweetOwner] = useState(null);
    const [isLiked,setIsLiked] = useState(null);
    const [likeCount,setLikeCount] = useState(0);
    // const [commentCount,setCommentCount] = useState(0);
    const [isSubscribed,setIsSubscribed] = useState(null);
    const [isSubscriptionButtonLoading,setIsSubscriptionButtonLoading] = useState(false);
    const [enableEdit,setEnableEdit] = useState(false);
    const [enableDelete,setEnableDelete] = useState(false);
    const [isEditModalButtonLoading,setIsEditModalButtonLoading] = useState(false);
    const [isDeleteModalButtonLoading,setIsDeleteModalButtonLoading] = useState(false);
    const userId = useSelector(state=>state.user.user?._id);
    const editRef = useRef();
    
    const {getTweetById,updateTweet,deleteTweet} = tweetAPI;
    const {toggleSubscription} = connectionAPI;
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

    const getTweetDetails = async () =>{
       try
        {
            setLoading(true);
            const response = await getTweetById(tweetId);
            setData(response.data?.data);
            setTweetContent(response.data?.data?.content);
            setTweetOwner(response.data?.data?.owner);
            setIsLiked(response.data?.data?.isLiked);
            setLikeCount(response.data?.data?.likesCount);
            // setCommentCount(response.data?.data?.commentsCount);
            setIsSubscribed(response.data?.data?.owner?.isSubscribed);
            
            console.log(response.data.data);
            return response.data.data;
        }
        catch(error)
        {
            //display an error message
            console.log(error);
        }
        finally
        {
          setLoading(false);
        }
    }

    const toggleSubscribe = async () =>{
        try
        {
            setIsSubscriptionButtonLoading(true);
            const response = await toggleSubscription(data.owner?._id);
            // console.log(response.data.data); 
            setIsSubscribed(response.data?.data?.isSubscribed);
        }
        catch(error)
        {      
            console.log(error);
        }
        finally
        {
            setIsSubscriptionButtonLoading(false);
        }
    }

    const toggleLike = async () =>{

        const prevLikeCount = likeCount; // backup for reverting in catch
        const prevIsLiked = isLiked;

        try
        {
            // setData(state=>({ //toggle the state before api call
            //   ...state,
            //   likesCount: state.isLiked? state.likesCount-1:state.likesCount+1,
            //   isLiked: !state.isLiked
            // }));
            setLikeCount(prev=>isLiked?prev-1:prev+1);
            setIsLiked(prev=>!prev);
            const response = await toggleTweetLike(data?._id);
            // console.log(response.data.data);  
            const { likesCount, isLiked:isVideoLiked } = response.data.data;

            //sync with backend response to maintain consistency
            // setData(state => ({
            //   ...state,
            //   likesCount,
            //   isLiked
            // }));
            setLikeCount(likesCount);
            setIsLiked(isVideoLiked);
        }
        catch(error)
        {   
            //if any error occurs, then revert the state
            setLikeCount(prevLikeCount);
            setIsLiked(prevIsLiked);
            console.log(error);       
        }
    }

    const updateHandler = async (content)=>{
        try
        {
            setIsEditModalButtonLoading(true);
            const response = await updateTweet(tweetId,editRef.current.getValue());
            console.log(response.data.data);
            editRef.current.reset();
            setEnableEdit(false);
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
            const response = await deleteTweet(tweetId);
            console.log(response.data.data);
            setEnableDelete(false);
            // navigate('/'); //navigate to home page
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

    //sync tweetId state with tweetID param
    useEffect(()=>{
        setTweetId(paramTweetId);
    },[paramTweetId])
    
    useEffect(()=>{
        //load tweet details
        getTweetDetails();
    },[])

    useUserEvents({
      data:{
        userId: (data && data.owner && data.owner._id)?data.owner._id:null
      },
      publicListeners:{
        updateSubscriberCount:(payload)=>{
          console.log("Subscriber Count: ",payload);
          setTweetOwner(prev=>({...prev,subscribersCount:payload}))
        },
        updateAvatar:(payload)=>{
          setTweetOwner(prev=>({...prev,avatar:payload}))
        },
        updateChannelName:(payload)=>{
          setTweetOwner(prev=>({...prev,channelName:payload}))
        }
      },
      privateListeners:{
        updateIsSubscribed:(payload)=>{
          if(userId==payload.id)
          {
            setIsSubscribed(payload.data);          
          }
        }
      }
    });

    useTweetEvents({
      data:{
        tweetId:tweetId
      },
      publicListeners:{
        updateTweet:(payload)=>{
            console.log("updated tweet: ",payload);
            setTweetContent(payload);
        },
        deleteTweet:(payload)=>{
            console.log("tweet deleted: ",payload);
            navigate("/"); //navigate to home page
        },
        updateTweetLikeCount:(payload)=>{
          console.log("Tweet Like Count: ",payload);
          setLikeCount(payload);
        }
      },
      privateListeners:{
        updateIsTweetLiked:(payload)=>{
          if(tweetId === payload.id)
          {
            setIsLiked(payload.data);
          }
        }
      }
    });

    return (
        <div className={`w-full grid grid-cols-12 max-w-[120rem] mx-auto`}>
            {
                loading?
                <Loader hideBackground={true}/>
                :
                
                <div className={`col-span-full lg:col-span-8 lg:col-start-3`}>

                    {
                        enableEdit && (
                            <InputModal 
                            setIsModalOpened={setEnableEdit} 
                            heading='Edit Tweet'
                            defaultValue={tweetContent}
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

                    {/* Channel Info */}         
                    <div 
                    className={`h-[25vw] lg:h-[10vw] max-h-[70px] rounded-lg overflow-hidden w-full flex flex-row`} 
                    >

                        {/* avatar */}
                        <div className='cursor-pointer' onClick={()=>navigate(`/channel/@${tweetOwner.username}`)}>
                            <img className={`aspect-1 h-full rounded-full z-5 p-1`} src={tweetOwner.avatar} alt="User Avatar" />
                        </div>

                        {/* Channel Info*/}
                        <div className={`flex-1 flex items-center justify-between lg:justify-start gap-4 px-2 sm:px-4`}>

                            <div>
                                {/* Channel Name */}
                                <h1 className={`font-bold overflow-hidden text-[0.9rem] sm:text-[1rem] md:text-[1.1rem] text-wrap flex items-center justify-start cursor-pointer`} onClick={()=>navigate(`/channel/@${tweetOwner.username}`)}>{tweetOwner.channelName}</h1>

                                <div>
                                    {/* Subscribers Count */}
                                    <h2 className=' font-medium overflow-hidden'>{tweetOwner.subscribersCount} Subscribers</h2>
                                </div>
                            </div>

                            {/* Subscribe option - only for non-owners*/}
                            {
                                userId !== tweetOwner._id && 
                                <Button 
                                fontSize='text-[0.7rem] sm:text-[0.8rem] md:text-[1rem]' 
                                bgcolor={`${isSubscribed? 'bg-transparent hover:bg-dark-font_color_dark dark:hover:bg-light-bg_dark':'bg-color-yellow'}`} 
                                textcolor={`${isSubscribed? 'text-light-font_color_dark dark:text-dark-font_color_dark hover:dark:text-light-font_color_dark':'text-light-font_color_dark'}`}
                                className={`${isSubscribed && 'border border-light-font_color_dark dark:border-dark-font_color_dark'}`} 
                                onClick={(event)=>{
                                    event.stopPropagation();
                                    toggleSubscribe();
                                }}
                                isLoading={isSubscriptionButtonLoading}
                                >
                                    {isSubscribed?'Unsubscribe':'Subscribe'}
                                </Button>
                            }
                                
                        </div>
                    </div>
                    
                    {/* content */}
                    <div className='my-4 mx-2 md:m-4 px-2 py-4 md:p-4 bg-light-bg_light dark:bg-dark-btn1_color rounded-lg'>
                        {tweetContent}
                    </div>
                
                    <div className='flex flex-row justify-between items-center text-[1.5rem] p-4 lg:px-4 lg:py-2'>

                        {/* Edit option - only for owner */}
                         {
                            userId === tweetOwner._id && (
                            <div className="col-span-2 xsm:col-span-4 md:col-span-6 xl:col-span-8 flex flex-row gap-6 items-center justify-end  mr-2">
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

                        {/* Like Option */}
                        <div className='flex flex-row justify-center items-center gap-1 cursor-pointer'>
                            {/* Like Icon */}
                            <Like 
                            isLiked={isLiked}
                            likeToggleHandler={toggleLike}
                            />
                            {/* LikesCount */}
                            <span>{likeCount}</span>
                        </div>
                    </div>
                    
                    {/* Comment Panel */}
                    <div className={`w-full`}>
                        <CommentPanel
                        mediaType='Tweet'
                        mediaId={tweetId}
                        // isPanelExpanded={isCommentPanelExpanded}
                        // setIsPanelExpanded={setIsCommentPanelExpanded}
                        /> 
                    </div>
                </div>
            }
        </div>
    )
}

export default Tweet