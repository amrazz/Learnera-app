import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import api from '../../../api';
import { toast } from 'react-toastify';
import { HashLoader } from 'react-spinners';

const ParentRelationship = ({ existingParents, onParentUpdate, studentId }) => {
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentParent, setCurrentParent] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/school_admin/parents/', {
          params: {
            paginate: false, 
          },
        });
        setParents(response.data);
      } catch (err) {
        setError('Failed to fetch parents list');
        toast.error('Failed to fetch parents list');
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
    if (existingParents && Object.keys(existingParents).length > 0) {
      setCurrentParent(existingParents);
    }
  }, [existingParents]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredParents([]);
      return;
    }

    const filtered = parents.filter((parent) => {
      const fullName = `${parent.user.first_name} ${parent.user.last_name}`.toLowerCase();
      const email = parent.user.email.toLowerCase();
      const phone = parent.user.phone_number;
      const searchLower = term.toLowerCase();
      
      return fullName.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });

    setFilteredParents(filtered);
  };

  const handleParentSelect = async (parent, relationshipType) => {
    try {
      const response = await api.post(
        `school_admin/student_parent_relationship/${studentId}/`,
        {
          parent_id: parent.id,
          relationship_type: relationshipType
        }
      );

      if (response.status === 200) {
        const newParentData = {
          parent_id: parent.id,
          parent_name: `${parent.user.first_name} ${parent.user.last_name}`,
          relationship_type: relationshipType,
          parent_phone_number: parent.user.phone_number,
          parent_email: parent.user.email
        };
        
        setCurrentParent(newParentData);
        onParentUpdate(newParentData);
        setSearchTerm('');
        setFilteredParents([]);
        setShowSearch(false);
        toast.success('Parent relationship updated successfully');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update parent relationship';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleRemoveParent = async () => {
    try {
      await api.delete(`school_admin/student_parent_relationship/${studentId}/`);
      setCurrentParent(null);
      onParentUpdate({});
      toast.success('Parent relationship removed successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to remove parent relationship';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Parent Information
        </h3>
        {!currentParent && !showSearch && (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <UserPlus className="h-5 w-5 mr-1" />
            Link Parent
          </button>
        )}
      </div>
      
      {currentParent && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="font-medium text-lg text-gray-900">
                {currentParent.parent_name}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {currentParent.relationship_type}
              </div>
              <div className="text-sm text-gray-500">
                Phone: {currentParent.parent_phone_number}
              </div>
              <div className="text-sm text-gray-500">
                Email: {currentParent.parent_email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveParent}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove parent relationship"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {(!currentParent && showSearch) && (
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-md bg-white">
              <Search className="h-5 w-5 text-gray-400 ml-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, email, or phone"
                className="w-full p-2 rounded-md focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilteredParents([]);
                  }}
                  className="p-2 hover:text-gray-700"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {searchTerm && filteredParents.length > 0 && (
            <div className="border rounded-md max-h-60 overflow-y-auto bg-white">
              {filteredParents.map((parent) => (
                <div 
                  key={parent.id} 
                  className="p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {parent.user.first_name} {parent.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {parent.user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {parent.user.phone_number}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleParentSelect(parent, 'Father')}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Father
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParentSelect(parent, 'Mother')}
                        className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                      >
                        Mother
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParentSelect(parent, 'Guardian')}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Guardian
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm && filteredParents.length === 0 && (
            <div className="text-center p-4 text-gray-500 bg-white rounded-md border">
              No parents found matching your search
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentRelationship;