import {
  Client,
  Message,
  MessageEmbed,
  TextChannel,
  WebhookClient,
} from "discord.js-selfbot-v13";
import fs from "fs"
import axios from 'axios';

import { crusers, Logger, pokeList, randomBin, randomItem, stats } from "./structs/utils.js";
import config from "./config.json"
import { setTimeout as wait } from "node:timers/promises";
import { solveHint } from "./structs/pokemon.js";

import leg from "./data/names/legendary.json"
import myth from "./data/names/mythical.json"
import ubs from "./data/names/ultra-beast.json"
import reg from "./data/names/regional.json"
import evs from "./data/names/event.json"

import evImages from "./data/images/events.json"
import fmImages from "./data/images/forms.json"
import alImages from "./data/images/images.json"
import path from "node:path";
import chalk from "chalk";
const poketwo = [`716390085896962058`];
const mention = `<@716390085896962058>`;

const langOpts = [`english`, `french`, `german`, `japanese`];
const languages = langOpts
  .map((x) => {

    const raw = fs.readFileSync(`./data/langs/${x}.json`, `utf-8`);
    try {
      return JSON.parse(raw);
    } catch (_) {
      return {};
    }
  })
  .filter((x) => x);

const legendariesSet = new Set(leg.map((p: string) => p.toLowerCase()));
const mythicalsSet = new Set(myth.map((p: string) => p.toLowerCase()));
const ultraBeastsSet = new Set(ubs.map((p: string) => p.toLowerCase()));
const regionalsSet = new Set(reg.map((p: string) => p.toLowerCase()));
const eventsSet = new Set(evs.map((p: string) => p.toLowerCase()));

const raritytags: { set: Set<string>; rarity: rarity }[] = [
  { set: legendariesSet, rarity: `leg` },
  { set: mythicalsSet, rarity: "myth" },
  { set: ultraBeastsSet, rarity: "ub" },
  { set: regionalsSet, rarity: "reg" },
  { set: eventsSet, rarity: "ev" },
];

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

let tokenCounter = 0;
export class Crused {
  token: string;
  client = new Client({});
  msgs: { message: string; channel: TextChannel; before?: Date }[] = [];
  sending: boolean = false;
  captcha: boolean = false;
  stats = {
    catches: 0,
    legendary: 0,
    mythical: 0,
    ultraBeast: 0,
    gigantamax: 0,
    event: 0,
    iv: 0,
    shiny: 0,
    balance: 0
  };
  count: number = ++tokenCounter;
  webhook: WebhookClient;
  constructor(token: string, webhook: string, count?: number) {
    this.token = token;
    this.webhook = new WebhookClient({ url: webhook });
    if (count) this.count = count;
  }

  login() {
    Logger.info(`Logging in...`);

    this.client.on("ready", () => {
      Logger.success(`Logged in as ${this.client?.user?.tag}!`);
      stats.connected++;
    });
    this.client.login(this.token).catch(() => `Unable to login`);
  }
  run() {
    this.client.on("messageCreate", async (message) => {
      if (message.channel.type != "GUILD_TEXT") return;
      if (poketwo.includes(message.author.id)) {
        //Whoa there. Please tell us you're human! https://verify.poketwo.net/captcha/1312953630134898750
        //Logger.error(this.client.user && message.content.includes(`Whoa there.`) && message.content.includes(this.client?.user?.id), this.client.user?.id, message.content, message.content.includes(`Whoa there.`))
        if (this.client.user && message.content.includes(`Whoa there.`) && message.content.includes(this.client?.user?.id)) {
          this.captcha = true;
          message.react(`🥶`);
          const hook = new WebhookClient({ url: config.captchaHook });
          const embed = new MessageEmbed()
            .setTitle(`Encountered new Captcha!`)
            .setColor(`#6a00c7`)
            .setThumbnail(this.client.user.displayAvatarURL())
            .setDescription(`- **<:PurpleUser:1278707340727554090> Account**: \`${this.client.user.tag}\` \`(${this.client.user.id})\`\n- **<:purple_link:1278707443278413876> Message**: [#${message.channel.name}](${message.url})`)
          let logStr = `Captcha on ` + chalk.underline(`${this.client.user.tag}`)
          if (config.captchaKey.length != 0) {
            embed.description = `-# ### ❕ Captcha Solver is __not available__!\n` + embed.description
            logStr = chalk.hex(`#e8ff17`)`❕` + ` | ` + logStr
          } else {
            logStr = chalk.hex(`#ff3352`)`❌` + ` | ` + logStr
          }
          Logger.warn(logStr)
          hook.send({
            embeds: [embed]
          })
          if (config.captchaKey.length == 0) return;
          let init = new Date();
          let solved = await this.solve(message);
          if (solved) {
            message.react(`:disguised_face:`)
            this.captcha = false;
            Logger.success(`✅ Solved captcha! ${chalk.hex(`#801fff`)`${this.client.user.tag}`}/${chalk.greenBright(((new Date().getTime() - init.getTime()) / 1000).toFixed(2))}s!`)
          }
          else {
            this.captcha = true;
            Logger.error(`❌ Failed captcha solve for ${this.client.user.tag}!`)
            message.react(`🙀`)
          }
        }
        if (message.embeds.length != 0 && message.embeds[0]?.title) {
          if (message.embeds[0].title.includes(`has appeared`)) {
            if (!config.autocatch || this.captcha) return;
            const spawned = new Date();
            this.sendMessage(
              `${mention} ${randomBin([`hint`, `h`])}`,
              message.channel,
              new Date(spawned.getTime() + 1 * 1000),
            );
          }
        }
        if (message.content.includes(`The pokémon is`)) {
          if (this.captcha || !config.autocatch) return;
          const pokemons = solveHint(message.content);
          this.catchPokemon(pokemons, message.channel);
        }
      }
    });
  }
  catchPokemon(pokemons: string[], channel: TextChannel) {
    const maxTries = 2;
    let tries = 0;
    const collector = channel.createMessageCollector({
      //filter: filter,
      time: 15_000,
    });
    collector.on(`collect`, async (msg) => {
      if (msg.content.startsWith(`Congratulations`)) {
        collector.stop();
        if (msg.client.user && msg.content.includes(msg.client.user?.id)) {
          const pokemon = this.parsePokemon(msg.content);
          //console.log(pokemon);
          this.stats.catches++;
          if (pokemon?.rarity.includes(`ev`)) this.stats.event++;
          if (pokemon?.rarity.includes(`leg`)) this.stats.legendary++;
          if (pokemon?.rarity.includes(`ub`)) this.stats.ultraBeast++;
          if (pokemon?.rarity.includes(`myth`)) this.stats.mythical++;
          if (pokemon?.shiny) this.stats.shiny++;

          if (pokemon?.loggable) {
            this.logPokemon(pokemon, msg.url);
          }
          if (pokemon)
            Logger.logPokemon(pokemon, msg as any)
          if (this.stats.catches == 1 && this.stats.balance == 0) {
            await channel.send(`<@${poketwo[0]}> bal`);
            const p2filter = (f: Message) =>
              f.embeds && f.embeds.length > 0 && poketwo.includes(f.author.id);
            let msg = (
              await channel.awaitMessages({
                filter: p2filter,
                time: 2000,
                max: 1,
              })
            ).first();
            if (msg && `embeds` in msg && msg.embeds.length > 0 && msg.embeds[0]?.title?.includes(`balance`) && msg.embeds[0]?.fields?.length > 0) {
              let rawBal = msg.embeds[0]?.fields[0]?.value;
              const bal = parseInt(rawBal.replace(/,/g, ""));
              if (!isNaN(bal)) {
                this.stats.balance = bal
                pokeList.pc += bal;
              };
              Logger.info(`Updated ${this.client.user?.tag}'s balance ${bal.toLocaleString()} PC!`)
            }
          }
        }
      } else if (
        msg.embeds.length > 0 &&
        msg.embeds[0]?.title?.includes(`wild pokémon`)
      ) {
        collector.stop();
      } else if (msg.content.includes(`That is the`)) {
        if (tries == maxTries) return collector.stop();
        const names = this.getNames(pokemons[tries]);
        names.push(pokemons[tries]);
        this.sendMessage(
          `${mention} ${randomBin([`c`, `catch`])} ${randomItem(names)}`,
          channel,
        );
        tries++;
      }
    });
    const names = this.getNames(pokemons[0]);
    names.push(pokemons[0]);
    this.sendMessage(
      `${mention} ${randomBin([`c`, `catch`])} ${randomItem(names)}`,
      channel,
    );
    tries++;
  }
  getNames(pokemon: string): string[] {
    const names = languages
      .map((language) => {
        if (pokemon.toLowerCase() in language) {
          return language[pokemon.toLowerCase()];
        }
      })
      .filter((x) => x);
    return names;
  }
  parsePokemon(content: string): Pokemon | null {
    if (!content.startsWith("Congratulations")) return null;

    const [_, main] = content.split("!").map((s) => s.trim());
    const [_1, _2, _3, _4, levelStr, ...nameParts] = main.split(" ");
    const level = parseInt(levelStr);

    const name = nameParts.join(" ").split("<")[0].trim();
    const iv = parseFloat(
      nameParts.join(" ").match(/\((\d+(\.\d+)?)%\)/)?.[1] ?? "0",
    );
    const gender = name.includes("female")
      ? "female"
      : name.includes("male")
        ? "male"
        : "none";

    let rarities: rarity[] = [];
    let loggable = false;
    for (const { set, rarity } of raritytags) {
      if (set.has(name.toLowerCase())) {
        rarities.push(rarity);
      }
    }

    if (rarities.length === 0) rarities = ["norm"];
    if (rarities[0] !== "norm") loggable = true;

    return {
      name,
      level,
      gender,
      iv,
      shiny: content.includes("✨") || content.includes(":sparkles:"),
      rarity: rarities,
      loggable,
    };
  }
  getImage(pokemon: string) {
    const name = pokemon.toLowerCase();
    let tags = [
      alImages[name as keyof typeof alImages],
      evImages[name as keyof typeof evImages],
      fmImages[name as keyof typeof fmImages],
    ];
    tags = tags.filter((x) => x);
    if (tags.length > 0) return tags[0];
    else {
      return `https://raw.githubusercontent.com/Z-Dux/Broskie-DB/main/ball.png`;
    }
  }
  logPokemon(pokemon: Pokemon, url: string) {
    const formats: Record<rarity, string> = {
      leg: `🟥`,
      myth: `🟨`,
      ub: `🟩`,
      ev: `⬜`,
      reg: `🟪`,
      norm: `🟦`,
    };
    const rNames: Record<rarity, string> = {
      leg: `Legendary`,
      myth: `Mythical`,
      ub: `Ultra Beast`,
      ev: `Event`,
      reg: `Regional`,
      norm: `Normal`,
    };
    const embed = new MessageEmbed()
      .setTitle("Pokémon Caught")
      .setDescription(
        `-  **Name** ‎ ‎ ‎ ‎ ‎ ※ ‎ ‎ ‎ ‎ \`${pokemon.name}\`
-  **Level**‎ ‎ ‎ ‎ ‎ ‎ ‎  ※ ‎  ‎ ‎ ‎ ‎${pokemon.level}
-  **Shiny**‎ ‎ ‎ ‎ ‎ ‎ ‎  ※ ‎  ‎ ‎ ‎ ‎${pokemon.shiny ? `Yes ✨` : `No`}
-  **Gender**‎ ‎ ‎  ※ ‎  ‎ ‎ ‎ ‎${pokemon.gender}
-  **IV** ‎ ‎ ‎  ※ ‎  ‎ ‎ ‎ ‎${pokemon.iv}%
  ` +
        "\n```\n" +
        pokemon.rarity.map((x) => formats[x].repeat(8)).join("\n") +
        "\n```",
      )
      .setURL(url)
      .setColor(2961203)
      .setAuthor({
        name: "Crused v2.2.3",
        url: "https://crused.sellauth.com/",
        iconURL:
          "https://raw.githubusercontent.com/Z-Dux/Broskie-DB/main/bew.png",
      })
      .setFooter({
        text: pokemon.rarity.map((x) => rNames[x]).join(" | "),
      })
      .setThumbnail(this.getImage(pokemon.name));
    this.webhook.send({ embeds: [embed] });
  }
  sendMessage(message: string, channel: TextChannel, before?: Date) {
    this.msgs.push({
      message,
      channel,
      before,
    });
    if (this.msgs.length == 1 && !this.sending) {
      this.sending = true;
      this.sender();
    }
  }
  async sender() {
    this.sending = true;
    while (this.msgs.length != 0) {
      try {
        const msg = this.msgs.shift();
        if (!msg?.before || (msg.before && msg.before > new Date())) {
          await msg?.channel.send(`${msg.message}`);
        }
        await wait(500);
      } catch (error) {
        Logger.error(error);
        await wait(500);
      }
    }
    this.sending = false;
  }
  async solve(message: Message) {
    const data = {
      token: this.client.token,
      key: config.captchaKey,
      id: this.client.user?.id || message.id
    };
    const hook = new WebhookClient({ url: config.captchaHook });
    let res = await axios.post('http://solver.poketwo.store/api/solve', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      return err?.response || err
    })

    if (res?.data && typeof res.data == `object` && `error` in res?.data) {
      const embed = new MessageEmbed()
        .setTitle(`Unable to solve!`)
        .setColor(`RED`)
        .setDescription(`> ${res.data.error}\n**Account:** ${this.client.user?.tag}`)

      try {
        await hook.send({
          embeds: [embed],
          username: `Crused Solver`,
          avatarURL: `https://raw.githubusercontent.com/Z-Dux/Broskie-DB/main/bew.png`
        })
      } catch (error) { }
      return false;
    } else {
      if (res.data?.message && res.data.message?.includes(`Solved`)) {
        let str = [
          `- <:PurpleTimeLogo1:1278709295101509686> **Solved** : \`${res.data.message.substring(0, res.data.message.indexOf(`:`))}\``,
          `- <:PurpleUser:1278707340727554090> **User** : \`${this.client?.user?.tag}\``,
          `- <:purple_link:1278707443278413876> **URL** : [Verifeid](https://verify.poketwo.net/captcha/${this.client.user?.id})`,
          `- <:discord_purple:1278708903567163495> **Server** : [${message.guild?.name}](${message.url})`
        ]
        message.reply(`Solved captcha!`);
        const embed = new MessageEmbed()
          .setTitle(`Captcha Solved!`)
          .setColor(`DARK_BUT_NOT_BLACK`)
          .setDescription(str.join('\n'))
        try {
          await hook.send({
            embeds: [embed],
            username: `Crused Solver`,
            avatarURL: `https://raw.githubusercontent.com/Z-Dux/Broskie-DB/main/bew.png`
          })
        } catch (error) { }
        return true;
      } else {
        let res = await this.awaitSolve(this.client?.user?.id || message.id);
        if (res) {
          let str = [
            `- <:PurpleTimeLogo1:1278709295101509686> **Solved** : \`Solved captcha in ${res}s!\``,
            `- <:PurpleUser:1278707340727554090> **User** : \`${this.client?.user?.tag}\``,
            `- <:purple_link:1278707443278413876> **URL** : [Verifeid](https://verify.poketwo.net/captcha/${this.client.user?.id})`,
            `- <:discord_purple:1278708903567163495> **Server** : [${message.guild?.name}](${message.url})`
          ]
          message.reply(`Solved captcha!`);
          const embed = new MessageEmbed()
            .setTitle(`Captcha Solved!`)
            .setColor(`DARK_BUT_NOT_BLACK`)
            .setDescription(str.join('\n'))
          try {
            await hook.send({
              embeds: [embed],
              username: `Crused Solver`,
              avatarURL: `https://raw.githubusercontent.com/Z-Dux/Broskie-DB/main/bew.png`
            })
          } catch (error) { }
          return true;
        }
        return false
      }

    }
  }

  async awaitSolve(id: string) {
    for (let i = 0; i < 20; i++) {
      await wait(3000)
      try {
        let res = await axios.get(`http://solver.poketwo.store/api/check/${id}`)//.catch(err => ({ error: `Unknown` }))
        let data = res.data
        if (`error` in res.data) continue;
        if (data?.state && data.state == `solved`) {
          return data?.time || 3;
        } else if (data?.state && data.state == `solving`) {
          continue;
        }
      } catch (error) {
        continue;
      }
    }

  }

}

const tokens = fs.readFileSync(path.join(__dirname, `../`, config.tokensFile), `utf-8`)?.split(`\n`).filter(x => x);


for (let i = 0; i < tokens.length; i++) {
  const cruser = new Crused(
    tokens[i],
    config.webhook,
    i
  );
  crusers.push(cruser)
  stats.tokens++;
  cruser.login();
  cruser.run();
}