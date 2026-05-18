import { useState } from 'react'
import {Header,Sidebar,PublishButton, Uploader, Message } from '../'
import { useSelector } from 'react-redux';
import { contentHeight, contentWidth, contentMargin, contentPadding } from './LayoutContent';

const Layout = ({children}) => {

  const isloggedIn = useSelector(state=>state.auth.isloggedIn);
  const isUploading = useSelector(state=>state.upload.isUploading);
  const showMessage = useSelector(state=>state.message.content);

  const [sidebarExpanded,setsidebarExpanded]=useState(false);

  return (
    <div className='w-full min-h-full'>

        {/* Header */}
        <Header setsidebarExpanded={setsidebarExpanded}/>

        {/* Sidebar */}
        <Sidebar sidebarExpanded={sidebarExpanded} setsidebarExpanded={setsidebarExpanded}/>

        {/* Publish Button */}
        {isloggedIn && (isUploading?<Uploader/>:<PublishButton/>)}

        {/* Message */}
        {showMessage && <Message/>}

        {/* content */}
        <div className={`${contentHeight(isloggedIn)} ${contentWidth} ${contentMargin(isloggedIn)} ${contentPadding} bg-light-bg_dark dark:bg-dark-bg_light text-light-font_color_dark dark:text-dark-font_color_light transition-colors duration-300 relative flex flex-col`}>
            {children}
        </div>
    </div>
  )
}

export default Layout;