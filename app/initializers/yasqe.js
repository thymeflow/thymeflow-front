import YASQE from 'yasqe';

// Monkey patch Trie library used by YASQE, which does not work properly
// due to Ember's extension of JavaScript Arrays, and unsafe property iteration of the Trie library.
// Refer to https://github.com/OpenTriply/YASGUI.YASQE/issues/95
export function initialize() {
  let textarea = document.createElement("textarea");
  let yasqe = YASQE.fromTextArea(textarea);

  // Monkey patch Trie library used by YASQE, which does not work properly
  // due to Ember's extension of JavaScript Arrays, and unsafe property iteration of the Trie library.
  Object.getPrototypeOf(yasqe.autocompleters.getTrie("prefixes")).getAllWords = function(str) {
    var T = this,
      k,
      child,
      ret = [];
    if(str === undefined) {
      str = "";
    }
    if(T === undefined) {
      return [];
    }
    if(T.words > 0) {
      ret.push(str);
    }
    for(k in T.children) {
      if (T.children.hasOwnProperty(k)){ // Monkey patch here
        child = T.children[k];
        ret = ret.concat(child.getAllWords(str + k));
      }
    }
    return ret;
  };
  yasqe.toTextArea();
}

export default {
  name: 'trie-monkey-patch',
  initialize: initialize
};