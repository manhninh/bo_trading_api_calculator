import { Router } from 'express';
import createUser from './createUser';
import verifyUser from "./verifyUser";

export default class UserRouters {
  public router: Router = Router();

  constructor() {
    createUser(this.router);
    verifyUser(this.router);
  }
}
