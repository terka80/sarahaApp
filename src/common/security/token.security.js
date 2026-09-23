import jwt from "jsonwebtoken";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config.js";
import {
  BadException,
  NotFoundException,
} from "../exceptions/error.exception.js";
import { findById, findOne } from "../repository/base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { tokenTypeEnum } from "../enum/security.enum.js";
import { RoleEnum } from "../enum/index.js";
import { compare } from "bcrypt";

export const generateToken = async ({
  payload = {},
  options = {},
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  const signingSecret = secret ?? ACCESS_USER_TOKEN_SIGNATURE;
  return jwt.sign(payload, signingSecret, options);
};

export const verifyToken = async ({
  token = "",
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  const verificationSecret = secret ?? ACCESS_USER_TOKEN_SIGNATURE;
  return jwt.verify(token, verificationSecret);
};

const getTokenSignature = async ({ role = RoleEnum.USER } = {}) => {
  let signature;
  switch (role) {
    case RoleEnum.ADMIN:
      signature = {
        accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE,
      };
      break;

    default:
      signature = {
        accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
        refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
      };
      break;
  }
  return signature;
};
const getSignature = async ({ tokenType = tokenTypeEnum.ACCESS,role=RoleEnum.USER } = {}) => {
  const signatures= await getTokenSignature({role})
  return tokenType == tokenTypeEnum.ACCESS
    ? signatures.accessSignature
    : signatures.refreshSignature;
};

export const decodeToken = async ({
  authorization = "",
  tokenType = tokenTypeEnum.ACCESS,
}) => {
  
  const decoded= jwt.decode(authorization)
  console.log(decoded);
  if (!decoded?.aud?.length) {
    throw BadException("missing token aud");
    
  }
  


  const payload = await verifyToken({
    token: authorization,
    secret: await getSignature({ tokenType,role:decoded.aud[0] }),
  });
  if (!payload?.sub) {
    throw BadException("missing token payload");
  }

  const user = await findById({
    model: UserModel,
    id: payload.sub,
  });
  if (!user) {
    throw NotFoundException("Invalid user id");
  }
  return { user, payload };
};

export const createLoginCredentials = async ({ user, options = {} ,issuer}) => {
  const { accessSignature, refreshSignature } = await getTokenSignature({
    role: user.role,
  });
  const access_token = await generateToken({
    payload: { sub: user._id },
    secret: accessSignature,
    options: {
      ...options,
      issuer,
      audience: [user.role],
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  });
  const refresh_token = await generateToken({
    payload: { sub: user._id },
    secret: refreshSignature,
    options: {
      ...options,
      audience: [user.role],
      issuer,

      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  });
  return { access_token, refresh_token };
};


export const basicAuth = async ({ email, password }, issuer) => {
  const account = await findOne({
    filter: { email },
    model: UserModel,
  });
  if (!account) throw NotFoundException("Not Exist");
  const match = await compare(password, account.password);
  console.log({ password, hash: account.password, match });
  if (!match) throw NotFoundException("Not Exist");

      return account

};
