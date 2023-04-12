const { Preference } = require("../Models/preference");
const catchAsyncError = require('../Utilities/catchAsyncError');

class preferenceController {
    getPreference = catchAsyncError(async(req,res,next)=>{
        const user=await Preference.findByPk(req.userData.userId,{attributes:{exclude:['createdAt','updatedAt']}});
        res.status(200).send(user);
    })
    savePreference = catchAsyncError(async(req,res,next)=>{
        const data={"userId":req.userData.userId,...req.body}
        console.log("data",data);
        const newPreference = await Preference.create(data)
        res.status(201).json({
            success:true
        });
    })
}

module.exports = new preferenceController;