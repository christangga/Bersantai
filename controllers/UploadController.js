var UploadController = function() {}

UploadController.prototype.sendFile = function(req, res) {
  var options = {
    root: './uploads/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function(err) {
    if (err) {
      console.error(err);

      res.status(err.status).end();
    } else {
      console.log('Sent:', fileName);
    }
  });
}

module.exports = new UploadController();
