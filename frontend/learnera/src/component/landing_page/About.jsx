import React from "react";
import { image1, image2 } from "../../assets/landing_page";
import { useSlideOnScroll } from '../landing_page/constants/CustomHook';

const About = ({ aboutRef }) => {
  const imgRef1 = useSlideOnScroll('right');
  const imgRef2 = useSlideOnScroll('left');

  return (
    <section ref={aboutRef}>
      <div className="mx-8 md:mx-32 py-24 md:py-52">
        <div className="container max-md:my-10 flex flex-col md:flex-row justify-between items-center gap-32">
          <img
            src={image1}
            ref={imgRef1}
            alt="Digital Learning Environment"
            className="rounded-3xl w-[420px] h-auto"
          />
          <div className="text-center w-full md:w-[60%]">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Transforming Education Management</h2>
            <p className="text-gray-950 text-lg leading-relaxed font-palanquin">
              Learnera revolutionizes school management by bringing together students, 
              teachers, and parents on a single unified platform. Our comprehensive 
              solution streamlines administrative tasks, enhances communication, and 
              creates an engaging learning environment that promotes academic excellence.
              With real-time tracking of academic progress, seamless attendance 
              management, and instant communication channels, we're making education 
              management more efficient and accessible than ever before.
            </p>
          </div>
        </div>
        <div className="container flex flex-col md:flex-row justify-between items-center gap-32 mt-12">
          <div className="md:p-12 text-center w-full md:w-[60%] order-2 md:order-none">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Empowering Educational Communities</h2>
            <p className="text-gray-950 text-lg leading-relaxed font-palanquin">
              Our platform empowers every stakeholder in the educational journey. 
              Teachers can focus more on teaching with automated grading and curriculum 
              planning tools. Parents stay connected with their child's progress through 
              regular updates and easy communication channels. Students benefit from 
              organized study materials, assignment tracking, and personalized learning 
              paths. Together, we're creating a collaborative ecosystem that supports 
              academic growth and student success.
            </p>
          </div>
          <img
            src={image2}
            ref={imgRef2}
            alt="Collaborative Learning"
            className="rounded-3xl max-md:py-10 w-[420px] h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default About;