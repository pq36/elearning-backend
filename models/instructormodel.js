import mongoose from "mongoose";
const instructorSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    technology:{
        type:String,
        required:true
    }
    ,
    email:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    specialization:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
export default mongoose.model("Instructor",instructorSchema)

