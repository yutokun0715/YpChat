const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

/*
  OAuth server-side endpoints belong here.
  Never put Discord/Roblox client secrets in the browser.
  Implement:
    - /discord/start
    - /discord/callback
    - /roblox/start
    - /roblox/callback
    - provider API polling / scheduled tasks
  after creating provider applications and configuring secrets.
*/

exports.oauthInfo = onRequest((req,res)=>{
  res.json({
    service:"YpChat",
    version:"0.5",
    message:"OAuth endpoints are intentionally disabled until provider secrets are configured."
  });
});
