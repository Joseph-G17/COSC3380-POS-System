const Reports = require('../models/reportModel');

async function getReport(req, res, report, filters){
  try{
    if(!Reports.REPORTS[report]) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({message:'Report not found!'}));
    }
    const rows = await Reports.findReport(report, filters);

    res.writeHead(200, {'Content-Type': 'applicaton/json'});
    res.end(JSON.stringify(rows));
  } catch(error){
    console.log(error);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: error.sqlMessage || 'Could not load report!'}));
  }
}

module.exports = {
  getReport
}