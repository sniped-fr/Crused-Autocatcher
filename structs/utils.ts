import chalk from "chalk";
import moment from "moment";
import blessed from 'blessed';
import figlet from "figlet"
import { Message } from "discord.js-selfbot-v13";

type rarity = `leg` | `myth` | `ub` | `ev` | `reg` | `norm`;
interface Pokemon {
  name: string;
  level: number;
  gender: `female` | `male` | `none`;
  iv: number;
  shiny: boolean;
  rarity: rarity[];
  loggable: boolean;
}


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
  label: chalk.hex(`#1cff37`)('Pokémons'),
  border: { type: 'line' },
  style: { border: { fg: '#00bf0a' } },
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
  label: chalk.hex(`#f6ff00`)('AutoCatcher'),
  border: { type: 'line' },
  style: { border: { fg: 'yellow' } },
});
screen.append(titleBox)
screen.append(errorLogBox);
screen.append(basicLogBox);
screen.append(statsBox);
screen.append(otherDetailsBox);

//errorLogBox.setContent('Error logs will appear here...');
basicLogBox.setContent('Waiting for pokemons...');
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
  Logger.updateStats()

  scrollToBottom(errorLogBox);
  scrollToBottom(basicLogBox);
}, 1000);

screen.render();

const list = {
  //`leg` | `myth` | `ub` | `ev` | `reg` | `norm`;
  rares: {
    leg: 0,
    myth: 0,
    ub: 0,
    ev: 0,
    reg: 0,
    norm: 0,
  },
  total: 0,
  shiny: 0,
  pc: 0
}

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
      `[${level}]`.padEnd(9, ` `) + ` [${timestamp}] - ${formattedMessage}`
    ))
    /*console.log(
      colorFn(
        `[${level}]`.padStart(9, ` `) + ` [${timestamp}] - ${formattedMessage}`
      )
    );*/
  }
  static async updateStats() {
    const lines = [
      chalk.hex(`#00aeff`)(`Total: ${chalk.magenta(list.total.toLocaleString())}`),
      chalk.hex(`#00aeff`)(`Balance: ${chalk.magenta(list.pc)}`),
      chalk.hex(`#ff6600`)( `Legendaries:  ${chalk.hex(`#00aeff`)(list.rares.leg.toLocaleString())}`),
      chalk.hex(`#ff6600`)( `Mythics:      ${chalk.redBright(list.rares.myth.toLocaleString())}`),
      chalk.hex(`#ff6600`)( `Ultra Beasts: ${chalk.hex(`#00ff95`)(list.rares.ub.toLocaleString())}`),
      chalk.hex(`#6f00ff`)( `Events:       ${chalk.hex(`#6f00ff`)(list.rares.ev.toLocaleString())}`),
      chalk.hex(`#6f00ff`)( `Regionals:    ${chalk.hex(`#ff6600`)(list.rares.reg.toLocaleString())}`),
    ]
    otherDetailsBox.setContent(lines.join(`\n`))
  }
  static async logPokemon(pokemon: Pokemon, message: Message<true>) {
    //`leg` | `myth` | `ub` | `ev` | `reg` | `norm`;
    interface Rar {
      rarity: `leg` | `myth` | `ub` | `ev` | `reg` | `norm`;
      label: string;
      color: any;
    }
    list.rares[pokemon.rarity[0]]++;
    list.total++;
    list.shiny += pokemon.shiny?1:0;
    this.updateStats()
    const rarities: Rar[] = [
      {
        rarity: `leg`,
        label: `Legendary`,
        color: chalk.hex(`#00aeff`)
      },
      {
        rarity: `myth`,
        label: `Mythic`,
        color: chalk.redBright
      },
      {
        rarity: `ub`,
        label: `Ultra Beast`,
        color: chalk.hex(`#00ff95`)
      },
      {
        rarity: `ev`,
        label: `Event`,
        color: chalk.hex(`#6f00ff`)
      }, {
        rarity: `reg`,
        label: `Regional`,
        color: chalk.hex(`#ff6600`)
      }
    ]
    let rarTag = rarities.find(X => pokemon.rarity.includes(X.rarity)) || {
      color: chalk.hex(`#00b86b`),
      label: `Regular`
    };
    if (pokemon.shiny) rarTag.color = chalk.yellowBright;

    basicLogBox.insertBottom(chalk.green(`[${this.getTimestamp()}]`) + `  ${(rarTag?.color((`${pokemon.shiny ? `✨ ` : ``}` + pokemon.name).padEnd(10, ` `)))}  Lvl. ${pokemon.level.toString().padStart(2)}    ${pokemon.iv.toString().padStart(5)}% | #${message.channel.name}/${message?.guild?.name || `/`}`)
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

Logger.updateStats()
