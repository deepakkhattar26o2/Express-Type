import Bull from "bull";
import emailProcess from "./emailProcess";

const emailQueue = new Bull('email', {
    redis:{
        host:"localhost",
        port:"6379"
    }
})

emailQueue.process(emailProcess)


export default emailQueue