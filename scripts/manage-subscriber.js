import dotenv from 'dotenv';
import path from 'path';
import minimist from 'minimist';
import axios from 'axios';

// Parse command-line arguments
const args = minimist(process.argv.slice(2));

// Determine .env path: use --env if provided, otherwise default to .env in current directory
const envPath = args.env ? path.resolve(args.env) : path.resolve('.env');
dotenv.config({ path: envPath });

const { LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS } = process.env;

if (!LISTMONK_API_URL || !LISTMONK_API_USER || !LISTMONK_API_PASS) {
    console.error('Error: Missing required environment variables (LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS).');
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

const getSubscriberByEmail = async (email) => {
    try {
        const response = await api.get(`/api/subscribers?query=subscribers.email='${email}'`);
        if (response.data.data.results.length === 0) {
            console.error(`Subscriber with email ${email} not found.`);
            return null;
        }
        return response.data.data.results[0];
    } catch (error) {
        console.error(`Error fetching subscriber by email ${email}:`, error.response ? error.response.data : error.message);
        return null;
    }
};

const updateSubscriber = async (subscriber) => {
    try {
        const response = await api.put(`/api/subscribers/${subscriber.id}`, subscriber);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating subscriber ${subscriber.id}:`, error.response ? error.response.data : error.message);
        return null;
    }
};

const main = async () => {
    if (args['get-subscriber']) {
        const email = args.email;
        if (!email) {
            console.error('Error: --email is required for --get-subscriber.');
            return;
        }
        const subscriber = await getSubscriberByEmail(email);
        if (subscriber) {
            console.log(JSON.stringify(subscriber, null, 2));
        }
    } else if (args['set-last-hl']) {
        const email = args.email;
        const hl = args.hl;
        if (!email || !hl) {
            console.error('Error: --email and --hl are required for --set-last-hl.');
            return;
        }

        const subscriber = await getSubscriberByEmail(email);
        if (subscriber) {
            // Safe attribute update
            subscriber.attribs = subscriber.attribs || {};
            subscriber.attribs.last_sent_hl = parseInt(hl, 10);

            const updatedSubscriber = await updateSubscriber(subscriber);
            if (updatedSubscriber) {
                console.log('Successfully updated subscriber:');
                console.log(JSON.stringify(updatedSubscriber, null, 2));
            }
        }
    } else {
        console.log('Usage:');
        console.log('  node manage-subscriber.js --get-subscriber --email <email>');
        console.log('  node manage-subscriber.js --set-last-hl --email <email> --hl <number>');
    }
};

main();