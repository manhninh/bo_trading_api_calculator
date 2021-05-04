declare module NodeJS {
  interface Global {
    /** socket */
    io: any;
    /** open/close trade */
    openTrade: any;
    /** kue queue */
    queue: any;
  }
}
