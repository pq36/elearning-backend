import Instructor from "../models/instructormodel.js";
import Course from "../models/courseSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Student from "../models/studentSchema.js"

export const createInstructor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new instructor
    const instructorData = new Instructor({ ...req.body, password: hashedPassword });
    await instructorData.save();

    return res.status(200).json({ msg: "Instructor registered successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const loginInstructor = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ msg: "Email and password are required" });
      }

      const instructor = await Instructor.findOne({ email });
      if (!instructor) {
          return res.status(404).json({ msg: "Email not registered" });
      }

      const isPasswordValid = await bcrypt.compare(password, instructor.password);
      if (!isPasswordValid) {
          return res.status(401).json({ msg: "Invalid password" });
      }

      // Check if JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
      }

      const token = jwt.sign(
          { id: instructor._id, email: instructor.email },
          process.env.JWT_SECRET, // Ensure this value is defined
          { expiresIn: "1h" }
      );

      return res.status(200).json({ msg: "Login successful", token });
  } catch (error) {
      console.error("Error during login:", error.message);
      return res.status(500).json({ error: "An internal error occurred" });
  }
};

export const getAllInstructors=async (req,res)=>{
    try{
        const instructorData=await Instructor.find()
        if(!instructorData){
            return res.status(404).json({msg:"Instructor is not found"})
        }
        return res.status(200).json(instructorData)
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }
}
export const getoneInstructors=async (req,res)=>{
    try{
        console.log(req.params.id)
        const instructorData=await Instructor.findById(req.params.id)
        if(!instructorData){
            return res.status(404).json({msg:"Instructor is not found"})
        }
        return res.status(200).json(instructorData)
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }
}
export const searchInstructorbyName=async (req,res)=>{
    try{
        const regexName=new RegExp(req.params.name,'i')
        const instructorData=await Instructor.find({name:{$regex:regexName}})
        if(!instructorData){
            return res.status(404).json({msg:"Instructor is not found"})
        }
        return res.status(200).json(instructorData)
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }
}
export const upadateInstructor = async (req, res) => {
    try {
      const id = req.params.id;
      const userExist = await Instructor.findById(id);
  
      if (!userExist) {
        return res.status(404).json({ msg: "Instructor not found" });
      }
  
      const updatedInstructor = await Instructor.findByIdAndUpdate(
        id,
        req.body,
        { new: true } // Return the updated document
      );
  
      if (!updatedInstructor) {
        return res.status(400).json({ msg: "Failed to update instructor" });
      }
  
      return res.status(200).json({ msg: "Instructor updated successfully", data: updatedInstructor });
    } catch (err) {
      console.error("Error updating instructor:", err);
      return res.status(500).json({ error: err.message });
    }
  };
  
export const deleteInstructor= async(req,res)=>{
        Instructor.findByIdAndDelete(req.params.id).then(result=>{
            if(result) return res.status(200).json({msg:"User deleted successfully"})
                else return res.status(404).json({msg:"Instructor is not found"})
        })
       .catch(err=>{
        return res.status(500).json({error:err.message})
    })
}


export const createCourse = async (req, res) => {
    try {
      const { title, description, duration, technology, price } = req.body;
      const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
  
      if (!token) {
        return res.status(401).json({ message: "Authentication token is required" });
      }
  
      // Decode the token and extract the instructor ID
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);  // Verify and decode the token
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
  
      console.log("Decoded Token:", decodedToken);  // Log the decoded token for debugging
  
      const instructorId = decodedToken.id;  // Use the `id` field from the decoded token
  
      if (!instructorId) {
        return res.status(400).json({ message: "Instructor ID is missing or invalid" });
      }
  
      // Validate the input fields
      if (!title || !description || !duration || !technology || price === undefined) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Create a new course
      const course = new Course({
        title,
        description,
        instructor: instructorId,  // Use the instructor ID from the decoded JWT token
        duration,
        technology,
        price,
      });
  
      // Save the course to the database
      const savedCourse = await course.save();
      res.status(201).json({ message: "Course created successfully", course: savedCourse });
    } catch (err) {
      console.error("Error creating course:", err.message);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  };
  
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update the course with the provided data
    const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({ message: "Course updated successfully", course: updatedCourse });
  } catch (err) {
    console.error("Error updating course:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Controller to fetch courses by instructor
export const getCoursesByInstructor = async (req, res) => {
    try {
      const { instructorId } = req.params; // Retrieve the instructorId from the URL
      console.log("Instructor ID:", instructorId);  // Log the instructorId for debugging
  
      if (!instructorId) {
        return res.status(400).json({ message: "Instructor ID is required" });
      }
  
      // Fetch courses for the instructor from the database
      const courses = await Course.find({ instructor: instructorId });
  
      if (!courses || courses.length === 0) {
        return res.status(404).json({ message: 'No courses found for this instructor' });
      }
  
      res.status(200).json({ courses });
    } catch (err) {
      console.error("Error fetching courses:", err);  // Log the error for debugging
      res.status(500).json({ message: "Failed to fetch courses", error: err.message });
    }
  };
  export const getCoursesByName = async (req, res) => {
    try {
      const { name } = req.query;  // Get the name from query parameters
      if (!name) {
        return res.status(400).json({ message: "Course name is required for search" });
      }
  
      // Find courses by name (case-insensitive search)
      const courses = await Course.find({
        title: { $regex: name, $options: "i" }, // Case-insensitive search
      });
  
      if (!courses || courses.length === 0) {
        return res.status(404).json({ message: 'No courses found with that name' });
      }
  
      res.status(200).json({ courses });
    } catch (err) {
      console.error("Error searching courses:", err);
      res.status(500).json({ message: "Failed to search courses", error: err.message });
    }
  };
  export const viewCourse = async (req, res) => {
    console.log("Inside viewCourse controller"); // Debug log
    const { courseId } = req.params;
    console.log(`Course ID: ${courseId}`); // Debug log
  
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        console.log("Course not found"); // Debug log
        return res.status(404).json({ message: "Course not found" });
      }
  
      console.log("Course fetched successfully", course); // Debug log
      res.json({ course });
    } catch (err) {
      console.error("Error fetching course:", err); // Debug log
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const enrollStudentInCourses = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized. No token provided." });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
  
      const { studentId } = req.params;
      const { courseIds } = req.body; // Expect an array of course IDs
  
      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({ message: "Invalid course IDs provided." });
      }
  
      // Fetch the student by studentId
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
  
      // Fetch the courses by courseIds
      const courses = await Course.find({ _id: { $in: courseIds } });
      if (courses.length !== courseIds.length) {
        return res.status(404).json({ message: "Some courses were not found." });
      }
  
      // Add new courses to the student's enrolledCourses (avoiding duplicates)
      await Student.updateOne(
        { _id: studentId },
        { $addToSet: { enrolledCourses: { $each: courseIds } } }
      );
  
      res.status(200).json({ message: "Student successfully enrolled in courses." });
    } catch (err) {
      console.error("Error enrolling student in courses:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  // Controller to get all enrolled courses of a student
  export const getStudentEnrolledCourses = async (req, res) => {
    const { studentId } = req.params;
  
    try {
      // Fetch student by studentId and populate the enrolled courses
      const student = await Student.findOne({ studentId }).populate('enrolledCourses');
  
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
  
      res.status(200).json({ enrolledCourses: student.enrolledCourses });
    } catch (err) {
      console.error("Error fetching student enrolled courses:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const enrollStudentInCourse = async (req, res) => {
    const { courseId } = req.body;
    const token = req.headers.authorization?.split(" ")[1]; // Extract JWT token
  
    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }
  
    try {
      // Verify JWT and extract user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const instructorId = decoded.id; // Instructor ID acts as studentId
  
      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
  
      // Check if student entry exists (create if not)
      let student = await Student.findOne({ studentId: instructorId });
  
      if (!student) {
        student = new Student({ studentId: instructorId, enrolledCourses: [] });
      }
  
      // Prevent duplicate enrollments
      if (student.enrolledCourses.includes(course._id)) {
        return res.status(400).json({ message: "Already enrolled in this course." });
      }
  
      // Enroll student
      student.enrolledCourses.push(course._id);
      await student.save();
  
      res.status(200).json({ message: "Successfully enrolled in the course.", student });
    } catch (err) {
      console.error("Error enrolling student in course:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  export const getAllCourses = async (req, res) => {
    try {
      const courses = await Course.find();
  
      if (courses.length === 0) {
        console.log("No courses found"); // Debug log
        return res.status(404).json({ message: "No courses found" });
      }
  
      console.log("Courses fetched successfully", courses); // Debug log
      res.status(200).json({ courses });
    } catch (err) {
      console.error("Error fetching courses:", err); // Debug log
      res.status(500).json({ message: "Server error" });
    }
  };

  export const getEnrolledCourses = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const instructorId = decoded.id;
  
      const student = await Student.findOne({ studentId: instructorId });
  
      if (!student) {
        return res.status(200).json({ enrolledCourses: [] });
      }
  
      console.log("Enrolled Courses:", student.enrolledCourses); // Debugging
      res.status(200).json({ enrolledCourses: student.enrolledCourses });
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const checkEnrollment = async (req, res) => {
    const { courseId } = req.params; // Course ID from request URL
    const token = req.headers.authorization?.split(" ")[1]; // Extract JWT token
  
    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }
  
    try {
      // Verify JWT and get instructor ID (acting as studentId)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const instructorId = decoded.id;
  
      // Find student record
      const student = await Student.findOne({ studentId: instructorId });
  
      if (!student) {
        return res.status(200).json({ enrolled: false, message: "Not enrolled" });
      }
  
      // Check if the course is in the enrolledCourses list
      const isEnrolled = student.enrolledCourses.includes(courseId);
  
      return res.status(200).json({ enrolled: isEnrolled, message: isEnrolled ? "Already enrolled" : "Not enrolled" });
    } catch (err) {
      console.error("Error checking enrollment:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  