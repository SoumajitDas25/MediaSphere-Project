import { useEffect, useRef, useState } from 'react'
import {CameraIcon,EditIcon} from '../../assets/icons'
import { Button, ListContainer,Loader,ImageCropper } from '..'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { userAPI,videoAPI,tweetAPI,playlistAPI,connectionAPI } from '../../api'
import {setAvatar as setUserAvatar,setCoverImage as setUserCoverImage} from "../../slices/userSlice"
import {setIsCropperOpened,setCropProperties,setCropReset,setCropLoading} from '../../slices/cropSlice'
import {useUserEvents} from "../../events/hooks"

const Channel = () => {

    let {username} = useParams();
    const dispatch = useDispatch();
    const userId = useSelector(state=>state.user.user?._id);
    // const user = useSelector(state=>state.user.user);
    const [channelProfile,setChannelProfile] = useState(null);
    const [avatar,setAvatar] = useState(null);
    const [coverImage,setCoverImage] = useState(null);
    const [subscriberCount,setSubscriberCount] = useState(null);
    const [subscriptionCount,setSubscriptionCount] = useState(null);
    const [isSubscribed,setIsSubscribed] = useState(null);
    const [videosCount,setVideosCount] = useState(null);
    const [activeButtonIndex,setActiveButtonIndex] = useState(null);
    const [activeContent,setActiveContent] = useState(null);
    const [loading,setLoading] = useState(true);
    const [isSubscribeButtonloading,setIsSubscribeButtonLoading] = useState(false);
    const {isCropperOpened,image:cropImage,aspectRatio:cropAspectRatio,cropSource,isCompleted:isCropCompleted,error:cropError} = useSelector(state=>state.crop);
    const listRef = useRef(null);

    const {getUserChannelProfile,updateAvatar,updateCoverImage} = userAPI;
    const {getUserVideos} = videoAPI;
    const {getUserTweets} = tweetAPI;
    const {getUserPlaylists} = playlistAPI;
    const {toggleSubscription} = connectionAPI;

    const checkisUserOwnProfile = () =>{
        return userId === channelProfile._id;
    }

    const updateImageViaCropperHandler = (file,aspectRatio,cropSource) => {
        //create temp Url
        const tempUrl = URL.createObjectURL(file);

        //dispatch crop actions
        dispatch(setCropProperties({
        image: tempUrl,
        aspectRatio: aspectRatio,
        cropSource: cropSource
        })); 
        dispatch(setIsCropperOpened(true));
    }

    const onCropComplete = async (croppedImage)=>{

        //enable loading
        dispatch(setCropLoading(true));

        //make the api call based on cropSource
        let response;
        switch(cropSource)
        {
            case 'avatar':
                response = await updateAvatar(croppedImage);
                setAvatar(response.data.data.avatar);
                //update the redux user state if user own channel
                if(checkisUserOwnProfile())
                dispatch(setUserAvatar(response.data.data.avatar));
                // console.log('avatar api called');
                break;

            case 'cover-image':
                response = await updateCoverImage(croppedImage);
                setCoverImage(response.data.data.coverImage);
                //update the redux user state if user own channel
                if(checkisUserOwnProfile())
                dispatch(setUserCoverImage(response.data.data.coverImage));
                // console.log('sample-cover api called');  
                break; 
            // default:
            //     console.log('no api called');
        }

        //reset the crop state
        dispatch(setCropReset());
    } 
      
    const ribbon=[
        {
            id:'1',
            name:'Videos',
            content: {
                type: 'Video',
                getData: (userId, page, limit) => {
                    return getUserVideos(userId, page, limit);
                }
            }
        },
        {
            id:'2',
            name:'Tweets',
            content: {
                type: 'Tweet',
                getData: (userId, page, limit) => {
                    return getUserTweets(userId, page, limit);
                }
            }
        },
        {
            id:'3',
            name:'Playlists',
            content: {
                type: 'Playlist',
                getData: (userId, page, limit) => {
                    return getUserPlaylists(userId, page, limit);
                }
            }
        }
    ];

    const toggleSubscribe = async () =>{
        try
        {
            setIsSubscribeButtonLoading(true);
            const response = await toggleSubscription(channelProfile._id);
            // setIsSubscribed(response.data.data.isSubscribed);
            // console.log(response); 
        }
        catch(error)
        {
            console.log(error);
        }
        finally
        {
            setIsSubscribeButtonLoading(false);
        }
    }

    const loadContentData = async (pageIndex = 1,limit = 6)=>{

        try
        {
            let response;

            switch(activeContent.type)
            {
                case 'Video':
                {
                    response = await getUserVideos(channelProfile._id,pageIndex,limit);
                    break;
                }
                case 'Tweet':
                {
                    response = await getUserTweets(channelProfile._id,pageIndex,limit);
                    break;
                }
                case 'Playlist':
                {
                    response = await getUserPlaylists(channelProfile._id,pageIndex,limit);
                    break;
                }
            }
            if (response.status < 200 || response.status >= 300)
            {
                //error
                //TODO: View the error component
                console.log("Error: ");
                return null;
            }
            else
            {
                return response.data.data;
            }
        }
        catch(error)
        {
            //display an error message
            // console.log(error);
            return null;
        }
    }

    useEffect(()=> {

        //strip @ from the start of username
        username = username.startsWith('@') ? username.substring(1) : username;
        console.log(username);

        //get the userChannelProfile
        (async ()=>{
            try
            {
                const response = await getUserChannelProfile(username);
                if (response.status < 200 || response.status >= 300)
                {
                    //TODO: View the error component
                    console.log("Error: ");
                }
                else
                {
                    console.log(response.data.data);
                    setChannelProfile(response.data.data);
                    setAvatar(response.data.data.avatar);
                    setCoverImage(response.data.data.coverImage);
                    setSubscriberCount(response.data.data.subscriberCount);
                    setSubscriptionCount(response.data.data.subscriptionCount);
                    setVideosCount(response.data.data.videosCount);
                    setIsSubscribed(response.data.data.isSubscribed);
                    setActiveButtonIndex(0);
                    setActiveContent(ribbon[0].content);
                }
            }
            catch(error)
            {
                //error
                console.log("Error: ",error);
            }
            finally
            {
                setLoading(false);
            }
        })();

    },[]);

    useUserEvents({
        data:{
            userId:(channelProfile && channelProfile._id)?channelProfile._id:null
        },
        publicListeners:{
            updateAvatar:(payload)=>{
                setAvatar(payload);
            },
            updateCoverImage:(payload)=>{
                setCoverImage(payload);
            },
            updateSubscriberCount:(payload)=>{
            //   console.log("Subscriber Count: ",payload);
              setSubscriberCount(payload);
            },
            updateSubscriptionCount:(payload)=>{
            //   console.log("Subscription Count: ",payload);
              setSubscriptionCount(payload);
            },
            updateVideoCount:(payload)=>{
                setVideosCount(payload);
            },
            reloadVideoList:(payload)=>{
                listRef.current.reload(payload);
                console.log("reloadVideoList: ",payload);
            },
            reloadTweetList:(payload)=>{
                console.log(activeContent.type);
                // if(activeContent.type==='Tweet')
                    listRef.current.reload(payload);
                console.log("reloadTweetList: ",payload);
            },
            reloadPlaylistList:(payload)=>{
                listRef.current.reload(payload);      
                console.log("reloadPlaylistList: ",payload);
            }
        },
        privateListeners:{
            updateIsSubscribed:(payload)=>{
                if(userId===payload.id)
                {
                    setIsSubscribed(payload.data); 
                    // console.log(payload.data);      
                }
            }
        }
    });

    return (
        <div>
        {
            loading?
            <Loader hideBackground={true}/>
            :
            <div>

                {/* Image Cropper */}
                {(isCropperOpened && cropImage && cropAspectRatio && cropSource)? 
                    <ImageCropper
                    file={cropImage}
                    aspect={cropAspectRatio}
                    cropSource = {cropSource}
                    onComplete={onCropComplete}
                    />:''
                }

                {/* Cover Image */}
                <div 
                style={{backgroundImage: `${coverImage?`url(${coverImage})`:'none'}`}} 
                className={`w-full aspect-[4/1] overflow-hidden bg-cover bg-center relative ${coverImage?'':'bg-light-btn1_color dark:bg-dark-btn1_color'}`}
                >
                    {/* Update Cover Image Label - only visible for the channel owner*/}
                    {checkisUserOwnProfile()  && (
                        <label 
                        htmlFor='update-cover-image'
                        className='absolute bottom-0 right-0 bg-light-bg_light  dark:bg-dark-bg_dark text-light-font_color_dark  dark:text-dark-font_color_light text-[1rem] sm:text-[1.25rem] md:text-[1.5rem] lg:text-[2rem] px-4 py-2 lg:px-6 lg:py-4 rounded-tl-lg cursor-pointer shadow-custom shadow-light-btn1_color dark:shadow-none' 
                        >
                            <input type="file" 
                            accept="image/*"
                            id="update-cover-image" 
                            className="sr-only"
                            onChange={(event)=>{
                                if(event.target.value)
                                {
                                    updateImageViaCropperHandler(event.target.files[0],4/1,'cover-image');

                                    //clear input value
                                    event.target.value=null;
                                    }
                                } 
                                }
                            />
                            <CameraIcon/>
                        </label>
                    )}
                    {/* <img src={SampleCoverImage} alt="" /> */}
                </div>

                {/* Info Section*/}
                <div className="flex py-4 gap-4">
                    {/* avatar */}
                    <div className='flex flex-row items-center'>
                        <div className='relative'>
                            <img 
                            src={avatar} 
                            className="h-[8rem] aspect-1 md:h-[9rem] lg:h-[10rem] rounded-full"
                            alt="User Avatar"
                            />
                            {/* Avatar Label - only visible for the channel owner*/}
                            {checkisUserOwnProfile()  && (
                                <label 
                                htmlFor='update-avatar'
                                className='absolute bottom-[5px] right-[5px] bg-light-bg_light  dark:bg-dark-bg_dark text-light-font_color_dark  dark:text-dark-font_color_light text-[1.25rem] md:text-[1.5rem] p-2  rounded-full cursor-pointer shadow-custom shadow-light-btn1_color dark:shadow-none' 
                                >
                                    <input type="file" 
                                    accept="image/*"
                                    id="update-avatar" 
                                    className="sr-only"
                                    onChange={(event)=>{
                                        if(event.target.value)
                                        {
                                            updateImageViaCropperHandler(event.target.files[0],1,'avatar');

                                            //clear input state
                                            event.target.value=null;
                                        }
                                        } 
                                    }
                                    />
                                    <EditIcon/>
                                </label>
                            )}
                            
                        </div>
                    </div>
                    {/* info */}
                    <div className='flex flex-1 flex-col gap-2 justify-center'>
                        {/* Channel Name */}
                        <h1 className="font-bold text-[5vw] md:text-[2rem] lg:text-[2.5rem]">{channelProfile.channelName}</h1>
                        
                        <div className='flex flex-row justify-start gap-4 items-center text-[3vw] sm:text-[1rem] md:text-[1.2rem] text-light-font_color_light dark:text-dark-font_color_dark'>
                            {/* username */}
                            <h2>@{channelProfile.username}</h2>
                            {/* videos count */}
                            <h2>{videosCount} Videos</h2>
                        </div>
                        
                        <div className='flex flex-row gap-4 text-[3vw] sm:text-[1rem] md:text-[1.2rem] text-light-font_color_light dark:text-dark-font_color_dark'>
                            {/* subscriber count */}
                            <h2>{subscriberCount} Subscribers</h2>
                            {/* channelSubscribed count */}
                            <h2>{subscriptionCount} Subscribed</h2>
                        </div>

                        <div className='py-2'>
                            {/* Subscribe/Unsubscribe button - not visible for the channel owner*/}
                            {channelProfile._id !== userId  && (
                                <Button 
                                fontSize='text-[0.7rem] sm:text-[0.8rem] md:text-[1rem]' 
                                bgcolor={`${isSubscribed? 'bg-transparent hover:bg-dark-font_color_dark dark:hover:bg-light-bg_dark':'bg-color-yellow'}`} 
                                textcolor={`${isSubscribed? 'text-light-font_color_dark dark:text-dark-font_color_dark hover:dark:text-light-font_color_dark':'text-light-font_color_dark'}`}
                                className={`${isSubscribed && 'border border-light-font_color_dark dark:border-dark-font_color_dark'}`} 
                                onClick={toggleSubscribe} 
                                isLoading={isSubscribeButtonloading}
                                >
                                    {isSubscribed?'Unsubscribe':'Subscribe'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ribbon */}
                <ul className='flex flex-row justify-center gap-4 p-4'>
                    {
                        ribbon.map((button,index)=>(
                        <Button 
                        className={`${activeButtonIndex===index?'bg-color-yellow':'bg-transparent hover:bg-light-bg_light dark:hover:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light'}`} 
                        key={button.id} 
                        onClick={()=>{
                            setActiveButtonIndex(()=>index);
                            setActiveContent(button.content);
                        }}
                        >
                            {button.name}
                        </Button>
                        ))
                    }
                </ul>

                {/* Horizontal line bar */}
                <div className='bg-light-font_color_dark dark:bg-dark-font_color_light h-[1px]'></div>

                {/*Paginated Content*/}
                {
                    activeContent && (
                        <ListContainer 
                        type={activeContent.type} 
                        isPaginationEnabled={true}  
                        fetchPaginatedData={loadContentData}
                        dataLimitPerPage={6}
                        ref={listRef}
                        allowDelayLoad={true}
                        delayLoadDurationInMs={700}
                        />
                    )
                }

            </div>
        }
        </div>
        
    )
}

export default Channel