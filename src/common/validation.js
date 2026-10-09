import { z } from "zod";
import { GenderEnum } from "./enum/user.enum.js";
import { languageEnum } from "./enum/security.enum.js";



const matchFields=({original , copy , data,ctx, lang})=>{
    if (data[original] != data[copy]) {
        ctx.addIssue({
          code: "custom",
          path: [copy],
          message:lang == languageEnum.AR? `عفوا لا يمكن أن يكون ${original} أقل من ${copy}`: `fail to match ${original} with ${copy}`,
        });
      }
}


export const generalValidationFields = {
  email: z.email({
    message: "please enter a valid email like : example@domain.com",
  }),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).min(8).max(16),
  username:(lang)=> z
    .string()
    .min(2, { message:lang ===languageEnum.AR? 'عفوا لا يمكن أن يكون اسم المستخدم أقل من 2 أحرف': "username must be at least 2 characters long" })
    .max(25, { message: "username must be at most 25 characters long" }),
  phone: z.e164(),
  confirmPassword: z.string().min(8).max(16),
  gender: z.enum(GenderEnum),
  matchFields,
  otp:(lang)=>z.string().regex(/^\d{6$}/,{error:'invalid code'})
};
