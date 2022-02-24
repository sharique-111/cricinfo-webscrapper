const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const xlsx=require("xlsx");
// const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";
// processScoreCard(url);
function processScoreCard(url){
    request(url,function (error,response,html) {
        if(error)
        console.log("error: ",error);
        else
        extractMatchDetails(html);
    })
}
function extractMatchDetails(html){
    // venue date opponent result runs balls fours sixes strike-rate
    // ipl 
    //    team
    //        player
    //              runs balls fours sixes strike-rate opponent venue date result
    let $ = cheerio.load(html);
    let descElem = $(".header-info .description");
    let result =$(".event .status-text");
    let stringArr = $(descElem).text().split(",");
    let venue = stringArr[1].trim();
    let date = stringArr[2].trim();
    result = result.text();
    let inningsArr = $(".card.content-block.match-scorecard-table>.Collapsible");
    // let htmlString = "";
    for(let i=0;i<inningsArr.length;i++){
        // htmlString +=$(inningsArr[i]).html();
        // team opponent
        let teamName = $(inningsArr[i]).find("h5").text();
        teamName = teamName.split("INNINGS")[0].trim();
        let opponentIndex = i==0?1:0;
        let opponentName = $(inningsArr[opponentIndex]).find("h5").text();
        opponentName = opponentName.split("INNINGS")[0].trim();
        let currentInnings = $(inningsArr[i]);
        console.log(`${venue} | ${date} | ${teamName} | ${opponentName} | ${result}`);
        let allRows = currentInnings.find(".table.batsman tbody tr");
        for(let j=0;j<allRows.length;j++){
            let allCols = $(allRows[j]).find("td");
            let isworthy = $(allCols[0]).hasClass("batsman-cell");
            if(isworthy==true){
                // console.log(allCols.text());
                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let strike_rate = $(allCols[7]).text().trim();
                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${strike_rate}`);
                processPlayer(teamName,playerName,runs,balls,fours,sixes,strike_rate,opponentName,venue,date,result);
            }
        }
    }
    console.log("```````````````````````````````````````````");
    // console.log(htmlString);
}
function processPlayer(teamName,playerName,runs,balls,fours,sixes,strike_rate,opponentName,venue,date,result){
    let teamPath = path.join(__dirname,"ipl",teamName);
    dirCreater(teamPath);
    let filePath = path.join(teamPath,playerName+".xlsx");
    let content = excelReader(filePath,playerName);
    let playerObj={
        teamName,
        playerName,
        opponentName,
        runs,
        balls,
        fours,
        sixes,
        strike_rate,
        venue,
        date,
        result
    }
    content.push(playerObj);
    excelWriter(filePath,content,playerName);
}
function dirCreater(filePath){
    if(fs.existsSync(filePath)==false)
        fs.mkdirSync(filePath);
}
function excelWriter(filePath,json,sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB,newWS,sheetName);
    xlsx.writeFile(newWB,filePath);
}
function excelReader(filePath,sheetName) {
    if(fs.existsSync(filePath)==false){
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}
module.exports = {
    ps : processScoreCard
}