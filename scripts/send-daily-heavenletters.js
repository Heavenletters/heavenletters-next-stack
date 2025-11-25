/**
 * Heavenletter Daily Sending Script - Campaign Version
 *
 * This script sends daily Heavenletter emails to subscribers in a sequential manner.
 * Each subscriber receives the next Heavenletter in the sequence based on their
 * 'last_sent_hl' subscriber attribute.
 *
 * This version uses the Campaign API to support dynamic subject lines with template ID=6
 *
 * FEATURES:
 * - Supports dry-run mode for testing without sending actual emails
 * - Tracks subscriber progress via 'last_sent_hl' attribute
 * - Automatically advances each subscriber to the next Heavenletter
 * - Detailed logging and error handling
 * - Support for custom environment configuration
 * - Uses Campaign API for templates that require dynamic subject lines
 *
 * REQUIREMENTS:
 * - Node.js with ES module support
 * - ListMonk API credentials (LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS)
 * - Heavenletter Template ID (HEAVENLETTER_TEMPLATE_ID)
 * - JSON file containing Heavenletter data (./batch-1-1-100.json)
 *
 * DATA SOURCE:
 * - Reads Heavenletters from: ./batch-1-1-100.json
 * - Format: { "1": {title, publishedOn, body}, "2": {...}, ... }
 *
 * SUBSCRIBER ATTRIBUTES:
 * - Uses 'last_sent_hl' attribute to track progress
 * - Updates 'last_sent_hl' after successful email delivery
 *
 * USAGE:
 *   node send-daily-heavenletters.js                    # Send emails normally
 *   node send-daily-heavenletters.js --dry-run          # Preview what would be sent
 *   node send-daily-heavenletters.js --dry-run=false    # Explicitly send emails
 *   node send-daily-heavenletters.js --email=test@example.com  # Test specific subscriber
 *   node send-daily-heavenletters.js --email=test@example.com --dry-run  # Test specific subscriber
 *   node send-daily-heavenletters.js --env=.env.production  # Use custom env file
 *   node send-daily-heavenletters.js --help             # Show help information
 *
 * ENVIRONMENT VARIABLES:
 *   LISTMONK_API_URL        - ListMonk API base URL
 *   LISTMONK_API_USER       - ListMonk API username
 *   LISTMONK_API_PASS       - ListMonK API password
 * HEAVENLETTER_TEMPLATE_ID - Template ID for email sending
 *
 * COMMAND LINE OPTIONS:
 *   --email=<address>       Test with specific email address only
 *   --dry-run[=<value>]     Enable dry-run mode (default: false)
 *                          true/empty = preview mode, false = actual sending
 *   --env=<path>            Path to .env file (default: .env)
 *   --help, -h              Show help message
 *
 * SAFETY:
 * - Dry-run mode: No emails sent, no attributes updated
 * - Production use: Requires proper environment configuration
 * - Error handling: Continues processing other subscribers on individual failures
 *
 * AUTHOR: Heavenletters Development Team
 * VERSION: 2.0.0 - Campaign Support
 * DATE: 2025-11-14
 */
import dotenv from 'dotenv';
import path from 'path';
import minimist from 'minimist';
import axios from 'axios';
import fs from 'fs';

// Parse command-line arguments
const args = minimist(process.argv.slice(2));

// Check for email targeting
const targetEmail = args.email;

// Check for dry-run mode
// Default to true if --dry-run is specified without a value, or if --dry-run is "true"
// Default to false if --dry-run is "false" or not specified
let isDryRun;
if (args['dry-run'] === undefined) {
    isDryRun = false;
} else if (args['dry-run'] === true || args['dry-run'] === 'true' || args['dry-run'] === '') {
    isDryRun = true;
} else if (args['dry-run'] === 'false') {
    isDryRun = false;
} else {
    isDryRun = true; // Default to dry-run for safety
}

// Show usage if help is requested
if (args.help || args.h) {
    console.log(`
Heavenletter Daily Sending Script (Campaign Version)

Usage:
  node send-daily-heavenletters.js [options]

Options:
  --email=<address>       Test with specific email address only
  --dry-run[=<value>]     Run in dry-run mode (default: false)
                          Use --dry-run or --dry-run=true to enable
                          Use --dry-run=false to disable
  --env=<path>            Path to .env file (default: .env)
  --help, -h              Show this help message

Examples:
  node send-daily-heavenletters.js                    # Send emails normally
  node send-daily-heavenletters.js --dry-run          # Preview what would be sent
  node send-daily-heavenletters.js --dry-run=false    # Explicitly send emails
  node send-daily-heavenletters.js --email=test@example.com  # Test specific subscriber
  node send-daily-heavenletters.js --env=.env.production  # Use production env
    `);
    process.exit(0);
}

// Determine .env path: use --env if provided, otherwise default to .env in current directory
const envPath = args.env ? path.resolve(args.env) : path.resolve('.env');
dotenv.config({ path: envPath });

const { LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS, HEAVENLETTER_TEMPLATE_ID } = process.env;

if (!LISTMONK_API_URL || !LISTMONK_API_USER || !LISTMONK_API_PASS || !HEAVENLETTER_TEMPLATE_ID) {
    console.error('Error: Missing required environment variables (LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS, HEAVENLETTER_TEMPLATE_ID).');
    console.error(`Attempted to load from: ${envPath}`);
    process.exit(1);
}

const api = axios.create({
    baseURL: LISTMONK_API_URL,
    auth: {
        username: LISTMONK_API_USER,
        password: LISTMONK_API_PASS,
    },
});

// Load heavenletters.json
let heavenletters;
try {
    const data = fs.readFileSync(path.resolve('./batch-1-1-100.json'), 'utf8');
    heavenletters = JSON.parse(data);
} catch (error) {
    console.error('Error loading batch-1-1-100.json:', error.message);
    process.exit(1);
}

// Create and send campaign for a specific Heavenletter
const createAndSendCampaign = async (hlNumber, hlData, subscribers) => {
    const templateId = parseInt(HEAVENLETTER_TEMPLATE_ID, 10);

    // Schedule campaign to send 2 minutes from now to ensure it's processed
    const sendTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const payload = {
        name: `Daily Heavenletter #${hlNumber} - ${hlData.title}`,
        subject: `Daily Heavenletter #${hlNumber}: ${hlData.title}`,
        type: 'regular',
        template_id: templateId,
        lists: [7], // Daily Heavenletter list ID
        from_email: 'noreply@heavenletters.org',
        from_name: 'Heavenletters',
        send_at: sendTime,
        data: {
            title: hlData.title,
            publishedOn: hlData.publishedOn,
            body: hlData.content,
            permalink: hlData.permalink,
            publishNumber: hlData.publishNumber,
        },
    };

    try {
        console.log(`Creating campaign for Heavenletter #${hlNumber}...`);
        const campaignResponse = await api.post('/api/campaigns', payload);
        const campaign = campaignResponse.data.data;

        console.log(`Campaign created successfully (ID: ${campaign.id}). Scheduled to send at ${sendTime}`);
        console.log(`This will send to ${subscribers.length} subscriber(s).`);

        return {
            campaign_id: campaign.id,
            status: 'scheduled',
            send_time: sendTime,
            recipients: subscribers.length
        };
    } catch (error) {
        console.error(`Error creating Heavenletter #${hlNumber} campaign:`, error.response ? error.response.data : error.message);
        return null;
    }
};

const updateSubscriberProgress = async (subscriber, newLastSentHl) => {
    try {
        // GET full subscriber object
        const getResponse = await api.get(`/api/subscribers/${subscriber.id}`);
        const fullSubscriber = getResponse.data.data;

        // Update last_sent_hl in memory
        if (!fullSubscriber.attribs) {
            fullSubscriber.attribs = {};
        }
        fullSubscriber.attribs.last_sent_hl = newLastSentHl;

        // PUT the full object back
        const putResponse = await api.put(`/api/subscribers/${subscriber.id}`, fullSubscriber);
        return putResponse.data.data;
    } catch (error) {
        console.error(`Error updating subscriber progress for ${subscriber.id}:`, error.response ? error.response.data : error.message);
        return null;
    }
};

const main = async () => {
    const modeText = isDryRun ? 'DRY RUN - ' : '';
    const targetingText = targetEmail ? `[TARGETING: ${targetEmail}] ` : '';
    console.log(`${modeText}${targetingText}Starting daily Heavenletter sending script...`);

    let wouldSendCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    try {
        // Fetch subscribers specifically from the Daily Heavenletter list (list ID = 7)
        const subscribersResponse = await api.get('/api/subscribers?list_id=7');
        const dailyHeavenletterSubscribers = subscribersResponse.data.data.results;

        // Filter to specific email if targeting mode
        let subscribers = dailyHeavenletterSubscribers;
        if (targetEmail) {
            subscribers = dailyHeavenletterSubscribers.filter(subscriber =>
                subscriber.email.toLowerCase() === targetEmail.toLowerCase()
            );
            if (subscribers.length === 0) {
                console.error(`Error: No subscriber found with email: ${targetEmail}`);
                process.exit(1);
            }
            console.log(`Targeting specific subscriber: ${subscribers[0].email}`);
        }

        console.log(`Found ${subscribers.length} subscribers.`);

        // Group subscribers by which Heavenletter they should receive
        const subscribersByHeavenletter = {};

        for (const subscriber of subscribers) {
            const lastSentHl = subscriber.attribs?.last_sent_hl || 0;
            const nextHl = lastSentHl + 1;
            const hlKey = nextHl.toString();

            // Convert to zero-based array index
            const hlIndex = parseInt(hlKey) - 1;
            const hlData = heavenletters[hlIndex];

            if (!hlData) {
                console.log(`Warning: Heavenletter #${nextHl} not found in JSON file. Skipping subscriber ${subscriber.email}.`);
                skippedCount++;
                continue;
            }

            // Group subscribers by the Heavenletter number they should receive
            if (!subscribersByHeavenletter[nextHl]) {
                subscribersByHeavenletter[nextHl] = [];
                subscribersByHeavenletter[nextHl].data = hlData;
            }
            subscribersByHeavenletter[nextHl].push(subscriber);
        }

        console.log(`Will create ${Object.keys(subscribersByHeavenletter).length} campaign(s).`);

        // Process each Heavenletter group
        for (const [hlNumber, group] of Object.entries(subscribersByHeavenletter)) {
            const hlData = group.data;
            const subscribers = group;

            if (isDryRun) {
                console.log(`[DRY RUN] Would create campaign for HL #${hlNumber} with ${subscribers.length} subscriber(s):`);
                for (const subscriber of subscribers) {
                    const lastSentHl = subscriber.attribs?.last_sent_hl || 0;
                    console.log(`[DRY RUN]   - ${subscriber.email} (currently at HL #${lastSentHl})`);
                }
                console.log(`[DRY RUN] HL #${hlNumber} data: "${hlData.title}" (published: ${hlData.publishedOn})`);
                console.log(`[DRY RUN] Would update ${subscribers.length} subscriber(s) last_sent_hl attributes to ${hlNumber}`);
                wouldSendCount += subscribers.length;
            } else {
                console.log(`Creating campaign for HL #${hlNumber} to ${subscribers.length} subscriber(s)...`);

                // Create the campaign
                const sendResult = await createAndSendCampaign(hlNumber, hlData, subscribers);
                if (sendResult) {
                    console.log(`Campaign created successfully for HL #${hlNumber}.`);

                    // Update progress for all subscribers immediately
                    let updatedCount = 0;
                    for (const subscriber of subscribers) {
                        const updateResult = await updateSubscriberProgress(subscriber, parseInt(hlNumber, 10));
                        if (updateResult) {
                            updatedCount++;
                        } else {
                            console.error(`Failed to update progress for ${subscriber.email}`);
                        }
                    }

                    if (updatedCount === subscribers.length) {
                        wouldSendCount += updatedCount;
                        console.log(`Updated progress for ${updatedCount} subscriber(s) for HL #${hlNumber}.`);
                    } else {
                        errorCount += (subscribers.length - updatedCount);
                        console.error(`Partial success: ${updatedCount}/${subscribers.length} subscribers updated for HL #${hlNumber}.`);
                    }
                } else {
                    errorCount += subscribers.length;
                    console.error(`Failed to create campaign for HL #${hlNumber}.`);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching subscribers:', error.response ? error.response.data : error.message);
        errorCount++;
    }

    console.log('Script execution completed.');
    if (targetEmail) {
        if (isDryRun) {
            console.log(`Summary: Would process ${wouldSendCount} email${wouldSendCount !== 1 ? 's' : ''} for ${targetEmail}, ${skippedCount} skipped due to missing HL data, ${errorCount} errors would have occurred.`);
            console.log('Use --dry-run=false to actually send campaigns and update subscriber attributes.');
        } else {
            console.log(`Summary: ${wouldSendCount} email${wouldSendCount !== 1 ? 's' : ''} will be sent via campaign(s) to ${targetEmail}, ${errorCount} errors encountered.`);
            console.log('Campaigns are scheduled to send automatically.');
        }
    } else {
        if (isDryRun) {
            console.log(`Summary: Would create ${Object.keys(subscribersByHeavenletter || {}).length} campaign(s), ${skippedCount} subscribers skipped due to missing HL data, ${errorCount} errors would have occurred.`);
            console.log('Use --dry-run=false to actually send campaigns and update subscriber attributes.');
        } else {
            console.log(`Summary: ${wouldSendCount} emails will be sent via ${Object.keys(subscribersByHeavenletter || {}).length} campaign(s), ${errorCount} errors encountered.`);
            console.log('Campaigns are scheduled to send automatically.');
        }
    }
};

main();