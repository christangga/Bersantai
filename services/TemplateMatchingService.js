var async = require('async');
var request = require('request');
var Q = require('q');
var cache = require('memory-cache');
var numeral = require('numeral');

var models = require('../models');
var stopwords = require('../utils/stopwords');

var sequelize = require('../models/index').sequelize;

var TemplateMatchingService = function() {}

TemplateMatchingService.prototype.tokenize = function(text) {
  var words = text.replace(/([^a-zA-Z0-9])/g, function(match) {
    return "\|" + match + "\|";
  });
  words = words.replace(/(\d)\|([\.\/])\|(\d)/g, function(match, $1, $2, $3) {
    return $1 + $2 + $3;
  });
  words = words.replace(/([^\s])\|([\-])\|([^\s])/g, function(match, $1, $2, $3) {
    return $1 + $2 + $3;
  });
  words = words.replace(/({)\|([^\s]*)\|(})/g, function(match, $1, $2, $3) {
    return $1 + $2 + $3;
  });
  words = words.split(/\|/);
  return words.filter(function(item) {
    return ['\|', ' ', '\r', '\n', '\t', ''].indexOf(item) < 0;
  });
}

TemplateMatchingService.prototype.removeStopwords = function(text, isDisemvowel) {
  if (isDisemvowel) {
    for (var i = 0; i < stopwords.length; ++i) {
      stopwords[i] = stopwords[i].replace(/[aiueo-]/gi, '');
    }
  }

  var raw = this.tokenize(text.toLowerCase());
  raw.forEach(function(item, i, raw) {
    raw[i] = raw[i].replace(/[^\x00-\x7F]/g, ''); // remove non ascii
    raw[i] = raw[i].replace(/[^a-zA-Z0-9{}]/g, ''); // remove non alphanumeric

    var disemvowel = isDisemvowel ? raw[i].replace(/[aiueo]/gi, '') : raw[i];

    if (stopwords.indexOf(disemvowel) >= 0) {
      raw.splice(i, 1);
    }
  });

  return raw.filter(function(item) {
    return item != '';
  });
}

TemplateMatchingService.prototype.divideTemplate = function(template) {
  var deferred = Q.defer();

  var regex = /[^\s\(]*\([^\)]*\)[^\s]*|[^\s\(\)]+/g;
  var matchedRegex;
  var templates = [];
  while ((matchedRegex = regex.exec(template)) !== null) {
    templates.push(matchedRegex[0]);
  }

  templates.forEach(function(template, i) {
    if (template.startsWith('(') && template.endsWith(')')) {
      template = template.substring(1, template.length - 1);
    }

    templates[i] = template.split('/');
    templates[i].forEach(function(template, j) {
      if (template.startsWith('(') && template.endsWith(')')) {
        template = template.substring(1, template.length - 1);
      }

      templates[i][j] = template.split(' ');
    });
  });

  var splittedTemplates = [];
  templates.forEach(function(template) {
    var tempSplittedTemplates = splittedTemplates.slice();
    splittedTemplates = [];

    template.forEach(function(template) {
      console.log('hai', template);
      var t = tempSplittedTemplates.slice();
      if (!t.length) {
        t.unshift(template.join(' '));
      } else {
        t.forEach(function(s, i) {
          t[i] += ' ' + template.join(' ');
        });
      }

      splittedTemplates = splittedTemplates.concat(t);
    });
  });
  console.log('PARSED TEMPLATES', splittedTemplates);

  deferred.resolve(splittedTemplates);

  return deferred.promise;
}

TemplateMatchingService.prototype.getTemplateEntities = function(table) {
  var deferred = Q.defer();

  sequelize.query('SELECT * FROM ' + table, {
    type: sequelize.QueryTypes.SELECT
  }).then(function(models) {
    var arr = {};
    models.forEach(function(model) {
      Object.keys(model).forEach(function(column) {
        if (!arr[column]) arr[column] = [];
        if (typeof model[column] === 'string') model[column] = model[column].toLowerCase();
        arr[column].push(model[column]);
      });
    });
    // console.log('TEMPLATE ENTITIES', arr);

    deferred.resolve(arr);
  });

  return deferred.promise;
}

TemplateMatchingService.prototype.matchTemplate = function(question, template, templateEntities, isPOSTag) {
  var deferred = Q.defer();

  console.log('QUESTION', question);
  console.log('TEMPLATE', template);

  var pos = 0;
  var isMatch = true;
  var entities = {};
  var mismatch = 0;
  template.forEach(function(t) {
    var isFound = false;
    if (!t.startsWith('{') || !t.endsWith('}')) { // non-entity
      while (pos < question.length && !isFound) {
        if (t.indexOf(question[pos][0]) >= 0) {
          isFound = true;
        }

        if (!isFound) {
          ++mismatch;
          ++pos;
        }
      }
      console.log('NON-ENTITY T', t, 'Q', pos < question.length ? question[pos][0] : '-');
    } else { // entity
      t = t.substring(1, t.length - 1);

      while (pos < question.length && !isFound) {
        // find matched POS Tag with current word
        var entityCandidate = [question[pos][0]];
        if (isPOSTag) {
          var i = 1;
          while (pos + i < question.length) {
            var isFoundz = false;
            var splittedTag = question[pos + i][1].split(',');
            for (var j = 0; j < splittedTag.length && !isFoundz; ++j) {
              if (question[pos][1].indexOf(splittedTag[j]) >= 0) {
                isFoundz = true;
              }
            }

            if (isFoundz) {
              entityCandidate.unshift(entityCandidate[0] + ' ' + question[pos + i][0]);
              ++i;
            } else {
              break;
            }
          }
        }

        // find question entity in database
        for (var k = 0; k < entityCandidate.length && !isFound; ++k) {
          console.log('ENTITY', t, 'Q', entityCandidate[k], 'T', templateEntities[t].join(', ') + ' ' + k);
          if (templateEntities[t].join(', ').indexOf(entityCandidate[k]) >= 0) {
            entities[t] = entityCandidate[k];
            pos += entities[t].split(' ').length - 1;
            isFound = true;
          }
        }

        if (!isFound) {
          ++mismatch;
          ++pos;
        }
      }
    }

    if (pos == question.length) {
      isMatch = false;
    } else {
      ++pos;
    }
  });

  while (pos < question.length) {
    ++mismatch;
    ++pos;
  }

  var data = null;
  if (isMatch) {
    data = {
      entities: entities,
      confidence: 1 - mismatch / question.length
    }
  }

  deferred.resolve(data);

  return deferred.promise;
}

TemplateMatchingService.prototype.pattern = function(questions, stories, config) {
  var deferred = Q.defer();

  var self = this;
  var matchedTemplates = [];
  async.each(stories, function(story, cb) {
    self.getTemplateEntities(story.category).then(function(templateEntities) {
      self.divideTemplate(story.question).then(function(realTemplates) {
        var matchedRealTemplates = [];
        async.each(realTemplates, function(realTemplate, cb) {
          var templates = self.removeStopwords(realTemplate, config.disemvowel);

          self.matchTemplate(questions, templates, templateEntities, config.pos_tag).then(function(matchedRealTemplate) {
            if (matchedRealTemplate) {
              matchedRealTemplate.story = story;
              matchedRealTemplates.push(matchedRealTemplate);
              console.log('MATCHED', matchedRealTemplate.entities, matchedRealTemplate.confidence, matchedRealTemplate.story.toJSON());
            }

            cb();
          });
        }, function() {
          // rank matched divided templates by confidence
          matchedRealTemplates.sort(function(a, b) {
            if (a.confidence > b.confidence) return 1;
            if (a.confidence < b.confidence) return -1;
            return 0;
          });

          if (matchedRealTemplates.length) {
            matchedTemplates.push(matchedRealTemplates[0]);
          }

          cb();
        });
      });
    });
  }, function() {
    matchedTemplates.sort(function(a, b) {
      if (a.confidence > b.confidence) return 1;
      if (a.confidence < b.confidence) return -1;
      return 0;
    });

    matchedTemplates = matchedTemplates.filter(function(item) {
      return item.confidence >= config.confidence_threshold;
    });

    if (matchedTemplates.length) {
      deferred.resolve(matchedTemplates[0]);
    } else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

TemplateMatchingService.prototype.POSTag = function(text) {
  var deferred = Q.defer();

  request({
    method: 'POST',
    url: 'http://bahasa.cs.ui.ac.id/postag/API/tag',
    formData: {
      'Text[value]': text
    }
  }, function(error, response, body) {
    console.log('/postag/API/tag', body);

    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);

      body.taggedText.data.slice().reverse().forEach(function(tag, i, tags) {
        if (!tag[1] || tag[1] == 'Z' || tag[1] == 'SC') {
          body.taggedText.data.splice(tags.length - 1 - i, 1);
        } else {
          tags[i].splice(2, 2);
          if (tag[0].split(' ').length > 1) {
            body.taggedText.data.splice(tags.length - 1 - i, 1);
            tag[0].split(' ').reverse().forEach(function(item) {
              body.taggedText.data.splice(tags.length - 1 - i, 0, [item, tag[1]]);
            });
          }
        }
      });

      deferred.resolve(body.taggedText.data);
    } else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

TemplateMatchingService.prototype.getResponseEntities = function(table, select, where) {
  var deferred = Q.defer();

  // setup where clause string
  var whereClause = '';
  if (Object.keys(where).length > 0) {
    whereClause = ' WHERE';
  }
  Object.keys(where).forEach(function(key) {
    if (whereClause.length > 6) {
      whereClause += ' AND ';
    } else {
      whereClause += ' ';
    }

    if (typeof where[key] === 'string' && key != 'size') {
      whereClause += key + ' ILIKE \'%' + where[key] + '%\'';
    } else {
      whereClause += key + ' = ' + where[key];
    }
  });
  // console.log(whereClause);

  // get data from database based on where clause
  sequelize.query('SELECT ' + select.join(',') + ' FROM ' + table + whereClause + ' ORDER BY ' + select.join(','), {
    type: sequelize.QueryTypes.SELECT
  }).then(function(models) {
    if (!models.length) {
      models = null;
    } else {
      models = models[0];
    }

    deferred.resolve(models);
  });

  return deferred.promise;
}

TemplateMatchingService.prototype.match = function(sender, store, question, callback) {
  var self = this;

  async.waterfall([
    function(cb) {
      store.getStories({
        where: {
          prerequisite_id: null
        }
      }).then(function(stories) {
        if (!stories.length) {
          cb('No story found.');
        } else {
          // find matched template from question
          store.getSetting().then(function(setting) {
            var config = JSON.parse(setting.tm_config);

            var questions = self.removeStopwords(question, config.disemvowel);

            self.POSTag(questions.join(' ')).then(function(taggedQuestions) {
              if (!taggedQuestions) {
                cb('Failed to tag question.');
              } else {
                var lastQuestionCache = JSON.parse(cache.get('last_question_' + sender));
                console.log('CACHE', lastQuestionCache);
                if (lastQuestionCache) {
                  store.getStories({
                    where: {
                      prerequisite_id: lastQuestionCache.story_id
                    }
                  }).then(function(requisitedStories) {
                    self.pattern(taggedQuestions, requisitedStories, config).then(function(matchedTemplate) {
                      if (!matchedTemplate) {
                        console.log('CACHE DELETE');
                        cache.del('last_question_' + sender);
                        self.pattern(taggedQuestions, stories, config).then(function(matchedTemplate) {
                          if (!matchedTemplate) {
                            cb('No matched template found.');
                          } else {
                            // console.log('MATCHED TEMPLATE', matchedTemplate);
                            cb(null, matchedTemplate.story, matchedTemplate.entities);
                          }
                        });
                      } else {
                        // console.log('MATCHED TEMPLATE', matchedTemplate, lastQuestionCache);
                        Object.keys(lastQuestionCache.entities).forEach(function(key) {
                          if (!matchedTemplate.entities.hasOwnProperty(key)) {
                            matchedTemplate.entities[key] = lastQuestionCache.entities[key];
                          }
                        });
                        cache.put('last_question_' + sender, JSON.stringify({
                          story_id: matchedTemplate.story.id,
                          entities: matchedTemplate.entities
                        }));
                        cb(null, matchedTemplate.story, matchedTemplate.entities);
                      }
                    });
                  });
                } else {
                  self.pattern(taggedQuestions, stories, config).then(function(matchedTemplate) {
                    if (!matchedTemplate) {
                      cb('No matched template found.');
                    } else {
                      // console.log('MATCHED TEMPLATE', matchedTemplate);
                      cache.put('last_question_' + sender, JSON.stringify({
                        story_id: matchedTemplate.story.id,
                        entities: matchedTemplate.entities
                      }));
                      cb(null, matchedTemplate.story, matchedTemplate.entities);
                    }
                  });
                }
              }
            });
          });
        }
      });
    },
    function(story, entities, cb) {
      var select = [];
      var where = {};

      // find entities in response
      story.response.split(' ').forEach(function(word) {
        var result = /{(.*?)}/.exec(word);
        if (result) {
          word = result[1];
          if (entities.hasOwnProperty(word)) {
            where[word] = entities[word];
          } else {
            select.push(word);
          }
        }
      });

      if (!select.length) {
        cb(null, story, entities);
      } else {
        self.getResponseEntities(story.category, select, where).then(function(responseEntities) {
          if (!responseEntities) {
            cb('No entities found.');
          } else {
            Object.keys(responseEntities).forEach(function(key) {
              entities[key] = responseEntities[key];
            });

            cb(null, story, entities);
          }
        });
      }
    },
    function(story, entities, cb) { // response generator
      var response = {
        type: 'text',
        // type: story.response_type,
        body: story.response
      }

      Object.keys(entities).forEach(function(key) {
        if (key == 'price') {
          entities[key] = entities[key].toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR'
          });
        }

        response.body = response.body.replace(new RegExp('{' + key + '}', 'gi'), entities[key]);
      });

      cb(null, response);
    }
  ], function(err, response) {
    if (err) {
      console.error(err);

      callback();
    } else {
      callback(response);
    }
  });
}

module.exports = new TemplateMatchingService();

// todo:
// otomatis post ke page kalo ada perubahan
// promo otomatis
// kalo stok abis, jawabannya beda
// report
// 
// done:
// pos tagger
// kalo ga bisa jawab bisa contact CS
// get started
// multiple question
// pertanyaan yang cuman bisa ditanya kalo sebelumnya udah
// 
// saran:
// konteks pertanyaan (coreference resolution)
// ML
// 
// 
// 
// list semua kemungkinan pertanyaan
// 
//
// benerin caching system
//
