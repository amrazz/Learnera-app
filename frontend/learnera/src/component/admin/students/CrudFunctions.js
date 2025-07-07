import api from "../../../api"

export const deleteStudent = async (studentId) => {
    try {
    
        const response = await api.delete(`school_admin/student_delete/${studentId}/`);

        if (response.status === 204) {
            return true;
        } else {
            console.log('Error: Unexpected response status', response.status);
            return false;
        }
    } catch (error) {
        console.error('Failed to delete the user:', error);
        return false;
    }
};




export const BlockStudent = async (studentId, action) => {

    try {
        const response = action === "block"
            ? await api.post(`school_admin/student_block/${studentId}/`)
            : await api.delete(`school_admin/student_block/${studentId}/`)

            
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error(error.response?.data?.error || `Failed to ${action} student`);
        return false;
    }


}