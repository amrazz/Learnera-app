import React from "react";
import { image1, image2 } from "../../assets/landing_page";
import {useSlideOnScroll} from '../landing_page/constants/CustomHook';
const About = ({aboutRef}) => {
    const imgRef1 = useSlideOnScroll('right')
    const imgRef2 = useSlideOnScroll('left')
  return (
    <section ref={aboutRef}>
      <div className="mx-8 md:mx-32 py-24 md:py-52">
        <div className="container max-md:my-10 flex flex-col md:flex-row justify-between items-center gap-32">
          <img
            src={image1}
            ref={imgRef1}
            alt="about1"
            className="rounded-3xl w-[420px] h-auto"
          />
          <div className="text-center w-full md:w-[60%]">
            <p className="text-gray-950 text-lg leading-relaxed font-palanquin animate-fade-left animate-duration-700 animate-delay-1000">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse
              doloremque quae quia nam quos, sapiente, pariatur dolorum eveniet
              corrupti qui maiores minima quaerat aperiam dolorem quam
              praesentium mollitia. Veniam, harum? Ipsam voluptatibus impedit
              recusandae ullam maxime veniam cupiditate assumenda iure? Fuga
              natus laboriosam magnam quod, quidem nulla cum accusantium ipsum
              fugiat accusamus id dolore repellendus ducimus animi incidunt
              libero in? Quae voluptatem ipsam corrupti exercitationem
            </p>
          </div>
        </div>
        <div className="container  flex flex-col md:flex-row justify-between items-center gap-32 mt-12 ">
          <div className="md:p-12 text-center w-full md:w-[60%] order-2 md:order-none">
            <p className="text-gray-950 text-lg leading-relaxed font-palanquin animate-fade-right animate-duration-700 animate-delay-1000">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse
              doloremque quae quia nam quos, sapiente, pariatur dolorum eveniet
              corrupti qui maiores minima quaerat aperiam dolorem quam
              praesentium mollitia. Veniam, harum? Ipsam voluptatibus impedit
              recusandae ullam maxime veniam cupiditate assumenda iure? Fuga
              natus laboriosam magnam quod, quidem nulla cum accusantium ipsum
              fugiat accusamus id dolore repellendus ducimus animi incidunt
              libero in? Quae voluptatem ipsam corrupti exercitationem
            </p>
          </div>
          <img
            src={image2}
            ref={imgRef2}
            alt="about1"
            className="rounded-3xl max-md:py-10 w-[420px] h-auto delay-[300ms] duration-[600ms] taos:translate-x-[100%] taos:opacity-0"
            data-taos-offset="400"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
