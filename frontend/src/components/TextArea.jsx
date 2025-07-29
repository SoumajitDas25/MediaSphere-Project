import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react'

const TextArea = forwardRef(({
    label,
    limit=50,
    placeholder='',
    rows=4,
    defaultValue='',
    className='',
    bgColor = 'bg-light-bg_dark dark:bg-dark-bg_light',
    textColor = 'text-light-font_color_dark dark:text-dark-font_color_light'
},ref) => {

    const [characterLength,setCharacterLength] = useState(defaultValue?defaultValue.length:0);
    const textAreaRef = useRef(null);
    const id=useId();

    useImperativeHandle(ref,()=>({ //expose these to parent via ref
        value: textAreaRef.current.value,
        reset:()=>{
            setCharacterLength(0);
            if(textAreaRef.current.value)
            textAreaRef.current.value = '';
        }
    }));

    return (
        <div className='w-full'>
            {/* label */}
            {
            label && <label className='block mb-1 text-[0.875rem] font-medium leading-6' htmlFor={id}>
                {label}
            </label>
            }
            <div className='relative w-full'>
                {/* Text Area */}
                <textarea  
                rows={rows} 
                className={`w-full ${bgColor} ${textColor} px-4 py-2 rounded-lg border border-gray-600 dark:border-gray-400 focus:outline-color-yellow ${className}`}
                placeholder={placeholder} 
                ref={textAreaRef}
                id={id}
                maxLength={limit}
                defaultValue={defaultValue} 
                onChange={(event)=>{
                    event.stopPropagation();
                    if(event.target.value.length<=limit)
                        setCharacterLength(event.target.value.length);
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