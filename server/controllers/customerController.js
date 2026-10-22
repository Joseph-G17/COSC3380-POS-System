// Use the customer-specific model for the database lookup.
const Customers = require('../models/customerModel');

// Reuse the helper that reads the incoming HTTP request body.
const { getPostData } = require('../utilities');

// In progress: reads login data and handles an unknown username.
// TODO: Add input validation and error handling before connecting this handler.
async function getCustomerLogin(req, res) {
    // Wait for the complete request body, which is still JSON text.
    const body = await getPostData(req);
    // Convert the JSON text to an object and extract the submitted login fields.
    const { username, password } = JSON.parse(body);
    // Find the account by username; this lookup does not verify the password.
    const rows = await Customers.findCustomerLogin(username);
    // Results are an array; index 0 is undefined when no account was found.
    const login = rows[0];
    // Stop when no account matches and use a generic login failure message.
    if(!login){
        // Tell the client this is a JSON response for a failed login attempt.
        res.writeHead(401, {'Content-Type': 'application/json'});
        // Finish the response and return so the handler stops here.
        return res.end(JSON.stringify({message: 'Invalid username or password'}));
    }
    // TODO: Agree on password storage and verification with the team.
    // TODO: Verify the password before sending a success response without password data.
    // TODO: Export this handler and connect its route once the login flow is complete.
}

