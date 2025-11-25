#!/usr/bin/env node

/**
 * @file preview-subscribers.js
 * @description Preview script to check which subscribers will be targeted by the Daily Heavenletter mailing system
 *
 * This script connects to Listmonk API to:
 * - Check existence of test subscribers
 * - Display their current subscription status and last_sent_hl tracking
 * - Show whether they're subscribed to the Daily Heavenletter list
 * - Preview what the main sending script will do based on environment variables
 *
 * @requires axios - HTTP client for API calls
 * @requires dotenv - Environment variable management
 *
 * @environment LISTMONK_API_URL - Base URL for Listmonk API
 * @environment LISTMONK_API_USER - API username for authentication
 * @environment LISTMONK_API_PASS - API password for authentication
 * @environment TEST_EMAIL_FILTER - Set to 'true' to limit to test emails only
 * @environment TEST_EMAILS - Comma-separated list of test email addresses
 *
 * @usage
 * # Basic usage - shows all Daily Heavenletter subscribers behavior
 * node preview-subscribers.js
 *
 * # Set environment variables first
 * export LISTMONK_API_URL="https://mailer.heavenletters.org"
 * export LISTMONK_API_USER="bounce"
 * export LISTMONK_API_PASS="your_api_password"
 * export TEST_EMAIL_FILTER="true"
 * export TEST_EMAILS="test1@example.com,test2@example.com"
 * node preview-subscribers.js
 *
 * @example
 * # Complete workflow example:
 * # 1. Set up environment variables
 * export LISTMONK_API_URL="https://mailer.heavenletters.org"
 * export LISTMONK_API_USER="bounce"
 * export LISTMONK_API_PASS="fXoO3F6Vn2CrkZndwThZjA6xz3XWiJLn"
 *
 * # 2. Run preview to see what would happen
 * node preview-subscribers.js
 *
 * # 3. Check output to understand targeting behavior
 * # 4. Proceed with actual sending if satisfied with preview
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Main function to preview subscriber targeting
 * Checks test subscribers and shows script behavior based on environment variables
 */
async function previewSubscribers() {
    // Create authenticated axios instance for Listmonk API
    const api = axios.create({
        baseURL: process.env.LISTMONK_API_URL,
        auth: {
            username: process.env.LISTMONK_API_USER,
            password: process.env.LISTMONK_API_PASS,
        },
    });

    try {
        console.log('🔍 Checking which test subscribers exist in Listmonk...\n');

        // Define test email addresses to check
        // These are used for development/testing purposes
        const testEmails = [
            'mojahkhanyi@hotmail.com',
            'mojahkhanyi@gmail.com',
            'mojahkhanyi@yahoo.com'
        ];

        // Iterate through each test email to check status
        for (const email of testEmails) {
            try {
                // Query Listmonk API for specific subscriber
                const response = await api.get(`/api/subscribers?query=subscribers.email='${email}'`);
                const subscriber = response.data.data.results[0];

                if (subscriber) {
                    // Extract Heavenletter tracking data
                    const lastSentHl = subscriber.attribs?.last_sent_hl || 0;
                    const nextHl = lastSentHl + 1;

                    console.log(`✅ ${email}`);
                    console.log(`   ID: ${subscriber.id} | Name: ${subscriber.name}`);
                    console.log(`   Last HL: ${lastSentHl} | Next HL: ${nextHl}`);
                    console.log(`   Status: ${subscriber.status}`);

                    // Check Daily Heavenletter list subscription (list ID 7)
                    const dailyHeavenletterList = subscriber.lists.find(list => list.id === 7);
                    if (dailyHeavenletterList) {
                        console.log(`   ✅ Subscribed to Daily Heavenletter list`);
                    } else {
                        console.log(`   ❌ NOT subscribed to Daily Heavenletter list`);
                    }
                    console.log('');
                } else {
                    console.log(`❌ ${email} - Not found in Listmonk\n`);
                }
            } catch (error) {
                console.log(`❌ ${email} - Error: ${error.response ? error.response.data : error.message}\n`);
            }
        }

        // Display script behavior based on environment configuration
        console.log('\n📊 Script Behavior:');
        console.log('====================');

        // Check if test mode is enabled
        const testEmailFilter = process.env.TEST_EMAIL_FILTER === 'true';
        console.log(`TEST_EMAIL_FILTER: ${testEmailFilter}`);

        if (testEmailFilter) {
            console.log(`TEST_EMAILS: ${process.env.TEST_EMAILS}`);
            console.log('🔒 Script will ONLY send to these test emails');
        } else {
            console.log('🌍 Script will send to ALL Daily Heavenletter subscribers');
        }

        console.log('\n💡 Tips:');
        console.log('- Use TEST_EMAIL_FILTER=true for testing with limited emails');
        console.log('- Set TEST_EMAILS to specific addresses for controlled testing');
        console.log('- Run this script before send-daily-heavenletters.js to verify targeting');

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Verify LISTMONK_API_URL is correct and accessible');
        console.log('- Check LISTMONK_API_USER and LISTMONK_API_PASS credentials');
        console.log('- Ensure you have network connectivity to the Listmonk instance');
    }
}

// Execute the preview function when script is run directly
previewSubscribers();