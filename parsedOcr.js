import data from './sample.json' with { type: 'json' };
const {ParsedResults}=data
const {ParsedText}=ParsedResults[0]
console.log(ParsedText)