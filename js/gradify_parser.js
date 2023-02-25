class Parser {

  // Greedy Parser

  constructor(wordlist, options){
    this.wordlist = wordlist;
    this.alltags = new Tags();
    this.options = options;
    this.highlight = {};
    this.buildTrie(wordlist);
    this.buildHash(wordlist);
  }

  buildHash(wordlist){
    //assuming the words will only appear once
    this.hash = []
    for (let i = 0; i < wordlist.length; ++i) {
      this.hash[wordlist[i].word] = new Word(wordlist[i], this.alltags);
    }
  }

  buildTrie(wordlist) {
    this.trie = new Trie();
    for (let i = 0; i < wordlist.length; ++i) {
      this.trie.insert(wordlist[i].word);
    }
  }

  setHighlight(tag, style) {
    this.highlight[tag] = style;
  }

  parse(string) {
    let json = [];
    for (let i = 0; i < string.length;){
      let m = 0;
      let maxmatch = '';
      let teststring ;
      while (i + m < string.length && 
              this.trie.find(teststring = string.substr(i,m+1)).length > 0) {
        if (this.trie.contains(teststring)) {
          maxmatch = teststring;
        }
        ++m;
      }
      m = maxmatch.length;
      if (m == 0) {
        // Character not found

        // Check Letters / Numbers
        while (i + m < string.length &&
          string.substr(i,m+1).match(new RegExp('[ -~]{'+ (m+1) + '}','g'))) {
          ++m
        }
        if (m > 0) {
          json.push(new Word({ 'word': string.substr(i,m), 'tags': ['_alphanum'] }, this.alltags));
          i += m;
        }
        else {
          while (i + m < string.length &&
            string.substr(i,m+1).match(new RegExp('[\u0000-\u001F\u007F-\u2e7f]{'+(m+1)+'}','g'))) {
            ++m
          }
          if (m > 0) {
            json.push(new Word({ 'word': string.substr(i,m), 'tags': ['_misc'] }, this.alltags));
            i += m;
          }
          else {
            json.push(new Word({ 'word': string.substr(i,m+1), 'tags': ['_unknown'] }, this.alltags));
            ++i;
        }
        }
      }
      else {
        let the_match = this.hash[maxmatch];
        let status = {};
        for (const [key, value] of Object.entries(this.options)) {
          status[key] = maxmatch.match(new RegExp(value.value)) != null;
        }
        if (status['yue_unique'] && !status['yue_exclude']){
          the_match.tags.push(new Tag('yue__1'));  
        } else if (status['yue_feature'] && !status['yue_exclude']){
          the_match.tags.push(new Tag('yue__2')); 
        } else if (status['hkzh_feature'] && !status['hkzh_exclude']){
          the_match.tags.push(new Tag('hkzh__2'));
        }
        json.push(this.hash[maxmatch]);
        i += m;
      }
    }
    return this.format(json);
  }

  format(json) {
    let str = ''
    for (let i = 0; i < json.length; ++i){
      if (this.alltags) {
        if (json[i].word == ' '){
          // Skip space
        }
        else if (json[i].tags && json[i].tags.length) {
          // console.log(json[i].tags);
          // console.log(json[i].word, json[i].tags.map(x => x.toString()).join(' '));
          let tag_string = json[i].tags.map(x => x.toString()).join(' ');
          str = str + '<span style="margin-right:2px;" data-toggle="tooltip" data-html="true" title="' + tag_string + '" class="word '+ tag_string  + '">' + json[i].word.replace(/[\n\r]/g,'<br>') + '</span>';  
        } else {
          str = str + json[i].word.replace(/[\n\r]/g,'<br>')
        }
      }
    }
    return str
  }

}