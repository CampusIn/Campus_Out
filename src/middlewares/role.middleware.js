import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";

const roleMiddleware = (role) =>{
    
    return asyncHandler(async(req,res,next) =>{
        if(!req.user){
            throw new ApiError(401,"Unauthorized")
        }
        if(req.user.role !==role){
            throw new ApiError(403,"Forbidden")
        }
        next();
    })
}

export default roleMiddleware