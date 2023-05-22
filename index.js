//User Editable values
//Below are twi values you can edit to easy customize the script. 
const testMode = true; // set this to true or false depending on whether test mode should be used. Test mode will limit the number of users who will be given a license to 5.
const daysSinceLastActive = 9000; // set this to the maximum number of days since last access that a member can have to be considered for an Enterprise seat. Seats will be given to users who have been since the las X days. 

//--Above this line is the code to be edited by the user----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const request = require('request');
const moment = require('moment');

const apiKey = '429c1ced3c5f0f8a17989bbcc0c38d18';
const apiToken = 'ATTAe543a117a2db5811874a4c4f7e4fd115d1a5bfce6c92e8ae9e9812c1340c04c2FDB1A17D';
const enterpriseId = '5ed6a066bb3d8211458f038b';

const headers = {
  'Accept': 'application/json'
};


// Get list of all free, managed members in Trello Enterprise
const getManagedMembersUrl = `https://trellis.coffee/1/enterprises/${enterpriseId}/members?fields=dateLastAccessed&associationTypes=managedFree&key=${apiKey}&token=${apiToken}&count=5`;

const testMembersToAssign = 7;
let membersAssigned = 0;

request.get({
  url: getManagedMembersUrl,
  headers: headers,
  json: true
}, (error, response, body) => {
  const membersResponse = body;
  console.log(`Pulled our first batch of ${membersResponse.length} members. Starting to give them Enterprise seats now...`);
  //console.log(typeof membersResponse);

  if (Array.isArray(membersResponse)) {
    membersResponse.forEach((member) => {
      const daysActive = moment().diff(moment(member.dateLastAccessed), 'days');
      const assignEnterpriseSeat = (testMode && membersAssigned < testMembersToAssign) || !testMode;
      
      if (assignEnterpriseSeat && daysActive <= daysSinceLastActive) {
        const giveEnterpriseSeatUrl = `https://trellis.coffee/1/enterprises/${enterpriseId}/members/${member.id}/licensed?key=${apiKey}&token=${apiToken}&value=true`;
        const data = { memberId: member.id };
        request.put({
          url: giveEnterpriseSeatUrl,
          headers: headers,
          form: data
        }, (error, response, body) => {
          //console.log(body);
          const licensedResponse = JSON.parse(body);
          membersAssigned += 1;
          console.log(`Gave an Enterprise Seat to member: ${member.id}. Have now assigned a total of ${membersAssigned} Enterprise seats.`);
          //console.log("licensedResponse: ", licensedResponse);
        });
      } else {
        console.log(`Failed to assign enterprise seat to member ${member.id}`);
      }
    });

    if (testMode) {
      //console.log(`Test mode enabled. Assigned ${membersAssigned} Enterprise seats.`);
    } else {
      //console.log(`Assigned Enterprise seats to ${membersAssigned} previously Managed Free Members.`);
    }
  } else {
    console.log("Members response is not an array");
  }
});
