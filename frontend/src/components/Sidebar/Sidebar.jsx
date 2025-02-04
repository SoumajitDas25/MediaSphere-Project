import React, { useEffect } from 'react'
import {
    HomeIcon,
    SubscriptionIcon,
    ChannelIcon,
    HistoryIcon,
    PlaylistIcon,
    VideoIcon,
    TweetIcon,
    LikeIcon,
    WatchLaterIcon,
    RegisterIcon,
    LoginIcon,
    LogoutIcon
} from "../../assets/icons"
import { useSelector,useDispatch } from 'react-redux';
import { logoutThunk } from '../../slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({
    sidebarExpanded,
    setsidebarExpanded
}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isloggedIn = useSelector(state=>state.auth.isloggedIn);
    const user = useSelector(state=>state.user.user);
    
    const items=[
        //when user is not loggedIn
        {
            name:'Login',
            icon: LoginIcon, 
            path: '/login',
            auth: false
        },
        {
            name:'SignUp',
            icon: RegisterIcon,
            path: '/signup',
            auth: false
        },
        //when user is loggedIn
        {
            name:'Home',
            icon: HomeIcon,
            path: '/',
            auth:true
        },
        {
            name:'Subscriptions',
            icon: SubscriptionIcon,
            path: '#',
            auth:true
        },
        {
            name:'Your Channel',
            icon: ChannelIcon,
            path: `/channel/@${(user && isloggedIn)?user.username:''}`, //append the username
            auth:true
        },
        {
            name:'Watch History',
            icon: HistoryIcon,
            path: '#',
            auth:true
        },
        {
            name:'Playlists',
            icon: PlaylistIcon,
            path: '#',
            auth:true
        },
        {
            name:'Your Videos',
            icon: VideoIcon,
            path: '#',
            auth:true
        },
        {
            name:'Your Tweets',
            icon: TweetIcon,
            path: '#',
            auth:true
        },
        {
            name:'Watch Later',
            icon: WatchLaterIcon,
            path: '#',
            auth:true
        },
        {
            name:'Logout',
            icon: LogoutIcon,
            path: '#',
            auth:true
        }
    ];

    const logoutHandler = () =>{

        //dispatch the logout action
        dispatch(logoutThunk())
        // .unwrap()
        // .then(()=>{
        //     console.log('sidebar welcome');
        //     //if logout is successful, then navigate to login
        //     navigate('/welcome');
        // });
        setsidebarExpanded(false);
    }

    // const navigateHandler = ()=>{
    // }

    return (
        <div className={`bg-light-bg_light dark:bg-dark-bg_dark text-light-font_color_dark  dark:text-dark-font_color_light h-[100vh] fixed left-0 top-0 z-[20] overflow-y-auto overflow-x-hidden transition-[width,color,background-color,border-color] ease-in-out duration-300 ${isloggedIn?'pt-[calc(2.6rem+17vw)] sm:pt-[7.6rem]':'mt-[calc(1.6rem+7vw)] sm:mt-[4.1rem]'} ${sidebarExpanded?'flex w-[75%] xsm:w-[15rem]':'hidden sm:flex sm:justify-start sm:w-[12vw] md:w-[5.5rem] lg:w-[6rem]'} scrollbar-hide`}>
            <div className={`flex flex-col items-center py-[1rem] sm:text-[1.6vw] sm:h-full max-h-[50rem] w-full ${sidebarExpanded?'w-full gap-2 text-[4vw] sm:text-[1rem]':'justify-start text-[1.8vw] md:text-[1.4vw] lg:text-[0.75rem]'} font-semibold`}>
                {
                    items.map((item,index)=>
                        item.auth===isloggedIn?
                        (
                            item.name==='Logout'?
                            (
                            <div
                            className={`flex ${sidebarExpanded?'flex-row justify-left gap-2 px-6':'flex-col justify-center px-1'} items-center py-[0.6rem] w-full hover:bg-color-yellow hover:text-light-font_color_dark rounded-lg cursor-pointer`}
                            key={index}
                            onClick={logoutHandler}
                            >
                                <span className="text-[1.6rem]">
                                    {React.createElement(item.icon)}
                                </span>
                                {item.name}
                            </div>
                            )
                            :
                            <Link
                            className={`flex ${sidebarExpanded?'flex-row justify-left gap-2 px-6':'flex-col justify-center px-1'} items-center py-[0.6rem] w-full hover:bg-color-yellow hover:text-light-font_color_dark rounded-lg cursor-pointer`}
                            key={index}
                            to={item.path}
                            onClick={()=>setsidebarExpanded(false)}
                            >
                                <span className="text-[1.6rem]">
                                    {React.createElement(item.icon)}
                                </span>
                                {item.name}
                            </Link>
                        )
                        :
                        null
                    )
                }

            </div>
        </div>
    )
}

export default Sidebar