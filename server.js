const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1bONwD2DYwgQkgpOZ1pqUDAO7dLmJ8f1IdNFdNCzaBVo';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

function getColumnIndex(rows, column) {
  var idx;
  for(idx = 0; idx < rows[0].length; ++idx)
    if(rows[0][idx].toLowerCase() === column.toLowerCase())
      break;

  return idx;
}

function getRowIndex(rows, col, value) {
  var r;
  for(r = 1; r < rows.length; ++r)
    if(rows[r][col] == value)
      break;
  return r;
}




async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  var jsonResult = [];

  for(var i = 0; i < rows.length - 1; ++i)
  {
    var row = {};

    for(var j = 0; j < rows[0].length; ++j)
    {
      row[rows[0][j]] = rows[i+1][j];
    }
    jsonResult[i] = row;
  }

  res.json(jsonResult);
}
app.get('/api', onGet);


async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.
  const result = await sheet.getRows();
  const rows = result.rows;

  var newRow = [];

  for(var key in messageBody)
  {
    newRow[getColumnIndex(rows, key)] = messageBody[key];
  }
  console.log(newRow);
  const message = await sheet.appendRow(newRow);
  res.json(message);
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;

  var col = getColumnIndex(rows, column);
  var newRow = [];
  newRow[col]= value;
  // console.log(rows[0][col]);
  // console.log(messageBody);
  for(var key in messageBody)
  {
    newRow[getColumnIndex(rows, key)] = messageBody[key];
  }
  console.log(newRow);
  const message = await sheet.appendRow(newRow);
  res.json(message);
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // TODO(you): Implement onDelete.
  const result = await sheet.getRows();
  const rows = result.rows;

  // get column index;
  var col = getColumnIndex(rows, column);
  // get row index
  var r = getRowIndex(rows, col, value);

  if(r < rows.length)
  {
    console.log(rows[r]);
    const message = await sheet.deleteRow(r);
    res.json(message);
  }
  else
  {
    console.log("not such this row");
    res.json({response: "success"});
  }
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});


