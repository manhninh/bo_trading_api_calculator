declare module NodeJS {
  interface Global {
    /** socket */
    io: any;
    /** open/close trade */
    openTrade: any;
    /** kue queue */
    queue: any;
    /** bảo vệ sàn được chọn thủ công */
    protectBO: number;
    /** các mức bảo vệ sàn trong db */
    protectLevel1: number;
    protectLevel2: number;
    protectLevel3: number;
    protectLevel4: number;
    /** các mức bảo vệ sàn hiện tại */
    currentProtectLevel1: number;
    currentProtectLevel2: number;
    currentProtectLevel3: number;
    currentProtectLevel4: number;
  }
}
