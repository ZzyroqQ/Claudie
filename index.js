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
const fs = require('node:fs');
const path = require('node:path');

// \\ config
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const START_ROLE_ID = process.env.START_ROLE_ID;

const DB_PATH = path.join(__dirname, 'database.json');
const LINK_REGEX = /(https?:\/\/[^\s]+)/g;
const BANNED_WORDS = ['scam', 'nitro-free', 'discord.gg/fake-invite', 'free-nitro'];

// \\ dynamic safety system storage (database manager)
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify({ guilds: {}, warnings: {}, giveaways: [], ticket_count: 0 }, null, 4));
        }
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error("Database read violation:", e);
        return { guilds: {}, warnings: {}, giveaways: [], ticket_count: 0 };
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4));
    } catch (e) {
        console.error("Database push violation:", e);
    }
}

// \\ client initialization
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// \\ application slash layout commands
const commands = [
    new SlashCommandBuilder().setName('status').setDescription('Perform rigorous structural system integrity checks'),
    
    new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Execute an enterprise infrastructure giveaway event')
        .addStringOption(option => option.setName('prize').setDescription('What assets are being provisioned?').setRequired(true))
        .addIntegerOption(option => option.setName('winners').setDescription('Total allocated selection slots').setRequired(true)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Purge a disruptive threat boundary from the server')
        .addUserOption(option => option.setName('target').setDescription('Target identity').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Operational justification documentation')),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Blacklist an account matrix record permanently')
        .addUserOption(option => option.setName('target').setDescription('Target identity').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Operational justification documentation')),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Wipe linear chat database lines down to clean space')
        .addIntegerOption(option => option.setName('amount').setDescription('Quantity index payload (1-100)').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Inject an architectural infraction mark against an account')
        .addUserOption(option => option.setName('target').setDescription('Target user signature').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Infraction detailing').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Retrieve historical infraction logging matrices for a specific user identity')
        .addUserOption(option => option.setName('target').setDescription('Identify target').setRequired(true)),

    new SlashCommandBuilder().setName('serverinfo').setDescription('Extract structural guild metadata indicators'),
    
    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Inspect chronological record history logs of a specific account')
        .addUserOption(option => option.setName('target').setDescription('Target data payload')),

    new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('Inject an enterprise button-driven support gateway system panel')
        .addChannelOption(option => option.setName('logging-channel').setDescription('Target channel for ticket audits').setRequired(true))
];

// \\ register commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
async function deployMatrixCommands() {
    try {
        console.log("⚡ Synchronizing deployment modules to Discord REST highway...");
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log("🏆 Integration verified. Slash architecture cached successfully.");
    } catch (err) {
        console.error("⛔ Command synchronization matrix initialization failed:", err);
    }
}

// \\ ready
client.once('ready', () => {
    console.log(`🌸 Claudie: ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'Claudie | System Bot', type: 3 }],
        status: 'dnd'
    });
});

// \\ automod
const messageTracker = new Map();
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const contentLower = message.content.toLowerCase();
    const triggerWordMatch = BANNED_WORDS.some(word => contentLower.includes(word));
    const maliciousLinkMatch = LINK_REGEX.test(message.content) && (contentLower.includes('gift') || contentLower.includes('nitro'));

    if (triggerWordMatch || maliciousLinkMatch) {
        await message.delete().catch(() => null);
        const autoWarning = await message.channel.send(`🚨 **Security Infraction:** ${message.author}, your recent broadcast violated threat matrix protocols. Action logged.`);
        setTimeout(() => autoWarning.delete().catch(() => null), 6000);

        const auditChannel = message.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (auditChannel) {
            const securityEmbed = new EmbedBuilder()
                .setTitle('🛡️ Automated Firewall Intercept')
                .setColor('#FF3B30')
                .addFields(
                    { name: 'Identity Account', value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
                    { name: 'Threat vector classification', value: triggerWordMatch ? 'Blacklisted Phrase Pattern' : 'Deceptive Token Scam Link', inline: true },
                    { name: 'Intercepted String Trace', value: `\`\`\`${message.content.substring(0, 1012)}\`\`\`` }
                )
                .setTimestamp();
            auditChannel.send({ embeds: [securityEmbed] });
        }
    }
});

// \\ welcome
client.on('guildMemberAdd', async (member) => {
    const defaultRole = member.guild.roles.cache.get(START_ROLE_ID);
    if (defaultRole) {
        await member.roles.add(defaultRole).catch(e => console.error("Auto-role processing error:", e));
    }

    const entranceChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (!entranceChannel) return;

    const presentationEmbed = new EmbedBuilder()
        .setTitle('🌸 Node Entry Confirmed')
        .setDescription(`Greetings ${member}, you have crossed boundaries into **${member.guild.name}**.\n\nOur system parameters require adherence to the protocol frameworks. Have an excellent integration.`)
        .setColor('#5865F2')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Assigned Index Position', value: `\`#${member.guild.memberCount}\``, inline: true },
            { name: 'Security Clear Level', value: defaultRole ? `${defaultRole}` : 'None Assigned', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Claudie Automated Access Management', iconURL: client.user.displayAvatarURL() });

    entranceChannel.send({ embeds: [presentationEmbed] });
});

// \\ tickets
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) return;

    const db = readDB();

    if (interaction.customId === 'gate_initialize_ticket') {
        await interaction.deferReply({ ephemeral: true });

        const ticketIndex = db.ticket_count + 1;
        const channelIdentifier = `ticket-${String(ticketIndex).padStart(4, '0')}`;

        // Create specialized overhead permissions for support staff
        const internalSupportChannel = await interaction.guild.channels.create({
            name: channelIdentifier,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ]
        });

        db.ticket_count = ticketIndex;
        writeDB(db);

        const internalInterfaceEmbed = new EmbedBuilder()
            .setTitle(`🎫 Communications Node: ${channelIdentifier}`)
            .setDescription(`System opened by request parameter of ${interaction.user}.\n\nPlease drop your structural issues and configuration requests down below. Management has been notified.`)
            .setColor('#34C759')
            .addFields(
                { name: 'Issuer Account ID', value: `\`${interaction.user.id}\``, inline: true },
                { name: 'Node Priority Level', value: '🟢 Standard System Inquiry', inline: true }
            )
            .setTimestamp();

        const functionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gate_terminate_ticket').setLabel('Close Stream').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await internalSupportChannel.send({ embeds: [internalInterfaceEmbed], components: [functionRow] });
        
        // Push configuration record to setup logging stream if available
        const logChannelId = db.guilds[interaction.guild.id]?.ticket_logs;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const auditTicketLog = new EmbedBuilder()
                .setTitle('📥 Communication Pipeline Formed')
                .setColor('#34C759')
                .addFields(
                    { name: 'Ticket Channel', value: `${internalSupportChannel}`, inline: true },
                    { name: 'Originator Identity', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();
            logChannel.send({ embeds: [auditTicketLog] });
        }

        return interaction.editReply({ content: `✅ Dynamic secure routing pipeline assembled: ${internalSupportChannel}` });
    }

    if (interaction.customId === 'gate_terminate_ticket') {
        await interaction.reply({ content: '⚠️ **De-authorization Phase Initiated.** Wiping channel data blocks and purging channel records in 5 seconds...' });
        
        const logChannelId = db.guilds[interaction.guild.id]?.ticket_logs;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const auditTicketCloseLog = new EmbedBuilder()
                .setTitle('📤 Communication Pipeline Terminated')
                .setColor('#FF3B30')
                .setDescription(`Channel index context: \`${interaction.channel.name}\` was flagged terminated.`)
                .addFields({ name: 'Enforcing Identity', value: `${interaction.user.tag}`, inline: true })
                .setTimestamp();
            logChannel.send({ embeds: [auditTicketCloseLog] });
        }

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => null);
        }, 5000);
    }
});

// \\ command handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;
    const db = readDB();

    const pushCentralAuditLog = (guild, operation, subject, actor, messageSummary) => {
        const auditRoute = guild.channels.cache.find(c => c.name === 'mod-logs');
        if (!auditRoute) return;

        const analyticalEmbed = new EmbedBuilder()
            .setTitle(`🛡️ Core Execution Log: ${operation}`)
            .setColor(operation === 'BAN' ? '#FF3B30' : '#FF9500')
            .addFields(
                { name: 'Subject User Element', value: `${subject.tag || subject.user.tag} (\`${subject.id}\`)`, inline: true },
                { name: 'Authorizing Official', value: `${actor.tag}`, inline: true },
                { name: 'System Justification Entry', value: messageSummary || 'No technical notes logged' }
            )
            .setTimestamp();
        auditRoute.send({ embeds: [analyticalEmbed] });
    };

    try {
        if (cmd === 'status') {
            const performanceEmbed = new EmbedBuilder()
                .setTitle('📊 Architectural Diagnostics System')
                .setColor('#007AFF')
                .addFields(
                    { name: 'Network Pipeline Latency', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
                    { name: 'Memory Array Index Load', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
                    { name: 'Node Engine Engine Envir.', value: `\`Node ${process.version}\``, inline: true }
                )
                .setTimestamp();
            return interaction.reply({ embeds: [performanceEmbed] });
        }

        if (cmd === 'giveaway') {
            const rewardName = interaction.options.getString('prize');
            const slotsAllocated = interaction.options.getInteger('winners');

            const deploymentEmbed = new EmbedBuilder()
                .setTitle('🎉 ENTERPRISE RESOURCE DISPATCH EVENT')
                .setDescription(`A promotional event matrix has been opened.\n\n🎁 **Asset Prize:** \`${rewardName}\`\n👥 **Allocated Winner Slots:** \`${slotsAllocated}\``)
                .setColor('#FFD700')
                .setFooter({ text: 'Interact using the expression below to drop entry matrix.' })
                .setTimestamp();

            const promptMessage = await interaction.reply({ embeds: [deploymentEmbed], fetchReply: true });
            await promptMessage.react('🎉');

            db.giveaways.push({
                messageId: promptMessage.id,
                channelId: interaction.channel.id,
                prize: rewardName,
                winnersCount: slotsAllocated
            });
            writeDB(db);
            return;
        }

        if (cmd === 'setup-tickets') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '⛔ System Access Core Violation. Administrative validation matrix required.', ephemeral: true });
            }

            const targetLogChannel = interaction.options.getChannel('logging-channel');
            
            if (!db.guilds[interaction.guild.id]) db.guilds[interaction.guild.id] = {};
            db.guilds[interaction.guild.id].ticket_logs = targetLogChannel.id;
            writeDB(db);

            const displayHubPanel = new EmbedBuilder()
                .setTitle('🎫 Secure Systems Routing Terminal')
                .setDescription('Need direct communication pathways with infrastructure administration? Deploy a protected message node sequence down below.')
                .setColor('#007AFF')
                .setFooter({ text: 'Claudie Communications Controller' });

            const structuralButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('gate_initialize_ticket').setLabel('Provision New Pipeline Channel').setStyle(ButtonStyle.Primary).setEmoji('📩')
            );

            await interaction.reply({ content: '✅ Dynamic Interface System deployed securely.', ephemeral: true });
            return interaction.channel.send({ embeds: [displayHubPanel], components: [structuralButtonRow] });
        }

        if (cmd === 'kick') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: '⛔ Enforcement operational permissions validation rejected.', ephemeral: true });
            }
            const target = interaction.options.getMember('target');
            const explanation = interaction.options.getString('reason') || 'No technical notes logged';

            if (!target.kickable) return interaction.reply({ content: '⛔ Target entity contains hierarchy system bypass. Force ejection failed.', ephemeral: true });

            await target.kick(explanation);
            pushCentralAuditLog(interaction.guild, 'KICK', target, interaction.user, explanation);
            return interaction.reply({ content: `✅ Force eviction complete: **${target.user.tag}** extracted from grid maps.`, ephemeral: true });
        }

        if (cmd === 'ban') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: '⛔ Enforcement operational permissions validation rejected.', ephemeral: true });
            }
            const target = interaction.options.getUser('target');
            const explanation = interaction.options.getString('reason') || 'No technical notes logged';

            await interaction.guild.members.ban(target, { reason: explanation });
            pushCentralAuditLog(interaction.guild, 'BAN', target, interaction.user, explanation);
            return interaction.reply({ content: `⛔ Hard permanent trace blacklist successfully cast over **${target.tag}**.`, ephemeral: true });
        }

        if (cmd === 'clear') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: '⛔ Operational permissions validation rejected.', ephemeral: true });
            }
            const volumeIndex = interaction.options.getInteger('amount');
            if (volumeIndex < 1 || volumeIndex > 100) return interaction.reply({ content: '⛔ Processing error. Bounds limited strictly within 1 to 100 rows.', ephemeral: true });

            await interaction.channel.bulkDelete(volumeIndex, true);
            return interaction.reply({ content: `🧹 Transaction lines erased. Linear log blocks dropped: \`${volumeIndex}\`.`, ephemeral: true });
        }

        if (cmd === 'warn') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '⛔ Operational permissions validation rejected.', ephemeral: true });
            }
            const target = interaction.options.getUser('target');
            const explanation = interaction.options.getString('reason');

            if (!db.warnings[target.id]) db.warnings[target.id] = [];
            db.warnings[target.id].push({
                moderator: interaction.user.tag,
                reason: explanation,
                timestamp: new Date().toISOString()
            });
            writeDB(db);

            await target.send(`⚠️ **Infraction System Warning Registered:** You received an official log entry file mark inside **${interaction.guild.name}**.\nContext justification: *${explanation}*`).catch(() => null);

            pushCentralAuditLog(interaction.guild, 'WARN', target, interaction.user, explanation);
            return interaction.reply({ content: `⚠️ Infraction log record linked successfully against account handle: **${target.tag}**.`, ephemeral: true });
        }

        if (cmd === 'warnings') {
            const target = interaction.options.getUser('target');
            const recordLogs = db.warnings[target.id] || [];

            if (recordLogs.length === 0) {
                return interaction.reply({ content: `✨ Profile structure for user: **${target.tag}** is fully optimal. Clean index history record.` });
            }

            const recordEmbed = new EmbedBuilder()
                .setTitle(`📋 Historic Audit File Log: ${target.tag}`)
                .setColor('#FF9500')
                .setDescription(recordLogs.map((warn, index) => `**[Entry #${index + 1}]**\nOfficer: \`${warn.moderator}\`\nReasoning: \`${warn.reason}\`\nFiled: <t:${Math.floor(new Date(warn.timestamp).getTime() / 1000)}:R>`).join('\n\n'));

            return interaction.reply({ embeds: [recordEmbed] });
        }

        if (cmd === 'serverinfo') {
            const { guild } = interaction;
            const detailEmbed = new EmbedBuilder()
                .setTitle(`📊 System Diagnostics Metric Map: ${guild.name}`)
                .setThumbnail(guild.iconURL())
                .setColor('#5865F2')
                .addFields(
                    { name: 'Root Infrastructure Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Active Node Identities Count', value: `\`${guild.memberCount}\``, inline: true },
                    { name: 'Creation Synchronization Stamp', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
                );
            return interaction.reply({ embeds: [detailEmbed] });
        }

        if (cmd === 'userinfo') {
            const targetUser = interaction.options.getUser('target') || interaction.user;
            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            const technicalUserEmbed = new EmbedBuilder()
                .setTitle(`👤 Structural Account Analysis: ${targetUser.tag}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setColor('#5865F2')
                .addFields(
                    { name: 'System Identification Value', value: `\`${targetUser.id}\``, inline: true },
                    { name: 'Platform Creation Timeline', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Guild Matrix Join Timestamp', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`, inline: true }
                );
            return interaction.reply({ embeds: [technicalUserEmbed] });
        }

    } catch (err) {
        console.error("Critical matrix execution fault caught:", err);
        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({ content: '❌ System internal process engine error encountered while compiling output arrays.', ephemeral: true });
        } else {
            return interaction.reply({ content: '❌ System internal process engine error encountered while compiling output arrays.', ephemeral: true });
        }
    }
});

// \\ start execution loop
deployMatrixCommands().then(() => client.login(TOKEN));
