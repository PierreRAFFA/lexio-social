/**
 * From the Scaffold
 * Do not modify this file except if if you know what you are doing
 *
 * Contains all configuration used specifically by the service
 * Note that any configuration based on the environment should be specified in .env or by an orchestration tool
 */

/** insert:imports */

export interface IRoutingKey {
  [event: string]: Function;
}

/**
 * Topic List for RabbitMQ Queue
 */
export let routingKeys: IRoutingKey = {
  /** insert:routingKeys */
};
