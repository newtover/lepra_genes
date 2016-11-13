console.info('Lepra Genes: cs/list_inboxes.js started');

function getContainer(){
    return document.querySelector('#js-posts_holder');
}

function handleMessage(message, sender){
    if (message.header == 'I need inboxes from robopupsique'){
        sendRoboInboxes(); 
    } else {
        console.info('handleMessage', message.header, message.body);
    }
}

function sendRoboInboxes(){
    var robo_inboxes = extractRoboInboxes();
    sendToBG('Inboxes from robopupsique', robo_inboxes);
}

function extractRoboInboxes(){
    var container = getContainer();
    // all inboxes from robopupsique
    var nodes = container.querySelectorAll('.inbox.u68061');
    var robo_inboxes = [];
    nodes.forEach(function (inbox_node){
        var inbox = {
          post_id: null,
          generation: 1000,
//          comments: 0,
//          new_comments: 0,
//          game_id: null,
//          gender: null
        }
        inbox.post_id = inbox_node.id.substring(1);  // strip "p" in "p2111676"
        this.push(inbox);
        var match = /\[поколение (\d+)\]/.exec(inbox_node.innerText);
        if (match){
            inbox.generation = Number(match[1]);  
        };
        match = /^(\d+)\s+комментар/.exec(inbox_node.querySelector('.b-post_comments_links').innerText)
        if (match){
            inbox.comments = Number(match[1]);
        } else {
            console.warn(inbox_node.querySelector('.b-post_comments_links').innerText);  
        };
        var unread = inbox_node.querySelector('.b-post_comments_links a[href$="?unread=on"]');
        if (unread){
            inbox.new_comments = /^(\d+)\s+нов/.exec(unread.innerText)[1].toInt();
        }
    }, robo_inboxes);
    console.log(JSON.stringify(robo_inboxes, null, ' '));
    return robo_inboxes;
}

function main() {
    if (!chrome.runtime.onMessage.hasListener(handleMessage)){
        chrome.runtime.onMessage.addListener(handleMessage);
    }

    var target = getContainer();
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                sendRoboInboxes();
                observer.disconnect();
            }
        });    
    });
    var config = { childList: true };
    observer.observe(target, config);    
    
}

main();
