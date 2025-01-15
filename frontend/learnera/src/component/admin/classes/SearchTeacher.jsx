import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Loader } from 'lucide-react';

const SearchTeacher = ({ teachers, onChange, initialTeacherName, error }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const dropdownRef = useRef(null);

  // Initialize with existing teacher if provided
  useEffect(() => {
    if (!isInitialized && initialTeacherName && teachers.length > 0) {
      // Find teacher by full name
      const initialTeacher = teachers.find(teacher => 
        `${teacher.user.first_name} ${teacher.user.last_name}`.toLowerCase() === initialTeacherName.toLowerCase()
      );
      
      if (initialTeacher) {
        setSelectedTeacher(initialTeacher);
        setSearch(initialTeacherName);
        onChange(initialTeacher.id);
      } else {
        // If no exact match found, just set the search text
        setSearch(initialTeacherName);
      }
      setIsInitialized(true);
    }
  }, [initialTeacherName, teachers, isInitialized, onChange]);


  // Filter teachers based on search
  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      `${teacher.user.first_name} ${teacher.user.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [search, teachers]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (teacher) => {
    setSelectedTeacher(teacher);
    onChange(teacher.id);
    setSearch(`${teacher.user.first_name} ${teacher.user.last_name}`);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedTeacher(null);
    setSearch('');
    onChange('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value) {
      setSelectedTeacher(null);
      onChange('');
    }
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a teacher..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
         {(selectedTeacher || search) && (
          <button
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredTeachers.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">No teachers found</div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => handleSelect(teacher)}
                className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
              >
                <span>
                  {teacher.user.first_name} {teacher.user.last_name}
                </span>
                {selectedTeacher?.id === teacher.id && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchTeacher;