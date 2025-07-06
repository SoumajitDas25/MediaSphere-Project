import React, { useEffect, useState } from 'react';
import {ContentLoader} from "../";

const Button = ({
  children,
  type = 'button',
  bgcolor ='bg-color-yellow',
  textcolor ='text-black',
  fontSize = null,
  onClick = null,
  className ='',
  isLoading = false,
  ...props
}) => {

    return (
      <button 
      type={type}
      className={`flex flex-row justify-center items-center gap-2 ${bgcolor} ${textcolor} font-semibold px-4 py-2 rounded-lg ${fontSize?fontSize:'text-[4vw] sm:text-[1rem]'} ${className}`}
      onClick={onClick?onClick:null}
      >
          {isLoading && 
          <ContentLoader 
          height='h-[4vw] sm:h-[1.5rem]' 
          thickness='border-[0.2rem]'
          />}
          {children}
      </button>
    )
}

export default Button