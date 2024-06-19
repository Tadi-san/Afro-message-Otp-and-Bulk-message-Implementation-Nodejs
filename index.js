const express = require('express');
const axios = require('axios');
const schedule = require('node-schedule');
const app = express();
const port = 3000;
const prisma = new PrismaClient();
app.use(express.json());

const baseURL = 'https://api.afromessage.com/api/send-bulk';
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoibVlFUEVHVDF2Q1h5bWtqVDFOem94RWoyaHdmZnlzUnEiLCJleHAiOjE4NzMzMjAyNzUsImlhdCI6MTcxNTU1Mzg3NSwianRpIjoiOTliMDBiYWItZmMyNi00YWE0LWE4MmItZWJkY2Y0MDJjOWQ5In0.tvoKRu1NJoPqH7PR_Udvj0v37A1Kdq0J6VKeyDSNbEw';

app.post('/send-bulk', (req, res) => {
  const { phoneNumbers, message, from, sender, campaign, createCallback, statusCallback } = req.body;

  const payload = {
    to: phoneNumbers,
    message,
    from,
    sender,
    campaign,
    createCallback,
    statusCallback
  };

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  axios.post(baseURL, payload,  headers )
    .then(response => {
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.acknowledge === 'success') {
          res.json({ message: 'API success' });
        } else {
          res.json({ message: 'API error' });
        }
      } else {
        res.status(response.status).json({ message: `HTTP error... code: ${response.status}` });
      }
    })
    .catch(error => {
      res.status(500).json({ message: error });
    });
});

async function sendScheduledMessages() {
  try {
    // Find all messages with a scheduled time in the past and a null 'sendStatus' field
    const messages = await prisma.message.findMany({
      where: {
        schedule: {
          lt: new Date(),
        },
        sendStatus: null,
      },
    });

    for (const message of messages) {
      const payload = {
        phoneNumbers: message.to,
        message: message.message,
        from: message.from,
        sender: message.sender,
        campaign: message.campaign,
        createCallback: message.createCallback,
        statusCallback: message.statusCallback,
      };

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      try {
        const response = await axios.post(baseURL, payload, { headers });

        if (response.status === 200) {
          const responseData = response.data;
          if (responseData.acknowledge === 'success') {
            // Update the message record with the 'sendStatus' field
            await prisma.message.update({
              where: {
                id: message.id,
              },
              data: {
                sendStatus: 'sent',
              },
            });
            console.log(`Message with ID ${message.id} sent successfully.`);
          } else {
            console.error(`Failed to send message with ID ${message.id}: ${responseData.message}`);
          }
        } else {
          console.error(`HTTP error ${response.status} while sending message with ID ${message.id}`);
        }
      } catch (error) {
        console.error(`Error sending message with ID ${message.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
  }
}

// Call the sendScheduledMessages function periodically (e.g., every minute)
setInterval(sendScheduledMessages, 60000);

app.post('/scheduled-bulk', async (req, res) => {
  const { scheduledTime, phoneNumbers, message, from, sender, campaign, createCallback, statusCallback } = req.body;

  try {
    // Create a new message record
    const scheduledMessage = await prisma.message.create({
      data: {
        to: phoneNumbers,
        message,
        from,
        sender,
        campaign,
        createCallback,
        statusCallback,
        schedule: scheduledTime,
      },
    });

    res.status(201).json(scheduledMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create scheduled message' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});