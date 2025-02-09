import {createInstructor,loginInstructor,getAllInstructors,searchInstructorbyName,getoneInstructors,upadateInstructor,deleteInstructor,createCourse,
getCoursesByInstructor,updateCourse,getCoursesByName,getStudentEnrolledCourses,enrollStudentInCourses,
enrollStudentInCourse} from "../controllers/instructorController.js";
import Course from "../models/courseSchema.js";
import express from "express"
const route=express.Router()
route.post("/createInstructor",createInstructor)
route.get('/getAllInstructors',getAllInstructors)
route.post("/login", loginInstructor);
route.get('/getOneInstructorById/:id',getoneInstructors)
route.get('/searchAllInstructorByNameFilter/:name',searchInstructorbyName)
route.put('/updateInstructor/:id',upadateInstructor)
route.delete('/deleteInstructorById/:id',deleteInstructor)
route.post("/createcourse", createCourse);
route.put("/update/:id", updateCourse);
route.get("/mycourses/:instructorId", getCoursesByInstructor);
route.get("/searchcourses", getCoursesByName);
route.post("/:studentId/enroll", enrollStudentInCourses);
route.get("/:studentId/courses", getStudentEnrolledCourses);
route.post('/:studentId/enroll', enrollStudentInCourse);
route.get("/course/:courseId", async (req, res) => {
    console.log("Request received for /course/:courseId"); // Log the request
  
    const { courseId } = req.params;
    console.log(`Course ID from URL: ${courseId}`); // Log the courseId
  
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        console.log("Course not found"); // Log if course is not found
        return res.status(404).json({ message: "Course not found" });
      }
  
      console.log("Course fetched successfully", course); // Log fetched course
      res.json({ course });
    } catch (err) {
      console.error("Error fetching course:", err); // Log any errors
      res.status(500).json({ message: "Server error" });
    }
  });

export default route
