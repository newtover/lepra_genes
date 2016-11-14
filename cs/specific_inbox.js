console.info('Lepra Genes: cs/specific_inbox.js started');

function getPostNode(){ return document.querySelector('.inbox.u68061'); }

function getFirstComment(){ return document.querySelector('.comment.u68061'); }

function getReaders(){ return document.querySelectorAll('#js-inbox_controls_users .b-inbox_controls_user a'); }

function SendInboxUpdates(){
    // check if the inbox is from robopupsique
    var postNode = getPostNode();
    if (!postNode){ return; };

    var inbox = {
        post_id: /\/my\/inbox\/(\d+)\//.exec(location.pathname)[1]
    }
    var firstComment = getFirstComment();
    let genes = {};
    if (firstComment){
        let gender = /существо\s+(мужского|женского)\s+пола/.exec(firstComment.innerText);
        if (gender){
            inbox.gender = gender[1].substring(0, 1);
        }
    }
    getReaders().forEach((userNode) => {
        let gene = {
            user_id: userNode.dataset.user_id,
            login: userNode.innerText

        }
        if (userNode.parentNode.classList.contains('b-inbox_controls_user_visited')){
            gene.visited = true;
        }
        genes[gene.user_id] = gene;
    });
    inbox.genes = genes;
    console.log(JSON.stringify([inbox], null, ' '));
    sendToBG('Inboxes from robopupsique', [inbox]);
}


function main(){
    SendInboxUpdates();
}

main();
