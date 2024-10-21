const axios = require('axios');
require('dotenv').config(); // Load environment variables from a .env file

class MessageService {
  static baseURL = 'https://api.afromessage.com/api/send';
  static bulkURL = 'https://api.afromessage.com/api/send-bulk';

  static token = process.env.AFRO_MESSAGE_KEY;
  static identifierID = process.env.AFRO_MESSAGE_ID;
  static headers = {
    Authorization: `Bearer ${this.token}`,
  };

  static async sendSingleMessage(request) {
    try {
      console.log("sending message");
      const message = `example message` 
      const phoneNumber = request.phone_number;
      const response = await axios.post(
        this.baseURL,
        {
          to: phoneNumber,
          message: message,
          sender: 'Sender Name',
          api_key: this.token,
          from: this.identifierID,
        },
        { headers: this.headers }
      );
      // if (response.data.acknowledge=='error') throw new Error(response.data.errors);
      // console.log(response.data);
      console.log(response.data);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  static async sendBulkMessages(payload) {
    try {
            // this is how your payload should look like
    const  payload = {
        to: phoneNumbers,
        message,
        from,
        sender,
        campaign,
        createCallback,
        statusCallback
      };

      const response = await  axios.post(baseURL, payload,  headers )
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
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* Fixed sendOtp function */
  static async sendOtp(phoneNumber) {
    // Use AfroMessage API to send a security code challenge
    const response = await axios.get(
      'https://api.afromessage.com/api/challenge',
      {
        params: {
          sender: 'Sender Name',
          from: '',
          to: phoneNumber,
          len: 6, // Set code length to 6 digits
          t: 0, // Code type: 0 for numbers only
          ttl: 60 * 5, // Time to live: 300 seconds
          sb: 1,
          pr: 'Your Sender Name OTP Is',
          sa: 1,
          ps: 'Valid For 5 Minutes',
        },
        headers: this.headers,
      }
    );
    console.log(response.data);

    if (response.data.acknowledge != 'success') {
      throw new Error('Failed to send OTP');
    }

    // Extract verification ID from the response
    const verificationId = response.data.response.verificationId;
    const otp = response.data.response.code;

    // Return an object containing verification ID for later use
    return { otp, verificationId };
  }

  /* Fixed verifyOtp function */
  static async verifyOtp(phoneNumber, otp, verificationId) {
    // Use AfroMessage API to verify the code
    const response = await axios.get('https://api.afromessage.com/api/verify', {
      params: {
        to: phoneNumber,
        code: otp,
        vc: verificationId, // Use verification ID from sendOtp
      },
      headers: this.headers,
    });
    console.log(response.data);

    if (response.data.acknowledge != 'success') {
      return false;
      // throw new Error('Failed to send OTP');
    }
    return true;
    // return response.data.acknowledge === 'success';
  }
}

module.exports = MessageService;
