import { tokenTypeEnum } from "../common/enum/security.enum.js";
import { ForbiddenException, UnAuthorizedException } from "../common/exceptions/error.exception.js";
import { basicAuth, decodeToken } from "../common/security/token.security.js";

export const authentication = (tokenType = tokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw UnAuthorizedException("UnAuthorized Account");
    }
    const [key, credentials] = authorization.trim().split(/\s+/);
    console.log({ key, credentials });

    switch (key) {
      case "Basic":
        const [email,password] = Buffer.from(credentials,'base64').toString().split(":")
        console.log({email,password});
        req.user=await basicAuth({email,password})
        break;
      case "Bearer":
        const { user, payload } = await decodeToken({
          authorization: credentials,
          tokenType,
        });
        req.user = user;
        req.payload = payload;
        break;
      default:
        next(
          new Error("invalid authentication schema", {
            cause: { status: 400 },
          }),
        );
        break;
    }
    next();
  };
};
export const authorization = (accessRole) => {
  return async (req, res, next) => {

    if (req.user.role<accessRole) {
      throw ForbiddenException("Forbidden Account");
    }
  
    next();
  };
};
