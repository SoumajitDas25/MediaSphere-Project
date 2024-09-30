import React from 'react'
import { Button,Loader } from '../components';
import { Link } from 'react-router-dom';
import { RightArrowIcon } from '../assets/icons';

const Welcome = () => {

  return (
    <div className="flex flex-col items-center flex-1">

      <div className="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32 flex flex-col gap-4 items-center px-2">
        {/* heading */}
        <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
          Unleash Your Creativity with MediaSphere
        </h1>
        {/* paragraph */}
        <p className="mt-6 text-lg text-center max-w-3xl">Join MediaSphere, the ultimate platform for creators. Upload, share, and connect with a global audience while growing your community. Discover new content, engage with others, and take control of your creative journey like never before!</p>
        <Button>
          <Link to='/login'>
            <span className="flex flex-row gap-1 hover:gap-2 items-center transition-all">Get Started<RightArrowIcon/></span>
          </Link>
        </Button>
      </div>

      {/* image */}
      {/* <div className="hidden lg:block lg:col-span-5">
        banner
      </div> */}
      
    </div>
  )
}

export default Welcome;