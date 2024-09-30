import { forwardRef, useId } from "react"

const Input = forwardRef(({
    label,
    type='text',
    placeholder='',
    className='',
    bgColor = 'bg-light-bg_light',
    textColor = 'text-light-font_color_dark',
    ...props
},ref) => {

    const id=useId();

    return (
        <div className="w-full">
        {
            label && <label className='block mb-1 text-[0.875rem] font-medium leading-6' htmlFor={id}>
                {label}
            </label>
        }
        <input 
        type={type} 
        className={`px-3 py-2 rounded-lg ${bgColor} ${textColor} outline-none duration-200 border border-red-600 w-full ${className}`}
        placeholder={placeholder}
        id={id}
        ref={ref}
        {...props}
        />
        </div> 
    )
})

export default Input