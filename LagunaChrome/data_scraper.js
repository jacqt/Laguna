
if (!__laguna_scraper_url){ // Ensure that only one scraper instance is running at any given time
  var __laguna_scraper_url = true; 
  RunScraper();
}  else {
  console.log('Already running a scraper');
}


function RunScraper(){
  console.log('Running the data scraper...');
  
  console.log('Referred by', document.referrer);

  if (document.referrer){ // User clicked a link to get here
    send_message({
      type: 'page_navigation',
      referrer: document.referrer,
      html_content : GetHtmlContent()
    });
  } else {
    send_message({
      type: 'page_navigation',
      referrer: null,
      html_content : GetHtmlContent()
    });
  }

  window.onhashchange = function(event){
    send_message({
      type: 'page_navigation',
      referrer: document.referrer,
      html_content : GetHtmlContent()
    });
  }
  function send_message(message_to_send){
    console.log(GetHtmlContent());
    chrome.runtime.sendMessage({source: window.location, message: message_to_send});
  }

  function GetHtmlContent(){
    var meta_tags = document.querySelectorAll('meta');
    var meta_tag_objs = [];
    for (var i = 0; i != meta_tags.length; ++i){
      var meta_tag = meta_tags[i];
      var meta_tag_obj = { };

      for (var j = 0; j != meta_tag.attributes.length; ++j){
        meta_tag_obj[meta_tag.attributes[j].name] = meta_tag.attributes[j].value;
        meta_tag_objs.push(meta_tag_obj);
      }
    }

    return {
      meta_tags : meta_tag_objs,
      h1_tags: GetTags('h1'),
      h2_tags: GetTags('h2'),
      h3_tags: GetTags('h3'),
      length: document.body.length
    };
  }

  function GetTags(tag_name){
    var tags = document.querySelectorAll(tag_name);
    var tag_objs = [];
    for (var i = 0; i != tags.length; ++i){
      tag_objs.push(tags[i].textContent);
    }
    return tag_objs;
  }

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
      switch  (request.message){
        default:
          if (request.message.startmth != null){
          options_obj = request.message;
          console.log("Options Object:");
          console.log(options_obj);
        }
        break;
      }
    });
}
