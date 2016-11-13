console.info('Lepra Genes: cs/redirect.js started');

function handleMessage(message, sender){
    if (message.header == 'Please, redirect!'){
        location.href = message.body;
        chrome.runtime.onMessage.removeListener(handleMessage);
    }
    console.log('redirect', message);
}

if (!chrome.runtime.onMessage.hasListener(handleMessage)){
    chrome.runtime.onMessage.addListener(handleMessage);
}

