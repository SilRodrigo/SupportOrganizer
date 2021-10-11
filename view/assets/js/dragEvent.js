function allowDrop(ev) {
    ev.preventDefault();
    ev.target.classList.add('hover');
}

function leaveDrop(ev) {
    ev.target.classList.remove('hover');
}

function cancelDrag(ev) {
    communicate(true);
}

function drag(ev) {
    communicate(false);
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    ev.target.classList.remove('hover');
    let data = ev.dataTransfer.getData("text");
    cleanSupportList('mySupportList');
    supportTaken(document.getElementById(data).querySelector('.support').id);
    deleteOpenSuppElem({ id: data });
}