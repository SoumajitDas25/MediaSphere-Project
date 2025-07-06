import { useEffect, useRef, useState } from 'react'
import {CameraIcon,EditIcon} from '../../assets/icons'
import { Button, ListContainer,Loader,ImageCropper } from '..'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { userAPI,videoAPI,tweetAPI,playlistAPI,connectionAPI } from '../../api'
import {setAvatar as setUserAvatar,setCoverImage as setUserCoverImage} from "../../slices/userSlice"
import {setIsCropperOpened,setCropProperties,setCropReset,setCropLoading} from '../../slices/cropSlice'
import {userEmitters} from '../../sockets/emitters'
import {refreshListeners,uploadListeners} from '../../sockets/listeners'

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
    const [videosCount,setVideosCount] = useState(null);
    const [activeButtonIndex,setActiveButtonIndex] = useState(null);
    const [activeContent,setActiveContent] = useState(null);
    const [loading,setLoading] = useState(true);
    const [isSubscribeButtonloading,setIsSubscribeButtonLoading] = useState(false);
    const {isCropperOpened,image:cropImage,aspectRatio:cropAspectRatio,cropSource,isCompleted:isCropCompleted,error:cropError} = useSelector(state=>state.crop);

    const {getUserChannelProfile,updateAvatar,updateCoverImage} = userAPI;
    const {getUserVideos} = videoAPI;
    const {getUserTweets} = tweetAPI;
    const {getUserPlaylists} = playlistAPI;
    const {toggleSubscription} = connectionAPI;
    const {emitJoinUserPage,emitLeaveUserPage} = userEmitters;
    const {listenToRefreshSubscriberCount,stopListeningRefreshSubscriberCount,listenToRefreshSubscriptionCount,stopListeningRefreshSubscriptionCount} = refreshListeners;
    const {listenToUploadComplete,stopListeningUploadComplete} = uploadListeners;

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

    // const videos = [
    //     {
    //         _id:'1',
    //         thumbnail: "https://res.cloudinary.com/predator-op/image/upload/v1721682299/zti6yq56udcw3kljsal0.png",
    //         title: "Understanding JavaScript Closures",
    //         duration: 600,
    //         viewsCount: 105,
    //         owner:{
    //                 _id:"66e9cb6ef5a380d1842c4624",
    //                 username:"predator315",
    //                 channelName:"Code_With_Predator",
    //                 avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-29T10:00:00.000+00:00",
    //         updatedAt: "2024-09-29T10:00:00.000+00:00"
    //     },
    //     {
    //         _id:'2',
    //         thumbnail: VideoThumbnail,
    //         title: "React Hooks Explained",
    //         duration: 750,
    //         viewsCount: 200,
    //         owner:{
    //                 _id:"66e9cb6ef5a380d1842c4624",
    //                 username:"predator315",
    //                 channelName:"Code_With_Predator",
    //                 avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //             }, 
    //         createdAt: "2024-09-28T12:00:00.000+00:00",
    //         updatedAt: "2024-09-28T12:00:00.000+00:00"
    //     },
    //     {
    //         _id:'3',
    //         thumbnail: "https://res.cloudinary.com/predator-op/image/upload/v1721682299/zti6yq56udcw3kljsal0.png",
    //         title: "Mastering Redux Toolkit",
    //         duration: 1200,
    //         viewsCount: 350,
    //         owner:{
    //                 _id:"66e9cb6ef5a380d1842c4624",
    //                 username:"predator315",
    //                 channelName:"Code_With_Predator",
    //                 avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //             }, 
    //         createdAt: "2024-09-27T15:00:00.000+00:00",
    //         updatedAt: "2024-09-27T15:00:00.000+00:00"
    //     }
    //   ];    
      
    // const tweets = [
    //     {
    //         _id:'1',
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         content: "Excited about the new project launch!",
    //         likesCount: 45,
    //         commentsCount: 20,
    //         isLiked:true,
    //         createdAt: "2024-09-29T12:00:00.000+00:00",
    //         updatedAt: "2024-09-30T12:00:00.000+00:00"
    //     },
    //     {
    //         _id:'2',
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         content: "Had a great day at the conference today.",
    //         likesCount: 32,
    //         commentsCount: 10,
    //         isLiked:false,
    //         createdAt: "2024-09-28T10:00:00.000+00:00",
    //         updatedAt: "2024-09-28T10:00:00.000+00:00"
    //     },
    //     {
    //         _id:'3',
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         content: "Looking forward to the weekend!",
    //         likesCount: 15,
    //         commentsCount: 50,
    //         isLiked:false,
    //         createdAt: "2024-09-27T08:00:00.000+00:00",
    //         updatedAt: "2024-09-27T08:00:00.000+00:00"
    //     }
    // ];    
    
    // const playlists = [
    //     {
    //         _id:'1',
    //         name: "JavaScript Essentials",
    //         description:
    //         "A collection of videos explaining the core concepts of JavaScript.",
    //         thumbnail: VideoThumbnail,
    //         videosCount: 4, 
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-29T11:00:00.000+00:00",
    //         updatedAt: "2024-09-29T11:00:00.000+00:00",
    //     },
    //     {
    //         _id:'2',
    //         name: "React for Beginners",
    //         description: "Beginner-friendly videos to get started with React.js.",
    //         thumbnail: VideoThumbnail,
    //         videosCount: 10, 
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-28T15:30:00.000+00:00",
    //         updatedAt: "2024-10-01T15:30:00.000+00:00",
    //     },
    //     {
    //         _id:'3',
    //         name: "Full Stack Development",
    //         description: "A complete guide to full stack development using MERN.",
    //         thumbnail: VideoThumbnail,
    //         videosCount: 6, 
    //         owner:{
    //             _id:"66e9cb6ef5a380d1842c4624",
    //             username:"predator315",
    //             channelName:"Code_With_Predator",
    //             avatar:"http://res.cloudinary.com/predator-op/image/upload/v1726598000/gczafpyqy0mnwen02stx.jpg"
    //         },
    //         createdAt: "2024-09-27T09:00:00.000+00:00",
    //         updatedAt: "2024-09-27T09:00:00.000+00:00",
    //     }
    // ];
      
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
            //first toggle isSubscribed state(before api call)
            // setChannelProfile(state=>({...state,isSubscribed:!state.isSubscribed}));
            const response = await toggleSubscription(channelProfile._id);
            channelProfile.isSubscribed=!channelProfile.isSubscribed;
            // if(!(response.data.statusCode >= 200 && response.data.statusCode <300))
            //     //re-toggle isSubscribed state if any wrong statusCode arrives
            //     setChannelProfile(state=>({...state,isSubscribed:!state.isSubscribed})); 
        }
        catch(error)
        {
            //re-toggle isSubscribed state if any error occurs
            // setChannelProfile(state=>({...state,isSubscribed:!state.isSubscribed}));
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

    useEffect(()=>{
        if(channelProfile)
        {
        //emit joinUserPage event to the backend
        emitJoinUserPage(channelProfile._id);
        console.log('User page joined '+username);
        }

        return ()=>{ //clean up
            if(channelProfile)
            {
                emitLeaveUserPage(channelProfile._id); //emit leaveUserpage event to the backend
                console.log('User page left '+username);
            }
        }
    },[channelProfile]);

    useEffect(()=>{
        //attach refreshSubscriberCount Listener upon mount
        listenToRefreshSubscriberCount((updatedSubscriberCount)=>{
            setSubscriberCount(updatedSubscriberCount);
        });

        return ()=>stopListeningRefreshSubscriberCount(); //remove listener upon unmount
    },[]);

    useEffect(()=>{
        //attach refreshSubscriptionCount Listener upon mount
        listenToRefreshSubscriptionCount((updatedSubscriptionCount)=>{
            setSubscriptionCount(updatedSubscriptionCount);
        });

        return ()=>stopListeningRefreshSubscriptionCount(); //remove listener upon unmount
    },[]);

    useEffect(()=>{
        listenToUploadComplete((uploaderId,mediaType)=>{
            if(mediaType.toLowerCase()==='video')
            {
                setVideosCount(state=>state+1); //increment the videos count if video is uploaded
            }
        })
        return ()=> stopListeningUploadComplete();
    },[]);

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
                                bgcolor={`${channelProfile.isSubscribed? 'bg-transparent hover:bg-dark-font_color_dark dark:hover:bg-light-bg_dark':'bg-color-yellow'}`} 
                                textcolor={`${channelProfile.isSubscribed? 'text-light-font_color_dark dark:text-dark-font_color_dark hover:dark:text-light-font_color_dark':'text-light-font_color_dark'}`}
                                className={`${channelProfile.isSubscribed && 'border border-light-font_color_dark dark:border-dark-font_color_dark'}`} 
                                onClick={toggleSubscribe} 
                                isLoading={isSubscribeButtonloading}
                                >
                                    {channelProfile.isSubscribed?'Unsubscribe':'Subscribe'}
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
                        // data={activeContentData?activeContentData.paginatedContent:null}  
                        // fetchData={loadContentData}
                        isPaginationEnabled={true} 
                        // totalPaginationPages={activeContentData?activeContentData.totalPages:null} 
                        fetchPaginatedData={loadContentData}
                        dataLimitPerPage={6}
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