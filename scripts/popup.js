var KMapp = {};

// endpoint que devuelve las preguntas de tipo /api/v1/questions/
KMapp.questionsEndPoint = document.getElementById('qForm').action;

KMapp.init = function() {   
    // enlace para refrescar los resultados, volver a obtener las preguntas
    var refresh = document.querySelector('a.refresh');
    
    // rotamos la imagen mientras se obtienen los datos
    refresh.classList.toggle('rotate');
    
    KMapp.getResults(KMapp.questionsEndPoint);
    
    // para la rotación de la imagen
    refresh.classList.toggle('rotate');
}

KMapp.getResults = function(endpoint, data) {
    // contenedor de preguntas
    var questionsList = document.querySelector('#mainbar');
    
    endpoint += '?' + Math.random();
    var httpRequest = new XMLHttpRequest();
       
    httpRequest.open('GET', endpoint, true);
    httpRequest.responseType = 'json';
    httpRequest.setRequestHeader('Content-Type', 'multipart/form-data');
    httpRequest.send(data != null ? KMapp.getDataRequest() : null);
    httpRequest.onload = function(e) {
        var xhr = e.target;
        
        // comprueba que recibimos los datos con el tipo esperado.
        if (xhr.responseType === 'json') {
            
            // comprueba que existe alguna pregunta
            if (xhr.response.count > 0) {
                
                // limpia el contenedor
                questionsList.innerHTML = '';
                
                // convierte el array de preguntas en un conjunto de li
                questionsList.innerHTML += xhr.response.questions.map(KMapp.buildQuestion).join('');
                
                // establece el evento click de cada pregunta. Efecto acordeón
                KMapp.attachAccordionEvent();
            }
        } else {
            // algo fue mal, fin de la ejecución.
            console.log(xhr.responseText);                          
            questionsList.innerHTML = JSON.parse(xhr.responseText).message;
        }
    };
}

/***********************************
/api/v1/questions/

Returns information about all questions.

Optional parameters:

* author (<int> user id)
* scope (all|unanswered), default "all"
* sort (age|activity|answers|votes|relevance)-(asc|desc) default - activity-desc
* tags - comma-separated list of tags, without spaces
* query - text search query, url escaped
****************************************/

KMapp.getDataRequest = function () {
    var formData = new FormData();
    var text = encodeURIComponent(document.getElementById('q').value);
    var scope = document.getElementById('s').checked == true ? 'all' : 'unanswered';
    
    formData.append('query', text);
    formData.append('scope', scope);
    
    return formData;
}

// item.author.username
// item.accepted_answer_id
// item.added_at
// item.answer_count
// item.url
// item.tags <array>
// item.view_count
// item.score

KMapp.buildQuestion = function(item, index) {
    var current= new Date();
    var qDate = new Date(item.added_at*1000);
    var tags = item.tags.map(KMapp.buildTag).join('');
    
    return `
        <div class="question-summary narrow">
            <div class="cp">
                <div class="votes">
                    <div class="mini-counts"><span title="0 votos">0</span></div>
                    <div>votos</div>
                </div>
                <div class="status@unanswered">
                    <div class="mini-counts"><span title="@answer_count answers">@answer_count</span></div>
                    <div>respuestas</div>
                </div>
                <div class="views">
                    <div class="mini-counts"><span title="@view_count vistas">@view_count</span></div>
                    <div>vistas</div>
                </div>
            </div>
            <div class="summary accordion">
                <h3><a href="@url" class="question-hyperlink" title="@title">@title</a></h3>
                <div class="tags">
                    @tags
                </div>
                <div class="started">
                    <a href="" class="started-link">preguntado <span title="@added_at" class="relativetime">@relativetime por </span></a>
                    <a href="">@author</a><span class="reputation-score" title="reputation score " dir="ltr"> @score</span>
                </div>
                <div class="panel">
                    @summary
                    <div class="url"><a href="@url" title="Ver en KM">Ver en KM</a></div>
                </div>
            </div>
        </div>`
        .replace('@unanswered', item.answer_count == 0 ? ' unanswered' : item.accepted_answer_id != null ? ' answered-accepted' : ' answered')
        .split('@answer_count').join(item.answer_count)
        .split('@view_count').join(item.view_count)
        .split('@title').join(item.title)
        .replace('@author', item.author.username)
        .replace('@added_at', qDate.toLocaleString())
        .replace('@relativetime', KMapp.timeDifference(current, qDate))
        .replace('@score', item.score)
        .replace('@tags', tags)
        .replace('@summary', item.summary)
        .replace('@url', item.url);
}

KMapp.buildTag = function(item, index) {
    return `
        <a href="" class="post-tag t-@tag" title="show questions tagged '@tag'" rel="tag">@tag</a>
    `
    .split('@tag').join(item);
}

KMapp.timeDifference = function (current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    
    var elapsed = current - previous;
    
    if (elapsed < msPerMinute) return 'hace ' + Math.round(elapsed/1000) + ' segundos';   
    else if (elapsed < msPerHour) return 'hace ' + Math.round(elapsed/msPerMinute) + ' minutos';   
    else if (elapsed < msPerDay ) return 'hace ' + Math.round(elapsed/msPerHour ) + ' horas';   
    else if (elapsed < msPerMonth) return 'hace ' + Math.round(elapsed/msPerDay) + ' días';   
    else if (elapsed < msPerYear) return 'hace ' + Math.round(elapsed/msPerMonth) + ' meses';   
    else return 'hace ' + Math.round(elapsed/msPerYear ) + ' años';
}

// Añade o quita las clases "active" y "show" para dar efecto acordeón.
// Active se usa para diferenciar la pregunta seleccionada
// Show se usa para abrir el texto de la pregunta

KMapp.attachAccordionEvent = function() {
    var acc = document.querySelectorAll('.accordion');
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle('active');
            this.querySelector('div.panel').classList.toggle('show');
        }
    }
}

// lanza la aplicación
document.onload = KMapp.init();

document.querySelector('a.refresh').onclick = KMapp.init;

document.getElementById('s').onchange = KMapp.getDataRequest;
 