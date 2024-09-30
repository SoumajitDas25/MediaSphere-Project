import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShowIcon, HideIcon } from "../../assets/icons";
import { AppLogo } from "../../assets/images";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Loader } from "../index";
import { useForm } from "react-hook-form";
import { loginThunk } from "../../slices/authSlice";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
//   const [loading,setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const error = useSelector((state) => state.auth.error);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: onchange });

  const submitHandler = async (data) => {

    // setLoading(true);
    //dispatch the login action
    dispatch(loginThunk(data))
    // .unwrap()
    // .then(()=>{
    //     setLoading(false);
    // })
    // .catch(()=>{
    //     setLoading(false);
    // })
  };

  return (
    <>
        {/* {loading &&<Loader/>} */}
        <div className="flex w-[95%] sm:w-[30rem] flex-col justify-center px-6 py-12 lg:px-8 bg-light-bg_light dark:bg-dark-btn1_color rounded-lg">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
                alt="Your Company"
                src={AppLogo}
                className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
                Login to your account
            </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form
                className="space-y-6 mt-2 flex flex-col"
                onSubmit={handleSubmit(submitHandler)}
            >
                {/* username */}
                <div>
                <Input
                    label="Username"
                    type="text"
                    placeholder="Your Username"
                    className="border-0 shadow-sm ring-1 ring-inset ring-gray-400 dark:ring-light-font_color_light placeholder:text-light-font_color_light focus:ring-2 focus:ring-inset focus:ring-color-yellow sm:text-sm sm:leading-6 rounded-lg"
                    bgColor="bg-light-bg_light dark:bg-dark-btn1_color"
                    textColor="text-light-font_color_dark dark:text-dark-font_color_light"
                    {...register("username", {
                    //validations- atleast 4 lowercase letters, atleast 1 digit & upto 3 digit, can include upto 3 underscores(not consecutively) in between letters
                    required: "Username is required",
                    maxLength: {
                        value: 15,
                        message:
                        "Username length cannot exceed more than 15 characters",
                    },
                    minLength: {
                        value: 5,
                        message: "Username must contain atleast 5 characters",
                    },
                    pattern: {
                        value: /^[a-z]([a-z]*_?[a-z]+){3}[a-z]*[0-9]{1,3}$/,
                        message: "Invalid Username",
                    },
                    })}
                />
                {/* username validation error message */}
                {errors.username && (
                    <p className="text-red-500">{errors.username.message}</p>
                )}
                </div>

                {/* password */}
                <div className="relative">
                <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your Password"
                    className="border-0 shadow-sm ring-1 ring-inset ring-gray-400 dark:ring-light-font_color_light placeholder:text-light-font_color_light focus:ring-2 focus:ring-inset focus:ring-color-yellow sm:text-sm sm:leading-6 rounded-lg"
                    bgColor="bg-light-bg_light dark:bg-dark-btn1_color"
                    textColor="text-light-font_color_dark dark:text-dark-font_color_light"
                    {...register("password", {
                    //validations- exactly one uppercase letter and rest all lowercase letters, at least 1 digit & upto 4 digits, at least one special character & upto 3 special characters(@,&,$,#,_,!), spaces not allowed.
                    required: "Password is required",
                    maxLength: {
                        value: 20,
                        message:
                        "Password length cannot exceed more than 20 characters",
                    },
                    minLength: {
                        value: 8,
                        message: "Password must contain atleast 8 characters",
                    },
                    pattern: {
                        value:
                        /^(?=(?:[^A-Z]*[A-Z]){1}[^A-Z]*$)(?=(?:[^0-9]*\d){1,4}[^0-9]*$)(?=.*[a-z])(?=.*[@&$#_!])(?!.*([@&$#_!])\1)[A-Za-z\d@&$#_!]{6,16}$/,
                        message: "Invalid Password",
                    },
                    })}
                />
                <span
                    className="absolute top-[2.25rem] right-2 text-[1.6rem] z-[30]"
                    onClick={() => setShowPassword((state) => !state)}
                >
                    {showPassword ? <HideIcon /> : <ShowIcon />}
                </span>
                {/* password validation error message */}
                {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                )}
                </div>

                {/* Credential Error message */}
                {error === "Invalid Credentials" && (
                <p className="bg-red-500 text-white rounded-lg py-2 text-center transition-all">
                    {error}
                </p>
                )}

                {/* login button */}
                <Button
                className={`mt-2 flex w-full justify-center rounded-lg bg-light-yellow px-3 py-1.5 text-sm font-semibold leading-6`}
                type="submit"
                >
                Login
                </Button>

                {/* Signup option */}
                <p className="mt-2 text-center text-sm text-light-font_color_light dark:text-dark-font_color_dark text-[1.8vw] md:text-[1rem]">
                Don&apos;t have any account?&nbsp;
                <Link
                    to="/signup"
                    className=" transition-all duration-200 hover:underline font-semibold leading-6 text-color-dark_yellow"
                >
                    Sign Up
                </Link>
                </p>
            </form>
            </div>
        </div>
    </>
  );
};

export default LoginForm;
