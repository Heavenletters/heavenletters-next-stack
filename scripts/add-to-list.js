#!/usr/bin/env node

/**
 * @file add-to-list.js
 * @description Utility script to add subscribers to the Daily Heavenletter mailing list in Listmonk
 *
 * This script connects to Listmonk API to:
 * - Find existing subscribers by email address
 * - Check if they're already subscribed to the Daily Heavenletter list
 * - Add them to the Daily Heavenletter list (ID: 7) if not already subscribed
 * - Update their subscription status appropriately
 *
 * @requires axios - HTTP client for API calls
 * @requires dotenv - Environment variable management
 *
 * @environment LISTMONK_API_URL - Base URL for Listmonk API
 * @environment LISTMONK_API_USER - API username for authentication
 * @environment LISTMONK_API_PASS - API password for authentication
 *
 * @usage
 * # Basic usage - adds mojahkhanyi@gmail.com to Daily Heavenletter list
 * node add-to-list.js
 *
 * # Set environment variables first (recommended)
 * export LISTMONK_API_URL="https://mailer.heavenletters.org"
 * export LISTMONK_API_USER="bounce"
 * export LISTMONK_API_PASS="your_api_password"
 * node add-to-list.js
 *
 * # For different email addresses, modify the 'email' variable in the script
 * # Or extend the script to accept command-line arguments for flexibility
 *
 * @example
 * # Complete workflow example:
 * # 1. Set up environment variables
 * export LISTMONK_API_URL="https://mailer.heavenletters.org"
 * export LISTMONK_API_USER="bounce"
 * export LISTMONK_API_PASS="fXoO3F6Vn2CrkZndwThZjA6xz3XWiJLn"
 *
 * # 2. Run the script to add subscriber
 * node add-to-list.js
 *
 * # 3. Verify the subscriber was added correctly
 * # 4. Use preview-subscribers.js to confirm the addition
 *
 * @notes
 * - The script currently targets mojahkhanyi@gmail.com (hardcoded)
 * - Daily Heavenletter list has ID 7 and UUID dfadb91d-8ecf-4859-9245-891eeffbf805
 * - Subscriptions are created with 'unconfirmed' status
 * - The script handles both new subscriptions and existing subscribers
 * - No duplicate subscriptions are created if subscriber is already in the list
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Add subscriber to the Daily Heavenletter mailing list
 *
 * This function:
 * 1. Creates an authenticated API connection to Listmonk
 * 2. Finds the specified subscriber by email address
 * 3. Checks if they're already subscribed to the Daily Heavenletter list
 * 4. Adds them to the list if not already subscribed
 * 5. Provides detailed feedback about the operation
 */
async function addToDailyHeavenletterList() {
    // Create authenticated axios instance for Listmonk API
    const api = axios.create({
        baseURL: process.env.LISTMONK_API_URL,
        auth: {
            username: process.env.LISTMONK_API_USER,
            password: process.env.LISTMONK_API_PASS,
        },
    });

    try {
        // Configuration for the subscriber and target list
        const email = 'mojahkhanyi@gmail.com'; // TODO: Make this configurable via command-line args
        const listId = 7; // Daily Heavenletter list ID (hardcoded for this specific use case)

        console.log(`🔄 Adding ${email} to Daily Heavenletter list (ID: ${listId})...`);

        // Step 1: Find the existing subscriber by email address
        const getResponse = await api.get(`/api/subscribers?query=subscribers.email='${email}'`);
        const subscriber = getResponse.data.data.results[0];

        // Handle case where subscriber doesn't exist
        if (!subscriber) {
            console.log(`❌ Subscriber ${email} not found`);
            console.log('💡 The subscriber must exist in Listmonk before adding them to lists');
            return;
        }

        console.log(`✅ Found subscriber: ${subscriber.name} (ID: ${subscriber.id})`);

        // Step 2: Check if already subscribed to Daily Heavenletter list
        const alreadySubscribed = subscriber.lists.some(list => list.id === listId);
        if (alreadySubscribed) {
            console.log(`✅ Already subscribed to Daily Heavenletter list`);
            console.log(`📋 Current lists: ${subscriber.lists.map(l => `${l.name} (${l.id})`).join(', ')}`);
            return;
        }

        // Step 3: Prepare updated list membership
        // Add Daily Heavenletter list to subscriber's existing lists
        const updatedLists = [
            ...subscriber.lists, // Preserve existing list memberships
            {
                // Subscription metadata for the new list membership
                subscription_status: 'unconfirmed', // Standard status for new subscriptions
                subscription_created_at: new Date().toISOString(),
                subscription_updated_at: new Date().toISOString(),
                subscription_meta: {}, // Empty metadata object

                // Daily Heavenletter list details (ID 7)
                id: listId,
                uuid: 'dfadb91d-8ecf-4859-9245-891eeffbf805', // Listmonk list UUID
                name: 'Daily Heavenletter',
                type: 'private',
                optin: 'single',
                tags: null,
                description: '',
                created_at: '2025-11-13T18:34:54.094147Z',
                updated_at: '2025-11-13T18:34:54.094147Z'
            }
        ];

        // Step 4: Update subscriber with new list membership
        subscriber.lists = updatedLists;

        // Send update request to Listmonk API
        const updateResponse = await api.put(`/api/subscribers/${subscriber.id}`, subscriber);

        // Step 5: Confirm successful operation
        console.log(`✅ Successfully added ${email} to Daily Heavenletter list!`);
        console.log(`📧 Updated subscriber: ${updateResponse.data.data.name}`);
        console.log(`📋 Lists: ${updateResponse.data.data.lists.map(l => `${l.name} (${l.id})`).join(', ')}`);

        console.log(`\n💡 Next steps:`);
        console.log(`- The subscriber will receive unconfirmed subscription emails`);
        console.log(`- Use preview-subscribers.js to verify the addition`);
        console.log(`- Consider sending a welcome/confirmatory email manually if needed`);

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Verify LISTMONK_API_URL is correct and accessible');
        console.log('- Check LISTMONK_API_USER and LISTMONK_API_PASS credentials');
        console.log('- Ensure the subscriber email exists in Listmonk');
        console.log('- Verify Daily Heavenletter list ID 7 exists in your Listmonk instance');

        // Common error scenarios
        if (error.response?.status === 404) {
            console.log('💡 Tip: Subscriber not found - they may need to be created first in Listmonk');
        } else if (error.response?.status === 401) {
            console.log('💡 Tip: Authentication failed - check your API credentials');
        }
    }
}

// Execute the function when script is run directly
addToDailyHeavenletterList();