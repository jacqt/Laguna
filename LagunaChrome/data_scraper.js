
var __laguna_scraper_url = true;

console.log('Running the data scraper...');
function send_message(message_to_send){
  chrome.runtime.sendMessage({source: window.location, message: message_to_send});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    switch  (request.message){
      case "start":
        deletePost();
      break;
      case "trialExpired":
        setTimeout(function(){alert("Sorry you've already removed your free 20 activites already. Please consider supporting me by unlocking this add-on for just $2.49!");}, 100);
      break;
      default:
        if (request.message.startmth != null){
        options_obj = request.message;
        console.log("Options Object:");
        console.log(options_obj);
      }
      break;
    }
  });
