import React from 'react'
import { Loader, SignupForm } from '../components'
import { useSelector } from 'react-redux';

const Signup = () => {
  
  const isloading = useSelector(state=>state.user.loading);

  return (
    <div className='flex justify-center items-center flex-1'>
      {isloading ? <Loader /> : null}
      <SignupForm/> 
    </div>
  );
}

export default Signup