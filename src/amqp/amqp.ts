/**
 * From the Scaffold
 * Do not modify this file except if if you know what you are doing
 */

import { Channel, Connection, Replies, connect } from "amqplib";
import AssertQueue = Replies.AssertQueue;
import AssertExchange = Replies.AssertExchange;
import { routingKeys } from './routingKeys';
import consume from './consumer';
import { Message } from "amqplib/properties";
import logger from "../logger";

const chalk = require('chalk');

export interface IAmqpConfig {
  exchangeHost: string;
  exchangeName: string;
  queueName: string;
  deadLetterExchangeName: string;
  deadLetterQueueName: string;
}

enum Status {
  Closed = 'closed',
  Open = 'open',
  Error = 'error',
}

class Amqp {

  private _config: IAmqpConfig;
  private _connection: Connection;
  private _channel: Channel;

  private _status: Status = Status.Closed;
  private _statusError: string;

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  constructor() {
  }

  ////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////  INIT
  public async start(config: IAmqpConfig): Promise<any> {
    chalk.enabled = true;
    this._config = config;

    try {
      await this._connect(config.exchangeHost);
      await this._configureDeadLetterExchange(config.deadLetterExchangeName, config.deadLetterQueueName);
      await this._configureExchange(config.exchangeName, config.queueName, config.deadLetterExchangeName);
      await this._consumeMessages(config.queueName);
    } catch (e) {
      this._statusError = Status.Error;
      this._statusError = e.message;

      logger.info(chalk.bgRed('AMQP: Connection Error'));
      logger.info(chalk.bgRed(e.message));
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////// CONSUME MESSAGES
  /**
   * Publishes a message to a specific routingKey
   *
   * @param {object} content
   * @param {string} routingKey
   * @param {string} exchangeName
   * @returns {Promise<void>}
   */
  public async publishMessage(routingKey: string, content: object, exchangeName: string = this._config.exchangeName) {
    logger.info('publishMessage', routingKey);

    try {
      const success: boolean = await this._channel.publish(
        exchangeName,
        routingKey,
        new Buffer(JSON.stringify(content)),
        {
          contentType: 'application/json'
        }
      );

      logger.info('success:' + success);
    } catch (e) {
      console.error(chalk.red('Message Not Published to the routingKey:'), routingKey);
      console.error(chalk.red(content));
    }
  }

  ////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////// CONNECT
  /**
   * Connects via AMQP
   *
   * @param {string} url
   * @returns {Promise<Connection>}
   * @private
   */
  private async _connect(url: string): Promise<Connection> {

    this._connection = await connect(url);
    this._channel = await this._connection.createChannel();
    this._channel.prefetch(10);

    //set status to Open after connection complete
    this._status = Status.Open;
    this._statusError = undefined;

    logger.info(chalk.bgGreen('AMQP: Connected to "%s"'), url);

    //Error Management
    // In the case of a server-initiated shutdown or an error, the 'close' handler will be supplied with an error indicating the cause
    // Note that 'close' is called after 'error'
    this._connection.on('error', this._onError);
    this._connection.on('close', this._onClose);
    // this._channel.on('error', this._onError);
    // this._channel.on('close', this._onClose);

    return this._connection;
  }

  private _onError(error: Error): void {
    this._status = Status.Error;
    this._statusError = error.message;
    logger.info(chalk.bgRed('AMQP: Connection Error'));
    logger.info(chalk.bgRed(error.message));
  }

  private _onClose(error: Error): void {
    logger.info(chalk.bgRed('AMQP: Connection Closed'));
    if (!this._statusError && error.message) {
      this._status = Status.Error;
      this._statusError = error.message;
      logger.info(chalk.bgRed(error.message));
    } else {
      this._status = Status.Closed;
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////  CONFIGURE
  /**
   * Configures the main Exchange
   *
   * @returns {Promise<void>}
   * @private
   */
  private async _configureExchange(exchangeName: string, queueName: string, deadLetterExchangeName: string) {
    //create or get the main exchange
    const exchange: AssertExchange = await this._channel.assertExchange(exchangeName, 'topic');

    //create or get the queue
    const queue: AssertQueue = await this._channel.assertQueue(queueName, {
      arguments: {
        'x-dead-letter-exchange': deadLetterExchangeName
      }
    });

    //assert a routing path from an exchange to a queue
    for (const event in routingKeys) {
      this._channel.bindQueue(queue.queue, exchangeName, event);
    }
  }

  /**
   * Configures the dead Letter Exchange
   *
   * @returns {Promise<void>}
   * @private
   */
  private async _configureDeadLetterExchange(deadLetterExchangeName: string, deadLetterQueueName: string) {
    const exchange: AssertExchange = await this._channel.assertExchange(
      deadLetterExchangeName,
      'topic',
      {
        durable: true,
        autoDelete: false
      }
    );

    const queue: AssertQueue = await this._channel.assertQueue(deadLetterQueueName);
    this._channel.bindQueue(queue.queue, deadLetterExchangeName, '#');
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////// CONSUME MESSAGES
  /**
   * Consumes all messages from RabbitMQ
   * @private
   */
  private _consumeMessages(queueName: string) {
    this._channel.consume(queueName, async (msg: Message | null) => {
      try {
        const result: any = await consume(msg);

        //send response
        if (msg.properties.replyTo) {
          this._channel.sendToQueue(msg.properties.replyTo,
            new Buffer(JSON.stringify(result ? result : undefined)),
            {correlationId: msg.properties.correlationId}
          );
        }

        this._channel.ack(msg);
        console.error(chalk.green('Message Consumed Successfully'));
      } catch (e) {
        console.error(chalk.red(e.message));
        this._channel.reject(msg, false);
      }
    });
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////// GETTER
  public get status() {
    return this._status;
  }

  public get statusError() {
    return this._statusError;
  }
}

export default new Amqp();