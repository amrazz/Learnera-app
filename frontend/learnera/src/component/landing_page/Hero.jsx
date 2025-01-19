import React from "react";
import { hero_video, poster } from "../../assets/landing_page";
import { CustomButton } from "./CustomBtn";
const Hero = () => {
  return (
    <section className="h-auto w-full bg-black">
      <div className="absolute inset-0">
        <video
          src={hero_video}
          autoPlay
          muted
          loop
          preload="auto"
          className="w-full h-full object-cover"
          poster={poster}
        ></video>
      </div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div
        className="relative mx-4 md:mx-20 my-12 flex flex-col items-center md:items-start justify-center 
        h-full"
      >
        <h1 className="text-3xl md:text-4xl font-montserrat font-semibold text-white mb-4 text-center md:text-left animate-fade-right animate-duration-400 animate-delay-150">
          Learnera: <br />
          <span className="text-yellow-500">Simplifying School Life</span>
        </h1>
        <div className="font-montserrat md:mx-20 max-md:text-center">
          {/* <p className="text-base md:text-xl animate-fade-left text-gray-300 tracking-wide max-w-xl font-medium leading-relaxed">
            Redefining School Management with Smart,
            <br /> Integrated Solutions
          </p> */}
          <ShinyText text="" />
        </div>
        <div className="flex flex-col md:flex-row gap-3 animate-fade animate-delay-300 justify-center items-center py-10 md:space-y-0 md:space-x-10">
            <CustomButton title="I'm a Student" />
            <CustomButton title="I'm a Tutor" />
            <CustomButton title="I'm a Parent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
