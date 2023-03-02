var form0, inputbox, features, char_result, word_result = null;
const FEATURE_SET = ['yue_unique', , 'yue_feature', 'yue_exclude', 'hkzh_feature', 'hkzh_exclude', 'allquotes'];

function init() {
    form0 = document.querySelector('form[name="input_form"]');

    features = {};
    inputbox = form0.querySelector('textarea[name="inputbox"]');
    inputbox.addEventListener('keyup', reparse, false);

    FEATURE_SET.forEach( (feature_name) => {
        features[feature_name] = form0.querySelector('textarea[name="' + feature_name + '"]');
        features[feature_name].addEventListener('keyup', reparse, false);
    });

    word_result = document.querySelector('p[id="word_result"]');
    statistics = document.querySelector('p[id="statistics"]');
    word_result.parser = new Parser(complete_list, features);
    reparse();
}

function reparse() {
    word_result.innerHTML = word_result.parser.parse(inputbox.value);
    reclassify();
    statistics.innerHTML = updateStat();
}

function updateStat(){
    word_elements = document.querySelectorAll('.word:not(._alphanum__)');
    let wordSet = new Set([]);
    let wordTypeCount = {good:0, above:0, at:0}; 
    let wordTokenCount = {good:0, above:0, at:0}; 
    word_elements.forEach((element, i) => {
        if (element.className.match(/gr_[1-9]|_unknown__/)){
            wordTokenCount.above++;
        } else {
            wordTokenCount.good++;
            if (element.className.match(/gr_0/))
                wordTokenCount.at++;
        }
        if (!wordSet.has(element.innerHTML)){
            if (element.className.match(/gr_[1-9]|_unknown__/)){
                wordTypeCount.above++;
            } else {
                wordTypeCount.good++;
                if (element.className.match(/gr_0/))
                    wordTypeCount.at++;
            }
            wordSet.add(element.innerHTML)
        }
    });
    return 'Total number of words:' + word_elements.length + '<br>' +
        '範圍內（詞數） Within Range (Token) ' + wordTokenCount.good + '/' + word_elements.length +' (' + Math.round(wordTokenCount.good*100/word_elements.length,1) + '%)<br>' +
        '範圍內（詞類） Within Range (Type)  ' + wordTypeCount.good + '/' + wordSet.size +' (' + Math.round(wordTypeCount.good*100/wordSet.size,1) + '%)<br>' +
        '<hr></hr>'+
        '指定等級（詞數） At Level (Token) ' + wordTokenCount.at + '/' + word_elements.length +' (' + Math.round(wordTokenCount.at*100/word_elements.length,1) + '%)<br>' +
        '指定等級（詞數） At Level (Type)  ' + wordTypeCount.at + '/' + wordSet.size +' (' + Math.round(wordTypeCount.at*100/wordSet.size,1) + '%)<br>';

}

function reclassify() {
    let level = 0;
    //remove all gr- classes
    gr_elements = document.querySelectorAll('[class*="gr_"]');
    for (let i = 0; i < gr_elements.length; ++i) {
        element = gr_elements[i];
        element.className = element.className.replace(/ *gr_-?[0-9]/g, "");
    }
    let MINLEVEL = 0, MAXLEVEL = 10, MINGR = -9, MAXGR = 9;
    for (let l = MINLEVEL; l <= MAXLEVEL; l++) {
        i = l - level;
        if (i > MAXGR) i = MAXGR;
        if (i < MINGR) i = MINGR;
        target = category+'__'+l;
        target_elements = document.querySelectorAll('[class*="'+target+'"]');
        for (let j = 0; j < target_elements.length; ++j) {
            element = target_elements[j];
            element.className = element.className + " gr_" + i;
        }
    }

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })
}

window.addEventListener('load', init, false);