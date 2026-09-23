import {
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/index.js";
import { create, findOne } from "../../common/repository/index.js";
import { createLoginCredentials } from "../../common/security/token.security.js";
import { UserModel } from "../../DB/model/user.model.js";
import bcrypt from "bcrypt";

export const signup = async ({ email, password, username }) => {
  const duplicatedAccount = await findOne({
    filter: { email },
    options: { select: "email" },
    model: UserModel,
  });
  if (duplicatedAccount) throw ConflictException("Email Exist");
  const account = await create({
    data: { email, password: await bcrypt.hash(password, 12), username },
    model: UserModel,
  });

  return account;
};
export const login = async ({ email, password }, issuer) => {
  const account = await findOne({
    filter: { email },
    model: UserModel,
  });
  if (!account) throw NotFoundException("Not Exist");
  const match = await bcrypt.compare(password, account.password);
  console.log({ password, hash: account.password, match });
  if (!match) throw NotFoundException("Not Exist");

      return await createLoginCredentials({user:account,issuer})

};
