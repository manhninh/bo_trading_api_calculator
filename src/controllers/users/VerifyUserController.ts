import { verifyUserBusiness } from '@src/business/user/VerifyUserBusiness';
import { VerifyUserValidator } from '@src/validator/users/VerifyUser';
import { NextFunction, Request, Response } from 'express';

export const verifyUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = new VerifyUserValidator();
    data.uuid = req.body.uuid.toString();
    const result = await verifyUserBusiness(data);
    let message: string = '';
    if (result === 0 || result === 1) message = `Your account has been verified. Let's start trading`;
    else if (result === 2) message = `Your account does not exist. Register and start trading`;
    else if (result === 3) message = `Your account verification failed. Please try again in a few minutes`;
    res.status(200).send({ data: { message } });
  } catch (err) {
    next(err);
  }
};
