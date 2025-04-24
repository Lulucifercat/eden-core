// 📜 Eden-Core : gestion des tickets avec commandes !claim, !close, !delete, ping UptimeRobot et faux serveur HTTP
const { Client, GatewayIntentBits, Events, Partials, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const express = require('express');
const os = require('os');
const { setInterval } = require('node:timers');
const app = express();
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

// ID du salon de logs où les tickets seront enregistrés
const LOG_CHANNEL_ID = '1363845483533176883';
const LOG_CHANNEL_ID_EDEN = '1364718735763443763';

// ID des salons où les boutons d'ouverture de ticket sont affichés. Chaque salon correspond à un type spécifique de demande (spec, background, dev, etc.) Eden Core enverra un embed dans chacun de ces salons avec un bouton pour créer un ticket.
const ticketChannels = {
  'spec': '1360714073897177301',
  'background': '1360713975544680710',
  'problématique': '1360713882318012486',
  'dev': '1360714141047980042',
  'helpeur': '1360299478921252875',
  'autres': '1360721481633632448',
  'mj': '1360713808196276244'
};

// ID des catégories Discord dans lesquelles seront automatiquement créés les salons de tickets selon leur type sélectionné par l'utilisateur. Ces catégories permettent de classer les tickets (Admin, Dev, Helpeur, MJ, etc.) pour une meilleure organisation.
const ticketCategories = {
  'spec': '1362898038774829136',
  'background': '1362898038774829136',
  'problématique': '1362898038774829136',
  'dev': '1360719242529607710',
  'helpeur': '1360717411460055080',
  'autres': '1360717411460055080',
  'mj': '1360717707145908284'
};

// 👥 Rôles à ping automatiquement selon le type de ticket (avec les bons IDs)
const roleMentions = {
  'spec': ['<@&1360180797021360221>', '<@&1360410753697321043>'],
  'background': ['<@&1360180797021360221>', '<@&1360410753697321043>'],
  'problématique': ['<@&1360180797021360221>', '<@&1360410753697321043>'],
  'dev': ['<@&1360329081249468516>'],
  'helpeur': ['<@&1360184516043603988>', '<@&1360409790681059518>'],
  'autres': ['<@&1360184516043603988>', '<@&1360409790681059518>'],
  'mj': ['<@&1360181430969307167>']
};

const embedData = {
  'spec': {
    title: '👁️ Demander un spec',
    description: `Tu sens qu’une scène RP risque de partir en vrille ? Tu as l’impression que ça va déraper, que quelqu’un pourrait dépasser les limites du fairplay, ou que tu risques de subir un RP malsain, incohérent ou toxique ?

Ce formulaire te permet de demander la présence d’un membre du staff.

Scènes concernées :
• RP de conflit (physique ou verbal)
• Ambiance tendue ou joueur douteux
• Forcing RP pressenti
• Problème de confort / consentement

Le staff interviendra seulement si nécessaire, mais sa présence est là pour te protéger, garantir l’équité et éviter l’escalade.`
  },
  'background': {
    title: '📜 Envoies ton background !',
    description: `Avant de poser les pieds dans l’Ouest sauvage, ton personnage doit avoir une histoire, un passé, une raison d’être.
Ce ticket te permet d’envoyer ton background RP pour validation par le staff. C’est ce document qui définira ce que ton personnage sait, peut faire, a vécu et redoute.

⚠️ Sois cohérent avec l’univers de chaque saison. Évite les personnages trop puissants, les traumatismes gratuits ou les éléments surnaturels sans justification.
Souviens toi lors de ta douane, tu as discuté avec un membre du staff de la saison en cours. Si ton dossier ne correspond pas à la saison, le staff se réserve le droit de refuser ou de te demander de modifier celui-ci.`
  },
  'problématique': {
    title: '🚨 Signaler un problème ou un comportement',
    description: `Tu rencontres un souci sérieux avec un autre joueur ou une situation RP/HRP ? Voici ce que tu peux signaler :
• Propos déplacés ou comportements toxiques
• Forcing RP ou non-respect des limites
• Incohérences graves dans l’univers RP
• Abus de pouvoir
• etc..., tout ce que tu penses être problématique.

Merci d’expliquer calmement et clairement ce qu’il s’est passé. Si tu as des preuves (screens, REC), joins-les au ticket dès l’ouverture.
Nous traiterons ta demande avec la plus grande confidentialité et impartialité.`
  },
  'dev': {
    title: '🛠️ Demander une intervention du développeur',
    description: `Tu rencontres un bug technique, un souci de script, un problème d’interface, ou tu souhaites suggérer une amélioration côté dev ?

Ce ticket est fait pour contacter l’équipe de développement.

Tu peux ouvrir un ticket pour :
• Un bug en jeu (invisibilité, mapping cassé, script qui plante…)
• Un problème d’interface ou de menu,
• Un item ou un objet qui ne fonctionne pas
• Une suggestion de fonctionnalité (système, interface, mécanique RP),
• Un problème de synchronisation / chargement / crashs,

⚠️ Merci de décrire ton problème avec précision, et de fournir des captures d’écran ou logs si possible.`
  },
  'helpeur': {
    title: '🧊 Ouvre un ticket d’aide',
    description: `Tu rencontres un souci technique, un bug en jeu ne nécessitant pas l’intervention d’un développeur, un problème de connexion ou tu as une question sur le serveur ?

Appuie sur le bouton ci-dessous pour ouvrir un ticket avec l’équipe support. Un membre du staff viendra te répondre au plus vite.

⚠️ Merci d’expliquer clairement ton problème une fois le ticket ouvert.`
  },
  'autres': {
    title: '⚖️ Déposer une réclamation ou demande de grade',
    description: `Tu veux signaler un comportement inapproprié, une décision injuste ou un abus de pouvoir ou tout simplement demander le grade streamer ?

Il ne s’agit pas d’un espace pour régler des comptes, mais pour faire valoir un désaccord ou alerter sur un problème grave.

Tu peux déposer une réclamation pour :
• Abus d’un joueur ou d’un membre du staff,
• Traitement inéquitable / sanction,
• Demande du grade streamer.

⚠️ Merci de rester respectueux, clair et de fournir des preuves si possible. Toute demande sans fondement ou insultante sera ignorée.`
  },
  'mj': {
    title: '📜 Ouvre un ticket MJ',
    description: `Tu as une demande liée à l’univers RP ? Les MJ sont là pour t’écouter.

Voici quelques exemples de ce que tu peux demander :
• Création ou modification de fiche personnage
• Requête pour un don, une capacité spéciale, une malédiction…
• Création ou prise en charge d’une faction RP
• Proposition de quête ou d’événement RP

Ce ticket est privé entre toi et l’équipe MJ et le staff. Merci de formuler ta demande de façon claire et détaillée.`
  }
};

async function setupEmbeds() {
  for (const [type, channelId] of Object.entries(ticketChannels)) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) continue;

      const existingMessages = await channel.messages.fetch({ limit: 10 });
      const alreadyExists = existingMessages.some(m => m.author.id === client.user.id && m.components.length > 0);
      if (alreadyExists) continue;

      const embed = new EmbedBuilder()
        .setTitle(embedData[type].title)
        .setDescription(embedData[type].description)
        .setColor(0x2c3e50);

      const button = new ButtonBuilder()
        .setCustomId(`create_${type}`)
        .setLabel(`Ticket ${type.charAt(0).toUpperCase() + type.slice(1)}`)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(`Erreur lors de l'envoi de l'embed dans ${type} :`, err);
    }
  }
}

setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 30 * 60 * 1000);

client.once(Events.ClientReady, async () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
  await setupEmbeds();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, type] = interaction.customId.split('_');
  if (action !== 'create' || !ticketCategories[type]) return;

  const categoryId = ticketCategories[type];
  const user = interaction.user;
  const guild = interaction.guild;

  try {
    let permissionOverwrites = [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      }
    ];

    // 🔧 Synchronisation avec la catégorie DEV si besoin
    if (type === 'dev') {
      const category = await guild.channels.fetch(categoryId);
      if (category && category.permissionOverwrites) {
        permissionOverwrites = category.permissionOverwrites.cache.map(po => ({
          id: po.id,
          allow: po.allow.bitfield,
          deny: po.deny.bitfield
        }));
        permissionOverwrites.push({
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        });
      }
    }

    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: `Ticket de ${user.id}`,
      permissionOverwrites
    });
    
    let ticketMessage = `🎟️ Bonjour <@${user.id}>, ton ticket a été créé. Merci de nous fournir les détails nécessaires pour que nous puissions t’aider efficacement.`;

    if (type === 'spec') {
      const mentions = roleMentions['spec'].join(' ');
      ticketMessage += `\n${mentions}`;
    }

    await ticketChannel.send({ content: ticketMessage });

    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        content: `📥 Ticket créé : <#${ticketChannel.id}> par <@${user.id}> dans la catégorie ${type}`
      });
    }

    await interaction.reply({ 
      content: `✅ Ticket créé : <#${ticketChannel.id}>`, 
      flags: 64 });

  } catch (err) {
    console.error('❌ Erreur lors de la création du ticket :', err);
    await interaction.reply({
      content: '❌ Une erreur est survenue lors de la création du ticket.',
      ephemeral: true
    });
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  const member = message.member;
  const channel = message.channel;
  const content = message.content.toLowerCase();

  if (content === '!claim') {
    let emoji = '🎫';
    if (member.roles.cache.some(role => role.name === 'Resp. Admin')) emoji = '🟪';
    else if (member.roles.cache.some(role => role.name === 'Admin')) emoji = '🟠';
    else if (member.roles.cache.some(role => role.name === 'Développeur')) emoji = '🔵';
    else if (member.roles.cache.some(role => role.name === 'Resp. Helpeur')) emoji = '🟩';
    else if (member.roles.cache.some(role => role.name === 'Helpeur')) emoji = '🟢';

    try {
      const oldName = channel.name.replace(/^.+?・/, '');
      await channel.setName(`${emoji}・${oldName}`);
      const messages = await channel.messages.fetch({ limit: 10 });
      const hasAlreadyClaimed = messages.some(msg => msg.content.includes("Ce ticket est désormais sous la responsabilité"));
      if (!hasAlreadyClaimed) {
        await channel.send(`🛡️ *Ce ticket est désormais sous la responsabilité de <@${member.id}>.*`);
      }
    } catch (err) {
      console.error(err);
      message.reply("❌ Impossible de renommer le salon. Vérifie mes permissions.");
    }
    return;
  }

  if (content === '!close') {
    try {
      await message.reply("🔒 *Le ticket est désormais clos. Merci pour votre message.*");
      await channel.send("📌 *Ce ticket a été marqué comme résolu. Un membre du staff peut le supprimer avec `!delete`.*");
      const ticketOpener = message.mentions.users.first() || channel.topic?.match(/<@(\d+)>/)?.[1];
      if (ticketOpener) {
        await channel.permissionOverwrites.edit(ticketOpener, {
          ViewChannel: false,
          SendMessages: false,
          ReadMessageHistory: false
        });
      }
    } catch (err) {
      console.error("Erreur lors de la commande !close :", err);
      message.reply("❌ Impossible de marquer ce ticket comme fermé.");
    }
    return;
  }

  if (content === '!delete') {
    try {
      await message.reply("⚠️ Suppression immédiate...");
      setTimeout(() => {
        channel.delete().catch(err => {
          console.error("Erreur lors de la suppression du salon :", err);
        });
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la commande !delete :", err);
      message.reply("❌ Impossible de supprimer le salon.");
    }
    return;
  }
});

setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 30 * 60 * 1000);

client.login(TOKEN);

app.get("/", (req, res) => {
  console.log("🔁 Ping reçu depuis UptimeRobot");
  res.send("Eden Core est éveillé.");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Faux serveur HTTP lancé pour Render");
});

client.on('error', async (error) => {
  try {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID_EDEN);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send(`❌ **Erreur client :**\n\`\`\`${error.message}\`\`\``);
    }
  } catch (err) {
    console.error('Erreur en log d\'erreur client :', err);
  }
});

process.on('unhandledRejection', async (reason) => {
  try {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID_EDEN);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send(`⚠️ **Unhandled Rejection :**\n\`\`\`${reason}\`\`\``);
    }
  } catch (err) {
    console.error('Erreur en log d\'Unhandled Rejection :', err);
  }
});

setInterval(async () => {
  try {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID_EDEN);
    if (!logChannel || !logChannel.isTextBased()) return;

    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalMem = os.totalmem() / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024;
    const cpuLoad = os.loadavg()[0];

    const statusMsg = `📊 **Monitoring système**\n🧠 RAM utilisée : ${Math.round(used * 100) / 100} MB / ${Math.round(totalMem)} MB\n💨 RAM libre : ${Math.round(freeMem)} MB\n⚙️ Charge CPU (1m) : ${cpuLoad}`;

    await logChannel.send(statusMsg);
  } catch (err) {
    console.error('Erreur dans le monitoring mémoire/CPU :', err);
  }
}, 180 * 60 * 1000);
