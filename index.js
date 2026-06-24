const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000, () => console.log("Web server running"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;

client.once("ready", () => {
  console.log("Bot is ONLINE!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "play") {
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply("Voice channel join pannunga");

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    interaction.reply("🎵 Bot joined voice (stable version)");
  }

  if (interaction.commandName === "disconnect") {
    if (connection) connection.destroy();
    interaction.reply("👋 Left voice channel");
  }
});

client.login(process.env.TOKEN);
