module.exports = {
  randomString: function(size) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i=0; i<size; ++i) {
      text += possible.charAt(Math.floor(Math.random() * 62));
    }

    return text;
  },
  randomNumber: function(size) {
    var text = '';
    var possible = '0123456789';

    for (var i=0; i<size; ++i) {
      text += possible.charAt(Math.floor(Math.random() * 10));
    }

    return text;
  }
};
