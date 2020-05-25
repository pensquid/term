const Discord = require("discord.js");
const client = new Discord.Client();
const DBL = require("dblapi.js");
new DBL(process.env.DBL_TOKEN, client);

const commands = require("./commands");

const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const adapter = new FileAsync("../term.db.json");
low(adapter).then((db) => {
  client.on("ready", () => {
    client.user.setActivity("for $ info", { type: "WATCHING" });
    console.log(`Bot logged in as ${client.user.username}`);
  });

  client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith("$")) return;
    const parts = message.content.substr(1).trim().split(" ");

    switch (parts[0]) {
      case "create":
        commands.create(message.channel, db, parts[1]);
        break;
      case "remove":
        commands.remove(message.channel, db);
        break;
      case "run":
        commands.run(message.channel, parts.slice(1).join(" "), db);
        break;
      case "info":
        commands.info(message.channel, client.guilds.size, db.get("containers").size());
        break;
      default:
        if (message.channel.guild && message.channel.guild.id == "264445053596991498") return;
        commands.run(message.channel, parts.join(" "), db);
    }
  });

  client.on("guildCreate", (guild) => {
    const channel = guild.channels
      .sort(function(channel1, channel2) {
        if (channel1.type !== "text") return 1;
        if (!channel1.permissionsFor(guild.me).has("SEND_MESSAGES")) return -1;
        return channel1.position < channel2.position ? -1 : 1;
      })
      .first()
      || { send: () => {} };
    commands.hello(channel);
  });

  db.defaults({ containers: [] }).write();
  client.login(process.env.BOT_TOKEN);
});
