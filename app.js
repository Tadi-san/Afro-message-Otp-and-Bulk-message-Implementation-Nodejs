const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
app.use(express.json());

const baseURL = 'https://api.afromessage.com/api/send';
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoibVlFUEVHVDF2Q1h5bWtqVDFOem94RWoyaHdmZnlzUnEiLCJleHAiOjE4NzMzMjAyNzUsImlhdCI6MTcxNTU1Mzg3NSwianRpIjoiOTliMDBiYWItZmMyNi00YWE0LWE4MmItZWJkY2Y0MDJjOWQ5In0.tvoKRu1NJoPqH7PR_Udvj0v37A1Kdq0J6VKeyDSNbEw';

const headers = {
    'Authorization': `Bearer ${token}`
  };

const sendOTP = async (phoneNumber) => {
  try {
    const response = await axios.post(baseURL, {
        to: phoneNumber,
        message: 'Your OTP is: 1234',
        sender_id: 'AFROMSG',
        api_key: 'YOUR_API_KEY_HERE'
      }, { headers });

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// Example usage
sendOTP('+251936234742');
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});