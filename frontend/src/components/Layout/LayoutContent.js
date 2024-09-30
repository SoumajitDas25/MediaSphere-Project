export const contentHeight = (isloggedIn) => `${isloggedIn?'min-h-[calc(100vh-(2.6rem+17vw))] sm:min-h-[calc(100vh-7.6rem)]':'min-h-[calc(100vh-(1.6rem+7vw))] sm:min-h-[calc(100vh-4.1rem)]'}`;

export const contentWidth = 'sm:w-[calc(88vw)] md:w-[calc(100vw-5.5rem)] lg:w-[calc(100vw-6rem)]';

export const contentMargin = (isloggedIn) => `${isloggedIn?'mt-[calc(2.6rem+17vw)] sm:mt-[7.6rem]':'mt-[calc(1.6rem+7vw)] sm:mt-[4.1rem]'} sm:ml-[12vw] md:ml-[5.5rem] lg:ml-[6rem]`;

export const contentPadding = 'px-[0.4rem] sm:px-[1.5vw] lg:px-[1.5rem] py-[1rem] md:py-[2vw] lg:py-[1.5rem]';