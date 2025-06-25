import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Save, FileQuestion, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '../../../api';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(3, 'Title must be at least 3 characters')
      .required('Title is required'),
  
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .required('Description is required'),
  
  
    total_mark: Yup.number()
      .min(1, 'Total marks must be at least 1')
      .required('Total marks is required'),
  
    start_time: Yup.date()
      .min(new Date(), 'Start time cannot be in the past')
      .required('Start time is required'),
  
    end_time: Yup.date()
      .min(Yup.ref('start_time'), 'End time must be after start time')
      .min(new Date(), 'End time cannot be in the past')
      .required('End time is required'),
  
    meet_link: Yup.string()
      .matches(
        /^https:\/\/meet\.google\.com\/.+/,
        'Please enter a valid Google Meet link'
      )
      .required('Google Meet link is required'),
  
    class_section: Yup.string()
      .required('Class section is required'),
  });
  

const CreateExam = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('');
  const [sections, setSections] = useState([]);
  const [subject, setSubject] = useState([])

  useEffect(() => {
    fetchSections()
    fetchSubjects()
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('teachers/class-list/');
      setSections(response.data);
    } catch (err) {
      setError('Failed to load class sections');
    }
  };
  const fetchSubjects = async () => {
    try {
      const response = await api.get('teachers/subject-list/');
      setSubject(response.data);
    } catch (err) {
      setError('Failed to load Subjects');
    }
  };

  const initialValues = {
    title: '',
    description: '',
    duration: '',
    total_mark: '',
    start_time: '',
    end_time: '',
    subject: '',
    meet_link: '',
    class_section: null
  };

  const calculateDuration = (startTime, endTime) => {
    
    return Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
        <ToastContainer />
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileQuestion className="h-6 w-6 text-primary" />
            Create New Exam
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setError('');
              try {
                const duration = calculateDuration(values.start_time, values.end_time)
                const response = await api.post('teachers/exams/', {
                  ...values,
                  duration: duration,
                  total_mark: parseInt(values.total_mark)
                });

                const examId = response.data.id;
                resetForm();
                toast.success("Exam details created successfully.")
                navigate(`/teachers/create-exam/${examId}/questions`);
              } catch (err) {
                setError(err.response?.data?.message || 'Failed to create exam');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting, handleReset, setFieldValue }) => (
              <Form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Exam Title *
                    </Label>
                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      className={`mt-1 ${touched.title && errors.title ? 'border-red-500' : ''}`}
                      placeholder="Enter exam title"
                    />
                    {touched.title && errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Description *
                    </Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      className={`mt-1 min-h-[100px] ${touched.description && errors.description ? 'border-red-500' : ''}`}
                      placeholder="Enter exam description"
                    />
                    {touched.description && errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    

                    <div className=''>
                      <div>
                      <Label htmlFor="subject" className="text-sm font-semibold">
                      Subject
                    </Label>
                    <Select 
                      onValueChange={(value) => setFieldValue('subject', value)}
                    >
                      <SelectTrigger className={touched.subject && errors.subject ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subject.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.subject_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.class_section && errors.class_section && (
                      <p className="text-red-500 text-sm mt-1">{errors.class_section}</p>
                    )}
                      </div>
                      
                    </div>
                    <div>
                      <Label htmlFor="total_mark" className="text-sm font-semibold">
                        Total Marks *
                      </Label>
                      <Field
                        as={Input}
                        id="total_mark"
                        name="total_mark"
                        type="number"
                        className={`mt-1 ${touched.total_mark && errors.total_mark ? 'border-red-500' : ''}`}
                        placeholder="Enter total marks"
                      />
                      {touched.total_mark && errors.total_mark && (
                        <p className="text-red-500 text-sm mt-1">{errors.total_mark}</p>
                      )}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="start_time" className="text-sm font-semibold">
                        Start Time *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Field
                          as={Input}
                          id="start_time"
                          name="start_time"
                          type="datetime-local"
                          className={`pl-10 ${touched.start_time && errors.start_time ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {touched.start_time && errors.start_time && (
                        <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                      )}
                      
                    </div>

                    <div>
                      <Label htmlFor="end_time" className="text-sm font-semibold">
                        End Time *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Field
                          as={Input}
                          id="end_time"
                          name="end_time"
                          type="datetime-local"
                          className={`pl-10 ${touched.end_time && errors.end_time ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {touched.end_time && errors.end_time && (
                        <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meet_link" className="text-sm font-semibold">
                      Google Meet Link *
                    </Label>
                    <Field
                      as={Input}
                      id="meet_link"
                      name="meet_link"
                      className={`mt-1 ${touched.meet_link && errors.meet_link ? 'border-red-500' : ''}`}
                      placeholder="https://meet.google.com/..."
                    />
                    {touched.meet_link && errors.meet_link && (
                      <p className="text-red-500 text-sm mt-1">{errors.meet_link}</p>
                    )}
                  </div>

                  <div className=''>
                    
                    <Label htmlFor="class_section" className="text-sm font-semibold">
                      Class Section *
                    </Label>
                    <Select 
                      onValueChange={(value) => setFieldValue('class_section', value)}
                    >
                      <SelectTrigger className={touched.class_section && errors.class_section ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select class section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id.toString()}>
                            {`${section.class_name} - ${section.section_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.class_section && errors.class_section && (
                      <p className="text-red-500 text-sm mt-1">{errors.class_section}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Creating...' : 'Create Exam'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateExam;