import { useEffect, useState } from 'react';
import { connectionAPI, videoAPI, likeAPI } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader,Button, CommentPanel,Like,AddVideoToPlaylistModal} from '../components';
import {CommentIcon,PlaylistAddIcon,PlaylistAddedIcon} from "../assets/icons"
import { useSelector } from 'react-redux';
import {useUserEvents,useVideoEvents} from "../events/hooks"

const Video = () => {

    let {videoId:paramVideoId} = useParams();
    const navigate = useNavigate();
    const [loading,setLoading] = useState(true);
    const [data,setData] = useState(null);
    const [videoId,setVideoId] = useState(paramVideoId);
    const [videoOwner,setVideoOwner] = useState(null);
    const [isLiked,setIsLiked] = useState(null);
    const [likeCount,setLikeCount] = useState(0);
    const [commentCount,setCommentCount] = useState(0);
    const [viewCount,setViewCount] = useState(0);
    const [isSubscribed,setIsSubscribed] = useState(null);
    const [isSubscriptionButtonLoading,setIsSubscriptionButtonLoading] = useState(false);
    const [isCommentPanelExpanded,setIsCommentPanelExpanded] = useState(false);
    const [isVideoPresentInPlaylist,setIsVideoPresentInPlaylist] = useState(null);
    const [isAddVideoToPlaylistModalOpened,setIsAddVideoToPlaylistModalOpened] = useState(false);
    const userId = useSelector(state=>state.user.user?._id);

    const {getVideoById} = videoAPI;
    const {toggleSubscription} = connectionAPI;
    const {toggleVideoLike} = likeAPI;

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

    const getVideoDetails = async () =>{
       try
        {
            setLoading(true);
            const response = await getVideoById(videoId);
            setData(response.data?.data);
            setVideoOwner(response.data?.data?.owner);
            setIsLiked(response.data?.data?.isLiked);
            setLikeCount(response.data?.data?.likesCount);
            setCommentCount(response.data?.data?.commentsCount);
            setViewCount(response.data?.data?.viewsCount);
            setIsSubscribed(response.data?.data?.owner?.isSubscribed);
            setIsVideoPresentInPlaylist(response.data?.data?.isVideoPresentInPlaylist);
            
            // console.log(response.data.data);
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
            const response = await toggleVideoLike(data?._id);
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

    //sync videoId state with videoID param
    useEffect(()=>{
      setVideoId(paramVideoId);
    },[paramVideoId])

    useEffect(()=>{
      //load video details
      getVideoDetails();
    },[])

    useUserEvents({
      data:{
        userId: (data && data.owner && data.owner._id)?data.owner._id:null
      },
      publicListeners:{
        updateSubscriberCount:(payload)=>{
          console.log("Subscriber Count: ",payload);
          setVideoOwner(prev=>({...prev,subscribersCount:payload}))
        },
        updateAvatar:(payload)=>{
          setVideoOwner(prev=>({...prev,avatar:payload}))
        },
        updateChannelName:(payload)=>{
          setVideoOwner(prev=>({...prev,channelName:payload}))
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

    useVideoEvents({
      data:{
        videoId:videoId
      },
      publicListeners:{
        updateViewCount:(payload)=>{
          setViewCount(payload);
        },
        updateVideoLikeCount:(payload)=>{
          console.log("Video Like Count: ",payload);
          setLikeCount(payload);
        },
        updateCommentCount:(payload)=>{
          console.log("Comment Count: ",payload);
          setCommentCount(payload);
        }
      },
      privateListeners:{
        updateIsVideoLiked:(payload)=>{
          if(videoId === payload.id)
          {
            setIsLiked(payload.data);
          }
        },
        updateIsVideoPresentInPlaylist:(payload)=>{
          if(videoId === payload.id)
          {
            setIsVideoPresentInPlaylist(payload.data);
            console.log("video added: ",payload.data);
          }
        }
      }
    });

    return (
      <div className={`${isCommentPanelExpanded && 'flex-1 flex flex-col md:block'}`}>
        {
          loading?
          <Loader hideBackground={true}/>
          :
          <div className={`grid grid-cols-12 max-w-[120rem] mx-auto ${isCommentPanelExpanded && 'scrollbar-hide flex-1'}`}>
            <div className={`col-span-full lg:col-span-8 lg:col-start-3 ${isCommentPanelExpanded && 'flex flex-col'}`}>

              {/* Video Panel*/}
              <div className='relative aspect-[8/5] rounded-xl bg-dark-btn1_color'>
                <video src={data.videoFile} controls  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain max-h-full max-w-full'></video>
              </div>

              <div className={`relative ${isCommentPanelExpanded && 'flex-grow flex flex-col'}`}>

                {/* title */}
                <h1 className='text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] leading-[2rem] md:leading-[2.8rem] font-bold py-2'>{data.title}</h1>

                {/* Channel Info */}
                <div className='flex flex-col md:flex-row'>
            
                  <div 
                  className={`h-[25vw] lg:h-[10vw] max-h-[70px] rounded-lg overflow-hidden w-full flex flex-row`} 
                  >

                      {/* avatar */}
                      <div className='cursor-pointer' onClick={()=>navigate(`/channel/@${videoOwner.username}`)}>
                          <img className={`aspect-1 h-full rounded-full z-5 p-1`} src={videoOwner.avatar} alt="User Avatar" />
                      </div>

                      {/* Channel Info*/}
                      <div className={`flex-1 flex items-center justify-between lg:justify-start gap-4 px-2 sm:px-4`}>

                          <div>
                              {/* Channel Name */}
                              <h1 className={`font-bold overflow-hidden text-[0.9rem] sm:text-[1rem] md:text-[1.1rem] text-wrap flex items-center justify-start cursor-pointer`} onClick={()=>navigate(`/channel/@${videoOwner.username}`)}>{videoOwner.channelName}</h1>

                              <div>
                                  {/* Subscribers Count */}
                                  <h2 className=' font-medium overflow-hidden'>{videoOwner.subscribersCount} Subscribers</h2>
                              </div>
                          </div>

                          {
                            userId !== videoOwner._id && 
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
            
                  <div className='flex flex-row justify-start items-center gap-4 text-[1.25rem] p-4 lg:px-4 lg:py-0'>

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

                    {/* Comments Option */}
                    <div 
                    className='flex flex-row justify-center items-center gap-1 cursor-pointer md:hidden' 
                    onClick={()=>setIsCommentPanelExpanded(state=>!state)}>
                      {/* Comment Icon */}
                      <span className='text-[2rem]'>
                        <CommentIcon/>
                      </span>
                      {/* CommentsCount */}
                      <span>{commentCount}</span>
                    </div>

                    {/* Add to playlist Option */}
                    <div>
                      <div 
                      className='flex flex-row justify-center items-center gap-[0.1rem] cursor-pointer' 
                      onClick={()=>setIsAddVideoToPlaylistModalOpened(true)}>
                        {/* Playlist Add Icon */}
                        <span className='text-[2rem]'>
                          {
                            isVideoPresentInPlaylist?<PlaylistAddedIcon/>:<PlaylistAddIcon/>
                          }
                        </span>
                        <span className='text-[1rem]'>
                          {
                            isVideoPresentInPlaylist?'Added':'Add'
                          }
                        </span>
                      </div>
                      {
                        isAddVideoToPlaylistModalOpened && (
                          <AddVideoToPlaylistModal 
                            videoId={videoId}
                            setIsModalOpened = {setIsAddVideoToPlaylistModalOpened}
                          />
                        )
                      }
                    </div>

                  </div>
                </div>

                <div className='flex flex-row gap-4 px-2'>
                    <span>{`${viewCount} ${viewCount>1?'views':'view'}`}</span>
                    {/* timestamp */}
                    <span className="inline-block text-gray-600 dark:text-gray-400">
                        {
                        data.createdAt===data.updatedAt?
                        `${timeSince(new Date(data.createdAt))}`:`${timeSince(new Date(data.updatedAt))} (edited)`
                        }
                    </span>
                </div>

                {/* description */}
                <div className='bg-light-bg_light dark:bg-dark-btn1_color p-4 my-2 shadow-custom shadow-light-btn1_color rounded-lg dark:shadow-none'>
                  {data.description}
                </div>

                <div className={`absolute top-0 left-0 w-full md:static bg-light-bg_dark dark:bg-dark-bg_light  h-full ${isCommentPanelExpanded?'flex-1':'hidden md:block'}`}>

                  <CommentPanel
                  mediaType='Video'
                  mediaId={videoId}
                  isPanelExpanded={isCommentPanelExpanded}
                  setIsPanelExpanded={setIsCommentPanelExpanded}
                  /> 
                </div>

              </div>

            </div>
            {/* TODO: Recommendations  */}

          </div>
        }
      </div>
    )
}

export default Video