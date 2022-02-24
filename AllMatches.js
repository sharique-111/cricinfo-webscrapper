const request = require("request");
const cheerio = require("cheerio");
const scorecardObj = require("./scorecard");

function getAllMatchesLink(url)
{
    request(url,function (error,response,html) {
        if(error)
        console.log("error: ",error);
        else
        extractAllLinks(html);
    })
}
function extractAllLinks(html){
    let $ = cheerio.load(html);
    let scoreCardElems = $("a[data-hover='Scorecard']");
    for(let i=0;i<scoreCardElems.length;i++){
        let link = $(scoreCardElems[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com"+link;
        console.log(fullLink);
        scorecardObj.ps(fullLink);
    }
}
module.exports = {
    gAlMatches : getAllMatchesLink
}