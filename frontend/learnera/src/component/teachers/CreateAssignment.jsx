import React, { useEffect, useState } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, BookOpen, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast, ToastContainer } from "react-toastify";
import { HashLoader } from "react-spinners";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters")
    .required("Title is required"),
  subject: Yup.string().required("Please select a subject"),
  classSection: Yup.string().required("Class section is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .required("Description is required"),
  dueDate: Yup.date()
    .min(new Date(), "Due date must be in the future")
    .required("Due date is required"),
});

const CreateAssignment = () => {
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionRes, subjectRes] = await Promise.all([
          api.get("teachers/class-list/"),
          api.get("teachers/subject-list/"),
        ]);
        if (sectionRes.status === 200 && subjectRes.status === 200) {
          setSections(sectionRes.data);
          setSubjects(subjectRes.data);
        }
      } catch (error) {
        setError("Failed to load required data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);
      const data = {
        title: values.title,
        description: values.description,
        subject: values.subject,
        class_section: values.classSection,
        last_date: values.dueDate,
        status: "published",
        is_active: true,
      };
      const response = await api.post("teachers/assignments/", data);
      if (response.status === 201) {
        toast.success("New Assignment Created Successfully");
        resetForm();
        navigate("/teachers/show-assignment")
      } else {
        toast.error(response.error || "Failed to create assignment.");
      }
    } catch (error) {
      toast.error("Failed to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="flex items-center justify-center">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-background to-muted rounded-lg shadow-lg">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <CardTitle className="text-3xl font-medium font-montserrat text-center">
                Create New Assignment
              </CardTitle>
            </div>
            <CardDescription className="text-center text-md">
              Create and assign work to your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{
                title: "",
                subject: "",
                description: "",
                classSection: "",
                dueDate: null,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, setFieldValue, values }) => (
                <Form className="space-y-6">
                  {/* Title Field */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Assignment Title
                    </Label>
                    <Field
                      name="title"
                      as={Input}
                      placeholder="Enter a descriptive title"
                      className={cn(
                        "transition-all duration-200",
                        errors.title && touched.title && "border-red-500"
                      )}
                    />
                    {errors.title && touched.title && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>{errors.title}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Subject and Class Section Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Subject
                        </span>
                      </Label>
                      <Select
                        onValueChange={(value) => setFieldValue("subject", value)}
                        value={values.subject}
                      >
                        <SelectTrigger
                          className={cn(
                            errors.subject && touched.subject && "border-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id.toString()}
                              className="cursor-pointer hover:bg-muted"
                            >
                              {subject.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subject && touched.subject && (
                        <Alert variant="destructive" className="py-2">
                          <AlertDescription>{errors.subject}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Class Section
                        </span>
                      </Label>
                      <Select
                        onValueChange={(value) => setFieldValue("classSection", value)}
                        value={values.classSection}
                      >
                        <SelectTrigger
                          className={cn(
                            errors.classSection &&
                              touched.classSection &&
                              "border-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select class section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem
                              key={section.id}
                              value={section.id.toString()}
                              className="cursor-pointer hover:bg-muted"
                            >
                              {section.class_name} - {section.section_name} 
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.classSection && touched.classSection && (
                        <Alert variant="destructive" className="py-2">
                          <AlertDescription>{errors.classSection}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Field
                      name="description"
                      as={Textarea}
                      placeholder="Provide detailed instructions for the assignment..."
                      className={cn(
                        "min-h-[120px] resize-y",
                        errors.description && touched.description && "border-red-500"
                      )}
                    />
                    {errors.description && touched.description && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>{errors.description}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Due Date
                      </span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !values.dueDate && "text-muted-foreground",
                            errors.dueDate && touched.dueDate && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {values.dueDate ? format(values.dueDate, "PPP") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={values.dueDate}
                          onSelect={(date) => setFieldValue("dueDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dueDate && touched.dueDate && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription>{errors.dueDate}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#0D2E76] to-[#1842DC] text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Assignment...
                      </>
                    ) : (
                      "Create Assignment"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAssignment;