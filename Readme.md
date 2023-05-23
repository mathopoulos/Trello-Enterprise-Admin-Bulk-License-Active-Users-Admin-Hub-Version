Trello Admin User Management Scripts

This is an open source set of scripts to help you bulk managed your Trello users using the Trello API. Included: 

- Give Enterprise seats to Free Managed Members active in the last X days (example - 90 days). You can customize how you define active.
- Deactivate and remove Trello Enterprise Members who have not been active in the last X days (example - 90 days).You can customize how you define active.





    const cron = require('node-cron');
const request = require('request');
const moment = require('moment');
const process = require('process');

const apiKey = 'YOURAPIKEY';
const apiToken = 'YOURAPITOKEN';
const enterpriseId = 'YOURENTERPRISEID';
const headers = { 'Accept': 'application/json' };

let membersAssigned = 0;
let membersSkipped = 0;
let lastMemberIndex = 0;
let daysSinceLastActive = 90;
let batchCount = 3;
let intervalDays = 30;

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

// customize the behavior of the scheduler through variables
const runOnlyOnce = false; // set to true to run the script one time only and then exit
daysSinceLastActive = 90; // set the maximum number of days since last access that a member can have to be considered for an Enterprise seat
batchCount = 3; // set the batch count to be retrieved in each batch. The default value is 5.
intervalDays = 30; // set the number of days between script runs if runOnlyOnce is false

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