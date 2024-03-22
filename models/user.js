import mongoose from "mongoose";

const userSchame = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    photo: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    dob: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

userSchame.virtual("age").get(() => {
  const today = new Date();
  const dob = this.dob;

  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
});

const User = mongoose.model("User", userSchame);
export default User;
