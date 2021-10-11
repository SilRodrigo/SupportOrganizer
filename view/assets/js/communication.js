var serverConnection = setInterval(updateOpenSupports, 2000);
var comunicando = false;

async function updateOpenSupports() {
    if (comunicando) {
        let response = await fetch('/pendingSupports', {
            method: 'GET'
        });
        let retorno = await response.json();		
        if (retorno.status != 200) {
            redirecionar();
            return alert('Erro na comunicação');
        }
        listIntegrity(retorno.dbObject);
        return enlistIncomeSupports(retorno.dbObject);
    }
}

async function updateMySupports() {
    let response = await fetch('/updateSupports', {
        method: 'GET'
    });
    let retorno = await response.json();
    if (retorno.status != 200) return alert(retorno.serverMessage)
    return enlistMySupports(retorno.dbObject, true);
}

async function pageResources() {
    let response = await fetch('/pageResources', {
        method: 'GET'
    });	
    let retorno = await response.json();	
    listCompanies(retorno.dbObject.companies);
}

async function report(date, status) {
    /* generateReport({start : '2021-01-01', end : '2021-01-07'}, 3) */
    let data = {
        url: 'report',
        params: {
            start: date.start,
            end: date.end,
            status: status
        }
    }
    let queryParam = encodeQuery(data);
    window.location.href = '/' + queryParam;
}

async function supportTaken(suppId) {
    let response = await fetch('/supportTaken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ 'id': suppId })
    });
    let retorno = await response.json();
    return retorno.status === 200 ? updateMySupports() : redirecionar();
};

async function registerNewSupport(data) {
    let response = await fetch('/register/new/support', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    });
    let retorno = await response.json();
};

async function registerQuickSupport(data) {
    let response = await fetch('/registerQuickSupport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    });
    let retorno = await response.json();
    console.log(retorno)
    updateMySupports();
};

async function sendExcludeSupport(data) {
    let response = await fetch('/excludeSupport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ id: data })
    });
    let retorno = await response.json();
};

async function registerUpdateSupport(data) {
    let response = await fetch('/updateStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    });
    let retorno = await response.json();
    redirecionar();
    if (retorno.status !== 200) alert(retorno.serverMessage);
};

function redirecionar() {
    window.location.href = '/main';
}

function logout() {
    window.location.href = '/logout';
}

updateMySupports();
pageResources();