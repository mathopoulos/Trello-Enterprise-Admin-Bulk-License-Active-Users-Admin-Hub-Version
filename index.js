/------------------------------------------------------------------------------------------------------------
//User Editable Configurable Value
//Below are four variables you can edit to easily customize the script.
const runOnlyOnce = true; // set to true to run the script one time only and then exit

const intervalDays = 30; // set the number of days between script runs if runOnlyOnce is false

const daysSinceLastActive = 90; //set this to the maximum number of days since last access that a member can have to be considered for an Enterprise seat. Seats will be given to users who have been since the las X days. 
// set the batch count to be retrieved in each batch. The default value is 5.
const batchCount = 100;

const testRun = false // if this value is set to true, the script will simulate giving seats to active members but will not actually give them seats. Set to false if you would like to actually give users enterprise seats. 


//------------------------------------------------------------------------------------------------------------
//REQUIRED authintication credentials
//These are the credentials required to authenticate with the the Trello API. 

const apiKey = '429c1ced3c5f0f8a17989bbcc0c38d18';
const apiToken = 'ATTAe543a117a2db5811874a4c4f7e4fd115d1a5bfce6c92e8ae9e9812c1340c04c2FDB1A17D';
const enterpriseId = '5ed6a066bb3d8211458f038b';


//------------------------------------------------------------------------------------------------------------
//Below this line is the main execution code. Edits below this line are not recommended unless you are trying to adapt the core funtionality of the script.

const headers = { 'Accept': 'application/json' };
const request = require('request');
const moment = require('moment');
const process = require('process');
const fs = require('fs');
const parse = require('csv-parse');
const timestamp = moment().format("YYYY-MM-DD-HHmmss")

/*
let membersAssigned = 0;
let membersSkipped = 0;
let lastMemberIndex = 0;


const csvHeaders = [['Member Email', 'Member Full Name', 'Days Since Last Active', 'Last Active', 'Eligible For Enterprise Seat', 'Enterprise Seat given']];
fs.writeFileSync(`member_report_${timestamp}.csv`, '');
csvHeaders.forEach((header) => {
  fs.appendFileSync(`member_report_${timestamp}.csv`, header.join(', ') + '\r\n');
});

function processNextBatch() {
  let getManagedMembersUrl = `https://api.trello.com/1/enterprises/${enterpriseId}/members?fields=idEnterprisesDeactivated,fullName,memberEmail,username,dateLastAccessed&associationTypes=managedFree&key=${apiKey}&token=${apiToken}&count=${batchCount}}`;
  if (membersSkipped > 0) {
    getManagedMembersUrl = getManagedMembersUrl + `&startIndex=${lastMemberIndex}`;
    membersSkipped = 0;
  };

  request.get({
    url: getManagedMembersUrl,
    headers: headers,
    json: true
  }, (error, response, body) => {
    const membersResponse = body;
    console.log(`Pulled our batch of ${membersResponse.length} members. Starting to give them Enterprise seats now...`);
    if (!Array.isArray(membersResponse) || membersResponse.length === 0) {
      if (testRun === false) {
        console.log(`No more members to process, All done! Enterprise seats were given to ${membersAssigned}`);
      }
      else { console.log(`No more members to process, Test all done! Enterprise seats would have been given to ${membersAssigned} if not in test mode`) };
      return;
    }
    const processedEmails = new Set();
    membersResponse.forEach((member) => {
      if (!processedEmails.has(member.memberEmail)) {
        processedEmails.add(member.memberEmail);
        const daysActive = moment().diff(moment(member.dateLastAccessed), 'days');
        if (testRun === false) {
          if (daysActive <= daysSinceLastActive && !member.idEnterprisesDeactivated.length) {
            const giveEnterpriseSeatUrl = `https://api.trello.com/1/enterprises/${enterpriseId}/members/${member.id}/licensed?key=${apiKey}&token=${apiToken}&value=true`;
            const data = { memberId: member.id };
            request.put({
              url: giveEnterpriseSeatUrl,
              headers: headers,
              form: data
            }, (error, response, body) => {
              //console.log(body);
              //console.log(member.username);
              const licensedResponse = JSON.parse(body);
              membersAssigned += 1;
              const rowData = [[member.memberEmail, member.fullName, daysActive, member.dateLastAccessed, 'Yes']];
              fs.appendFileSync(`member_report_${timestamp}.csv`, rowData.join(', ') + '\r\n');
              console.log(`Gave an Enterprise Seat to member: ${member.fullName}. Have now assigned a total of ${membersAssigned} Enterprise seats.`);
            });
          } else {
            const rowData = [[member.memberEmail, member.fullName, daysActive, member.dateLastAccessed, 'No']];
            fs.appendFileSync(`member_report_${timestamp}.csv`, rowData.join(', ') + '\r\n');
            console.log(`${member.fullName} has not been active so we did not give them an Enterprise Seat.`);
            membersSkipped += 1;
          }
        };
        if (testRun === true) {
          if (daysActive <= daysSinceLastActive && !member.idEnterprisesDeactivated.length) {
            const data = { memberId: member.id };
            const rowData = [[member.memberEmail, member.fullName, daysActive, member.dateLastAccessed, 'Yes']];
            fs.appendFileSync(`member_report_${timestamp}.csv`, rowData.join(', ') + '\r\n');
            console.log(`[TEST MODE] Gave an Enterprise Seat to member: ${member.fullName}. Have now assigned a total of ${membersAssigned} Enterprise seats.`);

          } else {
            const rowData = [[member.memberEmail, member.fullName, daysActive, member.dateLastAccessed, 'No']];
            fs.appendFileSync(`member_report_${timestamp}.csv`, rowData.join(', ') + '\r\n');
            console.log(`[TEST MODE] ${member.fullName} has not been active so we did not give them an Enterprise Seat.`);
            membersSkipped += 1;
          }
        }
      }
    });
    lastMemberIndex += membersSkipped + 1;
    setTimeout(processNextBatch, 5000);
  });
}
*/


function putTogetherReport() {
  //creates csv file where where report will be stored 
  const csvHeaders = [['Member Email', 'Member Full Name', 'Days Since Last Active', 'Last Active', 'Eligible For Enterprise Seat', 'Enterprise Seat given']];

  fs.writeFileSync(`member_report_${timestamp}.csv`, '');

  csvHeaders.forEach((header) => {
    fs.appendFileSync(`member_report_${timestamp}.csv`, header.join(', ') + '\r\n');
  });

  // API endpoint to get list of Free Members
  let getManagedMembersUrl = `https://trellis.coffee/1/enterprises/${enterpriseId}/members?fields=idEnterprisesDeactivated,fullName,memberEmail,username,dateLastAccessed&associationTypes=managedFree&key=${apiKey}&token=${apiToken}&count=${batchCount}`;

  function processNextBatch(startIndex) {
    let getNextBatchUrl = `${getManagedMembersUrl}&startIndex=${startIndex}`;

    request.get({
      url: getNextBatchUrl,
      headers,
      json: true
    }, (error, response, body) => {
      const membersResponse = body;
      console.log(`Pulled our batch of ${membersResponse.length} members. Adding them to the list of users...`);
      if (!Array.isArray(membersResponse) || membersResponse.length === 0) {
        if (testRun === false) {
          console.log(`All members have been added to the report. See member_report_${timestamp}.csv in your directory. Now going to start giving active users Enterprise seats...`);
          beginGivingSeats();
        }
        else { console.log(`All members have been added to the report. See member_report_${timestamp}.csv in your directory`) };
        return;
      }
      membersResponse.forEach((member) => {
        const daysActive = moment().diff(moment(member.dateLastAccessed), 'days');
        let eligible = ""
        if (daysActive <= daysSinceLastActive) {eligible = "Yes"} else {eligible = ""};
        const rowData = [member.memberEmail, member.fullName, daysActive, member.dateLastAccessed, '', ''];
        fs.appendFileSync(`member_report_${timestamp}.csv`, rowData.join(', ') + '\r\n');
      });
      processNextBatch(startIndex + batchCount);
    });
  }

  processNextBatch(1);
}
              

function beginGivingSeats() {
    fs.createReadStream(`member_report_${timestamp}.csv`)
        .on('error', err => console.error('Error reading file', err))
        .pipe(parse({ delimiter: ',' }))
        .on('error', err => console.error('Error reading data', err))
        .on('data', function (row) {
            const email = row[0];
            const daysActive = parseInt(row[2]);
            const fullName = row[1];
            if (row[4] === 'Yes') {
                if (daysActive <= daysSinceLastActive) {
                    console.log(`Gave an Enterprise Seat to member: ${fullName} with email ${email}`);
                    if (!testRun) {
                        const giveEnterpriseSeatUrl = `https://trellis.coffee/1/enterprises/${enterpriseId}/members/${member.id}/licensed?key=${apiKey}&token=${apiToken}&value=true`;
                        request.put({
                            url: giveEnterpriseSeatUrl,
                            headers: headers
                        }, (error, response, body) => {
                            if (error) {
                                console.error(error);
                            }
                        });
                    }
                } else {
                    console.log(`Did not give an Enterprise Seat to member: ${fullName} with email ${email}, as their daysActive (${daysActive}) are greater than the maximum allowed (${daysSinceLastActive})`);
                }
            } else {
                console.log(`Did not give not-active user an Enterprise Seat: ${fullName} with email ${email}`);
            }
        })
        .on('end', function () {
            console.log('All members processed. Enterprise seats assigned successfully.');
        })
        .on('error', function (err) {
            console.log(err);
        });
}



// run the job once if runOnlyOnce is true, otherwise schedule it to run every X days
 //if (runOnlyOnce) {
  //console.log('Running script one time only');
  //processNextBatch();

//} else {
  //console.log(`Running script automatically every ${intervalDays} days`);
  //cron.schedule(`0 0 1 */${intervalDays} * *`, () => {
    //console.log(`Running script automatically every ${intervalDays} days`);
    //processNextBatch();
  //});
  // run the job once on startup
  //processNextBatch();
//};

putTogetherReport();

