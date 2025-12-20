import { Request, Response, NextFunction } from "express";
import * as usersService from "../services/users.service";
import { responseOk } from "@/utils/response";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.findAll();
    responseOk(res, 200, users);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const result = await usersService.updateRole(id, req.body);
    responseOk(res, 200, result);
  } catch (error) {
    next(error);
  }
};
