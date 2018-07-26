import { routingKeys } from "./routingKeys";
import { Message } from "amqplib/properties";
const chalk = require('chalk');

export default async function consume(msg: Message | null): Promise<any> {
  console.log(chalk.yellow('Message received'));

  //check if json is valid
  let json;
  try {
    json = JSON.parse(msg.content.toString());
  } catch (e) {
    console.error(chalk.red('Error: Trying to parse \'%s\''), msg.content.toString());
    throw e;
  }

  const routingKey: string = msg.fields.routingKey; // new way by getting the routingKey

  if (routingKey) {

    //execute the route
    try {
      return await routingKeys[routingKey](json);
    } catch (e) {
      throw e;
    }
  } else {
    throw new Error(`No action found for this message. routingKey: ${routingKey}`);
  }
}