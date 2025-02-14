import mongoose from "mongoose";

// Define the Student Schema
const studentSchema = new mongoose.Schema(
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor", // Reference to the Student model
      required: true,
      },
      enrolledCourses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course", // Reference to the Course model
        },
      ],
    },
    {
      timestamps: true, // Automatically manage createdAt and updatedAt
    }
  );
export default mongoose.model("Student",studentSchema)

