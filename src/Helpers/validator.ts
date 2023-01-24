import { Request } from "express";

const requestValidator = (req : Request, arr : string[]) : [boolean, string]=>{
    if(!req.body){
        return [false, 'request-body']
    }   
    const body = req.body;
    for(let i =0; i<arr.length; i++){
        if(!body[arr[i]]){
            return [false, arr[i]]
        }
    }
    return[true, 'valid']
}
export default requestValidator