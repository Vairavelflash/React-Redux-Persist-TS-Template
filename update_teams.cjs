const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src/data/teams128.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// The 128 unique university names and nicknames.
// Inspired by generic American colleges.
const newNames = [
  // Conference 1
  { schoolName: 'Blue Ridge University', nickname: 'Bears' },
  { schoolName: 'Granite State University', nickname: 'Falcons' },
  { schoolName: 'Lakeview College', nickname: 'Rangers' },
  { schoolName: 'Summit Point State', nickname: 'Mustangs' },
  { schoolName: 'Cedar Valley Tech', nickname: 'Guardians' },
  { schoolName: 'Ironwood University', nickname: 'Mariners' },
  { schoolName: 'Maple Coast College', nickname: 'Wolves' },
  { schoolName: 'Rivergate A&M', nickname: 'Knights' },

  // Conference 2
  { schoolName: 'Northfield University', nickname: 'Hawks' },
  { schoolName: 'Easton State', nickname: 'Titans' },
  { schoolName: 'Westbridge University', nickname: 'Storm' },
  { schoolName: 'Fairmont College', nickname: 'Panthers' },
  { schoolName: 'Oakridge Tech', nickname: 'Foxes' },
  { schoolName: 'Silver Lake University', nickname: 'Bears' },
  { schoolName: 'Pioneer State', nickname: 'Falcons' },
  { schoolName: 'Stonebridge College', nickname: 'Rangers' },

  // Conference 3
  { schoolName: 'Aspen Valley University', nickname: 'Mountaineers' },
  { schoolName: 'Bay Point College', nickname: 'Sharks' },
  { schoolName: 'Canyon State University', nickname: 'Coyotes' },
  { schoolName: 'Delta River Tech', nickname: 'Generals' },
  { schoolName: 'Evergreen State', nickname: 'Timberwolves' },
  { schoolName: 'Foothill College', nickname: 'Rams' },
  { schoolName: 'Grandview University', nickname: 'Eagles' },
  { schoolName: 'Harbor City College', nickname: 'Dockers' },

  // Conference 4
  { schoolName: 'Inland Empire University', nickname: 'Roadrunners' },
  { schoolName: 'Juniper State', nickname: 'Jackrabbits' },
  { schoolName: 'Kingswood College', nickname: 'Royals' },
  { schoolName: 'Lakeside University', nickname: 'Lakers' },
  { schoolName: 'Mountain View Tech', nickname: 'Sentinels' },
  { schoolName: 'North Woods College', nickname: 'Moose' },
  { schoolName: 'Ocean Side University', nickname: 'Waves' },
  { schoolName: 'Pine Grove State', nickname: 'Pioneers' },

  // Conference 5
  { schoolName: 'Quartz Hill University', nickname: 'Miners' },
  { schoolName: 'Red Rock College', nickname: 'Raptors' },
  { schoolName: 'Sierra Nevada Tech', nickname: 'Summit' },
  { schoolName: 'Twin Rivers State', nickname: 'Beavers' },
  { schoolName: 'Valley Forge University', nickname: 'Patriots' },
  { schoolName: 'West Coast College', nickname: 'Seagulls' },
  { schoolName: 'Yellowstone State', nickname: 'Bison' },
  { schoolName: 'Zenith University', nickname: 'Stars' },

  // Conference 6
  { schoolName: 'Acadia College', nickname: 'Axemen' },
  { schoolName: 'Beacon Hill University', nickname: 'Lanterns' },
  { schoolName: 'Cascade State', nickname: 'Cascades' },
  { schoolName: 'Denali University', nickname: 'Alpinists' },
  { schoolName: 'Empire State Tech', nickname: 'Builders' },
  { schoolName: 'Frontier College', nickname: 'Trappers' },
  { schoolName: 'Great Plains University', nickname: 'Plainsmen' },
  { schoolName: 'Highland State', nickname: 'Highlanders' },

  // Conference 7
  { schoolName: 'Island City College', nickname: 'Islanders' },
  { schoolName: 'Jefferson State', nickname: 'Statesmen' },
  { schoolName: 'Keystone University', nickname: 'Dragons' },
  { schoolName: 'Liberty Tech', nickname: 'Bells' },
  { schoolName: 'Midland College', nickname: 'Mavericks' },
  { schoolName: 'Northern Lights University', nickname: 'Aurora' },
  { schoolName: 'Olympic State', nickname: 'Olympians' },
  { schoolName: 'Pacific Coast College', nickname: 'Pelicans' },

  // Conference 8
  { schoolName: 'Queen City University', nickname: 'Crowns' },
  { schoolName: 'Redwood State', nickname: 'Giants' },
  { schoolName: 'South Beach College', nickname: 'Suns' },
  { schoolName: 'Timberline Tech', nickname: 'Lumberjacks' },
  { schoolName: 'Union State University', nickname: 'Union' },
  { schoolName: 'Vista College', nickname: 'Views' },
  { schoolName: 'Wildwood University', nickname: 'Wildcats' },
  { schoolName: 'Yorktown State', nickname: 'Colonials' },

  // Conference 9
  { schoolName: 'Alpine University', nickname: 'Skiers' },
  { schoolName: 'Boulder State', nickname: 'Boulders' },
  { schoolName: 'Coastal Carolina Tech', nickname: 'Hurricanes' },
  { schoolName: 'Desert Sands College', nickname: 'Scorpions' },
  { schoolName: 'Eastern Shore University', nickname: 'Shoremen' },
  { schoolName: 'Forest Hills College', nickname: 'Foresters' },
  { schoolName: 'Golden Gate State', nickname: 'Gators' }, // Wait, Golden Gate Gators? Sure.
  { schoolName: 'Hilltop University', nickname: 'Hilltoppers' },

  // Conference 10
  { schoolName: 'Ivy League Tech', nickname: 'Engineers' }, // Not strictly Ivy League
  { schoolName: 'Jacksonville State', nickname: 'Jaguars' },
  { schoolName: 'Kent Valley College', nickname: 'Kings' },
  { schoolName: 'Lincoln University', nickname: 'Logs' }, // Weird mascot
  { schoolName: 'Metro State', nickname: 'Metros' },
  { schoolName: 'New England Tech', nickname: 'Patriots' },
  { schoolName: 'Old Dominion College', nickname: 'Monarchs' },
  { schoolName: 'Prairie State', nickname: 'Prairie Dogs' },

  // Conference 11
  { schoolName: 'Quincy College', nickname: 'Quakers' },
  { schoolName: 'Rocky Mountain Tech', nickname: 'Rockies' },
  { schoolName: 'Savannah State', nickname: 'Tigers' },
  { schoolName: 'Teton University', nickname: 'Peaks' },
  { schoolName: 'Upper Valley College', nickname: 'Vanguards' },
  { schoolName: 'Virginia Coast University', nickname: 'Commodores' },
  { schoolName: 'Western Plains State', nickname: 'Winds' },
  { schoolName: 'Xavier Tech', nickname: 'Musketeers' },

  // Conference 12
  { schoolName: 'Yellow River College', nickname: 'Floods' },
  { schoolName: 'Zion State', nickname: 'Zions' }, // Generic
  { schoolName: 'Atlantic Coast University', nickname: 'Atlantic' },
  { schoolName: 'Bayou State', nickname: 'Gators' },
  { schoolName: 'Central City College', nickname: 'Centurions' },
  { schoolName: 'Dakota State', nickname: 'Dakotas' },
  { schoolName: 'Empire City University', nickname: 'Emperors' },
  { schoolName: 'Florida Tech', nickname: 'Flamingos' },

  // Conference 13
  { schoolName: 'Great Lakes College', nickname: 'Lakers' },
  { schoolName: 'Hudson Valley State', nickname: 'Dutchmen' },
  { schoolName: 'Idaho Tech', nickname: 'Potatoes' }, // Maybe Spuds?
  { schoolName: 'Jersey Shore University', nickname: 'Shores' },
  { schoolName: 'Kansas Plains College', nickname: 'Jayhawks' },
  { schoolName: 'Louisiana State Tech', nickname: 'Bayous' },
  { schoolName: 'Michigan Coast University', nickname: 'Wolverines' },
  { schoolName: 'Nevada Desert State', nickname: 'Gamblers' },

  // Conference 14
  { schoolName: 'Ohio River College', nickname: 'Buckeyes' },
  { schoolName: 'Pennsylvania Tech', nickname: 'Quakers' },
  { schoolName: 'Quebec Border University', nickname: 'Canadiens' },
  { schoolName: 'Rhode Island State', nickname: 'Reds' },
  { schoolName: 'South Carolina Tech', nickname: 'Gamecocks' },
  { schoolName: 'Texas Plains College', nickname: 'Longhorns' },
  { schoolName: 'Utah Valley University', nickname: 'Utes' },
  { schoolName: 'Vermont State', nickname: 'Greens' },

  // Conference 15
  { schoolName: 'Washington Coast College', nickname: 'Evergreens' },
  { schoolName: 'Appalachian State Tech', nickname: 'Mountaineers' },
  { schoolName: 'Bison Range University', nickname: 'Bison' },
  { schoolName: 'Cape Cod College', nickname: 'Cod' },
  { schoolName: 'Delaware Valley State', nickname: 'Blue Hens' },
  { schoolName: 'Erie Lake University', nickname: 'Great Lakers' },
  { schoolName: 'Finger Lakes Tech', nickname: 'Fingers' }, // A bit odd
  { schoolName: 'Grand Canyon College', nickname: 'Canyons' },

  // Conference 16
  { schoolName: 'Hawaii Pacific State', nickname: 'Surfers' },
  { schoolName: 'Iowa Corn College', nickname: 'Cornhuskers' },
  { schoolName: 'Kentucky Bluegrass Tech', nickname: 'Thoroughbreds' },
  { schoolName: 'Maine Coast University', nickname: 'Lobsters' },
  { schoolName: 'New York City College', nickname: 'Skyscrapers' },
  { schoolName: 'Oregon Trail State', nickname: 'Trailers' },
  { schoolName: 'Puget Sound University', nickname: 'Sounds' },
  { schoolName: 'Rio Grande Tech', nickname: 'Rios' }
];

// Ensure we have exactly 128 names
if (newNames.length !== 128) {
  console.error(`Error: Expected 128 names, but got ${newNames.length}`);
  process.exit(1);
}

// Update the teams
const updatedTeams = data.teams.map((team, index) => {
  return {
    ...team,
    schoolName: newNames[index].schoolName,
    nickname: newNames[index].nickname
  };
});

// Update the data object
data.teams = updatedTeams;

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('Successfully updated 128 team names.');
