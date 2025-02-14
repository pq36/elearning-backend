import {createInstructor,loginInstructor,getAllInstructors,searchInstructorbyName,getoneInstructors,upadateInstructor,deleteInstructor,createCourse,
getCoursesByInstructor,updateCourse,getCoursesByName,getStudentEnrolledCourses,enrollStudentInCourses,
enrollStudentInCourse,getAllCourses,checkEnrollment,getEnrolledCourses} from "../controllers/instructorController.js";
import Course from "../models/courseSchema.js";
import express from "express"
import mongoose from "mongoose"; 
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
route.get("/getAllCourses",getAllCourses);
route.post("/enroll", enrollStudentInCourse);
route.get("/check-enrollment/:courseId", checkEnrollment);
route.get("/getEnrolledCourses",getEnrolledCourses)
route.get("/course/:courseId", async (req, res) => {
  console.log("📌 Request received for /course/:courseId");

  const { courseId } = req.params;
  console.log(`📌 Course ID from URL: ${courseId}`);

  // ✅ Validate Course ID format
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    console.log("❌ Invalid Course ID format");
    return res.status(400).json({ message: "Invalid Course ID format" });
  }

  try {
    console.log("🔍 Searching for course in database...");

    // ✅ First, find the course
    const course = await Course.findById(courseId);
    if (!course) {
      console.log("❌ Course not found");
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Ensure views field exists (default to 0)
    if (course.views === undefined || course.views === null) {
      course.views = 0;
    }

    // ✅ Now, increment views manually and save
    course.views += 0.5;
    await course.save();

    console.log("✅ Course found, views updated:", course.views);
    res.json({ course });

  } catch (err) {
    console.error("🔥 Error fetching course:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default route
