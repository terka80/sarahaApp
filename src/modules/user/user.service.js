import jwt from "jsonwebtoken";
import {
  findById,
  findByIdAndUpdate,
} from "../../common/repository/base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { createLoginCredentials } from "../../common/security/token.security.js";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js";
import { ConflictException } from "../../common/exceptions/error.exception.js";

export const profile = async (user) => {
  // const payload=await verifyToken({token:authorization})
  // console.log({payload});
  // const user=await  findById({model:UserModel,id:payload.sub})

  return user;
};
export const update = async (user, data) => {
  // const payload=await verifyToken({token:authorization})
  // console.log({payload});
  const account = await findByIdAndUpdate({
    model: UserModel,
    id: user._id,
    update: data,
  });

  return account;
};
export const rotateToken = async (payload,user,issuer) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
  const currentDate = Date.now() + (30*60000);

  if (currentDate < accessExpiresIn) {
    throw ConflictException(
      "Sorry you can't create a new login credential while current access one is valid on  it's range time ",
    );
  }
      return await createLoginCredentials({user,issuer})



};
