var database = {};

function execJS(path){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {file: path});
        console.log('execJS', path);
    });
}

function sendToActiveTab(header, body) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {header: header, body: body});
        console.log('sent to tab', tabs[0].id, header);
    });
}

function onPathname(url){
    document.getElementById('pathname').textContent = url.pathname;
    console.log('onPathname', url.host + url.pathname);
    if (url.host != 'leprosorium.ru') { return; };
    if (url.pathname == '/my/inbox/') {
        sendToActiveTab('I need inboxes from robopupsique');
    } else {
        sendToActiveTab('Hello!', url.pathname);
    };
}

function onInboxes(inbox_list){
    // надо смержить с тем, что уже есть: 
    // - добавить недостающие инбоксы, 
    // - в существующих обновить поля, 
    // - отрисовать изменения в интерфейсе
    console.log('new inboxes', js(inbox_list))
    upsertPosts(inbox_list);
    console.log('database', js(database));
    renderPopup();
}

function handleMessage(message, sender) {
    switch (message.header) {
        case 'pathname':
            onPathname(message.body);
            break;
        case 'Inboxes from robopupsique':
            onInboxes(message.body);
            break;
        default:
            console.log('handleMessage', message, sender);
    }
}

chrome.runtime.onMessage.addListener(handleMessage);
execJS('cs/get_pathname.js');

window.addEventListener('click', function(e){
    if (!e.target.classList.contains("href")){
        return;
    }
    execJS('cs/redirect.js');
    setTimeout(sendToActiveTab, 500, 'Please, redirect!', e.target.getAttribute('href'));
    // sendToActiveTab('Please, redirect!', e.target.getAttribute('href'));
});


var js = obj => JSON.stringify(obj, null, ' ');
var jsl = obj => {console.log(js(obj));}

function upsertPosts(posts) {
    for (let post of posts){
        let db_post = database[`post:${post.post_id}`];
        if (db_post){
            let needsUpdate = false;
            for (let key of Object.keys(post)){
                if (post[key] !== db_post[key]){
                    needsUpdate = true;
                    db_post[key] = post[key];
                }

            }
            if (needsUpdate){
                database[`post:${post.post_id}`] = db_post;
            }
        } else {
            //append post
            database[`post:${post.post_id}`] = post;
            if (!database.generations || !database.generations[post.generation]){
                if(!database.generations){
                    database.generations = {};
                }
                database.generations[post.generation] = [];
            }
            database.generations[post.generation].push(`post:${post.post_id}`);
        }
//        jsl(post.post_id);
    }
}

function listInboxes(){
    var generations = database.generations || {};
    if (!Object.keys(generations).length){
        return [];
    };
    const inboxes = [];
    for (let key of Object.keys(generations).map(x => Number(x)).sort((a, b) => b - a)){
        const gen = {
            generation: key,
            posts: [],
        };
        const posts = [];
        for (const post_id of generations[String(key)].slice().sort()){
            const db_post = database[post_id];
            const post = {
                "post_id": db_post.post_id,
                "comments": db_post.comments,
                "new_comments": db_post.new_comments || 0,
                "gender": db_post.gender || 'unk'
            };
            gen.posts.push(post);
            //jsl(post_id)
        }
        inboxes.push(gen);
    };
    return inboxes;
}

const ce = React.createElement;

class Inbox extends React.Component {
    render(){
        const post = this.props;
        const comments = ce('a', {
            href: `https://leprosorium.ru/my/inbox/${post.post_id}/`,
            className: 'href',
        }, post.comments);
        return ce('div', {className: "inbox"}, `${post.post_id} (${post.gender}) `, comments, `/${post.new_comments}`);
    }
}

class Generation extends React.Component {
    render(){
        let index = this.props.generation;
        if (index == 1000){
            index = 'unk';
        }
        const inboxList = this.props.posts.map((post) => {
            return ce(Inbox, post);
        });
        return ce('div', {className: "generation"}, `[поколение ${index}]`, inboxList);
    }
}

class GenerationList extends React.Component {
    render(){
        const infoList = []
        const genList = this.props.generations.map((gen) => {
            return ce(Generation, gen);
        });
        if (!genList.length){
            infoList.push(ce('p', null, 'Пока нечего отобразить. Надо зайти к себе в inbox (выше есть ссылка). Галочку "только новое" нужно снять, чтобы плагин узнал про уже прочитанные инбоксы.'));
            infoList.push(ce('p', null, 'Если не все инбоксы умещаются на первую страницу, а информация из них нужна, нужно подсосать их на страницу кнопкой "Еще, еще", а потом снова открыть плагин.'));
        } else {
            infoList.push(ce('p', null, 'Теперь надо обойти инбоксы, чтобы вытащить из них дополнительную информацию.'));
        }
        return ce('div', null, infoList, genList);
    }
}

function renderPopup(){
    ReactDOM.render(
      ce(GenerationList, {generations: listInboxes()}),
      document.getElementById('content')
    );
}
