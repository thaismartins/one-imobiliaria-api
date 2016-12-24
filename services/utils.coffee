'use strict'

module.exports =
  regexStringAccents: (str) ->

    accents = {'a': '[aãáâà]', 'e': '[éẽè]', 'i': '[iíîĩì]', 'o': '[oóõôò]','u': '[uúũûù]', 'c': 'cç'}

    for letter, regex of accents
      str = str.replace(new RegExp(letter, 'g'), regex)
    return str

  createSlug: (str) ->

    return '' if not str?

    str = str.replace(/^\s+|\s+$/g, '').toLowerCase()

    from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    to   = "aaaaaeeeeeiiiiooooouuuunc------";
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i)) for i in [0..from.length]

    str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');