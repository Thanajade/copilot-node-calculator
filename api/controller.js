'use strict';

exports.calculate = function (req, res) {
  req.app.use(function (err, _req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    res.status(400);
    res.json({ error: err.message });
  });

  var operations = {
    'add': function (a, b) { return Number(a) + Number(b) },
    'subtract': function (a, b) { return a - b },
    'multiply': function (a, b) { return a * b },
    'divide': function (a, b) { return a / b },
    'power': function (a, b) { return Math.pow(a, b) },
    'toBinary': function (a) { return parseInt(a).toString(2) },
    'toDecimal': function (a) { return parseInt(a, 2).toString() }
  };

  if (!req.query.operation) {
    throw new Error("Unspecified operation");
  }

  var operation = operations[req.query.operation];

  if (!operation) {
    throw new Error("Invalid operation: " + req.query.operation);
  }

  // Validate operand1 for all operations
  if (!req.query.operand1 ||
    !req.query.operand1.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
    req.query.operand1.replace(/[-0-9e]/g, '').length > 1) {
    throw new Error("Invalid operand1: " + req.query.operand1);
  }

  // Only validate operand2 for operations that need it
  if (!['toBinary', 'toDecimal'].includes(req.query.operation)) {
    if (!req.query.operand2 ||
      !req.query.operand2.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand2.replace(/[-0-9e]/g, '').length > 1) {
      throw new Error("Invalid operand2: " + req.query.operand2);
    }
  }

  // Call operation with appropriate number of arguments
  const result = ['toBinary', 'toDecimal'].includes(req.query.operation)
    ? operation(req.query.operand1)
    : operation(req.query.operand1, req.query.operand2);

  res.json({ result: result });
};
