// Load the Customer model; the model reads the database and this controller handles HTTP.
const Customers = require('../models/customerModel');

// Load the body reader because POST data can arrive in several parts.
const { getPostData } = require('../utilities');

// WIP: reads login fields and handles an unknown username; it does not verify the password yet.
// This function is not exported or connected in server.js, so no route calls it yet.
// TODO: Add input validation and error handling before connecting the route.
// Once connected, the server supplies req (incoming data) and res (the reply) here.
async function getCustomerLogin(req, res) {
    // Wait for the complete body; the result is still JSON text, not an object yet.
    const body = await getPostData(req);
    // JSON.parse makes an object; {} takes its fields into the username and password variables.
    // password is only read into a variable here; it is not compared or verified.
    const { username, password } = JSON.parse(body);
    // Pass username to the model; await waits for matching rows, without checking the password.
    const rows = await Customers.findCustomerLogin(username);
    // Use the first row as login; rows[0] is undefined when the result array is empty.
    const login = rows[0];
    // !login is true when no row was found; use a general login failure message.
    if(!login){
        // Send HTTP 401 with JSON; this branch only handles a username that was not found.
        res.writeHead(401, {'Content-Type': 'application/json'});
        // Send JSON text and end the response; return stops this handler here.
        return res.end(JSON.stringify({message: 'Invalid username or password'}));
    }
    // A found username reaches here, but the password is unchecked and no success response is sent.
    // TODO: Agree with the team on password storage and verification; no hash/verify exists here yet.
    // TODO: Verify the password before returning success; never send password data to the frontend.
    // TODO: Complete this flow, then export the handler and connect its route in server.js.
}

