import React, { useEffect } from 'react';
import {clearMessage} from '../../slices/messageSlice';
import { useDispatch, useSelector } from 'react-redux';
import { CloseIcon, TickIcon } from '../../assets/icons';

const Message = () => {

    const dispatch = useDispatch();

    const {content,type,enableIcon} = useSelector(state=>state.message);

    useEffect(() => {
        if (content) {
            const timer = setTimeout(() => {
                dispatch(clearMessage());
            }, 3000);

            return () => clearTimeout(timer); // Cleanup timeout on unmount or content change
        }
    }, [content, dispatch]);

    return (
        <div className={`z-50 fixed ${content?'bottom-28 sm:bottom-10':'bottom-0 translate-y-[100%]'} text-center left-1/2 -translate-x-1/2 flex justify-center items-center gap-2  px-4 py-2 rounded-lg transition-all opacity-90 bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light w-[80%] sm:w-auto`}>
            {
                enableIcon && <span className={`text-[1.5rem] sm:text-[1.75rem] min-h-[2rem] min-w-[2rem] w-[2rem] h-[2rem] sm:w-[2.25rem] sm:h-[2.25rem] rounded-full ${type==='Success'?'bg-color-yellow':'bg-color-light_red'} text-black font-extrabold flex items-center justify-center`}>
                {
                    type==='Success'? <TickIcon/>:<CloseIcon/>
                }
                </span>
            }
            <span className='text-[1rem] md:text-[1.1rem]'>
                {content? content: 'Sample Message'}
            </span>
        </div>
    )
}

export default Message