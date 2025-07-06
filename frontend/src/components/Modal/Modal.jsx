import React from 'react'
import {BgFreezer} from '../';
import { CloseIcon } from '../../assets/icons';

const Modal = ({
    children,
    className,
    heading = 'No Heading',
    setIsModalOpened
}) => {

  return (
    <BgFreezer className={`flex items-center justify-center sm:px-4 z-[70]`}>
        <div className={`bg-light-bg_light dark:bg-dark-btn1_color text-light-font_color_dark dark:text-dark-font_color_light rounded-lg  flex-1 sm:flex-none shadow-custom shadow-light-btn1_color  ${className}`}>

          {/* header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold">
              {heading}
            </h2>
            <span 
            className="text-[2rem]" 
            onClick={()=>setIsModalOpened(false)}
            >
              <CloseIcon/>
            </span>
          </div>

          {/* Content */}
          {children}

        </div>
    </BgFreezer>
  )
}

export default Modal