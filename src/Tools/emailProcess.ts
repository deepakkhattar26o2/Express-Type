import { Job } from "bull";
import sendMail from "./nodemailer";

const emailProcess = async (job : Job)=>{
    if(job.data.otp&&job.data.email)    
    {    
        sendMail(job.data.email, "One Time Password for Kode Klubs", `Your one-time-password for kode klubs is ${job.data.otp}`).then().catch((err : Error)=>{console.log(err.message, job.data.email)})
    }
}

export default emailProcess