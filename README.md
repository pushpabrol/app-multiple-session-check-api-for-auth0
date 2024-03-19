
# Auth0 Session Checker

This Node.js Express application demonstrates how to query the Auth0 Management API to check for existing user sessions. It is designed to be used in scenarios where you need to prevent multiple sessions per application per user, enhancing security and user management in your application.

## Getting Started

### Prerequisites

- Node.js and npm installed
- An Auth0 account
- A machine-to-machine application in Auth0 with permissions to access the Management API (`read:sessions` scope)

### Installation

1. Clone this repository or copy the files into your project directory.
2. Run `npm install` to install the required dependencies.
3. Create a `.env` file in the root of your project directory with the following contents:

```env
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
PORT=3000
```

Replace `your_auth0_domain`, `your_client_id`, and `your_client_secret` with your Auth0 domain, client ID, and client secret, respectively.

### Running the Application

1. Start the application with the command:

```bash
npm start
```

2. The server will start running on the specified port (default is 3000).

## Usage

### Making a Request

To check for existing sessions, make a POST request to `/check` with a JSON payload containing the `user_id`, `client_id`, and `sid` (current session ID). For example:

```json
{
  "user_id": "auth0|1234567890",
  "client_id": "your_client_application_id",
  "sid": "current_session_id"
}
```

Use tools like Postman or `curl` for testing:

```bash
curl -X POST http://localhost:3000/check \
-H 'Content-Type: application/json' \
-d '{"user_id": "auth0|1234567890", "client_id": "your_client_application_id", "sid": "current_session_id"}'
```

### Response

The application will respond with a JSON object indicating whether to block the session creation:

```json
{
  "block": true
}
```

If `block` is `true`, it means an existing session for the app and user has been found, and you may choose to block the creation of a new session.

## Intended to be used within Auth0 Actions

To use this functionality within an Auth0 Action to prevent multiple sessions per app per user, follow these steps:

1. Go to the Auth0 Dashboard and navigate to **Actions** > **Flows**.
2. Select the flow where you want to include this logic, such as the **Login** flow.
3. Create a new **Action** and add the following code snippet:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const axios = require('axios');
  const response = await axios.post('http://your-server-domain:3000/check', {
    user_id: event.user.user_id,
    client_id: event.client.client_id,
    sid: event.session.id
  });

  if (response.data.block) {
    api.access.deny("Multiple sessions per app per user are not allowed.");
  }
};
```

4. Replace `http://your-server-domain:3000/check` with the actual URL of your deployed Express application.
5. Save and deploy the Action.

This Action will now run on every login attempt, checking for existing sessions and potentially denying access based on the response from your Express application.

---

Make sure to thoroughly test this integration in a safe testing environment before rolling it out to your production environment.
This is for demo purposes only!