import { useEffect } from 'react';
import { forwardRef, useId, useImperativeHandle, useState } from 'react'

const TextArea = forwardRef(({
    id,
    label,
    limit=50,
    placeholder='',
    rows=4,
    value='',
    setValue=null,
    className='',
    bgColor = 'bg-light-bg_dark dark:bg-dark-bg_light',
    textColor = 'text-light-font_color_dark dark:text-dark-font_color_light'
},ref) => {

    const [characterLength,setCharacterLength] = useState(value.length);
    const inputId=useId();

    useImperativeHandle(ref,()=>({ //expose these to parent via ref
        value:value,
        reset:()=>{
            setCharacterLength(0);
            if(value)
            setValue('');
        }
    }));

    useEffect(()=>{
        setCharacterLength(value.length);
    },[value]);

    return (
        <div className='w-full'>
            {/* label */}
            {
            label && <label className='block mb-1 text-[0.875rem] font-medium leading-6' htmlFor={id?id:inputId}>
                {label}
            </label>
            }
            <div className='relative w-full'>
                {/* Text Area */}
                <textarea  
                rows={rows} 
                className={`w-full resize-none ${bgColor} ${textColor} px-4 py-2 rounded-lg duration-200 border-none outline-none ring-1 ring-inset ring-light-font_color_light dark:ring-light-btn1_color placeholder:text-light-font_color_light focus:ring-2 focus:ring-color-dark_yellow focus:dark:ring-color-yellow ${className}`}
                placeholder={placeholder} 
                id={id?id:inputId}
                maxLength={limit}
                value={value}
                onChange={(event)=>{
                    event.stopPropagation();
                    if(event.target.value.length<=limit)          
                        setValue(event.target.value);
                }}
                >
                </textarea>
                {/* Character Count */}
                <span className='absolute bottom-[0.75rem] right-[0.75rem] flex flex-row justify-center items-center gap-[0.15rem]'>
                    <span>{characterLength}</span>
                    <span>/</span>
                    <span>{limit}</span>
                </span>
            </div> 
        </div>
    )
})

export default TextArea