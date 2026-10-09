import { Router } from "express";
import { confirmEmail, login, signup, signupWithGmail , reSendConfirmEmail, requestForgetPasswordCode, verifyForgotPasswordCode, resetForgotPassword } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import * as validators from "./authentication.validation.js";
import { BadException } from "../../common/exceptions/error.exception.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();





router.post("/signup",validation(validators.signup), async (req, res, next) => {

  const data = await signup(req.validate.body);
  return successResponse({ res, status: 201, data });
});
router.post("/signup-with-gmail",validation(validators.signup), async (req, res, next) => {

  const {status,data} = await signupWithGmail(req.validate.body , `${req.protocol}://${req.host}`);
  return successResponse({ res, status, data });
});


router.patch("/confirm-email",validation(validators.confirmEmail), async (req, res, next) => {

  const data = await confirmEmail(req.body);
  return successResponse({ res, status: 200, data });
});

router.post("/resend-forget-password-code",validation(validators.resendConfirmEmail), async (req, res, next) => {

  const data = await requestForgetPasswordCode(req.body);
  return successResponse({ res, status: 201, data });
});
router.post("/verify-forgot-password",validation(validators.confirmEmail), async (req, res, next) => {

  const data = await verifyForgotPasswordCode(req.body);
  return successResponse({ res, status: 200, data });
});
router.patch("/reset-forgot-password",validation(validators.resetForgotPassword), async (req, res, next) => {

  const data = await resetForgotPassword(req.body);
  return successResponse({ res, status: 200, data });
});
router.patch("/resend-confirm-email",validation(validators.resendConfirmEmail), async (req, res, next) => {

  const data = await reSendConfirmEmail(req.body);
  return successResponse({ res, status: 200, data });
});


router.post("/login",validation(validators.login), async (req, res, next) => {
  console.log({v:req.validate});
  
  
  const data = await login(
    req.validate.body,
    `${req.protocol}://${req.host}`,
  );
  return successResponse({ res, data });
});
export default router;
