// Script to send a test WhatsApp message with interactive reply buttons
// Usage: node server/console/scripts/send-whatsapp-test.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const sendWhatsAppMessage = async () => {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const RECIPIENT_NUMBER = process.env.WHATSAPP_TEST_RECIPIENT; // Your phone number in international format (e.g., 5491234567890)

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || !RECIPIENT_NUMBER) {
    console.error('❌ Missing required environment variables:');
    console.error('   WHATSAPP_ACCESS_TOKEN:', WHATSAPP_TOKEN ? '✓' : '✗');
    console.error('   WHATSAPP_PHONE_NUMBER_ID:', PHONE_NUMBER_ID ? '✓' : '✗');
    console.error('   WHATSAPP_TEST_RECIPIENT:', RECIPIENT_NUMBER ? '✓' : '✗');
    process.exit(1);
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: RECIPIENT_NUMBER,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: '🔧 *InstalaPro - Mensaje de Prueba*\n\n¡Hola! Este es un mensaje de prueba con botones interactivos.'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'button_1',
              title: 'Confirmar ✓'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'button_2',
              title: 'Cancelar ✗'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'button_3',
              title: 'Más info ℹ'
            }
          }
        ]
      }
    }
  };

  try {
    console.log('📤 Sending WhatsApp message...');
    console.log('   To:', RECIPIENT_NUMBER);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Message sent successfully!');
      console.log('   Message ID:', data.messages[0].id);
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Failed to send message');
      console.error('   Status:', response.status);
      console.error('   Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }

  process.exit(0);
};

sendWhatsAppMessage();
