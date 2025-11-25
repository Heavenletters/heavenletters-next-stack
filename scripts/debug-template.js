/**
 * Debug script to check template status and API connectivity
 */
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment
dotenv.config();

const { LISTMONK_API_URL, LISTMONK_API_USER, LISTMONK_API_PASS, HEAVENLETTER_TEMPLATE_ID } = process.env;

if (!LISTMONK_API_URL || !LISTMONK_API_USER || !LISTMONK_API_PASS) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const api = axios.create({
    baseURL: LISTMONK_API_URL,
    auth: {
        username: LISTMONK_API_USER,
        password: LISTMONK_API_PASS,
    },
});

async function debugTemplate() {
    console.log('=== DEBUGGING LISTMONK TEMPLATE ===');
    console.log('API URL:', LISTMONK_API_URL);
    console.log('Template ID:', HEAVENLETTER_TEMPLATE_ID);

    try {
        // Check if template exists
        console.log('\n1. Checking template existence...');
        const templateResponse = await api.get(`/api/templates/${HEAVENLETTER_TEMPLATE_ID}`);
        const template = templateResponse.data.data;
        console.log('Template found:');
        console.log('- Name:', template.name);
        console.log('- Type:', template.type);
        console.log('- ID:', template.id);

        // Check if it's a transactional template
        if (template.type !== 'transactional') {
            console.log(`⚠️  WARNING: Template type is "${template.type}", not "transactional"`);
        } else {
            console.log('✅ Template is correctly configured as transactional');
        }

        // Test a simple transactional email
        console.log('\n2. Testing transactional email with simple data...');
        const testPayload = {
            subscriber_emails: ['mojahkhanyi@hotmail.com'],
            from_email: 'noreply@heavenletters.org',
            from_name: 'Heavenletters',
            subject: 'Test Transactional Email',
            template_id: parseInt(HEAVENLETTER_TEMPLATE_ID, 10),
            data: {
                title: 'Test Title',
                publishedOn: '2025-11-14',
                body: 'Test body content',
                publishNumber: '1'
            },
        };

        console.log('Sending test payload:', JSON.stringify(testPayload, null, 2));
        const txResponse = await api.post('/api/tx', testPayload);
        console.log('✅ Transactional email sent successfully!');
        console.log('Response:', JSON.stringify(txResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            console.log('\n🔧 SOLUTION: Template does not exist.');
            console.log('Please create a new transactional template in ListMonk web interface:');
            console.log('1. Go to:', LISTMONK_API_URL);
            console.log('2. Create new template with type "transactional"');
            console.log('3. Use the HTML from: daily_heavenletter_transactional_template.html');
            console.log('4. Update HEAVENLETTER_TEMPLATE_ID in .env to new template ID');
        }
    }
}

debugTemplate();