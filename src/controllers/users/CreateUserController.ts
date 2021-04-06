import { createUserBusiness } from '@src/business/user/CreateUserBusiness';
import { CreateUserValidator } from '@src/validator/users/CreateUser';
import { NextFunction, Request, Response } from 'express';

export const createUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params = req.body;
    const data = new CreateUserValidator();
    data.username = params.username;
    data.email = params.email;
    data.password = params.password;
    data.referralUser = params.referralUser;
    const result = await createUserBusiness(data);
    res.status(200).send({ data: result });
  } catch (err) {
    next(err);
  }
};
