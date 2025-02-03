import React, { useState, useEffect } from "react";
import api from "../../../api";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as Cal } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const FeeCreation = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ type: null, id: null });

  const [feeStructures, setFeeStructures] = useState([]);
  const [newStructure, setNewStructure] = useState({
    fee_type: "GLOBAL",
    academic_year: "",
    section: null,
    fee_category: "",
    amount: "",
    due_date: null,
  });
  const [editingStructure, setEditingStructure] = useState(null);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchFeeStructures();
    fetchClasses();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("school_admin/fee-categories/");
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch fee categories");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("school_admin/classes");
      setClasses(response.data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };

  const handleCreateCategory = async () => {
    try {
      setLoading(true);
      await api.post("school_admin/fee-categories/", newCategory);
      await fetchCategories();
      setNewCategory({ name: "", description: "" });
      toast.success("Fee category created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    try {
      setLoading(true);
      await api.put(`school_admin/fee-categories/${editingCategory.id}/`, editingCategory);
      await fetchCategories();
      setEditingCategory(null);
      toast.success("Fee category updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setLoading(true);
      await api.delete(`school_admin/fee-categories/${id}/`);
      await fetchCategories();
      toast.success("Fee category deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const response = await api.get("school_admin/fee-structures/");
      setFeeStructures(response.data);
    } catch (error) {
      toast.error("Failed to fetch fee structures");
    }
  };

  const handleCreateStructure = async () => {
    try {
      setLoading(true);
      const payload = {
        ...newStructure,
        due_date: newStructure.due_date ? format(newStructure.due_date, "yyyy-MM-dd") : null,
        section: selectedSection?.id,
      };
      await api.post("school_admin/fee-structures/", payload);
      await fetchFeeStructures();
      setNewStructure({
        fee_type: "GLOBAL",
        academic_year: "",
        section: null,
        fee_category: "",
        amount: "",
        due_date: null,
      });
      setSelectedClass(null);
      setSelectedSection(null);
      toast.success("Fee structure created successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create Fee structure"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditStructure = async () => {
    try {
      setLoading(true);
      const payload = {
        ...editingStructure,
        due_date: editingStructure.due_date ? format(editingStructure.due_date, "yyyy-MM-dd") : null,
        section: selectedSection,
      };
      await api.put(`school_admin/fee-structures/${editingStructure.id}/`, payload);
      await fetchFeeStructures();
      setEditingStructure(null);
      setSelectedClass(null);
      setSelectedSection(null);
      toast.success("Fee structure updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update structure"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStructure = async (id) => {
    try {
      setLoading(true);
      await api.delete(`school_admin/fee-structures/${id}/`);
      await fetchFeeStructures();
      toast.success("Fee structure deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete structure");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false)
    }
  };

  const confirmDelete = (type, id) => {
    setItemToDelete({type, id});
    setIsDeleteDialogOpen(true)
  }
  const executeDelete = () => {
    if (itemToDelete.type === "category") {
      handleDeleteCategory(itemToDelete.id)
    } else if (itemToDelete.type === "structure") {
      handleDeleteStructure(itemToDelete.id)
    }
  }

  return (
    <>
      <ToastContainer />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Fee Management</CardTitle>
          <CardDescription className="text-center" >
            Manage fee categories and structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Fee Categories</TabsTrigger>
              <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            </TabsList>

            {/* Fee Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                          id="name"
                          value={editingCategory ? editingCategory.name : newCategory.name}
                          onChange={(e) =>
                            editingCategory
                              ? setEditingCategory({ ...editingCategory, name: e.target.value })
                              : setNewCategory({ ...newCategory, name: e.target.value })
                          }
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editingCategory ? editingCategory.description : newCategory.description}
                          onChange={(e) =>
                            editingCategory
                              ? setEditingCategory({ ...editingCategory, description: e.target.value })
                              : setNewCategory({ ...newCategory, description: e.target.value })
                          }
                          placeholder="Enter description"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                        className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white font-montserrat"
                          onClick={editingCategory ? handleEditCategory : handleCreateCategory}
                          disabled={loading}
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingCategory ? "Update Category" : "Create Category"}
                        </Button>
                        {editingCategory && (
                          <Button
                            variant="outline"
                            className="ml-2 "
                            onClick={() => setEditingCategory(null)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white">
                          <TableHead className="text-center text-white">Name</TableHead>
                          <TableHead className="text-center text-white">Description</TableHead>
                          <TableHead className="text-center text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="text-center">{category.name}</TableCell>
                            <TableCell className="text-center">{category.description}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingCategory(category)}
                              >
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => confirmDelete("category", category.id)}
                                  >
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the fee category.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={executeDelete}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fee Structures Tab */}
            <TabsContent value="structures">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Structures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Fee Type</Label>
                        <Select
                          value={editingStructure ? editingStructure.fee_type : newStructure.fee_type}
                          onValueChange={(value) =>
                            editingStructure
                              ? setEditingStructure({ ...editingStructure, fee_type: value })
                              : setNewStructure({ ...newStructure, fee_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GLOBAL">Global Fee</SelectItem>
                            <SelectItem value="SPECIFIC">Specific Fee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Fee Category</Label>
                        <Select
                          value={editingStructure ? editingStructure.fee_category : newStructure.fee_category}
                          onValueChange={(value) =>
                            editingStructure
                              ? setEditingStructure({ ...editingStructure, fee_category: value })
                              : setNewStructure({ ...newStructure, fee_category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={editingStructure ? editingStructure.amount : newStructure.amount}
                          onChange={(e) =>
                            editingStructure
                              ? setEditingStructure({ ...editingStructure, amount: e.target.value })
                              : setNewStructure({ ...newStructure, amount: e.target.value })
                          }
                          placeholder="Enter amount"
                        />
                      </div>

                      <div>
                        <Label>Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !(editingStructure ? editingStructure.due_date : newStructure.due_date) && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editingStructure
                                ? editingStructure.due_date
                                  ? format(editingStructure.due_date, "PPP")
                                  : "Pick a date"
                                : newStructure.due_date
                                ? format(newStructure.due_date, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Cal
                              mode="single"
                              selected={editingStructure ? editingStructure.due_date : newStructure.due_date}
                              onSelect={(date) =>
                                editingStructure
                                  ? setEditingStructure({ ...editingStructure, due_date: date })
                                  : setNewStructure({ ...newStructure, due_date: date })
                              }
                              initialFocus
                              disabled={(date) => date < new Date()} 
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {(editingStructure ? editingStructure.fee_type : newStructure.fee_type) === "SPECIFIC" && (
                        <>
                          <div>
                            <Label>Academic Year</Label>
                            <Input
                              value={editingStructure ? editingStructure.academic_year : newStructure.academic_year}
                              onChange={(e) =>
                                editingStructure
                                  ? setEditingStructure({ ...editingStructure, academic_year: e.target.value })
                                  : setNewStructure({ ...newStructure, academic_year: e.target.value })
                              }
                              placeholder="Enter academic year"
                            />
                          </div>

                          <div>
                            <Label>Class</Label>
                            <Select
                              value={selectedClass ? selectedClass.id : ""}
                              onValueChange={(value) => {
                                const selected = classes.find(cls => cls.id === value);
                                setSelectedClass(selected);
                                setSelectedSection(null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map(cls => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.class_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Section</Label>
                            <Select
                              value={selectedSection ? selectedSection.id : ""}
                              onValueChange={(value) => {
                                const selected = selectedClass.sections.find(sec => sec.id === value);
                                setSelectedSection(selected);
                              }}
                              disabled={!selectedClass}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedClass && selectedClass.sections.map(sec => (
                                  <SelectItem key={sec.id} value={sec.id}>
                                    {sec.section_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="flex items-end">
                        <Button
                        className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white font-montserrat"
                          onClick={editingStructure ? handleEditStructure : handleCreateStructure}
                          disabled={loading}
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingStructure ? "Update Structure" : "Create Structure"}
                        </Button>
                        {editingStructure && (
                          <Button
                            variant="outline"
                            className="ml-2"
                            onClick={() => setEditingStructure(null)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow  className="bg-gradient-to-b from-[#0D2E76] to-[#1842DC] rounded-lg">
                          <TableHead className="text-white text-center">Type</TableHead>
                          <TableHead className="text-white text-center">Category</TableHead>
                          <TableHead className="text-white text-center">Amount</TableHead>
                          <TableHead className="text-white text-center">Academic Year</TableHead>
                          <TableHead className="text-white text-center">Due Date</TableHead>
                          <TableHead className="text-white text-center">Section</TableHead>
                          <TableHead className="text-white text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feeStructures.map((structure) => (
                          <TableRow key={structure.id}>
                            <TableCell className="text-center">{structure.fee_type}</TableCell>
                            <TableCell className="text-center">{structure.fee_category_name}</TableCell>
                            <TableCell className="text-center">${structure.amount}</TableCell>
                            <TableCell className="text-center">
                              {structure.academic_year_name}
                            </TableCell>
                            <TableCell className="text-center">
                              {structure.due_date}
                            </TableCell>
                            <TableCell className="text-center">
                            {structure.class_name ?structure.class_name + " - " : ""}{structure.section_name || "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingStructure(structure)}
                              >
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => confirmDelete("structure", structure.id)}
                                  >
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the fee structure.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={executeDelete}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default FeeCreation;