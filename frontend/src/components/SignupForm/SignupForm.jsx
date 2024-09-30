import React, { useEffect, useState,useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { ShowIcon,HideIcon,NoUserIcon } from "../../assets/icons";
import { AppLogo } from '../../assets/images';
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "../index";
import { useForm,Controller } from 'react-hook-form';
import { signupThunk } from '../../slices/userSlice';

const SignupForm = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const avatarFieldRef = useRef(null); 
    const [showPassword,setShowPassword] = useState(false);
    const [avatarPath,setAvatarPath] = useState(null);
    const error = useSelector(state=>state.user.error);
    const {register,handleSubmit,formState:{errors},control} = useForm({mode:onchange});

    // useEffect(()=>{

    //     if(user)
    //     { //if user is registered, then navigate to login
    //         navigate('/login');
    //     }

    // },[user]);

    const submitHandler = async ({avatar,username,channelName,email,password}) => {

        //create the form data & append the fields
        const formData = new FormData();
        formData.append('avatar',avatar);
        formData.append('username',username);
        formData.append('channelName',channelName);
        formData.append('email',email);
        formData.append('password',password);

        //dispatch the signup action
        dispatch(signupThunk(formData))
        .unwrap()
        .then(()=>{
            console.log('signup login');
            //if signup is successful, then navigate to login
            navigate('/login');
        });
    }

    const previewAvatar = (event,field) => {

        console.log(event.target.files[0]);

        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            //set the filepath to the avatarPath
            setAvatarPath(reader.result);
          };
          reader.readAsDataURL(file);
        }
        else
        {
            setAvatarPath(null);
        }
                                 
        field.onChange(event.target.files[0]); // Manually update the field's value
    }

    return (
        <div className="flex w-[95%] sm:w-[30rem] flex-col justify-center px-6 py-12 lg:px-8 bg-light-bg_light dark:bg-dark-btn1_color rounded-lg">

            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src={AppLogo}
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
                    Create a new account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6 mt-2 flex flex-col" onSubmit={handleSubmit(submitHandler)}>

                    {/* avatar */}
                    <div className='relative flex flex-col items-center'>
                     
                        <label 
                        htmlFor="avatar"
                        className='block mb-1 text-[0.875rem] font-medium leading-6'
                        >
                            Avatar
                        </label>

                        {/* avatar preview */}
                        <img 
                        src={avatarPath?avatarPath:NoUserIcon} 
                        className="h-32 rounded-full overflow-hidden"
                        onClick={()=>avatarFieldRef.current.click()}
                        alt="Avatar" />

                        {/* avatar field - hidden*/}
                        <Controller
                        name="avatar"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Avatar is required' }}
                        render={({ field }) => (
                            <input
                            id='avatar'
                            ref={avatarFieldRef}
                            type='file'
                            placeholder='Your Username'
                            accept="image/*"
                            className='hidden' 
                            onChange = {(event)=>previewAvatar(event,field)}
                            />
                        )}
                        /> 
                        
                        {/* username validation error message */}
                        {errors.avatar && (
                            <p className="text-red-500">
                                {errors.avatar.message}
                            </p>
                        )}
                    </div>

                    {/* username */}
                    <div>
                        <Input
                        label='Username'
                        type='text'
                        placeholder='Your Username'
                        className='border-0 shadow-sm ring-1 ring-inset ring-gray-400 dark:ring-light-font_color_light placeholder:text-light-font_color_light focus:ring-2 focus:ring-inset focus:ring-color-yellow sm:text-sm sm:leading-6 rounded-lg'
                        bgColor='bg-light-bg_light dark:bg-dark-btn1_color'
                        textColor='text-light-font_color_dark dark:text-dark-font_color_light'
                        {...register(
                            "username",
                            {   //validations- atleast 4 lowercase letters, atleast 1 digit & upto 3 digit, can include upto 3 underscores(not consecutively) in between letters
                                required: "Username is required",
                                maxLength: {
                                    value: 15,
                                    message: "Username length cannot exceed more than 15 characters"
                                },
                                minLength: {
                                    value: 5,
                                    message: "Username must contain atleast 5 characters"
                                },
                                pattern: {
                                    value: /^[a-z]([a-z]*_?[a-z]+){3}[a-z]*[0-9]{1,3}$/,
                                    message: "Invalid Username"
                                }
                            })
                        }
                        />
                        {/* username validation error message */}
                        {errors.username && (
                            <p className="text-red-500">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* channelName */}
                    <div>
                        <Input
                        label='Channel Name'
                        type='text'
                        placeholder='Your Channel Name'
                        className='border-0 shadow-sm ring-1 ring-inset ring-gray-400 dark:ring-light-font_color_light placeholder:text-light-font_color_light focus:ring-2 focus:ring-inset focus:ring-color-yellow sm:text-sm sm:leading-6 rounded-lg'
                        bgColor='bg-light-bg_light dark:bg-dark-btn1_color'
                        textColor='text-light-font_color_dark dark:text-dark-font_color_light'
                        {...register(
                            "channelName",
                            {   //validations- only letters,digits, spaces, hyphens (-), and underscores (_) allowed, no leading or trailing spaces. 
                                required: "Channel Name is required",
                                maxLength: {
                                    value: 20,
                                    message: "Channel Name length cannot exceed more than 15 characters"
                                },
                                minLength: {
                                    value: 5,
                                    message: "Channel Name must contain atleast 5 characters"
                                },
                                pattern: {
                                    value: /^[A-Za-z0-9_-](.*[A-Za-z0-9 _-])?$/,
                                    message: "Invalid Channel Name"
                                }
                            })
                        }
                        />
                        {/* channelName validation error message */}
                        {errors.channelName && (
                            <p className="text-red-500">
                                {errors.channelName.message}
                            </p>
                        )}
                    </div>

                    {/* email */}
                    <div>
                        <Input
                        label='Email Address'
                        type='text'
                        placeholder='Your Email Address'
                        className='border-0 shadow-sm ring-1 ring-inset ring-gray-400 dark:ring-light-font_color_light placeholder:text-light-font_color_light focus:ring-2 focus:ring-inset focus:ring-color-yellow sm:text-sm sm:leading-6 rounded-lg'
                        bgColor='bg-light-bg_light dark:bg-dark-btn1_color'
                        textColor='text-light-font_color_dark dark:text-dark-font_color_light'
                        {...register(
                            "email",
                            {   //validations- must start with an uppercase letter.
                                required: "Email Address is required",
                                pattern: {
                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                    message: "Email address must be a valid address"
                                }                        
                            })
                        }
                        />
                        {/* Email validation error message */}
                        {errors.email && (
                            <p className="text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                                  
                    {/* password */}
                    <div className="relative">
                        <Input
                        label='Password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Your Password'
                        className='border-0 shadow-sm ring-1 ring-inset ring-gray-400 dark:ring-light-font_color_light placeholder:text-light-font_color_light focus:ring-2 focus:ring-inset focus:ring-color-yellow sm:text-sm sm:leading-6 rounded-lg'
                        bgColor='bg-light-bg_light dark:bg-dark-btn1_color'
                        textColor='text-light-font_color_dark dark:text-dark-font_color_light'
                        {...register(
                            "password",
                            {   //validations- exactly one uppercase letter and rest all lowercase letters, at least 1 digit & upto 4 digits, at least one special character & upto 3 special characters(@,&,$,#,_,!), spaces not allowed.
                                required: "Password is required",
                                maxLength: {
                                    value: 20,
                                    message: "Password length cannot exceed more than 20 characters"
                                },
                                minLength: {
                                    value: 8,
                                    message: "Password must contain atleast 8 characters"
                                },
                                pattern: {
                                    value: /^(?=(?:[^A-Z]*[A-Z]){1}[^A-Z]*$)(?=(?:[^0-9]*\d){1,4}[^0-9]*$)(?=.*[a-z])(?=.*[@&$#_!])(?!.*([@&$#_!])\1)[A-Za-z\d@&$#_!]{6,16}$/,
                                    message: "Invalid Password"
                                }
                            })
                        }
                        />
                        <span className="absolute top-[2.25rem] right-2 text-[1.6rem] z-[30]" onClick={()=>setShowPassword((state)=>!state)}>
                            {showPassword?<HideIcon/>:<ShowIcon/>}
                        </span>
                        {/* password validation error message */}
                        {errors.password && (
                            <p className="text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (<p className="bg-red-500 text-white rounded-lg py-2 text-center transition-all">{error}</p>)}
                    
                    {/* signup button */}
                    <Button className={`mt-2 flex w-full justify-center rounded-lg bg-light-yellow px-3 py-1.5 text-sm font-semibold leading-6`}
                    type='submit'
                    >
                        Sign Up
                    </Button>

                    {/* login option */}
                    <p className="mt-2 text-center text-sm text-light-font_color_light dark:text-dark-font_color_dark text-[1.8vw] md:text-[1rem]">
                        Already have an account?&nbsp; 
                        <Link
                        to="/login"
                        className=" transition-all duration-200 hover:underline font-semibold leading-6 text-color-dark_yellow">
                        Login
                        </Link>
                    </p>
                </form>       
            </div>
        </div>
    )
}

export default SignupForm;