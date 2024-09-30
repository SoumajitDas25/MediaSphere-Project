import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {Loader} from '../index';

const AuthLayout = ({authentication = true,children}) => {

    const navigate = useNavigate();
    // const [isloading,setLoading] = useState(true);
    const {isloggedIn:authstatus,loading,hasTokens} = useSelector(state=>state.auth);

    useEffect(()=>{
        
        console.log('auth')
        if(!loading)
        {
            if (authentication && !authstatus) 
            {   // If the route requires authentication to be true but the user is unauthenticated
                if(hasTokens)
                {   //if the user has invalid or expired tokens, then navigate to login
                    console.log('auth login');
                    navigate('/login');
                }
                else
                {   //if the user does not have tokens or has logged out mannually, then navigate to welcome 
                    console.log('auth welcome');
                    navigate('/welcome');
                }
            } 
            else if (!authentication && authstatus) 
            {   // If the route requires authentication to be false but the user is authenticated, then navigate to home route
                console.log('auth home');
                navigate('/'); 
            }
            // Otherwise, allow them to access the route as intended
        }
        // setIsloading(false);
    },[navigate,authentication,authstatus,loading]);
    
    return (
        <div className='flex-1 flex flex-col'>
            {loading && <Loader/>}
            {children}
        </div>
    )
}

export default AuthLayout