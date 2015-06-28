
if (!__laguna_scraper_url){ // Ensure that only one scraper instance is running at any given time
  var __laguna_scraper_url = true; 
  RunScraper();
} 


function RunScraper(){
  console.log('Running the data scraper...');
  
  console.log('Referred by', document.referrer);

  if (document.referrer){ // User clicked a link to get here
    send_message({
      type: 'page_navigation',
      referrer: document.referrer,
    });
  }

  window.onhashchange = function(event){
    send_message({
      type: 'page_navigation',
      referrer: document.referrer
    });
  }
  function send_message(message_to_send){
    chrome.runtime.sendMessage({source: window.location, message: message_to_send});
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
