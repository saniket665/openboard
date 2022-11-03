
let canvas = document.querySelector(".canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let tool = canvas.getContext("2d");
let color;
let allIconCont = document.querySelectorAll(".icon-cont");
let allIcons = document.querySelectorAll(".icon");
let nav = document.querySelector(".nav");
let eraser = document.querySelector(".eraser");
let eraserCont = document.querySelector(".eraser-cont");
let download = document.querySelector(".download-icon");
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");
let penWidth;
let eraserWidth;
let eraserColor = "#292929";
let eraserActive = false;
let redoundo = [];
let track = 0;
console.log(nav.offsetHeight)
allIcons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
        eraserActive = false;
        changeActive(e);
    })
})
tool.strokeStyle = color;
tool.lineWidth = penWidth;
// tool.strokeStyle = "blue"; // line color
// tool.lineWidth = "3"; // line width
// tool.beginPath(); // new graphic path
// tool.moveTo(50, 50); // start point
// tool.lineTo(250, 250); // end point
// tool.stroke(); // draw graphic fill color
// tool.lineTo(280, 300); 
// tool.stroke();
let mouseFlag = false;
function changeActive(e) {
    if(eraserActive) {
        for(let i = 0; i < allIconCont.length; i++) {
            allIconCont[i].classList.remove("active");
            if(allIconCont[i].querySelector(".pen-size")) {
                let penSize = allIconCont[i].querySelector(".pen-size");
                penSize.remove();
            }
        }
    }
    else {
        eraserCont.classList.remove("active");
        if(eraserCont.querySelector(".eraser-size")) {
            let eraserSize = eraserCont.querySelector(".eraser-size");
            eraserSize.remove();
        }
        for(let i = 0; i < allIconCont.length; i++) {
            allIconCont[i].classList.remove("active");
            if(allIconCont[i].querySelector(".pen-size")) {
                let penSize = allIconCont[i].querySelector(".pen-size");
                penSize.remove();
            }
        }
        let activeIconCont = e.target.parentElement;
        activeIconCont.classList.add("active");
        color = e.target.classList[3];
        let select = document.createElement("select");
        select.setAttribute("class", "pen-size");
        select.innerHTML = `
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        `
        select.addEventListener("change", changePenWidth);
        activeIconCont.appendChild(select);
        tool.strokeStyle = color;
    }
}
canvas.addEventListener("mousedown", (e) => {
    mouseFlag = true;
    let data = {
        x: e.clientX,
        y: e.clientY
    }
    socket.emit("begin", data);
    // console.log(e);
})
canvas.addEventListener("mousemove", (e) => {
    if(mouseFlag) {
        let data = {
            x: e.clientX,
            y: e.clientY,
            width: eraserActive ? eraserWidth : penWidth,
            color: eraserActive ? eraserColor : color
        }
        socket.emit("move", data);
    }
})
canvas.addEventListener("mouseup", (e) => {
    mouseFlag = false;
    let url = canvas.toDataURL();
    redoundo.push(url);
    track = redoundo.length-1;
})
undo.addEventListener("click", (e) => {
    if(track > 0) track--;
    let trackObj = {
        tVal: track,
        redoundoArr: redoundo
    }
    undoRedoWork(trackObj);
})
redo.addEventListener("click", (e) => {
    if(track < redoundo.length-1) track++;
    let trackObj = {
        tVal: track,
        redoundoArr: redoundo
    }
    undoRedoWork(trackObj);
})
eraser.addEventListener("click", (e) => {
    eraserActive = true;
    changeActive();
    tool.strokeStyle = eraserColor;
    let eraserCont = e.target.parentElement;
    eraserCont.classList.add("active");
    let select = document.createElement("select");
    select.setAttribute("class", "eraser-size");
    select.innerHTML = `
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    `
    eraserCont.appendChild(select);
    select.addEventListener("change", changeEraserWidth);
})
download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();
    let a = document.createElement("a");
    a.href = url;
    a.download = "openboard.jpg";
    a.click();
})
function changeEraserWidth(e) {
    eraserWidth = e.target.value;
    tool.lineWidth = eraserWidth;
}
function changePenWidth(e) {
    penWidth = e.target.value;
    tool.lineWidth = penWidth;
}
function undoRedoWork(obj) {
    let t = obj.tVal;
    let a = obj.redoundoArr;
    let url = a[t];
    let img = new Image();
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.height, canvas.width);
    }
}
socket.on("begin", (data) => {
    begin(data);
})
socket.on("move", (data) => {
    drawStroke(data);
})
function begin(obj) {
    tool.beginPath();
    tool.moveTo(obj.x, obj.y);
}
function drawStroke(obj) {
    tool.strokeStyle = obj.color;
    tool.lineWidth = obj.width;
    tool.lineTo(obj.x, obj.y);
    tool.stroke();
}