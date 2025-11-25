/**
 * Heavenletter Daily Sending Script - Transactional Version
 *
 * This script sends daily Heavenletter emails to subscribers individually using the Transactional API.
 * Each subscriber receives the next Heavenletter in the sequence based on their 'last_sent_hl' subscriber attribute.
 *
 * This version uses the Transactional API to support dynamic subject lines and immediate delivery
 *
 * FEATURES:
 * - Supports dry-run mode for testing without sending actual emails
 * - Tracks subscriber progress via 'last_sent_hl' attribute
 * - Automatically advances each subscriber to the next Heavenletter
 * - Detailed logging and error handling
 * - Support for custom environment configuration
 * - Uses Transactional API for templates that require dynamic subject lines
 *
 * REQUIREMENTS:
 * - Node.js with ES module support
 * - ListMonk API credentials (LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS)
 * - Transactional Template ID (HEAVENLETTER_TEMPLATE_ID)
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
 *   node send-daily-heavenletters-transactional.js                    # Send emails normally
 *   node send-daily-heavenletters-transactional.js --dry-run          # Preview what would be sent
 *   node send-daily-heavenletters-transactional.js --dry-run=false    # Explicitly send emails
 *   node send-daily-heavenletters-transactional.js --email=test@example.com  # Test specific subscriber
 *   node send-daily-heavenletters-transactional.js --email=test@example.com --dry-run  # Test specific subscriber
 *   node send-daily-heavenletters-transactional.js --env=.env.production  # Use custom env file
 *   node send-daily-heavenletters-transactional.js --help             # Show help information
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
 * VERSION: 3.0.0 - Transactional API Support
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
Heavenletter Daily Sending Script (Transactional Version)

Usage:
  node send-daily-heavenletters-transactional.js [options]

Options:
  --email=<address>       Test with specific email address only
  --dry-run[=<value>]     Run in dry-run mode (default: false)
                          Use --dry-run or --dry-run=true to enable
                          Use --dry-run=false to disable
  --env=<path>            Path to .env file (default: .env)
  --help, -h              Show this help message

Examples:
  node send-daily-heavenletters-transactional.js                    # Send emails normally
  node send-daily-heavenletters-transactional.js --dry-run          # Preview what would be sent
  node send-daily-heavenletters-transactional.js --dry-run=false    # Explicitly send emails
  node send-daily-heavenletters-transactional.js --email=test@example.com  # Test specific subscriber
  node send-daily-heavenletters-transactional.js --env=.env.production  # Use production env
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

// Send transactional email for a specific Heavenletter to a specific subscriber
const sendTransactionalEmail = async (hlNumber, hlData, subscriber) => {
    const templateId = parseInt(HEAVENLETTER_TEMPLATE_ID, 10);

    // Generate dynamic subject line
    const subject = `Daily Heavenletter #${hlNumber}: ${hlData.title}`;

    // Prepare the final, correct payload
    const payload = {
        subscriber_email: subscriber.email,
        from_email: 'noreply@heavenletters.org',
        from_name: 'Heaven Post',
        subject: subject,
        template_id: templateId,
        data: {
            title: hlData.title,
            publishedOn: new Date(hlData.publishedOn).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
            body: hlData.content.replace(/\r\n/g, '<br>'),
            permalink: hlData.permalink,
            publishNumber: hlData.publishNumber,
        },
        content_type: 'markdown'
    };

    try {
        console.log(`Sending transactional email for Heavenletter #${hlNumber} to ${subscriber.email}...`);
        await api.post('/api/tx', payload);

        return {
            email: subscriber.email,
            status: 'sent',
            subject: subject,
        };
    } catch (error) {
        console.error(`Error sending Heavenletter #${hlNumber} to ${subscriber.email}:`, error.response ? error.response.data : error.message);
        return {
            email: subscriber.email,
            status: 'failed',
            error: error.response ? error.response.data : error.message
        };
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

        // Transform the lists array into an array of IDs for the PUT request
        if (fullSubscriber.lists && Array.isArray(fullSubscriber.lists)) {
            fullSubscriber.lists = fullSubscriber.lists.map(list => list.id);
        }

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
    console.log(`${modeText}${targetingText}Starting daily Heavenletter sending script (Transactional Version)...`);

    let successCount = 0;
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

        // Process each subscriber individually
        for (const subscriber of subscribers) {
            const lastSentHl = subscriber.attribs?.last_sent_hl || 0;
            const nextHl = lastSentHl + 1;

            // Convert to zero-based array index
            const hlIndex = parseInt(nextHl) - 1;
            const hlData = heavenletters[hlIndex];

            if (!hlData) {
                console.log(`Warning: Heavenletter #${nextHl} not found in JSON file. Skipping subscriber ${subscriber.email}.`);
                skippedCount++;
                continue;
            }

            if (isDryRun) {
                console.log(`[DRY RUN] Would send transactional email to ${subscriber.email}:`);
                console.log(`[DRY RUN]   - Subject: "Daily Heavenletter #${nextHl}: ${hlData.title}"`);
                console.log(`[DRY RUN]   - Template ID: ${HEAVENLETTER_TEMPLATE_ID}`);
                console.log(`[DRY RUN]   - Data: ${JSON.stringify({
                    title: hlData.title,
                    publishedOn: hlData.publishedOn,
                    body: hlData.content.substring(0, 100) + '...',
                    publishNumber: hlData.publishNumber
                })}`);
                console.log(`[DRY RUN] Would update ${subscriber.email} last_sent_hl attribute to ${nextHl}`);
                successCount++;
            } else {
                console.log(`Processing ${subscriber.email} (currently at HL #${lastSentHl})...`);

                // Send the transactional email
                const sendResult = await sendTransactionalEmail(nextHl, hlData, subscriber);

                if (sendResult.status === 'sent') {
                    console.log(`Successfully sent email to ${sendResult.email} with subject: "${sendResult.subject}"`);

                    // Update subscriber progress immediately
                    const updateResult = await updateSubscriberProgress(subscriber, parseInt(nextHl, 10));
                    if (updateResult) {
                        successCount++;
                        console.log(`Updated progress for ${subscriber.email} to HL #${nextHl}`);
                    } else {
                        console.error(`Failed to update progress for ${subscriber.email} (email was sent)`);
                        errorCount++;
                    }
                } else {
                    errorCount++;
                    console.error(`Failed to send email to ${subscriber.email}:`, sendResult.error);
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
            console.log(`Summary: Would process ${successCount} email${successCount !== 1 ? 's' : ''} for ${targetEmail}, ${skippedCount} skipped due to missing HL data, ${errorCount} errors would have occurred.`);
            console.log('Use --dry-run=false to actually send transactional emails and update subscriber attributes.');
        } else {
            console.log(`Summary: ${successCount} email${successCount !== 1 ? 's' : ''} successfully sent via transactional API to ${targetEmail}, ${errorCount} errors encountered.`);
            console.log('Emails sent immediately without scheduling.');
        }
    } else {
        if (isDryRun) {
            console.log(`Summary: Would send ${successCount} transactional email${successCount !== 1 ? 's' : ''}, ${skippedCount} subscribers skipped due to missing HL data, ${errorCount} errors would have occurred.`);
            console.log('Use --dry-run=false to actually send transactional emails and update subscriber attributes.');
        } else {
            console.log(`Summary: ${successCount} emails successfully sent via transactional API, ${errorCount} errors encountered.`);
            console.log('All emails sent immediately without campaign scheduling.');
        }
    }
};

main();