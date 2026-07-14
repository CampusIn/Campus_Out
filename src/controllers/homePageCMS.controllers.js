import bannerModel from "../models/banners.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js"
import announcementModel from "../models/anouncement.models.js";
import { getBannerCached, setBannerCached } from "../services/bannersCached.services.js";
import { getAnnouncementsCached, setAnnouncementsCached } from "../services/announcementsCached.services.js";

const getActiveBanners = asyncHandler(async(req,res)=>{
    const cachedData = await getBannerCached()
    if(cachedData){
        
        return res.status(200).json(new ApiResponse(200,'Banners fetched successfully',cachedData))
    }
    
    const banners = await bannerModel.find({
        isActive:true
    }).sort({
        priority:-1,
        createdAt:-1
    }).select('_id title image redirectType redirectedId priority')

    if(banners.length === 0){
        return res.status(200).json(new ApiResponse(200,'No banners to show',banners))
    }
    await setBannerCached(banners)

    return res.status(200).json(new ApiResponse(200,'Banners fetched successfully',banners))
});

const getActiveAnnouncements = asyncHandler(async(req,res)=>{

    const cachedData = await getAnnouncementsCached()
    if(cachedData){
        console.log("cache hit");
        
        return res.status(200).json(new ApiResponse(200,'Announcements fetched successfully',cachedData)) 
    }

    console.log("Cache miss");
    
    const todayDate = new Date()
    const announcements = await announcementModel.find({
        isActive:true,
        expiresAt:{$gte:todayDate}

    }).sort({
        priority:-1,
        createdAt:-1
    })

    if(announcements.length === 0){
        return res.status(200).json(new ApiResponse(200,'No announcements to show',announcements))
    }

    await setAnnouncementsCached(announcements)

    return res.status(200).json(new ApiResponse(200,'Announcements fetched successfully',announcements)) 
});


export default {
    getActiveBanners,
    getActiveAnnouncements
}