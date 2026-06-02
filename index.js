require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require('discord.js');

//  config
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const START_ROLE_ID = process.env.START_ROLE_ID;

const BANNED_WORDS = ['scam', 'nitro-free', 'discord.gg/fake-invite'];

//  client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

//  commands
const commands = [
    new SlashCommandBuilder().setName('status').setDescription('Check system diagnostics'),
    new SlashCommandBuilder().setName('giveaway').setDescription('Launch an interactive server giveaway event'),

    // Moderation
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member out of the server')
        .addUserOption(option => option.setName('target').setDescription('Member to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for enforcement')),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member permanently from the server')
        .addUserOption(option => option.setName('target').setDescription('User to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for enforcement')),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Purge a specified volume of messages')
        .addIntegerOption(option => option.setName('amount').setDescription('Volume of messages (1-100)').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issue a formal warning to a member')
        .addUserOption(option => option.setName('target').setDescription('Target member').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for infraction').setRequired(true)),

    // Utility
    new SlashCommandBuilder().setName('serverinfo').setDescription('Fetch architectural metadata of this Discord guild'),
    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Fetch comprehensive user account timeline data')
        .addUserOption(option => option.setName('target').setDescription('Target user')),

    // Tickets
    new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('Initialize Claudie’s interactive support system panel')
];

//  register commands
const rest = new REST({ version: '10' }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log("⏳ Initializing Slash Commands sync...");
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log("✅ Application (/) commands successfully cached locally.");
    } catch (error) {
        console.error("❌ Fatal error deploying application commands:", error);
    }
}

//  ready
client.once('ready', () => {
    console.log(`🌸 Claudie operational. Logged in securely as ${client.user.tag}`);
    client.user.setActivity('over NexoCloud Security', { type: 3 });
});

//  automod
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const matchedTrigger = BANNED_WORDS.some(word => message.content.toLowerCase().includes(word));
    
    if (matchedTrigger) {
        await message.delete().catch(err => console.error("Could not intercept message:", err));
        
        const autoWarning = await message.channel.send(`⚠️ ${message.author}, malicious or blacklisted phrases are prohibited. This incident has been logged.`);
        setTimeout(() => autoWarning.delete().catch(() => null), 5000);

        const logChannel = message.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (logChannel) {
            const safetyLog = new EmbedBuilder()
                .setTitle('🛡️ Automod Enforcement triggered')
                .setColor('#FF3B30')
                .addFields(
                    { name: 'Offender', value: `${message.author.tag} (\`${message.author.id}\`)` },
                    { name: 'Intercepted Content', value: `\`\`\`${message.content}\`\`\`` }
                )
                .setTimestamp();
            logChannel.send({ embeds: [safetyLog] });
        }
    }
});

//  welcome
client.on('guildMemberAdd', async (member) => {
    const initialRole = member.guild.roles.cache.get(START_ROLE_ID);
    if (initialRole) {
        await member.roles.add(initialRole).catch(err => console.error("Role synchronization failure:", err));
    }

    const greetingChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (!greetingChannel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setTitle('🌸 Welcome to NexoCloud!')
        .setColor('#5865F2')
        .setDescription(`Hello ${member}, welcome to our professional environment!\n\nYour presence drops you into a space built for innovation. Browse through our channels, follow guidelines, and connect.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields({ name: 'Member Position', value: `#${member.guild.memberCount}`, inline: true })
        .setTimestamp()
        .setFooter({ text: 'Claudie Core Operations', iconURL: client.user.displayAvatarURL() });

    greetingChannel.send({ embeds: [welcomeEmbed] });
});

//  tickets
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) return; 

    if (interaction.customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });

        const subchannelName = `ticket-${interaction.user.username}`;
        const activeCheck = interaction.guild.channels.cache.find(c => c.name === subchannelName.toLowerCase());
        
        if (activeCheck) {
            return interaction.editReply({ content: `❌ Verification failed. You already have an initialized support session pending here: ${activeCheck}` });
        }

        const supportChannel = await interaction.guild.channels.create({
            name: subchannelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel], 
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                }
            ],
        });

        const onboardingEmbed = new EmbedBuilder()
            .setTitle(`🎫 Support Docket initialized | ${interaction.user.username}`)
            .setDescription('Staff dispatch notifications completed. Please lay out your parameters or business queries transparently below.')
            .setColor('#1C1C1E')
            .setTimestamp();

        const closeActionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Terminate Session')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
        );

        await supportChannel.send({ embeds: [onboardingEmbed], components: [closeActionRow] });
        return interaction.editReply({ content: `✅ Ticket initialization successful. Proceed here: ${supportChannel}` });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 Session lifecycle end sequence initialized. Purging channel records in 5 seconds...' });
        setTimeout(async () => {
            await interaction.channel.delete().catch(() => null);
        }, 5000);
    }
});

//  command handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;

    const pushModLog = (guild, executionType, target, officer, summary) => {
        const auditLogChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
        if (!auditLogChannel) return;

        const structuralLog = new EmbedBuilder()
            .setTitle(`🛠️ System Action: ${executionType}`)
            .setColor(executionType === 'BAN' ? '#FF3B30' : '#FF9500')
            .addFields(
                { name: 'Target Account', value: `${target.tag || target.user.tag} (\`${target.id}\`)`, inline: true },
                { name: 'Enforcing Officer', value: `${officer.tag}`, inline: true },
                { name: 'Reason provided', value: summary || 'No context registered' }
            )
            .setTimestamp();
        auditLogChannel.send({ embeds: [structuralLog] });
    };

    try {
        if (cmd === 'status') return interaction.reply("🟢 Diagnostics Complete: Core dependencies stable. Claudie framework optimized.");

        if (cmd === 'giveaway') {
            const promotionalEmbed = new EmbedBuilder()
                .setTitle("🎉 LIVE INSIGNIA GIVEAWAY")
                .setDescription("Interact with the 🎉 mechanism below to cast your application slot into the matrix.")
                .setColor('#FFD700');
            const promotionalMsg = await interaction.reply({ embeds: [promotionalEmbed], fetchReply: true });
            promotionalMsg.react("🎉");
            return;
        }

        if (cmd === 'setup-tickets') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Command execution terminated. Administrative authentication required.", ephemeral: true });
            }

            const dispatchEmbed = new EmbedBuilder()
                .setTitle('🎫 Core Support Hub')
                .setDescription('Encountering configuration constraints? Initialize an encrypted chat stream with Claudie Operations by deploying the interaction panel below.')
                .setColor('#5865F2');

            const interfaceRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Initialize Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📩')
            );

            await interaction.reply({ content: '✅ Interactive portal successfully deployed.', ephemeral: true });
            return interaction.channel.send({ embeds: [dispatchEmbed], components: [interfaceRow] });
        }

        if (cmd === 'kick') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: "❌ Authentication denied. Insufficient operational rights.", ephemeral: true });
            }
            const target = interaction.options.getMember('target');
            const reason = interaction.options.getString('reason') || 'No context registered';

            if (!target.kickable) return interaction.reply({ content: "❌ Operation rejected. Target maintains hierarchy protection.", ephemeral: true });
            
            await target.kick(reason);
            pushModLog(interaction.guild, 'KICK', target, interaction.user, reason);
            return interaction.reply({ content: `✅ **${target.user.tag}** has been removed from the server environment.`, ephemeral: true });
        }

        if (cmd === 'ban') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: "❌ Authentication denied. Insufficient operational rights.", ephemeral: true });
            }
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') || 'No context registered';

            await interaction.guild.members.ban(target, { reason: reason });
            pushModLog(interaction.guild, 'BAN', target, interaction.user, reason);
            return interaction.reply({ content: `⛔ **${target.tag}** is permanently barred from accessing this guild.`, ephemeral: true });
        }

        if (cmd === 'clear') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: "❌ Authentication denied. Insufficient operational rights.", ephemeral: true });
            }
            const volume = interaction.options.getInteger('amount');
            if (volume < 1 || volume > 100) return interaction.reply({ content: "❌ Execution boundaries violated. Enter integers scaling 1-100.", ephemeral: true });

            await interaction.channel.bulkDelete(volume, true);
            return interaction.reply({ content: `🧹 Data purge complete. Eliminated **${volume}** message lines.`, ephemeral: true });
        }

        if (cmd === 'warn') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: "❌ Authentication denied. Insufficient operational rights.", ephemeral: true });
            }
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason');

            await target.send(`⚠️ An official infraction warning has been filed under your handle on **${interaction.guild.name}**.\nReason provided: ${reason}`).catch(() => null);
            
            pushModLog(interaction.guild, 'WARN', target, interaction.user, reason);
            return interaction.reply({ content: `⚠️ **${target.tag}** has been formally warned. Incident captured.`, ephemeral: true });
        }

        if (cmd === 'serverinfo') {
            const { guild } = interaction;
            const architecturalEmbed = new EmbedBuilder()
                .setTitle(`📊 System Profile: ${guild.name}`)
                .setColor('#5865F2')
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: 'Root Administrator', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'User Matrix Cap', value: `${guild.memberCount}`, inline: true },
                    { name: 'Chronology Genesis', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
                );
            return interaction.reply({ embeds: [architecturalEmbed] });
        }

        if (cmd === 'userinfo') {
            const account = interaction.options.getUser('target') || interaction.user;
            const contextMember = await interaction.guild.members.fetch(account.id);
            
            const profileEmbed = new EmbedBuilder()
                .setTitle(`👤 Object Metadata: ${account.tag}`)
                .setColor('#5865F2')
                .setThumbnail(account.displayAvatarURL())
                .addFields(
                    { name: 'Account ID String', value: `\`${account.id}\``, inline: true },
                    { name: 'Genesis Stamp', value: `<t:${Math.floor(account.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Guild Join Vector', value: `<t:${Math.floor(contextMember.joinedTimestamp / 1000)}:R>`, inline: true }
                );
            return interaction.reply({ embeds: [profileEmbed] });
        }

    } catch (err) {
        console.error("Runtime exception handled:", err);
        return interaction.reply({ content: "❌ Command execution collapsed due to internal environment faults.", ephemeral: true });
    }
});

//  start
registerCommands().then(() => client.login(TOKEN));
