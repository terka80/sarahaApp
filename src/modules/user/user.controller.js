import { Router } from "express";
import { successResponse } from "../../common/utils/success.response.js";
import { logout, profile, rotateToken, update } from "./user.service.js";
import { authentication, authorization, uploadMiddleware } from "../../middleware/index.js";
import { tokenTypeEnum } from "../../common/enum/security.enum.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { fileValidation, localFileUpload } from "../../common/utils/index.js";

const router=Router()





router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    isRequired:false,
    multerMiddleware:localFileUpload({maxFileSize:2})
    // .array('attachment',2),
    .single('attachment'),
    customPath:'users',
    validation:fileValidation.image
  })
,
  async (req, res) => {
    req.user.image=req.file.finalPath
    await req.user.save()
    return successResponse({ res, data: {user:req.user } });
  },
);

router.get('/',authentication(), async(req,res)=>{
    const data= await profile(req.user)
    return successResponse({res,data})
})
router.patch('/',authentication(),authorization(RoleEnum.ADMIN), async(req,res)=>{
    const data= await update(req.user,req.body)
    return successResponse({res,data})
})
router.post('/rotate-token',authentication(tokenTypeEnum.REFRESH), async(req,res)=>{
    const data= await rotateToken(req.payload,req.user,`${req.protocol}://${req.host}`)
    return successResponse({res,data})
})
router.post('/logout',authentication(), async(req,res)=>{
    const data= await logout(req.payload,req.user,req.body)
    return successResponse({res,data})
})















export default router