const express = require("express");
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

// ---------------- EXPRESS (Render keep-alive) ----------------
const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000, () => console.log("Web server running"));

// ---------------- DISCORD BOT ----------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer();
let connection;

// ---------------- SLASH COMMANDS ----------------
const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music")
    .addStringOption(opt =>
      opt.setName("url").setDescription("YouTube URL").setRequired(true)
    ),
  new SlashCommandBuilder().setName("pause").setDescription("Pause music"),
  new SlashCommandBuilder().setName("disconnect").setDescription("Leave voice")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// ---------------- READY EVENT ----------------
client.once("ready", async () => {
  console.log("Bot is ONLINE!");

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("Slash commands registered!");
  } catch (err) {
    console.log(err);
  }
});

// ---------------- COMMAND HANDLER ----------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // PLAY
  if (interaction.commandName === "play") {
    const url = interaction.options.getString("url");
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply("Voice channel join pannunga");

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const stream = ytdl(url, { filter: "audioonly" });
    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    interaction.reply("🎵 Playing music...");
  }

  // PAUSE
  if (interaction.commandName === "pause") {
    player.pause();
    interaction.reply("⏸ Paused");
  }

  // DISCONNECT
  if (interaction.commandName === "disconnect") {
    if (connection) connection.destroy();
    interaction.reply("👋 Disconnected");
  }
});

client.login(process.env.TOKEN);
