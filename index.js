const { EmbedBuilder } = require("discord.js");

// video details (after yt-search or url)
const embed = new EmbedBuilder()
  .setTitle(video.title)
  .setURL(video.url)
  .setAuthor({ name: video.author.name })
  .setThumbnail(video.thumbnail)
  .addFields(
    { name: "⏱ Duration", value: video.timestamp || "Live", inline: true },
    { name: "👤 Requested by", value: interaction.user.tag, inline: true }
  )
  .setColor("Blue");

interaction.reply({ embeds: [embed] });
