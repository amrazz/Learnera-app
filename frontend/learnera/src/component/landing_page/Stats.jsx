import React, { useEffect, useState } from "react";
import { Users, School, BookOpen, Award, User } from "lucide-react";

const StatCard = ({ icon: Icon, value, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment = value / 100;
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev < value) {
          return prev + increment;
        } else {
          clearInterval(interval);
          return value;
        }
      });
    }, 20);
  }, [value]);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg animate-fade-up transition-all ease-in-out duration-300 shadow-lg">
      <Icon className="w-10 h-10 text-blue-600 mb-3" />
      <h3 className="text-4xl font-bold mb-2">
        {Math.floor(count).toLocaleString()}
       {label === "Satisfaction Rate" ? "%" : "+"}
      </h3>
      <p className="text-gray-600 text-lg">{label}</p>
    </div>
  );
};

const Stats = () => {
  const stats = [
    {
      icon: Users,
      value: 10000,
      label: "Active Users",
    },
    {
      icon: School,
      value: 50,
      label: "Partner Schools",
    },
    {
      icon: BookOpen,
      value: 10000,
      label: "Assignments Completed",
    },
    {
      icon: Award,
      value: 95,
      label: "Satisfaction Rate",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 mt-52">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
