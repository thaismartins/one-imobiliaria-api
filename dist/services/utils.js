'use strict';
module.exports = {
  regexStringAccents: function(str) {
    var accents, letter, regex;
    accents = {
      'a': '[aãáâà]',
      'e': '[éẽè]',
      'i': '[iíîĩì]',
      'o': '[oóõôò]',
      'u': '[uúũûù]',
      'c': 'cç'
    };
    for (letter in accents) {
      regex = accents[letter];
      str = str.replace(new RegExp(letter, 'g'), regex);
    }
    return str;
  },
  createSlug: function(str) {
    var from, i, j, ref, to;
    if (str == null) {
      return '';
    }
    str = str.replace(/^\s+|\s+$/g, '').toLowerCase();
    from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    to = "aaaaaeeeeeiiiiooooouuuunc------";
    for (i = j = 0, ref = from.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }
};
