const Heading = ({
    children,
    className
}) => {
  return (
    <h1 className={`text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold mx-4 text-light-font_color_dark dark:text-dark-font_color_light ${className}`}>
        {children}
    </h1>
  )
}

export default Heading