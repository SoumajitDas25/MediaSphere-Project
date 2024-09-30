import React from 'react';

const Button = ({
  children,
  type = 'button',
  bgcolor ='bg-color-yellow',
  textcolor ='text-black',
  onClick = null,
  className ='',
  ...props
}) => {

  return (
    <button 
    type={type}
    className={`${bgcolor} ${textcolor} font-semibold px-4 py-2 rounded-lg text-[4vw] sm:text-[1rem] ${className}`}
    onClick={onClick?onClick:null}
    >
        {children}
    </button>
  )
}

export default Button