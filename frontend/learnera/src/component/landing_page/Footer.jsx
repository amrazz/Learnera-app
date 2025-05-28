const Footer = () => {
    const links = {
      Product: ['Features', 'Pricing', 'Updates', 'Beta Program'],
      Support: ['Help Center', 'Documentation', 'API Status', 'Contact'],
      Company: ['About Us', 'Blog', 'Careers', 'Press Kit'],
      Legal: ['Terms of Service', 'Privacy Policy', 'Cookie Policy']
    };
  
    return (
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 items-center md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Learnera</h3>
              <p className="text-gray-400 mb-6">
                Simplifying school management and enhancing educational experiences through innovative technology solutions.
              </p>
            </div>
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-lg font-semibold mb-4">{category}</h4>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Learnera. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };

  
export default Footer