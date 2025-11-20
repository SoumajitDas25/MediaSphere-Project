import { forwardRef, useId } from "react"

const Input = forwardRef(({
    id,
    label,
    type='text',
    accept='*',
    placeholder='',
    className='',
    bgColor = 'bg-light-bg_light dark:bg-dark-bg_light',
    textColor = 'text-light-font_color_dark dark:text-dark-font_color_light',
    ...props
},ref) => {

    const inputId=useId();

    return (
        <div className="w-full">
        {
            label && <label className='block mb-1 text-[0.875rem] font-medium leading-6' htmlFor={id?id:inputId}>
                {label}
            </label>
        }
        <input 
        type={type} 
        accept={accept}
        className={`w-full px-4 py-2 rounded-lg ${bgColor} ${textColor} outline-none duration-200 border-none shadow-sm ring-1 ring-inset ring-light-font_color_light dark:ring-light-btn1_color placeholder:text-light-font_color_light focus:ring-2 focus:ring-color-dark_yellow focus:dark:ring-color-yellow ${className}`}
        placeholder={placeholder}
        id={id?id:inputId}
        ref={ref}
        {...props}
        />
        </div> 
    )
})

export default Input