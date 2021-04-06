import { Router } from 'express';
import UserRouters from "./users";

class MainRoutes {
  public routers: Router;

  constructor() {
    this.routers = Router();
    this.config();
  }

  private config() {
    this.routers.use('/users', new UserRouters().router);
  }
}

export default new MainRoutes().routers;
