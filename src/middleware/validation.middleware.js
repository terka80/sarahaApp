import { languageEnum } from "../common/enum/security.enum.js";
import { BadException } from "../common/exceptions/error.exception.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const lang = Number(req.headers["accept-language"] ?? languageEnum.EN);
    console.log({ lang });

    const validationSchema =
      typeof schema === "function" ? schema(lang) : schema;
    const validationResult = validationSchema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    console.log({ validationResult });

    if (!validationResult.success) {
      throw BadException("validation error", validationResult.error.issues);
    }
    req.validate = validationResult.data;
    next();
  };
};
