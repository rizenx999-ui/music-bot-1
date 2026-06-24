const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

// Keep alive server
const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000, () => console.log("Web server running"));

// Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer();
let connection;

client.once("ready", () => {
  console.log("Bot is ONLINE!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // PLAY
  if (interaction.commandName === "play") {
    const query = interaction.options.getString("url");
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply("Voice channel join pannunga");

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    let videoUrl = query;

    // If not URL → search YouTube
    if (!ytdl.validateURL(query)) {
      const result = await ytSearch(query);
      if (!result.videos.length) return interaction.reply("Song not found");
      videoUrl = result.videos[0].url;
    }

    const stream = ytdl(videoUrl, { filter: "audioonly" });
    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    interaction.reply("🎵 Playing song...");
  }

  // DISCONNECT
  if (interaction.commandName === "disconnect") {
    if (connection) connection.destroy();
    interaction.reply("👋 Left voice channel");
  }
});

client.login(process.env.TOKEN);
