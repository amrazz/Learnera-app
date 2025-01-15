import React from 'react';
import { BookOpen, Users, Calendar, ChartColumn, MessageCircle, Shield } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = ({ featuresRef }) => {
  const features = [
    {
      icon: BookOpen,
      title: "Academic Management",
      description: "Comprehensive tools for curriculum planning, assignment tracking, and grade management."
    },
    {
      icon: Users,
      title: "Multi-User Platform",
      description: "Dedicated portals for administrators, teachers, students, and parents with role-specific features."
    },
    {
      icon: Calendar,
      title: "Scheduling & Attendance",
      description: "Automated attendance tracking and smart scheduling for classes and events."
    },
    {
      icon: ChartColumn,
      title: "Performance Analytics",
      description: "Detailed insights into student performance with visual analytics and progress tracking."
    },
    {
      icon: MessageCircle,
      title: "Communication Hub",
      description: "Integrated messaging system for seamless communication between all stakeholders."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security ensuring your data is protected and always accessible."
    }
  ];

  return (
    <section ref={featuresRef} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Powerful Features</h2>
        <p className="text-xl text-gray-600 text-center mb-12">Everything you need to manage your educational institution</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;