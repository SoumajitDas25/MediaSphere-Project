import React from 'react'
import {BgFreezer} from '../'

const ContentLoader = ({
  enableBackgroundBlur = false
}) => {
  return (
      <div className="h-full flex items-center justify-center bg-transparent relative">
        {
          enableBackgroundBlur?
          (
          <BgFreezer className={`flex items-center justify-center sm:px-4 z-[70] absolute bg-opacity-70 dark:bg-opacity-70`}>
            <div className="flex items-center justify-center relative w-[5rem] h-[5rem]">
              <div className="w-[75%] h-[75%] border-[0.3rem] border-t-[0.3rem] border-l-[0.3rem] border-transparent border-t-color-dark_yellow border-l-color-dark_yellow dark:border-t-color-dark_yellow  dark:border-l-color-dark_yellow rounded-full animate-[spin_0.7s_ease-in-out_infinite]">
              </div>
            </div>
          </BgFreezer>
          )
          :
          (
            <div className="flex items-center justify-center relative w-[5rem] h-[5rem]">
              <div className="w-[75%] h-[75%] border-[0.3rem] border-t-[0.3rem] border-l-[0.3rem] border-transparent border-t-color-dark_yellow border-l-color-dark_yellow dark:border-t-color-dark_yellow  dark:border-l-color-dark_yellow rounded-full animate-[spin_0.7s_ease-in-out_infinite]">
              </div>
            </div>
          )
        }
      </div>
  )
}

export default ContentLoader