import mongoose from "mongoose";
import { GenderEnum } from "../../common/enum/index.js";

export const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: 25,
      minLength: 2,
    },
    lastName: {
      type: String,
      required: true,
      maxLength: 25,
      minLength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
  },
  {
    strict: true,
    strictQuery: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    autoIndex: true,
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName}  ${this.lastName}`;
  });

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
