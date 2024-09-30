import { Layout,Loader } from './components'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifyAndGetUserThunk } from './slices/authSlice';
import { setUser } from './slices/userSlice';
import { Error } from './components';

function App() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading,setLoading] = useState(true);
  const {user,error} = useSelector(state=>state.auth);
  const theme = useSelector(state=>state.theme.currentTheme);
  // const isloggedIn = useSelector(state=>state.auth.isloggedIn);

  useEffect(()=>{

    console.log('app getUser');
    //get the current user & update the state accordingly
    dispatch(verifyAndGetUserThunk())
    .unwrap()
    .then(()=>{
      setLoading(false);
    })
    .catch((error)=>{
      // if(error.statusCode===404)
      // {
      //   console.log('app welcome');
      //   //if statusCode is 404(user doesnt have tokens), then navigate to welcome
      //   navigate('/welcome');
      // }
      // else
      // {
      //   console.log('app login');
      //   //if statusCode is not 404(user has tokens but invalid or expired), then navigate to login
      //   navigate('/login');
      // }   
      setLoading(false);    
    })

  },[dispatch,navigate]);

  useEffect(()=>{
    dispatch(setUser(user)); //set the user state with the current user
  },[user]);

  useEffect(()=>{
    if(theme === 'light')
    document.documentElement.classList.remove('dark');
    else
    document.documentElement.classList.add('dark');
  },[theme])

  return (
    <>
      <Layout>
        <div className='flex-1 flex flex-col'>
          {loading? <Loader hideBackground={true}/>:<Outlet/>}
          {/* {
            (isNetworkError==='Network Error') && <NetworkError/> 
          } */}
        </div>      
      </Layout>
    </>
  )
}

export default App

//user -- with no tokens -> welcome
//user -- with expired refresh token -> welcome
//user -- with expired access & valid refresh token -> home
//user -- with valid tokens -> home