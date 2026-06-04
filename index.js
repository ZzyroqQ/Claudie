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
    ChannelType,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
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

// \\ database manager
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

// \\ slash commands deployment matrix
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
        .setDescription('Inject an enterprise button/select support gateway system panel')
        .addChannelOption(option => option.setName('logging-channel').setDescription('Target channel for ticket audits').setRequired(true)),

    new SlashCommandBuilder()
        .setName('dmall')
        .setDescription('Send Direct Message to everyone here')
        .addStringOption(option => option.setName('message').setDescription('Target Message For Members').setRequired(true)),

    new SlashCommandBuilder()
        .setName('dmto')
        .setDescription('Send Direct Message to a specific account entry')
        .addUserOption(option => option.setName('target').setDescription('Target user identity').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The payload content string').setRequired(true)),

    new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Deploy an automated official infrastructure notification broadcast')
        .addStringOption(option => option.setName('message').setDescription('Announcement content').setRequired(true))
        .addStringOption(option => option.setName('mention').setDescription('Ping configuration')
            .addChoices(
                { name: 'none', value: 'none' },
                { name: 'everyone', value: 'everyone' },
                { name: 'here', value: 'here' }
            ).setRequired(true))
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
        .setColor('#FF3B30')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Assigned Index Position', value: `\`#${member.guild.memberCount}\``, inline: true },
            { name: 'Security Clear Level', value: defaultRole ? `${defaultRole}` : 'None Assigned', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Claudie Automated Access Management', iconURL: client.user.displayAvatarURL() });

    entranceChannel.send({ embeds: [presentationEmbed] });
});

// \\ enterprise ticket interactions engine
client.on('interactionCreate', async (interaction) => {
    const db = readDB();
    const serverIcon = interaction.guild?.iconURL({ dynamic: true }) || null;

    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category_select') {
        await interaction.deferReply({ flags: [ 'Ephemeral' ] });
        
        const categorySelection = interaction.values[0];
        const ticketIndex = db.ticket_count + 1;
        
        let prefix = "ticket";
        let titleName = "🔴 System Support Query";
        if (categorySelection === 'tech') { prefix = "tech"; titleName = "⚙️ Technical Matrix Support"; }
        if (categorySelection === 'report') { prefix = "report"; titleName = "🔏 Subject Violation Report"; }
        if (categorySelection === 'billing') { prefix = "billing"; titleName = "💼 Management Inquiry"; }

        const channelIdentifier = `${prefix}-${String(ticketIndex).padStart(4, '0')}`;

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
            .setDescription(`System opened by parameter logic of ${interaction.user}.\n\nCategory alignment: **${titleName}**\nPlease detail your engineering issue here. Our operational officials have been notified.`)
            .setColor('#FF3B30')
            .addFields(
                { name: 'Issuer Account ID', value: `\`${interaction.user.id}\``, inline: true },
                { name: 'Node Status Matrix', value: '🟢 Awaiting Administration Team Assignment', inline: true }
            )
            .setTimestamp();
        if (serverIcon) internalInterfaceEmbed.setThumbnail(serverIcon);

        const functionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gate_claim_ticket').setLabel('Claim Node').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
            new ButtonBuilder().setCustomId('gate_terminate_ticket').setLabel('Close Stream').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await internalSupportChannel.send({ content: `${interaction.user} | Administration Grid Notification`, embeds: [internalInterfaceEmbed], components: [functionRow] });

        const logChannelId = db.guilds[interaction.guild.id]?.ticket_logs;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const auditTicketLog = new EmbedBuilder()
                .setTitle('📥 Communication Pipeline Formed')
                .setColor('#FF3B30')
                .addFields(
                    { name: 'Ticket Channel', value: `${internalSupportChannel}`, inline: true },
                    { name: 'Originator Identity', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Category Target Cluster', value: `\`${categorySelection.toUpperCase()}\``, inline: true }
                )
                .setTimestamp();
            if (serverIcon) auditTicketLog.setThumbnail(serverIcon);
            logChannel.send({ embeds: [auditTicketLog] });
        }

        return interaction.editReply({ content: `✅ Dynamic secure routing pipeline assembled: ${internalSupportChannel}` });
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === 'gate_claim_ticket') {
        const claimEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        
        if (claimEmbed.data.fields.some(f => f.name === 'Assigned Official Component')) {
            return interaction.reply({ content: '⛔ This routing node pipeline data matrix has already been claimed.', ephemeral: true });
        }

        claimEmbed.spliceFields(1, 1, { name: 'Node Status Matrix', value: `🟡 Handled by ${interaction.user}`, inline: true });
        claimEmbed.addFields({ name: 'Assigned Official Component', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true });

        await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        await interaction.message.edit({ embeds: [claimEmbed] });
        return interaction.reply({ content: `✅ You have taken operational priority block ownership over \`${interaction.channel.name}\`.` });
    }

    if (interaction.customId === 'gate_terminate_ticket') {
        await interaction.reply({ content: '⚠️ **De-authorization Phase Initiated.** Wiping channel data blocks, running transcript pipeline backups and purging channel records in 5 seconds...' });
        
        const compiledMessages = await interaction.channel.messages.fetch({ limit: 100 });
        let rawLogString = `=== TICKET NODE ARCHIVE CONTEXT DICTIONARY: ${interaction.channel.name} ===\n\n`;
        
        const reverseLayoutArray = Array.from(compiledMessages.values()).reverse();
        reverseLayoutArray.forEach(m => {
            rawLogString += `[${m.createdAt.toISOString()}] ID: ${m.author.id} | ${m.author.tag}: ${m.content}\n`;
            if (m.embeds.length > 0) rawLogString += `>> [Embedded Array Element Present]\n`;
        });

        const dataBufferStream = Buffer.from(rawLogString, 'utf-8');

        const creationMatchEmbed = interaction.message.embeds[0];
        const extractedUserId = creationMatchEmbed?.fields[0]?.value.replace(/[^0-9]/g, '');
        
        if (extractedUserId) {
            const matchedUser = await client.users.fetch(extractedUserId).catch(() => null);
            if (matchedUser) {
                await matchedUser.send({
                    content: `🌸 **Secure System Storage Notification:** Communications node pipeline \`${interaction.channel.name}\` inside **${interaction.guild.name}** was closed successfully. Attached is your historical transcript payload data map.`,
                    files: [{ attachment: dataBufferStream, name: `transcript-${interaction.channel.name}.txt` }]
                }).catch(() => null);
            }
        }

        const logChannelId = db.guilds[interaction.guild.id]?.ticket_logs;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const auditTicketCloseLog = new EmbedBuilder()
                .setTitle('📤 Communication Pipeline Terminated')
                .setColor('#FF3B30')
                .setDescription(`Channel index context: \`${interaction.channel.name}\` was flagged terminated. Log data array buffered successfully.`)
                .addFields({ name: 'Enforcing Identity', value: `${interaction.user.tag}`, inline: true })
                .setTimestamp();
            if (serverIcon) auditTicketCloseLog.setThumbnail(serverIcon);
            
            logChannel.send({ embeds: [auditTicketCloseLog], files: [{ attachment: dataBufferStream, name: `audit-transcript-${interaction.channel.name}.txt` }] });
        }

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => null);
        }, 5000);
    }
});

// \\ chat command core execution handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;
    const db = readDB();
    const serverIcon = interaction.guild?.iconURL({ dynamic: true }) || null;

    const pushCentralAuditLog = (guild, operation, subject, actor, messageSummary) => {
        const auditRoute = guild.channels.cache.find(c => c.name === 'mod-logs');
        if (!auditRoute) return;

        const analyticalEmbed = new EmbedBuilder()
            .setTitle(`🛡️ Core Execution Log: ${operation}`)
            .setColor('#FF3B30')
            .addFields(
                { name: 'Subject User Element', value: `${subject.tag || subject.user?.tag || subject.id || 'N/A'} (\`${subject.id}\`)`, inline: true },
                { name: 'Authorizing Official', value: `${actor.tag}`, inline: true },
                { name: 'System Justification Entry', value: messageSummary || 'No technical notes logged' }
            )
            .setTimestamp();
        if (serverIcon) analyticalEmbed.setThumbnail(serverIcon);

        auditRoute.send({ embeds: [analyticalEmbed] });
    };

    try {
        if (cmd === 'status') {
            const performanceEmbed = new EmbedBuilder()
                .setTitle('📊 Architectural Diagnostics System')
                .setColor('#FF3B30')
                .addFields(
                    { name: 'Network Pipeline Latency', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
                    { name: 'Memory Array Index Load', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
                    { name: 'Node Engine Envir.', value: `\`Node ${process.version}\``, inline: true }
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
                .setColor('#FF3B30')
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
                .setDescription('Need direct communication pathways with infrastructure administration?\n\nSelect the structural operational category from the menu interface framework below to configure your channel line.')
                .setColor('#FF3B30')
                .setFooter({ text: 'Claudie Communications Controller' });
            if (serverIcon) displayHubPanel.setThumbnail(serverIcon);

            const categorySelectorDropdown = new StringSelectMenuBuilder()
                .setCustomId('ticket_category_select')
                .setPlaceholder('Establish communication parameter selection...')
                .addOptions(
                    new StringSelectMenuOptionBuilder().setLabel('General Support').setValue('general').setDescription('Standard infrastructure inquiries').setEmoji('🎫'),
                    new StringSelectMenuOptionBuilder().setLabel('Technical Assistance').setValue('tech').setDescription('Bug tracking and infrastructure errors').setEmoji('⚙️'),
                    new StringSelectMenuOptionBuilder().setLabel('Report Violation').setValue('report').setDescription('Report user system parameter bypasses').setEmoji('🔏'),
                    new StringSelectMenuOptionBuilder().setLabel('Management & Billing').setValue('billing').setDescription('Inquiries for executives').setEmoji('💼')
                );

            const selectionComponentRow = new ActionRowBuilder().addComponents(categorySelectorDropdown);

            await interaction.reply({ content: '✅ Advanced Category Dropdown System deployed securely.', ephemeral: true });
            return interaction.channel.send({ embeds: [displayHubPanel], components: [selectionComponentRow] });
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
                .setColor('#FF3B30')
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
                .setColor('#FF3B30')
                .addFields(
                    { name: 'System Identification Value', value: `\`${targetUser.id}\``, inline: true },
                    { name: 'Platform Creation Timeline', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Guild Matrix Join Timestamp', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`, inline: true }
                );
            return interaction.reply({ embeds: [technicalUserEmbed] });
        }

        if (cmd === 'dmall') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '⛔ System Access Core Violation. Administrative validation matrix required.', ephemeral: true });
            }

            const broadcastMessage = interaction.options.getString('message');
            await interaction.deferReply({ flags: [ 'Ephemeral' ] });

            const members = await interaction.guild.members.fetch();
            let successCount = 0;
            let failureCount = 0;

            for (const [id, member] of members) {
                if (member.user.bot) continue;

                try {
                    await member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`📢 Broadcast from ${interaction.guild.name}`)
                                .setDescription(broadcastMessage)
                                .setColor('#FF3B30')
                                .setTimestamp()
                        ]
                    });
                    successCount++;
                } catch (err) {
                    failureCount++;
                }
            }

            pushCentralAuditLog(interaction.guild, 'DM_ALL', { id: 'GUILD_ALL', tag: 'All Guild Members' }, interaction.user, broadcastMessage);

            return interaction.editReply({
                content: `✅ **Broadcast Protocol Terminated.**\n📊 **Metrics:** successfully pushed to \`${successCount}\` identities. Errored/Blocked streams: \`${failureCount}\`.`
            });
        }

        if (cmd === 'dmto') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '⛔ Enforcement operational permissions validation rejected.', ephemeral: true });
            }

            const targetUser = interaction.options.getUser('target');
            const targetMessagePayload = interaction.options.getString('message');

            await interaction.deferReply({ flags: [ 'Ephemeral' ] });

            try {
                await targetUser.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`✉️ Administrator Message ${interaction.guild.name}`)
                            .setDescription(targetMessagePayload)
                            .setColor('#FF3B30')
                            .setFooter({ text: `Authorized by Official: ${interaction.user.tag}` })
                            .setTimestamp()
                    ]
                });

                pushCentralAuditLog(interaction.guild, 'DM_SINGLE', targetUser, interaction.user, targetMessagePayload);
                return interaction.editReply({ content: `✅ Communication payload successfully dispatched to account vector: **${targetUser.tag}**.` });
            } catch (err) {
                return interaction.editReply({ content: `⛔ Transmission delivery failed. Target account node **${targetUser.tag}** has direct routing pipeline closed (DMs locked).` });
            }
        }

        if (cmd === 'announcement') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: '⛔ Operational permissions validation rejected.', ephemeral: true });
            }

            const announcePayload = interaction.options.getString('message');
            const mentionType = interaction.options.getString('mention');

            await interaction.deferReply({ flags: [ 'Ephemeral' ] });

            const announcementEmbed = new EmbedBuilder()
                .setTitle('📢 STRUCTURAL INFRASTRUCTURE ANNOUNCEMENT')
                .setDescription(announcePayload)
                .setColor('#FF3B30')
                .setTimestamp()
                .setFooter({ text: `Published by authorized actor: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            if (serverIcon) announcementEmbed.setThumbnail(serverIcon);

            let contentPing = '';
            if (mentionType === 'everyone') contentPing = '@everyone';
            if (mentionType === 'here') contentPing = '@here';

            await interaction.channel.send({
                content: contentPing ? contentPing : null,
                embeds: [announcementEmbed]
            });

            return interaction.editReply({ content: '✅ Announcement broadcast matrix deployed into current stream location.' });
        }

    } catch (err) {
        console.error("Critical matrix execution fault caught:", err);
        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({ content: '❌ System internal process engine error encountered.', ephemeral: true }).catch(() => null);
        } else {
            return interaction.reply({ content: '❌ System internal process engine error encountered.', ephemeral: true }).catch(() => null);
        }
    }
});

// \\ start execution loop
deployMatrixCommands().then(() => client.login(TOKEN));
