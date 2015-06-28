console.log("STARTING ADD-ON");
console.log("Initializing storage...");


var tab_id_to_obj = { }

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
  send_event_data('created_tab', get_tab_data(tab));
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
  if (!tab || tab.incognito || tab.status == "loading"){
    return; //Don't collect incognito data... because that's mean :(
  }

  tab_id_to_obj[tab_id] = {
    url: tab.url,
    title: tab.title,
  };
  chrome.tabs.executeScript(tab_id, {file: "data_scraper.js"}, function(arg){
    send_event_data('updated_tab', get_tab_data(tab));
  });
}

// Parameters:
//  active_info : {
//    tabId: int,
//    windowId: int
//  }
function activated_tab(active_info){
  chrome.tabs.get(active_info.tabId, function(tab){
    tab_id_to_obj[active_info.tabId] = {
      url: tab.url,
      title: tab.title,
    };
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
  if (!tab_id_to_obj[tab_id]){
    return console.log('Could not find tab info for this page');
  }
  send_event_data('removed_tab', {
    tab_id: tab_id,
    page: {
      url: tab_id_to_obj[tab_id].url,
      title: tab_id_to_obj[tab_id].title,
      highlighted: false,
    }
  });
}

chrome.tabs.onCreated.addListener(created_tab);
chrome.tabs.onUpdated.addListener(updated_tab);
chrome.tabs.onActivated.addListener(activated_tab);
chrome.tabs.onRemoved.addListener(removed_tab);


// Gets the data from a tab to send to the server
function get_tab_data(tab){
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
        switch(request.message.type){
          case "page_navigation":
            send_event_data("page_navigation", {
              tab_id: sender.tab.id,
              page: {
                url: sender.tab.url,
                referrer: request.message.referrer,
                title: sender.tab.title,
                highlighted: sender.tab.highlighted,
                html_content : JSON.stringify(request.message.html_content)
              }
            });
            break;
          case "":

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
    }, 
  });
}

