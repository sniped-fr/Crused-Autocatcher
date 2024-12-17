import gradient from 'gradient-string';
import throttle from 'lodash.throttle';
import chalk from "chalk";
import moment from "moment";
import blessed from 'blessed';
import figlet from "figlet"
import { Message } from "discord.js-selfbot-v13";
import crusedPackage from "../package.json"
import { Crused } from "..";

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

const title = gradient(['magenta', 'purple'])(figlet.textSync('Crused', {
  font: `Small`,
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));
//gradient(['cyan', 'pink'])(title)

const titleBox = blessed.box({
  top: 0,
  left: 'center',
  width: '100%',
  height: `20%`,
  content: chalk.magenta.bold(title + ` v${crusedPackage.version} | Made by ._dux`),
  align: 'center',
  valign: 'middle',
  tags: true,
  style: {
    fg: 'purple',
  },
});
const errorLogBox = blessed.box({
  top: `20%`,
  left: `25%`,
  width: '45%',
  height: '40%',
  label: chalk.magenta(`Logs`),
  border: { type: 'line' },
  style: { border: { fg: '#a800e6' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});
const captchaBox = blessed.box({
  top: `20%`,
  left: `70%`,
  width: '30%',
  height: '40%',
  label: chalk.hex(`#ff3053`)(`Captchas`),
  border: { type: 'line' },
  style: { border: { fg: '#ff0055' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});

const basicLogBox = blessed.box({
  top: '60%',
  left: 0,
  width: '40%',
  height: '40%',
  label: chalk.hex(`#1cff37`)('Pokémons'),
  border: { type: 'line' },
  style: { border: { fg: '#00bf0a' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});

const accountsBox = blessed.box({
  top: '60%',
  left: `40%`,
  width: '40%',
  height: '40%',
  label: chalk.hex(`#4d1691`)('Crusers'),
  border: { type: 'line' },
  style: { border: { fg: '#5300b8' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});
const statsBox = blessed.box({
  top: `20%`,
  left: 0,
  width: '25%',
  height: '40%',
  label: chalk.cyan('Stats'),
  border: { type: 'line' },
  style: { border: { fg: 'blue' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});

const otherDetailsBox = blessed.box({
  top: '60%',
  left: '80%',
  width: '20%',
  height: '40%',
  label: chalk.hex(`#f6ff00`)('AutoCatcher'),
  border: { type: 'line' },
  style: { border: { fg: 'yellow' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true,
});
screen.append(titleBox)
screen.append(errorLogBox);
screen.append(basicLogBox);
screen.append(accountsBox)
screen.append(captchaBox)
screen.append(statsBox);
screen.append(otherDetailsBox);

basicLogBox.setContent(chalk.grey('    Waiting for pokemons...'));

function smoothScroll(box: any, delta: any) {
  const step = Math.max(1, Math.floor(box.height / 5)); 
  box.scroll(delta * step); 
  screen.render();
}

const handleScroll = throttle((box, data) => {
  if (data.action === 'wheelup') smoothScroll(box, -1);
  if (data.action === 'wheeldown') smoothScroll(box, 1);
}, 50); 

[basicLogBox, errorLogBox, otherDetailsBox].forEach((box) => {
  box.on('mouse', (data) => handleScroll(box, data));
});
screen.key(['q', 'C-c'], () => process.exit(0));

setInterval(() => {
  Logger.updateStats()
  //otherDetailsBox.setContent(`Details:\nTime: ${new Date().toLocaleTimeString()}`);
  //scrollToBottom(errorLogBox);
  //scrollToBottom(basicLogBox);

  const captchas = crusers.filter(x => x.captcha && x.client?.user);
  if (captchas.length > 0) {
    const capList = captchas.map((x, i) => chalk.blackBright(`[${i + 1}]  `) + `${chalk.hex(`#e33645`)(x.client.user?.tag.padEnd(7, ` `))}` + ` ${chalk.hex(`#e33645`)`/${x.client.user?.id}`} `).filter(x => x)
    captchaBox.setContent(chalk.hex(`#fa3e77`)(`Live Captchas: ${capList.length}\n ${capList.join(`\n`)} `))
  } else captchaBox.setContent(chalk.redBright(`Live Captchas: 0`))
  const accs = crusers.filter(x => x.client.user)
  const largestName = accs.map(x => x.client.user?.tag).filter(x => x && Array.isArray(x)).reduce((longest, current) =>
    (current?.length || 0) > (longest?.length || 0) ? current || `` : longest || ``, `_______`
  );
  const highestPC = accs.map(x => x.stats.balance.toString()).filter(x => x && Array.isArray(x)).reduce((longest, current) =>
    (current?.length || 0) > (longest?.length || 0) ? current || `` : longest || ``, `______`
  );
  const highestCatches = accs.map(x => x.stats.catches.toString()).filter(x => x && Array.isArray(x)).reduce((longest, current) =>
    (current?.length || 0) > (longest?.length || 0) ? current || `` : longest || ``, `______`
  );
  const accounts = accs.map((x, i) => {
    return chalk.hex(`#370085`)(`[${i + 1}]`.padEnd(`${i}`.length + 2)) + chalk.hex(`#a800e6`)(` ${x.client.user?.tag.padEnd(largestName?.length || 7, ` `)}`) + chalk.hex(`#6a18d6`)(`    ${x.stats.balance.toLocaleString()} P$`.padEnd(highestPC.length + 8)) + chalk.hex(`#6a18d6`)(`${x.stats.catches.toLocaleString()} `.padStart(highestCatches.length + 3))
  })
  if (accounts.length != 0) {
    const head = `    ${` `.repeat(`${accounts.length}`.length / 10)}` + chalk.underline.magenta((`Account`).padEnd(largestName?.length || 9) + `Coins`.padStart(highestPC.length + 4, ` `) + `Catches`.padStart(highestCatches.length + 8))
    accountsBox.setContent(head + `\n` + accounts.join(`\n`))
  }
  screen.render();
}, 500);

screen.render();

export const pokeList = {
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

interface Stats {
  tokens: number;
  connected: number;
  captchas: {
    encountered: number;
    solved: number;
    failed: number;
  };
  uptime: Date;
  incenses: number;
  totalIncenses: number;
  suspensions: number;
  pokecoins: number
}

export const stats: Stats = {
  tokens: 0,
  connected: 0,
  captchas: {
    encountered: 0,
    solved: 0,
    failed: 0
  },
  uptime: new Date(),
  incenses: 0,
  totalIncenses: 0,
  suspensions: 0,
  pokecoins: 0
}
export const crusers: Crused[] = [];
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
    this.log("OK", message, chalk.green);
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
      `[${level}]`.padEnd(6, ` `) + ` [${timestamp}] - ${formattedMessage}`
    ))
  }
  static updateStats() {
    const lines = [
      chalk.hex(`#00aeff`)(`  Catches   ${chalk.magenta(pokeList.total.toLocaleString())}`),
      chalk.hex(`#00aeff`)(`  Balance   ${chalk.magenta(pokeList.pc)}`),
      chalk.hex(`#00aeff`)(`  Net. Bal  ${chalk.hex(`#4b0382`)(`${stats.pokecoins.toLocaleString()}`)}`),
      chalk.hex(`#ff622e`)(`  Legendaries  ${chalk.hex(`#ffff2e`)(pokeList.rares.leg.toLocaleString())}`),
      chalk.hex(`#ff622e`)(`  Mythics      ${chalk.hex(`#ffff2e`)(pokeList.rares.myth.toLocaleString())}`),
      chalk.hex(`#ff622e`)(`  Ultra Beasts ${chalk.hex(`#ffff2e`)(pokeList.rares.ub.toLocaleString())}`),
      chalk.hex(`#6f00ff`)(`  Events    ${chalk.hex(`#ad1fff`)(pokeList.rares.ev.toLocaleString())}`),
      chalk.hex(`#6f00ff`)(`  Regionals ${chalk.hex(`#ad1fff`)(pokeList.rares.reg.toLocaleString())}`),
    ]
    const logs = [
      chalk.hex(`#2b2b2b`)(`       [${new Date().toLocaleTimeString()}]`),
      `Accounts  :  ${chalk.greenBright(stats.connected)}/${chalk.green(stats.tokens)}`,
      `Uptime    :  ${(getTimeGap(stats.uptime))}`,
      `Captcha\n` + chalk.grey(` (${chalk.cyanBright(`T`)}/${chalk.greenBright(`S`)}/${chalk.red(`F`)}) `) + chalk.grey(` :  ${chalk.cyan(stats.captchas.encountered)}/${chalk.green(stats.captchas.solved)}/${chalk.red(stats.captchas.failed)}`),
      `Incenses  :  ${chalk.magenta(stats.incenses)} ${chalk.hex(`#4b0382`)(`(T/${stats.totalIncenses})`)}`,
      `Suspended :  ${chalk.hex(`#ff0000`)(stats.suspensions)}`,
    ];
    statsBox.setContent(chalk.hex(`#9d00ff`)(logs.join(`\n`)))
    otherDetailsBox.setContent(lines.join(`\n`))
  }
  static async logPokemon(pokemon: Pokemon, message: Message<true>) {
    //`leg` | `myth` | `ub` | `ev` | `reg` | `norm`;
    interface Rar {
      rarity: `leg` | `myth` | `ub` | `ev` | `reg` | `norm`;
      label: string;
      color: any;
    }
    pokeList.rares[pokemon.rarity[0]]++;
    pokeList.total++;
    pokeList.shiny += pokemon.shiny ? 1 : 0;
    if ((pokemon.name == `Eevee` || pokemon.rarity.length > 1) && pokemon.shiny)
      stats.pokecoins += 1_800_000
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
      color: chalk.hex(`#42f55d`),
      label: `Regular`
    };
    if (pokemon.shiny) rarTag.color = chalk.yellowBright;
    basicLogBox.insertBottom(chalk.green(`[${this.getTimestamp()}]`) + ` ${(rarTag?.color((`${pokemon.shiny ? `✨ ` : ``}` + pokemon.name).padEnd(10, ` `)))} ${chalk.hex(`#42f55d`)(`│`)} ${chalk.hex(`#ddff00`)(pokemon.level.toString().padStart(2))} ${chalk.hex(`#ddff00`)(`│`)} ${chalk.hex(`#ddff00`)(`${pokemon.iv.toString().padStart(5)}%`)} ${chalk.hex(`#42f55d`)(`│`)} ` + chalk.grey(`#${message.channel.name}`))
  }
}

function getTimeGap(date: Date): string {
  const now = new Date();
  let diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) {
    diffInSeconds = Math.abs(diffInSeconds);
  }

  const hours = Math.floor(diffInSeconds / 3600);
  diffInSeconds %= 3600;

  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  const result: string[] = [];

  if (hours > 0) result.push(chalk.hex(`#3c0070`)(`${chalk.hex(`#5b00ab`)(hours)}h`));
  if (minutes > 0) result.push(chalk.hex(`#3c0070`)(`${chalk.hex(`#5e00ab`)(minutes)}m`));
  if (seconds > 0) result.push(chalk.hex(`#3c0070`)(`${chalk.hex(`#5e00ab`)(seconds)}s`));

  return result.join(' ');
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