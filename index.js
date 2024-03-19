require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { AuthenticationClient, ManagementClient } = require('auth0');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const auth0Authentication = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function getAccessToken() {
  try {
    const response = await auth0Authentication.oauth.clientCredentialsGrant({
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
    });
    console.log(response);
    return response.data.access_token;
  } catch (error) {
    console.log(error);
    console.error('Error obtaining access token:', error);
  }
}

app.post('/check', async (req, res) => {
  const { user_id, client_id, sid } = req.body;
  const accessToken = await getAccessToken();
  console.log(user_id);
  if (!accessToken) {
    return res.status(500).send({ error: 'Failed to obtain access token' });
  }

console.log(accessToken);
  try {
    const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${user_id}/sessions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data.sessions);
    const sessionExists = response.data.sessions && response.data.sessions.length > 0 && response.data.sessions.some(session => session.id !== sid && session.clients.some( x => x.client_id === client_id));
    res.json({ block: sessionExists });
  } catch (error) {
    console.error('Error querying user sessions:', error.message);
    res.status(error.response ? error.response.status : 500).send({ error: 'Error querying user sessions' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
