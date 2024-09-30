import React from 'react'
import { NetworkErrorImg } from '../../assets/images'
import { useSelector } from 'react-redux';
import { contentHeight } from '../Layout/LayoutContent';

const NetworkError = ({
    message='Error',
    imgPath=NetworkErrorImg
}) => {

    const isloggedIn = useSelector(state=>state.auth.isloggedIn);

    return (
        <div className={`absolute w-full top-0 left-0 ${contentHeight(isloggedIn)} flex justify-center items-center z-[30] bg-light-bg_dark dark:bg-dark-bg_light`}>
            <div className="flex-1 flex flex-col gap-4 items-center justify-center">
                <img className='h-[80vw] sm:h-[60vw] lg:h-[30rem]' src={imgPath} alt={message} />
                <h1 className="text-light-font_color_dark dark:text-dark-font_color_light font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center">{message}</h1>
            </div>
        </div>
    )
}

export default NetworkError