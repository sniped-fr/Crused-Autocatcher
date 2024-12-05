// deno-lint-ignore-file
import chalk from "npm:chalk";
import moment from "npm:moment";

export class Logger {
  private static getTimestamp(): string {
    return moment().format("HH:mm:ss"); // Only hour:minute:second
  }

  public static info(message: string | object | any): void {
    this.log("INFO", message, chalk.cyan);
  }

  public static warn(message: string | object | any[]): void {
    this.log("WARN", message, chalk.magenta);
  }

  public static error(...message: string[] | object[] | any[]): void {
    this.log("ERROR", message.join(" "), chalk.red);
  }

  public static success(message: string | object | any[]): void {
    this.log("SUCCESS", message, chalk.green);
  }

  public static debug(message: string | object | any[]): void {
    this.log("DEBUG", message, chalk.yellow);
  }

  private static log(
    level: string,
    message: string | object | any[],
    colorFn: (text: string) => string
  ): void {
    const timestamp = this.getTimestamp();
    let formattedMessage;

    if (typeof message === "object") {
      formattedMessage = JSON.stringify(message, null, 2);
    } else {
      formattedMessage = message;
    }

    console.log(
      colorFn(
        `[${level}]`.padStart(9, ` `) + ` [${timestamp}] - ${formattedMessage}`
      )
    );
  }
}

export function chunkize<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function randomBin<T>(array:T[]) { 
  return array[Math.round(Math.random())];
}

export function randomItem<T>(array: T[]): T | undefined {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}