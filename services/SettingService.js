var Q = require('q');

var SettingService = function() {}

SettingService.prototype.createOrFind = function(user, store) {
  var deferred = Q.defer();

  store.getSetting().then(function(setting) {
    if (!setting) {
      store.createSetting({
        greeting_text: 'Selamat datang di ' + store.name + '. Silahkan pilih Get Started untuk memulai!',
        welcome_message: JSON.stringify({
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: 'Halo, perkenalkan saya Mark. Saya adalah asisten virtual yang akan membantu dalam menjawab pertanyaan kamu. Silahkan tanya atau pilih untuk memulai!',
              buttons: [{
                type: 'web_url',
                url: store.link,
                title: store.name
              }, {
                type: 'postback',
                title: 'Jelajah Produk',
                payload: 'RANDOM_PRODUCTS'
              }]
            }
          }
        }),
        contact_message: JSON.stringify({
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: 'Mohon maaf, Mark belum dapat menjawab pertanyaan kamu. Tapi jangan kuatir, kamu dapat langsung menghubungi pemilik ' + store.name + '!',
              buttons: [{
                type: 'web_url',
                url: user.link,
                title: user.name
              }]
            }
          }
        }),
        tm_config: JSON.stringify({
          disemvowel: true,
          pos_tag: true,
          confidence_threshold: 0.3
        })
      }).then(function(setting) {
        deferred.resolve(setting, true);
      });
    } else {
      deferred.resolve(setting, false);
    }
  });

  return deferred.promise;
}

module.exports = new SettingService();
