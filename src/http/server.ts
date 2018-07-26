import expressApp from './expressApp';
import { Express } from "express";
import logger from "../logger";


const chalk = require('chalk');

export interface IHttpConfig {
  port: number;
}

class Server {

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  constructor() {

  }

  ////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////  INIT
  public async start(config: IHttpConfig): Promise<Express> {
    chalk.enabled = true;

    return new Promise<Express>((resolve, reject) => {
      expressApp.listen(config.port, () => {
        logger.info(chalk.bgGreen('HTTP: Running at http://localhost:%d'), config.port);
        resolve(expressApp);
      });
    });
  }
}

export default new Server();