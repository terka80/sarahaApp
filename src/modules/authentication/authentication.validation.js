import { z } from "zod";
import { GenderEnum } from "../../common/enum/user.enum.js";
import { generalValidationFields } from "../../common/validation.js";

export const loginSchema = z.object({
  email:generalValidationFields.email,
  password: generalValidationFields.password,
});

export const login = z.object({
  body: loginSchema,
  query: z.strictObject({
    lang: z.enum(["en", "ar"]).default("en"),
    darkMode: z.stringbool().default(false),
  }),
});

export const signup = (lang)=>{
  return z.object({
  body: loginSchema
    .safeExtend({
      username: generalValidationFields.username(lang),
      phone: generalValidationFields.phone,
      gender: generalValidationFields.gender,
      confirmPassword: generalValidationFields.password,
    })
    .superRefine((data, ctx) => {
      console.log({ data, ctx });
      generalValidationFields.matchFields({
        original: "password",
        copy: "confirmPassword",
        data,
        ctx,
        lang
      });
      if (data.password != data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: lang == languageEnum.AR ? 'عفوا لا يمكن أن يكون كلمة المرور غير متطابقة مع تأكيد كلمة المرور' : 'password not matched with it"s conform one',
        });
      }
    }),
})
};




export const confirmEmail = (lang)=>{
  return  z.object({
  body: z.strictObject({
    email: generalValidationFields.email(lang),
    otp:generalValidationFields.otp(lang)
  }),

});

}

export const resendConfirmEmail = (lang)=>{
  return  z.object({
  body: z.strictObject({
    email: generalValidationFields.email(lang),
  }),

});

}
export const resetForgotPassword = (lang)=>{
  return  z.object({
  body: z.strictObject({
    email: generalValidationFields.email(lang),
    otp: generalValidationFields.otp(lang),
      password: generalValidationFields.password,
    confirmPassword: generalValidationFields.password,
    })
    .superRefine((data, ctx) => {
      console.log({ data, ctx });
      generalValidationFields.matchFields({
        original: "password",
        copy: "confirmPassword",
        data,
        ctx,
        lang
      });

})
})

}










// .refine((data)=>{
//     console.log({data});
//     return data.password == data.confirmPassword
// },{message:"password not matched with it's conform one "})
