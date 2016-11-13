console.info('Lepra Genes: cs/get_pathname.js started');

function sendToBG(header, body){
    chrome.runtime.sendMessage({header: header, body: body})
}

sendToBG('pathname', {host: location.host, pathname: location.pathname});

