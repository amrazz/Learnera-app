const Testimonials = () => {
    const testimonials = [
      {
        name: "Sarah Johnson",
        role: "School Principal",
        content: "Learnera has transformed how we manage our school. The efficiency gains have been remarkable, and both our staff and parents love the platform.",
        image: "/api/placeholder/80/80"
      },
      {
        name: "Michael Chen",
        role: "Teacher",
        content: "As a teacher, I can focus more on teaching and less on administrative tasks. The automated grading and attendance tracking features are game-changers.",
        image: "/api/placeholder/80/80"
      },
      {
        name: "Emma Davis",
        role: "Parent",
        content: "I feel more connected to my child's education than ever before. Being able to track progress and communicate with teachers easily has made a huge difference.",
        image: "/api/placeholder/80/80"
      }
    ];
  
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Trusted by educators, parents, and students alike</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  export default Testimonials;