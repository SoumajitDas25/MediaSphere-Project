import React, { useState } from 'react'
import {Header,Sidebar} from '../index'
import { useSelector } from 'react-redux';
import { contentHeight, contentWidth, contentMargin, contentPadding } from './LayoutContent';

const Layout = ({children}) => {

  const isloggedIn = useSelector(state=>state.auth.isloggedIn);

  const [sidebarExpanded,setsidebarExpanded]=useState(false);

  return (
    <div className='w-full min-h-full'>

        <Header setsidebarExpanded={setsidebarExpanded}/>
        <Sidebar sidebarExpanded={sidebarExpanded} setsidebarExpanded={setsidebarExpanded}/>

        {/* content */}
        <div className={`${contentHeight(isloggedIn)} ${contentWidth} ${contentMargin(isloggedIn)} ${contentPadding} bg-light-bg_dark dark:bg-dark-bg_light text-light-font_color_dark dark:text-dark-font_color_light transition-colors duration-300 relative flex flex-col`}>
            {children}
        </div>
    </div>
  )
}

export default Layout;