/**
 * This file may be modified by the scaffold
 * so, do not modify it except if you know what you are doing
 */

import amqp from './amqp/amqp';
import server from './http/server';
import logger from './logger';
const chalk = require('chalk');
const pkg = require('../package.json');

class AppBase {

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  constructor() {}
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////  START
  /**
   * Starts the app
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    chalk.enabled = true;
    logger.info(chalk.bgGreen('App version', pkg.version));
    logger.info(chalk.bgGreen('NODE_ENV:', process.env.NODE_ENV));

    await this.startAmqp();
    await this.startHttp();
  }

  /**
   * Starts to listen to events
   *
   * @returns {Promise<void>}
   */
  protected async startAmqp(): Promise<void> {

    logger.info(chalk.green('=================================================================================='));
    logger.info(chalk.green('AMQP_EXCHANGE_HOST:               ', process.env.AMQP_EXCHANGE_HOST));
    logger.info(chalk.green('AMQP_EXCHANGE_NAME:               ', process.env.AMQP_EXCHANGE_NAME));
    logger.info(chalk.green('AMQP_QUEUE_NAME:                  ', process.env.AMQP_QUEUE_NAME));
    logger.info(chalk.green('AMQP_DEAD_LETTER_EXCHANGE_NAME:   ', process.env.AMQP_DEAD_LETTER_EXCHANGE_NAME));
    logger.info(chalk.green('AMQP_DEAD_LETTER_QUEUE_NAME:      ', process.env.AMQP_DEAD_LETTER_QUEUE_NAME));
    logger.info(chalk.green('=================================================================================='));

    await amqp.start({
      exchangeHost: process.env.AMQP_EXCHANGE_HOST,
      exchangeName: process.env.AMQP_EXCHANGE_NAME,
      queueName: process.env.AMQP_QUEUE_NAME,
      deadLetterExchangeName: process.env.AMQP_DEAD_LETTER_EXCHANGE_NAME,
      deadLetterQueueName: process.env.AMQP_DEAD_LETTER_QUEUE_NAME,
    });
  }

  /**
   * Starts the express Server
   *
   * @returns {Promise<void>}
   */
  protected async startHttp(): Promise<void> {

    logger.info(chalk.green('=================================================================================='));
    logger.info(chalk.green('HTTP_PORT (default 80):           ', process.env.HTTP_PORT));
    logger.info(chalk.green('=================================================================================='));

    server.start({
      port: +process.env.HTTP_PORT || 80,
    });
  }
}

export default AppBase;