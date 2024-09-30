import React from 'react'
import { AppLogo } from '../../assets/images'
import { useSelector } from 'react-redux'
import { contentHeight } from '../Layout/LayoutContent'

const Loader = ({
    hideBackground = false
}) => {

    const isloggedIn = useSelector(state=>state.auth.isloggedIn);

    return (
        <div className={`absolute w-full top-0 left-0 ${contentHeight(isloggedIn)} flex justify-center items-center z-[80] backdrop-blur-sm ${hideBackground?'bg-light-bg_dark dark:bg-dark-bg_light':'bg-transparent'}`}>
            <div className="flex items-center justify-center relative w-[8rem] h-[8rem]">
                <div className="w-[75%] h-[75%] border-[0.4rem] border-t-[0.4rem] border-l-[0.4rem] border-light-bg_dark dark:border-dark-bg_light border-t-color-dark_yellow  border-l-color-dark_yellow dark:border-t-color-dark_yellow  dark:border-l-color-dark_yellow rounded-full animate-[spin_0.7s_ease-in-out_infinite]">
                </div>
                <img
                src={AppLogo}
                className={`absolute w-[40%] h-[40%] top-[26%] left-[30%] bg-transparent`}
                />
            </div>
        </div>
    )
}

export default Loader