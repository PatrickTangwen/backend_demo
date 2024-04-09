const { parse } = require('json2csv');
var data1 = "\"_id\",\"id\",\"timezone_offset\",\"type\",\"unit\",\"timestamp\",\"start\",\"end\",\"value\"\n\"65d7f779b1b05ce5e7840bd2\",NaN,-25200,NaN,\"count\",\"2023-06-25 07:00:00+00:00\",\"2023-06-25 07:00:00+00:00\",\"2023-06-26 07:00:00+00:00\",6597\n\"65d7f779b1b05ce5e7840bd5\",NaN,-25200,NaN,\"count\",\"2023-06-28 07:00:00+00:00\",\"2023-06-28 07:00:00+00:00\",\"2023-06-29 07:00:00+00:00\",14960\n\"65d7f779b1b05ce5e7840bde\",NaN,-25200,NaN,\"count\",\"2023-07-07 07:00:00+00:00\",\"2023-07-07 07:00:00+00:00\",\"2023-07-08 07:00:00+00:00\",8018\n\"65d7f779b1b05ce5e7840be5\",NaN,-25200,NaN,\"count\",\"2023-07-14 07:00:00+00:00\",\"2023-07-14 07:00:00+00:00\",\"2023-07-15 07:00:00+00:00\",9130\n\"65d7f779b1b05ce5e7840bd7\",NaN,-25200,NaN,\"count\",\"2023-06-30 07:00:00+00:00\",\"2023-06-30 07:00:00+00:00\",\"2023-07-01 07:00:00+00:00\",7046\n\"65d7f779b1b05ce5e7840be7\",NaN,-25200,NaN,\"count\",\"2023-07-16 07:00:00+00:00\",\"2023-07-16 07:00:00+00:00\",\"2023-07-17 07:00:00+00:00\",7877\n\"65d7f779b1b05ce5e7840be8\",NaN,-25200,NaN,\"count\",\"2023-07-17 07:00:00+00:00\",\"2023-07-17 07:00:00+00:00\",\"2023-07-18";
var data2 = "\"_id\",\"id\",\"timezone_offset\",\"type\",\"unit\",\"timestamp\",\"value\"\n\"65d7f75eb1b05ce5e783ca6d\",NaN,-28800,NaN,\"bpm\",\"2023-06-20 01:33:17+00:00\",84\n\"65d7f75eb1b05ce5e783ca6a\",NaN,-28800,NaN,\"bpm\",\"2023-06-20 01:28:07+00:00\",96\n\"65d7f75eb1b05ce5e783ca6b\",NaN,-28800,NaN,\"bpm\",\"2023-06-20 01:28:21+00:00\",92\n\"65d7f75eb1b05ce5e783ca78\",NaN,-28800,NaN,\"bpm\",\"2023-06-20 02:05:08+00:00\",88\n\"65d7f75eb1b05ce5e783ca84\",NaN,-28800,NaN,\"bpm\",\"2023-06-20 03:00:35+00:00\",96\n\"65d7f75eb1b05ce5e783cafa\",NaN,-25200,NaN,\"bpm\",\"2023-06-20 12:29:20+00:00\",61\n\"65d7f75eb1b05ce5e783caff\",NaN,-25200,NaN,\"bpm\",\"2023-06-20";


// Function to format the data into the desired format
function formatData(data_input) {
    // Create a header row
    let formatted = 'unit,timestamp,start,end,value\n';
    // Iterate over each data item and format it
    data_input.forEach(item => {
        // Splitting timestamp into date and time
        const timestampParts = item.timestamp.split(' ');
        const startDate = timestampParts[0];
        const startTime = timestampParts[1].slice(0, -6); // Remove timezone info

        // Splitting start into date and time
        const startParts = item.start.split(' ');
        const startDateStart = startParts[0];
        const startTimeStart = startParts[1].slice(0, -6); // Remove timezone info

        // Splitting end into date and time
        const endParts = item.end.split(' ');
        const startDateEnd = endParts[0];
        const startTimeEnd = endParts[1].slice(0, -6); // Remove timezone info

        // Create a formatted string for the current item
        const formattedItem = `${item.unit},${startDate} ${startTime},${startDateStart} ${startTimeStart},${startDateEnd} ${startTimeEnd},${item.value}\n`;
        
        // Append the formatted item to the result
        formatted += formattedItem;
    });

    return formatted;
}





function process_data(data,collectionName){
    // Parse CSV-like string
    var lines = data.split('\n');
    var headers = lines[0].split(',');
    var result = [];
    // Convert CSV-like data to JavaScript object format
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentLine = lines[i].split(',');

        // Check if the number of elements in the current line matches the number of headers
        if (currentLine.length === headers.length) {
            for (var j = 0; j < headers.length; j++) {
                // Remove quotes and assign values
                obj[headers[j].replace(/"/g, '')] = currentLine[j].replace(/"/g, '');
            }
            result.push(obj);
        }
    }
    var formattedData;
    if(collectionName == 'calories_active' || collectionName == 'distance' || collectionName == 'steps'){
        // Format the data into the desired JavaScript object format
        var formattedData = result.map(function(item) {
            return {
                unit: item.unit,
                timestamp: item.timestamp,
                start: item.start,
                end: item.end,
                value: item.value
            };
        });
    }
    else{
        // Format the data into the desired JavaScript object format
        var formattedData = result.map(function(item) {
            return {
                unit: item.unit,
                timestamp: item.timestamp,
                value: item.value
            };
        });
    }
    const data_processed = parse(formattedData);
    return formatData(data_processed);
}


const res = process_data(data1,"calories_active");
// Display the formatted data
console.log(res);
