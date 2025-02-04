import React, { useEffect, useState } from 'react'
import {
  SidebarOptionIcon,
  LightModeIcon,
  DarkModeIcon,
  NoAvatarIcon,
  SearchIcon,
  LoginIcon
} from "../../assets/icons";
import { AppLogo } from '../../assets/images';
import { useDispatch, useSelector } from 'react-redux';
import {changeTheme} from '../../slices/themeSlice';
import { Link } from 'react-router-dom';

const Header = (
  {
    setsidebarExpanded,
    userAvatar = NoAvatarIcon
  }
) => {

  const dispatch = useDispatch();
  const isloggedIn = useSelector(state=>state.auth.isloggedIn);
  const currentTheme = useSelector(state=>state.theme.currentTheme);
  const user = useSelector(state=>state.user.user);
  
  const expandSidebar = ()=>{ 
      setsidebarExpanded(sidebarExpanded=>!sidebarExpanded);
  }

  const switchTheme = () =>{
    const newTheme = currentTheme==='light'?'dark':'light';
    dispatch(changeTheme(newTheme));
  }

  return (
    <div className="px-[1rem] sm:px-[2.2rem] py-[0.8rem] flex  flex-col gap-4 bg-light-bg_light dark:bg-black text-light-dark-font_color_dark dark:text-dark-font_color_light fixed top-0 w-full z-[30] transition-colors duration-300">

        <div className="flex justify-between">

            {/* SidebarOption */}
            <div className="flex items-center justify-center">
                <span className="text-[7vw] sm:text-[2rem] cursor-pointer" onClick={expandSidebar}>
                  <SidebarOptionIcon/>
                </span>
            </div>

            {/* App logo */}
            <div className="flex flex-row justify-center items-center gap-2 cursor-pointer">
                <img
                src={AppLogo}
                className="w-[7vw] sm:w-[2.5rem]"
                />
                <h1 className=" font-bold text-[5vw] sm:text-[1.75rem]">
                    <span className="text-color-dark_yellow">Media</span>
                    <span className="text-black dark:text-white">Sphere</span>
                </h1>
            </div>

            <div className="col-span-4 flex flex-row justify-between items-center gap-2">
              {/* theme option */}
                <span className="text-[7vw] sm:text-[2.5rem] cursor-pointer" onClick={switchTheme}>
                  {
                  currentTheme==='light'?<LightModeIcon/>:<DarkModeIcon/>
                  }
                </span>
              {/* profile option */}
              {
                <Link 
                to={isloggedIn?'/channel':'/login'}
                className="text-[7vw] sm:text-[2.5rem] cursor-pointer rounded-[50%] overflow-hidden"
                >
                  {
                    (isloggedIn && user)?
                    <img 
                    src={user.avatar}
                    className="h-[7vw] sm:h-[2.5rem] rounded-[50%]"
                    />
                    :<LoginIcon/>
                  }
                </Link>
              }
                {/* <span >
                  {
                    isloggedIn?<NoAvatarIcon/>:
                  }                
                </span> */}
            </div>
        </div>

        {/* search bar */}
        <div className={`${isloggedIn?'flex justify-center':'hidden'}`}>
            
            <div className="flex items-center justify-center rounded-[1.25rem] h-[10vw] sm:h-[2.5rem] w-[100%] sm:w-[90%] md:w-[80%] max-w-[38rem] border-light-bg_dark dark:border-dark-btn1_color border-[0.15rem]">
                <input
                type="text" 
                className="rounded-l-[1.25rem] bg-light-bg_light dark:bg-dark-bg_light text-light-font_color_dark dark:text-dark-font_color_light outline-none h-full w-full max-w-[34rem] px-[1.375rem] text-[4vw] sm:text-[1rem]" 
                placeholder="Search"
                />
                <button 
                type="button"
                className="max-w-[4rem] w-[17vw] h-full bg-light-bg_dark dark:bg-dark-btn1_color rounded-r-[1.25rem] px-[1.25rem] flex items-center">
                  <span className="text-[6vw] sm:text-[1.7rem]">
                    <SearchIcon/>
                  </span>
                </button>
            </div>
        </div>
    </div>
  )
}

export default Header