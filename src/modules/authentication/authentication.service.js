import { EmailSubjectEnum, ProviderEnum } from "../../common/enum/index.js";
import {
  BadException,
  ConflictException,
  NotFoundException,
  TooManyRequestException,
} from "../../common/exceptions/index.js";
import { create, createOne, findOne } from "../../common/repository/index.js";
import { compare, hash } from "../../common/security/index.js";
import { createLoginCredentials, userBaseRevokeTokenKey } from "../../common/security/token.security.js";
import {
  deleteCache,
  expireCache,
  getCache,
  incrementByCache,
  keysCache,
  setCache,
  ttlCache,
} from "../../common/services/cache.service.js";
import {
  createOtp,
  emailEvent,
  sendEmail,
  userEmailKey,
  userEmailTrailsKey,
} from "../../common/utils/index.js";
import { WEB_CLIENT_ID } from "../../config.js";
import { UserModel } from "../../DB/model/user.model.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) {
    throw BadException("email not verified");
  }

  return payload;
}

// export const loginWithGmail = async (account, issuer) => {
//   return await createLoginCredentials({ user: account, issuer });
// };

export const signupWithGmail = async ({ idToken }, issuer) => {
  console.log({ idToken });

  const { name, email, picture } = await verifyGoogleAccount(idToken);
  console.log({ name, email, picture });
  const existAccount = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (existAccount) {
    if (existAccount.provider != ProviderEnum.GOOGLE) {
      throw ConflictException("invalid account provider");
    }
    return {
      status: 200,
      data: createLoginCredentials({ user: existAccount, issuer }),
    };
  }

  const user = await createOne({
    model: UserModel,
    data: {
      username: name,
      email,
      confirmEmail: new Date(),
      provider: ProviderEnum.GOOGLE,
      image: picture,
    },
  });
  return { status: 201, data: createLoginCredentials({ user, issuer }) };
};

const sendEmailOtp = async ({
  email,
  subject,
  expiresIn = 120,
  maxTrails = 3,
  blockInSeconds= 300,
  title
}) => {
  const existOtp_ttl = await ttlCache({
    key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
  });
  if (existOtp_ttl > 0) {
    throw ConflictException(
      `sorry we can't create a new otp while there is a valid ony try again after ${existOtp_ttl}s`,
    );
  }
  const oldTrails =
    (await getCache({ key: userEmailTrailsKey({ email, subject }) })) ?? 0;
  if (oldTrails >= maxTrails) {
    throw TooManyRequestException("max otp trails has been reached");
  }
  const code = createOtp();
  await setCache({
    key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
    value: await hash(code.toString()),
    ttl: expiresIn,
  });
  const currentTrails = await incrementByCache({
    key: userEmailTrailsKey({ email, subject }),
  });
  if (currentTrails==3) {
    await expireCache({key:  userEmailTrailsKey({email, subject}), ttl : blockInSeconds})
  }
  emailEvent.emit("sendEmail", {
    recipients: { to: email },
    subject,
    data: { code,title: title??subject },
  });
};

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

  await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
  return account;
};
export const confirmEmail = async ({ email, otp }) => {
  const account = await findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
    model: UserModel,
  });
  if (!account) throw NotFoundException("invalid account");

  const hashOtp = await getCache({
    key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw ConflictException("invalid OTP");
  }
  account.confirmEmail = new Date();
  await account.save();
  await deleteCache({
    key: await keysCache({prefix:userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })}),
  });
  return;
};
export const reSendConfirmEmail = async ({ email }) => {
  const account = await findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
    model: UserModel,
  });
  if (!account) throw NotFoundException("invalid account");

  await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });

  return;
};
export const requestForgetPasswordCode = async ({ email }) => {
  const account = await findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
    model: UserModel,
  });
  if (!account) throw NotFoundException("invalid account");

  await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGET_PASSWORD });

  return;
};
export const verifyForgotPasswordCode = async ({ email, otp }) => {
  const account = await findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
    model: UserModel,
  });
  if (!account) throw NotFoundException("invalid account");

  const hashOtp = await getCache({
    key: userEmailKey({ email, subject: EmailSubjectEnum.FORGET_PASSWORD}),
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw ConflictException("invalid OTP");
  }
  
  return account;
};
export const resetForgotPassword = async ({ email, otp , password }) => {
 const account = await verifyForgotPasswordCode({ email, otp });
 account.password= await hash(password)
 account.changeCredentialsTime= new Date()
 await account.save()
 const result = await Promise.all([
  keysCache({prefix: userBaseRevokeTokenKey({userId: account._id})}),
   keysCache({prefix:   userEmailKey({ email, subject: EmailSubjectEnum.FORGET_PASSWORD })})
 ])
    await deleteCache({
    key: [...result[0], ...result[1]],
  });
  
  return;
};
export const login = async ({ email, password }, issuer) => {
  const account = await findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
    model: UserModel,
  });
  if (!account) throw NotFoundException("Not Exist");
  const match = await bcrypt.compare(password, account.password);
  console.log({ password, hash: account.password, match });
  if (!match) throw NotFoundException("Not Exist");

  return await createLoginCredentials({ user: account, issuer });
};
