import React, { useEffect, useState } from 'react'
import {
    HomeIcon,
    SubscriptionIcon,
    DashboardIcon,
    ChannelIcon,
    HistoryIcon,
    PlaylistIcon,
    VideoIcon,
    TweetIcon,
    WatchLaterIcon,
    RegisterIcon,
    LoginIcon,
    LogoutIcon
} from "../../assets/icons"
import routeConfig from "../../router/routeConfig";
import { useSelector,useDispatch } from 'react-redux';
import { logoutThunk } from '../../slices/authSlice';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({
    sidebarExpanded,
    setsidebarExpanded
}) => {

    const dispatch = useDispatch();
    // const navigate = useNavigate();
    const isloggedIn = useSelector(state=>state.auth.isloggedIn);
    const user = useSelector(state=>state.user.user);
    
    const items1=[
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
            name:'Dashboard',
            icon: DashboardIcon,
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
            path: '/watch-history',
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
        // {
        //     name:'Watch Later',
        //     icon: WatchLaterIcon,
        //     path: '#',
        //     auth:true
        // },
        {
            name:'Logout',
            icon: LogoutIcon,
            path: '#',
            auth:true
        }
    ];

    //filter all routes which are to be shown in sidebar
    const items = routeConfig.children.filter((route)=>route.showInSidebar);

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

    return (
        <div className={`bg-light-bg_light dark:bg-dark-bg_dark text-light-font_color_dark  dark:text-dark-font_color_light h-[100vh] fixed left-0 top-0 z-[20] overflow-y-auto overflow-x-hidden transition-[width,color,background-color,border-color,transform]  duration-300 sm: ${isloggedIn?'pt-[calc(2.6rem+17vw)] sm:pt-[7.6rem]':'mt-[calc(1.6rem+7vw)] sm:mt-[4.1rem]'} flex w-[75%] xsm:w-[15rem] ${sidebarExpanded?'translate-x-0':'-translate-x-[100%] sm:translate-x-0 sm:justify-start sm:w-[12vw] md:w-[5.5rem] lg:w-[6rem]'} scrollbar-hide`}>
            <div className={`flex flex-col items-center py-[1rem] sm:h-full max-h-[50rem] w-full gap-2 text-[4vw] sm:text-[1rem] ${!sidebarExpanded && 'sm:justify-start sm:text-[1.5vw] md:text-[1.25vw] lg:text-[0.75rem] sm:gap-0'} font-semibold`}>
                {
                    items.map((item,index)=>
                        item.auth===isloggedIn?
                        (
                            <NavLink
                            className={({isActive})=>(`flex  flex-row justify-left gap-2 px-6 ${!sidebarExpanded &&'sm:flex-col sm:justify-center sm:px-1 sm:gap-0'} items-center py-[0.6rem] w-full rounded-lg cursor-pointer ${isActive? 'bg-color-yellow text-light-font_color_dark':'hover:bg-light-bg_dark dark:hover:bg-dark-btn1_color hover:text-light-font_color_dark dark:hover:text-dark-font_color_light'}`)}
                            key={index}
                            to={item.title==='Channel'?(`/channel/@${(user && isloggedIn)?user.username:''}`):item.path}
                            onClick={()=>setsidebarExpanded(false)}
                            >
                                <span className="text-[1.6rem]">
                                    {item.icon}
                                </span>
                                {item.label}
                            </NavLink>
                        )
                        :
                        null
                    )
                }
                {
                    isloggedIn && (
                        <div
                        className={`flex flex-row justify-left gap-2 px-6 ${!sidebarExpanded &&'sm:flex-col sm:justify-center sm:px-1 sm:gap-0'} items-center py-[0.6rem] w-full rounded-lg cursor-pointer hover:bg-light-bg_dark dark:hover:bg-dark-btn1_color hover:text-light-font_color_dark dark:hover:text-dark-font_color_light`}
                        // key={index}
                        onClick={logoutHandler}
                        >
                            <span className="text-[1.6rem]">
                                <LogoutIcon/>
                            </span>
                            Logout
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Sidebar