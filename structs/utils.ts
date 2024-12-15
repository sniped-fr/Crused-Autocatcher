import chalk from "chalk";
import moment from "moment";
import blessed from 'blessed';
import figlet from "figlet"
// Create a screen object
const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal Interface Example',
});

const title = figlet.textSync('Crused', {
  font: 'Slant', // Try fonts like "Standard", "Big", "Block", etc.
  horizontalLayout: 'default',
  verticalLayout: 'default',
});
console.log(title)

const titleBox = blessed.box({
  top: 0,
  left: 'center',
  width: '100%',
  height: `20%`, // Adjust for title height
  content: chalk.yellow.bold(title), // Add color with chalk
  align: 'center',
  valign: 'middle',
  tags: true, // Allows for color and formatting
  style: {
    fg: 'yellow',
  },
});
// Create a box for error logs
const errorLogBox = blessed.box({
  top: `20%`,
  left: `30%`,
  width: '70%',
  height: '40%',
  label: 'Logs',
  border: { type: 'line' },
  style: { border: { fg: 'magenta' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true, // Enable mouse support
});

// Create a box for basic logs
const basicLogBox = blessed.box({
  top: '60%',
  left: 0,
  width: '70%',
  height: '40%',
  label: 'Basic Logs',
  border: { type: 'line' },
  style: { border: { fg: 'green' } },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { ch: '|' },
  mouse: true, // Enable mouse support
});

// Create a box for stats
const statsBox = blessed.box({
  top: `20%`,
  left: 0,
  width: '30%',
  height: '40%',
  label: 'Stats',
  border: { type: 'line' },
  style: { border: { fg: 'blue' } },
});

// Create a box for other details
const otherDetailsBox = blessed.box({
  top: '60%',
  left: '70%',
  width: '30%',
  height: '40%',
  label: 'Other Details',
  border: { type: 'line' },
  style: { border: { fg: 'yellow' } },
});

// Append boxes to the screen
screen.append(titleBox)
screen.append(errorLogBox);
screen.append(basicLogBox);
screen.append(statsBox);
screen.append(otherDetailsBox);

// Add content to the boxes
errorLogBox.setContent('Error logs will appear here...');
basicLogBox.setContent('Basic logs will appear here...');
statsBox.setContent('Stats will appear here...');
otherDetailsBox.setContent('Other details will appear here...');

// Automatically scroll to bottom when new content is added
function scrollToBottom(box:any) {
  box.setScrollPerc(100); // Set scroll position to 100% (bottom)
  screen.render(); // Re-render the screen to reflect the update
}

// Allow mouse scrolling
errorLogBox.on('mouse', (data) => {
  if (data.action === 'wheelup') errorLogBox.scroll(-1); // Scroll up
  if (data.action === 'wheeldown') errorLogBox.scroll(1); // Scroll down
});

basicLogBox.on('mouse', (data) => {
  if (data.action === 'wheelup') basicLogBox.scroll(-1); // Scroll up
  if (data.action === 'wheeldown') basicLogBox.scroll(1); // Scroll down
});

// Allow exiting the program with 'q' or 'Ctrl+C'
screen.key(['q', 'C-c'], () => process.exit(0));

// Example: Dynamically update boxes
setInterval(() => {
  errorLogBox.insertBottom(`Error: ${Math.random()}`);
  basicLogBox.insertBottom(`Log: ${Math.random()}`);
  statsBox.setContent(`Stats:\nCPU: ${Math.random().toFixed(2)}%\nRAM: ${Math.random().toFixed(2)}GB`);
  otherDetailsBox.setContent(`Details:\nTime: ${new Date().toLocaleTimeString()}`);
  
  // Auto-scroll to the bottom for log boxes
  scrollToBottom(errorLogBox);
  scrollToBottom(basicLogBox);
}, 1000);

// Render the screen
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