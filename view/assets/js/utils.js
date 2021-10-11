var play = true;
var mySupports;
const notification = 'https://res.cloudinary.com/bonanza/video/upload/v1609454379/Item1_tb1du5.m4a'

// GENERAL TOOLS //

function encodeQuery(data) {
    let query = data.url + '?'
    for (let d in data.params)
        query += 'param='
            + encodeURIComponent(data.params[d]) + '&';
    return query.slice(0, -1)
}

function getDataFromElement(element) {
    let supportData = new Object();
    supportData.id = element.querySelector('.support').id;
    supportData.name = element.querySelector('.name-meta').innerText;
    supportData.company = element.querySelector('.company-meta').innerText;
    supportData.date = element.querySelector('.date-meta').innerText;
    supportData.time = element.querySelector('.time-meta').innerText;
    supportData.comment = element.querySelector('.comment-meta').innerText;
    supportData.status = parseInt(element.querySelector('.status-meta').innerText);
    if (supportData.status > 2) {
        supportData.closureDate = element.querySelector('.closureDate-meta').innerText;
        supportData.closureTime = element.querySelector('.closureTime-meta').innerText;
        supportData.resolution = element.querySelector('.resolution-meta').innerText;
    }
    return supportData;
}

function cleanForm(forms, fields) {
    if (forms && fields && fields[0]) {
        forms.forEach(form => {
            fields.forEach(field => {
                let subjects = form.querySelectorAll(field);
                subjects.forEach(subject => {
                    $(subject).val('');
                })
            })
        })
    }
}

function cleanSupportList(list) {
    document.getElementById(list).innerHTML = '';
}

function deleteOpenSuppElem(data) {
    document.getElementById(data.id).remove();
}

function deleteMySuppElem(data) {
    document.getElementById('selecSupp' + data.id).remove();
}

function calendar() {
    let today = new Date();
    let calendar = new Object();
    calendar.currentDate = getCurrentDate(today);
    calendar.currentTime = (today.getHours() < 10 ? '0' : '') + today.getHours() + ":" + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
    return calendar;
}

function getFirstMonday() {
    let date = new Date();
    var day = date.getDay(), diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday    
    let monday = new Date(date.setDate(diff));
    return getCurrentDate(monday)
}

function getFirstFriday() {
    date = new Date();
    var day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -2 : 5); // adjust when day is sunday
    let friday = new Date(date.setDate(diff));
    return getCurrentDate(friday)
}

function getCurrentDate(date) {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function formIsEmpty(forms, fields) {
    return new Promise((resolve, reject) => {
        let formulario = [];
        if (forms && fields && fields[0]) {
            forms.forEach(form => {
                fields.forEach(field => {
                    let subjects = form.querySelectorAll(field);
                    subjects.forEach(subject => {
                        if (!$(subject).val()) { return reject(subject) };
                        formulario.push($(subject).val());
                    })
                })
            })
        }
        return resolve(formulario)
    })
}

function orderByDate(obj, sortOrder) {//1 cres, 2 decres
    switch (sortOrder) {
        case 1:
            obj.sort((a, b) => {
                if (a.date > b.date) return 1
                if (a.date < b.date) return -1
                if (a.time < b.time) return 1
                if (a.time > b.time) return -1
            })
            break;
        case 2:
            obj.sort((a, b) => {
                if (a.date < b.date) return 1
                if (a.date > b.date) return -1
                if (a.time < b.time) return 1
                if (a.time > b.time) return -1
            })
            break;
    }
}

// ENLIST //

function enlistIncomeSupports(suppList) {
    if (suppList && suppList[0]) {
        suppList.forEach(e => {
            if (!document.getElementById(e._id)) {
                playSound(notification);
                return enlistSupport(e, 'newSupportIncomeElementExample', 'newSupp', 'newSupportList');
            }
        })
    }
}

function enlistMySupports(suppList, refresh) {
    if (refresh) {
        mySupports = suppList;
        cleanSupportList('mySupportList')
        cleanSupportList('closureSupportList')
    }
    if (suppList && suppList[0]) {
        orderByDate(suppList, 1)
        suppList.forEach(e => {
            if (!document.getElementById(e._id) && e.status === 2) return enlistSupport(e, 'mySupportIncomeElementExample', 'mySupp', 'mySupportList');
        })
        orderByDate(suppList, 2)
        suppList.forEach(e => {
            if (!document.getElementById(e._id) && e.status === 3) return enlistSupport(e, 'closureSupportIncomeElementExample', 'closureSupp', 'closureSupportList');
        })
    }
}

function enlistSupport(data, headElement, attribution, listName) {
    let element = document.getElementById(headElement);
    let newSuppElem = element.cloneNode(true);
    newSuppElem.id = attribution + data._id;
    newSuppElem.querySelector("#" + attribution + "Number").id = data._id;
    newSuppElem.querySelector(".time-meta").innerText = data.time;
    newSuppElem.querySelector(".name-meta").innerText = data.name;
    newSuppElem.querySelector(".company-meta").innerText = data.company;
    newSuppElem.querySelector(".date-meta").innerText = data.date;
    newSuppElem.querySelector(".comment-meta").innerText = data.comment;
    newSuppElem.querySelector(".status-meta").innerText = '' + data.status;
    if (data.status > 2) {
        newSuppElem.querySelector(".closureDate-meta").innerText = '' + data.closureDate;
        newSuppElem.querySelector(".closureTime-meta").innerText = '' + data.closureTime;
        newSuppElem.querySelector(".resolution-meta").innerText = '' + data.resolution;
    }
    document.getElementById(listName).appendChild(newSuppElem);
}

function listCompanies(companies) {
    companies.sort((a, b) => {
        if (a.shortName > b.shortName) return 1
        if (a.shortName < b.shortName) return -1
    })
    companies.forEach(e => {
        $("#nsCompanies").append(new Option(e.shortName, e.company));
    })
}

function listIntegrity(data) {
    let integrity = new Map();
    let listOnScreen = document.querySelector('#newSupportList').querySelectorAll('.support');
    listOnScreen.forEach(l => {
        integrity.set($(l)[0].id, 0);
        data.forEach(d => {
            if ($(l)[0].id === d._id) integrity.set(d._id, 1);
        })
    })
    integrity.forEach((value, key) => {
        if (value === 0) deleteOpenSuppElem({ id: 'newSupp' + key })
    })
}

function filteringSupports(search, status, htmlId) {
    cleanSupportList(htmlId)
    if (search === '') return enlistMySupports(mySupports);

    let filteredSupports = mySupports.filter(e => {
        return (e.status === status && e.name.toLowerCase().match(search.toLowerCase()))
            || (e.status === status && e.company.toLowerCase().match(search.toLowerCase()))
    });
    return enlistMySupports(filteredSupports);
}

// EVENTS

function playSound(sound) {
    if (play) {
        const audio = new Audio(sound);
        audio.volume = 0.20
        audio.play();
    }
}

function selected(ev) {
    $(ev).find('.icon').show();
    loadSupportDataOnModal(ev);
}

function removeNotification(ev) {
    if (ev.querySelector('.notification')) ev.querySelector('.notification').remove();
}

function mute() {
    if (play) {
        document.querySelector('.fa-volume-up').classList.add('fa-volume-off');
        document.querySelector('.fa-volume-up').classList.remove('soundOn');
        void document.querySelector('.fa-volume-up').offsetWidth;
        document.querySelector('.fa-volume-up').classList.add('soundOff');
        document.querySelector('.fa-volume-up').classList.remove('fa-volume-up');
    } else {
        document.querySelector('.fa-volume-off').classList.add('fa-volume-up');
        document.querySelector('.fa-volume-off').classList.remove('soundOff');
        void document.querySelector('.fa-volume-off').offsetWidth;
        document.querySelector('.fa-volume-off').classList.add('soundOn');
        document.querySelector('.fa-volume-off').classList.remove('fa-volume-off');
    }
    play = !play
}

function communicate(b) {
    (b === undefined) ? comunicando = !comunicando : comunicando = b;
}

function toggleLoading(element) {
    if ($('#loading' + element).hasClass("loadBG-out")) {
        $('#loading' + element).removeClass("loadBG-out").addClass("loadBG-in");
    }
    else {
        $('#loading' + element).removeClass("loadBG-in").addClass("loadBG-out");
    }
}

function generateReport(status) {
    let date = new Object();
    date.start = $('#generateReport').find("#initDate").val();
    date.end = $('#generateReport').find("#endDate").val();
    report(date, status);
}

// EDIT SUPPORT//

function showSupportDataOnForm(supportData) {
    $('#editSupport').on('shown.bs.modal', () => {
        $('#editSupportForm').find("#supportId").text(supportData.id);
        $('#editSupportForm').find("#edtDate").val(supportData.date);
        $('#editSupportForm').find("#edtTime").val(supportData.time);
        $('#editSupportForm').find("#edtName").val(supportData.name);
        $('#editSupportForm').find("#edtCompany").empty().append(new Option(supportData.company));
        $('#editSupportForm').find("#edtComment").val(supportData.comment);
        switch (supportData.status) {
            case 1:
                $('#editSupport').find('.opened').show();
                $('#editSupport').find('.resolution').hide();
                $('#editSupport').find('.resolutionBtn').hide();
                $('#editSupport').find('.closure').hide();
                $('#editSupport').find('.renounce').hide();
                $('#editSupport').find('.edit').show();
                $('#edtComment').attr("disabled", false);
				$('#editSupport').find('#edtDate').attr("disabled", false);
                $('#editSupport').find('#edtTime').attr("disabled", false);
                break;
            case 2:
                $('#editSupport').find('.resolution').show();
                $('#editSupport').find('.resolutionBtn').show();
                $('#editSupport').find('.renounce').show();
                $('#editSupport').find('.opened').hide();
                $('#editSupport').find('.closure').hide();
                $('#editSupport').find('.edit').hide();
				
                $('#editSupportForm').find("textarea:enabled").focus()
				
				$('#editSupportForm').find("#edtClosureDate").val(calendar().currentDate);
                $('#editSupportForm').find("#edtClosureTime").val(calendar().currentTime);
				$('#editSupportForm').find('.resolution').val('');
				
                $('#edtComment').attr("disabled", true);
				$('#editSupport').find('#edtDate').attr("disabled", true);
                $('#editSupport').find('#edtTime').attr("disabled", true);								
				$('#editSupport').find('#edtClosureDate').attr("disabled", false);
                $('#editSupport').find('#edtClosureTime').attr("disabled", false);
				$('#editSupport').find('.resolution').attr("disabled", false);
                break;
            case 3:
                $('#editSupport').find('.renounce').hide();
                $('#editSupportForm').find("#edtClosureDate").val(supportData.closureDate);
                $('#editSupportForm').find("#edtClosureTime").val(supportData.closureTime);
                $('#editSupportForm').find("#edtResolution").val(supportData.resolution);
                $('#editSupport').find('#edtClosureDate').attr("disabled", true);
                $('#editSupport').find('#edtClosureTime').attr("disabled", true);
                $('#editSupport').find('#edtComment').attr("disabled", true);
                $('#editSupport').find('.resolution').attr("disabled", true);                
                $('#editSupport').find('.opened').hide();
                $('#editSupport').find('.resolution').show();
                $('#editSupport').find('.resolutionBtn').hide();
                $('#editSupport').find('.edit').hide();
                $('#editSupport').find('.closure').show();                
                break;
        }
    });
}

function createNewSupport() {
    let fields = ['input', 'textarea'];
    let forms = [document.querySelector('#newSupportForm')];
    let hasQuickSupport = $('#quickSupportForm').find('i').hasClass('quickSupport-open-icon-animation');
    if (hasQuickSupport) { forms.push(document.querySelector('#quickSupportForm')) }
    formIsEmpty(forms, fields)
        .then(ret => {
            let body = new Object();
            body.date = ret[0];
            body.time = ret[1];
            body.name = ret[2];
            body.comment = ret[3];
            body.company = $("#nsCompanies").find(":selected").text();
            body.id = $("#newSupportForm").find("#supportId").text();
            if (hasQuickSupport) {
                body.closureDate = ret[4];
                body.closureTime = ret[5];
                body.resolution = ret[6];
                cleanSupportList('closureSupportList');
                registerQuickSupport(body);
            }
            else {
                registerNewSupport(body);
            }
            cleanForm(forms, fields);
            $('#newSupport').modal('toggle');
        })
        .catch(ret => { return $(ret).focus() })
}

function loadSupportDataOnModal(support) {
    let supportData = getDataFromElement(support);
    showSupportDataOnForm(supportData);
}

function excludeSupport() {
    sendExcludeSupport($('#editSupportForm').find("#supportId").text());
    $('#editSupport').modal('toggle');
    redirecionar();
}

function updateSupport(status) {
    let support = new Object();
    support.id = $('#editSupportForm').find("#supportId").text();
    support.date = $('#editSupportForm').find("#edtDate").val();
    support.time = $('#editSupportForm').find("#edtTime").val();
    support.name = $('#editSupportForm').find("#edtName").val();
    support.company = $('#editSupportForm').find(":selected").text()
    support.comment = $('#editSupportForm').find("#edtComment").val();
    support.resolution = $('#editSupportForm').find("#edtResolution").val();
    support.closureDate = $('#editSupportForm').find("#edtClosureDate").val();
    support.closureTime = $('#editSupportForm').find("#edtClosureTime").val();
    support.status = status;
    registerUpdateSupport(support);
}

function finishSupport() {
    let support = new Object();
    let fields = ['input', 'textarea'];
    let forms = [document.querySelector('#editSupportForm')];
    formIsEmpty(forms, fields)
        .then(ret => {
            support.id = $('#editSupportForm').find("#supportId").text();
            support.status = 3;
            support.date = ret[0];
            support.time = ret[1];
            support.name = ret[2];
            support.closureDate = ret[3];
            support.closureTime = ret[4];
            support.comment = ret[5];
            support.resolution = ret[6];
            registerUpdateSupport(support)
        })
        .catch(ret => {
            $(ret).focus();
        });
}