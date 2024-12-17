import * as readline from 'readline';
import * as fs from 'fs';

interface Config {
    mode: `spam` | `incense` | `beast` | `eco`;
    webhook: string;
    botToken: string;
    autocatch: boolean;
    tokenFile: string;
    captchaHook: string;
    captchaKey: string;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
};

const createConfigFile = async () => {
    console.log('Let\'s create your config.json file!');

    let mode = await askQuestion(`Which mode do you want to use the autocatcher in? (spam/incense/beast/eco)`) as "spam" | "incense" | "beast" | "eco"
    let modes = ["spam", "incense", "beast", "eco"]
    while (!modes.includes(mode.toLowerCase())) {
        mode = await askQuestion(`Which mode do you want to use the autocatcher in? (spam/incense/beast/eco)`) as "spam" | "incense" | "beast" | "eco"
    }
    const webhook = await askQuestion('Enter webhook for catch logs: ');
    const botToken = await askQuestion('Enter token for discord bot: ');
    const captchaHook = await askQuestion(`Enter a webhook to log captchas: `);
    const captchaKey = await askQuestion(`Enter captcha key from https://poketwo.store\: `)
    const config: Config = {
        mode,
        webhook,
        botToken,
        autocatch: true,
        tokenFile: `tokens.txt`,
        captchaHook,
        captchaKey
    };

    fs.writeFileSync('config.json', JSON.stringify(config, null, 2), 'utf-8');
    console.log('config.json has been created successfully!');
    fs.writeFileSync(config.tokenFile, ``);

    rl.close();
};

createConfigFile().catch((error) => {
    console.error('An error occurred:', error);
    rl.close();
});