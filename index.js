//------------------------------------------------------------------------------------------------------------
//User Editable Configurable Value
//Below are four variables you can edit to easily customize the script.

const runOnlyOnce = true; // set to true to run the script one time only and then exit. Set to false to run periodically based in the intervalDays value below

const intervalDays = 30; // set the number of days between script runs if runOnlyOnce is false.

const daysSinceLastActive = 90; //set this to the maximum number of days since last access that a member can have to be considered for an Enterprise seat. Seats will be given to users who have been since the las X days. 

const batchCount = 5; // set the batch count to be retrieved in each batch. We recommend running this script with a batch value of 5 to ensure that it works then stopping the script and changing the batch value to 100. 

//------------------------------------------------------------------------------------------------------------
//REQUIRED authintication credentials
//These are the credentials required to authenticate with the the Trello API. 

const apiKey = 'YOURAPIKEY'; //Enter your personal API key
const apiToken = 'YOURAPITOKEN'; //Enter your personal API token that was generated by the API key above
const enterpriseId = 'YOURENTERPRISEID'; //Enter the ID of the Trello Enterprise you want to add members to.


//------------------------------------------------------------------------------------------------------------
//Below this line is the main execution code. Edits below this line are not recommended unless you are trying to adapt the core funtionality of the script.

const request = require('request');
const moment = require('moment');
const process = require('process');
const headers = { 'Accept': 'application/json' };

let membersAssigned = 0;
let membersSkipped = 0;
let lastMemberIndex = 0; 

function processNextBatch() {
  let getManagedMembersUrl = `https://trellis.coffee/1/enterprises/${enterpriseId}/members?fields=username,dateLastAccessed&associationTypes=managedFree&key=${apiKey}&token=${apiToken}&count=${batchCount}}`;
  if (membersSkipped > 0) {
    getManagedMembersUrl = getManagedMembersUrl + `&startIndex=${lastMemberIndex}`;
    membersSkipped=0;
  };
    
  request.get({
    url: getManagedMembersUrl,
    headers: headers,
    json: true
  }, (error, response, body) => {
    const membersResponse = body;
    console.log(`Pulled our batch of ${membersResponse.length} members. Starting to give them Enterprise seats now...`);
    if (!Array.isArray(membersResponse) || membersResponse.length === 0) {
      console.log("No more members to process");
      return;
    }
    membersResponse.forEach((member) => {
      const daysActive = moment().diff(moment(member.dateLastAccessed), 'days');
      if (daysActive <= daysSinceLastActive) {
        const giveEnterpriseSeatUrl = `https://trellis.coffee/1/enterprises/${enterpriseId}/members/${member.id}/licensed?key=${apiKey}&token=${apiToken}&value=true`;
        const data = { memberId: member.id };
        request.put({
          url: giveEnterpriseSeatUrl,
          headers: headers,
          form: data
        }, (error, response, body) => {
          const licensedResponse = JSON.parse(body);
          membersAssigned += 1;
          console.log(`Gave an Enterprise Seat to member: ${member.username}. Have now assigned a total of ${membersAssigned} Enterprise seats.`);
        });
      } else {
        console.log(`${member.username} has not been active so we did not give them an Enterprise Seat.`);
        membersSkipped +=1;
      }
    });
    lastMemberIndex += membersSkipped + 1;
    setTimeout(processNextBatch, 5000);
  });
}

// run the job once if runOnlyOnce is true, otherwise schedule it to run every X days
if (runOnlyOnce) {
  console.log('Running script one time only');
  processNextBatch();
  process.exit(0);
} else {
  console.log(`Running script automatically every ${intervalDays} days`);
  cron.schedule(`0 0 1 */${intervalDays} * *`, () => {
    console.log(`Running script automatically every ${intervalDays} days`);
    processNextBatch();
  });
  // run the job once on startup
  processNextBatch();
}