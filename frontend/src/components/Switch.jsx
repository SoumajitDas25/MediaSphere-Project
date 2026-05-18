import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {ContentLoader} from ".";

const Switch = ({
    isSwitchOn=false,
    onSwitchOn=null,
    onSwitchOff=null,
    isLoading=false,
    isEnabled = true,
})=>{

    return (
        <button
        type="button"
        onClick={() => {
            if(isSwitchOn)
                onSwitchOff && onSwitchOff();
            else
                onSwitchOn && onSwitchOn();    
        }}
        className={`relative inline-flex w-[3rem] sm:w-[3.5rem] md:w-[3.75rem] aspect-[2.5/1] items-center rounded-full transition-colors duration-300 shadow-custom shadow-dark-btn1_color dark:shadow-light-btn1_color ${
            isSwitchOn ? "bg-color-yellow" : "bg-gray-300"
        }`}
        >
            <span
            className={`inline-block h-full w-[40%] transform rounded-full bg-white transition-transform duration-300 shadow-custom shadow-dark-btn1_color dark:shadow-light-btn1_color ${
                isSwitchOn ? "translate-x-[150%]" : "translate-x-0"
            }`}
            >
                {
                    isLoading && <ContentLoader height='h-full' className="scale-75"/>
                }       
            </span>
        </button>
    );
}

export default Switch;