import { User } from "@/models/user.model";
import { UpdateUserRoleDTO } from "@/types/users.types";
import { validate } from "@/validations/validate";
import { updateUserRoleSchema } from "@/validations/users.validation";
import { ResponseError } from "@/errors/ResponseError";

export const findAll = async () => {
  const users = await User.find().select("-password");
  return users;
};

export const updateRole = async (userId: string, data: UpdateUserRoleDTO) => {
  const payload = validate(updateUserRoleSchema, data);

  const user = await User.findByIdAndUpdate(
    userId,
    { role: payload.role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ResponseError(404, "User not found");
  }

  return { message: "Role updated successfully" };
};
