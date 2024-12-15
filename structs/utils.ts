import chalk from "chalk";
import moment from "moment";
import blessed from 'blessed';
import figlet from "figlet"
const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal Interface Example',
});

const title = figlet.textSync('Crused', {
  font: 'Slant',
  horizontalLayout: 'default',
  verticalLayout: 'default',
});
console.log(title)

const titleBox = blessed.box({
  top: 0,
  left: 'center',
  width: '100%',
  height: `20%`,
  content: chalk.magenta.bold(title),
  align: 'center',
  valign: 'middle',
  tags: true,
  style: {
    fg: 'purple',
  },
});
const errorLogBox = blessed.box({
  top: `20%`,
  left: `30%`,
  width: '70%',
  height: '40%',
  label: chalk.magenta(`Logs`),
  border: { type: 'line' },
  style: { border: { fg: '#a800e6' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});

const basicLogBox = blessed.box({
  top: '60%',
  left: 0,
  width: '70%',
  height: '40%',
  label: 'Pokémons',
  border: { type: 'line' },
  style: { border: { fg: 'green' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});

const statsBox = blessed.box({
  top: `20%`,
  left: 0,
  width: '30%',
  height: '40%',
  label: chalk.cyan('Stats'),
  border: { type: 'line' },
  style: { border: { fg: 'blue' } },
});

const otherDetailsBox = blessed.box({
  top: '60%',
  left: '70%',
  width: '30%',
  height: '40%',
  label: 'Other Details',
  border: { type: 'line' },
  style: { border: { fg: 'yellow' } },
});

screen.append(titleBox)
screen.append(errorLogBox);
screen.append(basicLogBox);
screen.append(statsBox);
screen.append(otherDetailsBox);

//errorLogBox.setContent('Error logs will appear here...');
basicLogBox.setContent('Soon...');
statsBox.setContent('Stats will load soon...');
otherDetailsBox.setContent('Other details will appear here...');

function scrollToBottom(box: any) {
  box.setScrollPerc(100);
  screen.render();
}

errorLogBox.on('mouse', (data) => {
  if (data.action === 'wheelup') errorLogBox.scroll(-1); 
  if (data.action === 'wheeldown') errorLogBox.scroll(1);
});

basicLogBox.on('mouse', (data) => {
  if (data.action === 'wheelup') basicLogBox.scroll(-1); 
  if (data.action === 'wheeldown') basicLogBox.scroll(1);
});

screen.key(['q', 'C-c'], () => process.exit(0));

setInterval(() => {
//  errorLogBox.insertBottom(`Error: ${Math.random()}`);
  //basicLogBox.insertBottom(`Log: ${Math.random()}`);
  //statsBox.setContent(`Stats:\nCPU: ${Math.random().toFixed(2)}%\nRAM: ${Math.random().toFixed(2)}GB`);
  otherDetailsBox.setContent(`Details:\nTime: ${new Date().toLocaleTimeString()}`);

  scrollToBottom(errorLogBox);
  scrollToBottom(basicLogBox);
}, 1000);

screen.render();
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
    errorLogBox.insertBottom(colorFn(
      `[${level}]`.padStart(9, ` `) + ` [${timestamp}] - ${formattedMessage}`
    ))
    /*console.log(
      colorFn(
        `[${level}]`.padStart(9, ` `) + ` [${timestamp}] - ${formattedMessage}`
      )
    );*/
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

export function randomBin<T>(array: T[]) {
  return array[Math.round(Math.random())];
}

export function randomItem<T>(array: T[]): T | undefined {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}