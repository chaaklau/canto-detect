class Word {
  constructor(json, all_tags){
    this.word = json.word;
    this.spelling = json.spelling;
    this.tags = [];
    for (let i = 0; i < json.tags.length; ++i) {
      let t = all_tags.retrieve(json.tags[i]);
      this.tags.push(t);
      t.addMember(this);
    }
  }
}

class Tags {
  // Singleton
  constructor() {
    if (!Tags.instance) {
      this.tags = {};
      Tags.instance = this;
    }
    return Tags.instance;
  }
  retrieve(tag) {
    let label = tag.toString();
    if (!this.tags[label]) {
      this.tags[label] = new Tag(tag);
    }
    return this.tags[label];
  }
}

class Tag {
  constructor(str) {
    this.name = str.split('__')[0];
    this.label = str.split('__')[1] || '';
    this.members = new Set();
  }
  addMember(word) {
    if (word.constructor.name == 'Word') {
      this.members.add(word);
    }
  }
  listMembers(){
    return this.members.toArray();
  }
  toString(){
    return this.name + '__' + this.label
  }
}

class Wordlist {
  words = [];
  instance = null;
  tags = new Tags();
  constructor(json){
    for (let i = 0; i < json.length; ++i) {
      this.words.push(new Word(json[i]));
    }
  }
  statistics(){
    let stat = {};
    return stat;
  }
}

// export Wordlist;
// export Word;
// export Tag;
// export Tags;
//let list = new Wordlist([{word: "大", spelling: "daai6", tags: ['',t2]},{word: "小", spelling: "daai6", tags: [t2,t3]}])

