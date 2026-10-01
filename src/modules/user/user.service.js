import jwt from "jsonwebtoken";
import {
  findById,
  findByIdAndUpdate,
} from "../../common/repository/base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { createLoginCredentials, createRevokeToken, userBaseRevokeTokenKey, userRevokeTokenKey } from "../../common/security/token.security.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../config.js";
import { ConflictException } from "../../common/exceptions/error.exception.js";
import { deleteCache, keysCache, setCache } from "../../common/services/index.js";
import { logoutEnum } from "../../common/enum/security.enum.js";

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
export const rotateToken = async (payload, user, issuer) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
  const currentDate = Date.now() + 30 * 60000;

  if (currentDate < accessExpiresIn) {
    throw ConflictException(
      "Sorry you can't create a new login credential while current access one is valid on  it's range time ",
    );
  }
  const data = await createLoginCredentials({ user, issuer });
  await createRevokeToken({payload})
   return data
};

export const logout = async (payload, user, {action =  logoutEnum.DEVICE}) => {
  
  switch (action) {
    case logoutEnum.ALL:
      user.changeCredentialsTime= new Date( )
      await user.save()
      await deleteCache({key : await keysCache({prefix: userBaseRevokeTokenKey({userId: payload.sub})}) })
      console.log({user});
      break;
  
    default:
      await createRevokeToken({payload})
      break;
  }




return 
};
