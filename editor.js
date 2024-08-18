/*
0-2 - row length
3-5 - spawn x pos
6-8 - spawn y pos
>8 level
*/
const sprites = []
function makeSprite(y,x,name){
	createImageBitmap(spritesheetImage,x*25,y*25,25,25).then((e)=>{sprites[name] = e})
}
const spritesheetImage = new Image()
spritesheetImage.src = "./media/spritesheet.png"
spritesheetImage.onload = ()=>{
	makeSprite(0,0,"player")
	makeSprite(0,1,"finnish")
	makeSprite(0,2,"fire")
	makeSprite(0,3,"arrows1")
	makeSprite(0,4,"arrows2")
	makeSprite(0,5,"arrows3")
	makeSprite(0,6,"arrows4")
	makeSprite(0,7,"antiGrav")
	makeSprite(0,8,"editorAir")
	makeSprite(0,9,"nogravity")
	makeSprite(1,0,"nothing")
	makeSprite(1,1,"dirt")
}
let editorTemp = {
	width: 3,
	height: 3,
	spawn: [0,0],
	brush:"0",
}
const brushes = [
	["0","nothing"],
	["player","player"],
	["1","dirt"],
	["2","finnish"],
	["3","fire"],
	["4","antiGrav"],
	["5","arrows1"],
	["6","arrows3"],
	["7","arrows4"],
	["8","arrows2"],
	["9","nogravity"],
]
const editorDrawDefaults = {
	0:"editorAir",
	1:"dirt",
	2:"finnish",
	3:"fire",
	4:"antiGrav",
	5:"arrows1",
	6:"arrows3",
	7:"arrows4",
	8:"arrows2",
	9:"nogravity",
}
function selectBrush(num){
	let curctx = document.getElementById("activebrushimg").getContext("2d")
	curctx.clearRect(0,0,25,25)
	curctx.drawImage(sprites[brushes[num][1]],0,0)
	editorTemp.brush = brushes[num][0]
}
let editorCanvas
let ectx
function openEditor(){
	loadMenu()
	document.getElementById("mainMenu").style.display="none"
	setupEditor()
	document.getElementById("editorMenu").style.display="block"
}
function closeEditor(){
	document.getElementById("mainMenu").style.display="block"
	document.getElementById("editorMenu").style.display="none"
}
function setupEditor() {
	editorTemp.width = Number(game.editor.substr(0,3))
	editorTemp.height = (game.editor.length-9)/(Number(game.editor.substr(0,3)))
	editorTemp.spawn = [Number(game.editor.substr(3,3)),Number(game.editor.substr(6,3))] 
	let htmlstring = `
	<div>
			<table class="editor">
				<tr style="min-height: 300px; height: 300px; min-width: 300px; width: 300px">
					<td>
						<canvas id="editorCanvas" width="${editorTemp.width*60}px" height="${editorTemp.height*60}px"></canvas>
					</td>
					<td style="vertical-align: top;">
						<div style="width: max-content;">
							<span>
								<button id="rmrow" style="transform: rotate(180deg)" onclick="removeRow(true)"></button>
								<button id="addrow" style="transform: rotate(180deg)" onclick="addRow(true)"></button>
									<span id="radd"> ${editorTemp.height} </span>
								<button id="addrow" onclick="addRow()"></button>
								<button id="rmrow" onclick="removeRow()"></button>
							</span><br>
							<span>
								<button id="rmrow" style="transform: rotate(90deg)" onclick="removeCol(true)"></button>
								<button id="addrow" style="transform: rotate(90deg)" onclick="addCol(true)"></button>
									<span id="cadd"> ${editorTemp.width} </span>
								<button id="addrow" style="transform: rotate(270deg)" onclick="addCol()"></button>
								<button id="rmrow" style="transform: rotate(270deg)" onclick="removeCol()"></button>
							</span>
							<br><br>
							<table id="editorControls">
								<tr>
									<td colspan=2><button onclick="playtest()">Playtest</button></td>
								</tr>
								<tr>
									<td><button id="edexpbtn" onclick="exportEditor()">Export</button></td>
									<td><button onclick="importEditor()">Import</button></td>
								</tr>
								<tr>
									<td><button onclick="clearEditor()">Clear editor</button></td>
									<td><button onclick="closeEditor()">Exit</button></td>
								</tr>
							</table>
						</div>
					</td>
				</tr>
			</table>
			<div style="display:flex; align-items: center">active brush: 
				<span>
					<canvas id="activebrushimg" width=35 height=35>
				</span>
			</div>
			<div id="selectors" style="margin-top:10px;">`
			for(let i=0; i<brushes.length;i++){
				htmlstring+=`
				<canvas id="${'sel'+i}" class="selectorCanvas" onclick="selectBrush(${i})" width=35 height=35></canvas>
				`
			}
			htmlstring+=`</div></div>`
		document.getElementById("editorMenu").innerHTML = htmlstring
		editorCanvas = document.getElementById("editorCanvas")
		editorCanvas.addEventListener('mousedown', function(e) {
			setTo(e)
		})
		updateEditor()
		drawBrushes()
		selectBrush(0)
}
function drawBrushes(){
	for(let i=0;i < brushes.length; i++){
		let curctx = document.getElementById("sel"+(i)).getContext("2d")
		curctx.drawImage(sprites[brushes[i][1]],0,0,35,35)
	}
}
function updateEditor(){
	editorCanvas.width = editorTemp.width*60
	editorCanvas.height = editorTemp.height*60
	ectx = editorCanvas.getContext("2d")
	ectx.clearRect(0,0,editorCanvas.width,editorCanvas.height)

	for(let y=0; y<editorTemp.height; y++) for(let x=0; x<editorTemp.width; x++){

		ectx.drawImage(sprites[editorDrawDefaults[game.editor[9+x+y*editorTemp.width]]],x*60,y*60,60,60)
	}
	for(let y=0; y<editorTemp.height; y++) for(let x=0; x<editorTemp.width; x++){
		ectx.strokeStyle="#fff"
		ectx.strokeRect(x*60,y*60,60,60)
	}
	//player
	ectx.drawImage(sprites["player"],editorTemp.spawn[0]*60+10,editorTemp.spawn[1]*60+10,40,40)
}
function playtest(){
	loadLevel("custom", game.editor)
	closeEditor()
}
function addRow(top=false) {
	if(editorTemp.height < 999) {

		if (!top){
			game.editor+=String("0".repeat(editorTemp.width))
		}else{
			game.editor = game.editor.insert(9, String("0".repeat(editorTemp.width)))
			let spawnY = ("000"+String(Number(game.editor.substr(6,3))+1)).substr(-3,3)
			game.editor = game.editor.replaceAt(6,spawnY)
			editorTemp.spawn[1]++
		}
		editorTemp.height++
		updateEditor()
		document.getElementById("radd").textContent = editorTemp.height
		save()
	}
}
function removeRow(top=false) {
	if(editorTemp.height > 2) {
		if (!top){
			game.editor = game.editor.substring(0,game.editor.length - editorTemp.width)
		}else{
			game.editor = game.editor.substr(0,9)+game.editor.substr(editorTemp.width+9, game.editor.length)
			let spawnY = ("000"+String(Number(game.editor.substr(6,3))-1)).substr(-3,3)
			game.editor = game.editor.replaceAt(6,spawnY)
			editorTemp.spawn[1]--
		}
		editorTemp.height--
		updateEditor()
		document.getElementById("radd").textContent = editorTemp.height
		save()
	}
}

function addCol(left=false) {
	if(editorTemp.width < 999) {
		let width = ("000"+String(Number(game.editor.substr(0,3))+1)).substr(-3,3)
		game.editor = width+game.editor.substring(3,game.editor.length)
		let tempstr = game.editor.substr(0,9)
		if(!left){
			for (let i=0; i<editorTemp.height; i++){
				tempstr += game.editor.substr(9+i*editorTemp.width,editorTemp.width)+"0"
			}
		} else {
			for (let i=0; i<editorTemp.height; i++){
				tempstr += "0"+game.editor.substr(9+i*editorTemp.width,editorTemp.width)
			}
			let spawnX = ("000"+String(Number(tempstr.substr(3,3))+1)).substr(-3,3)
			tempstr = tempstr.replaceAt(3,spawnX)
			editorTemp.spawn[0]++
		}
		game.editor = tempstr
		editorTemp.width++
		updateEditor()
		document.getElementById("cadd").textContent = editorTemp.width
		save()
	}
}
function removeCol(left=false) {
	if(editorTemp.width > 2) {
		let width = ("000"+String(Number(game.editor.substr(0,3))-1)).substr(-3,3)
		game.editor = width+game.editor.substring(3,game.editor.length)
		let tempstr = game.editor.substr(0,9)
		if(!left){
			for (let i=0; i<editorTemp.height; i++){
				tempstr+=game.editor.substr(9+i*editorTemp.width,editorTemp.width-1)
			}
		} else {
			for (let i=0; i<editorTemp.height; i++){
				tempstr+=game.editor.substr(9+i*editorTemp.width+1, editorTemp.width-1)
			}
			let spawnX = ("000"+String(Number(tempstr.substr(3,3))-1)).substr(-3,3)
			tempstr = tempstr.replaceAt(3,spawnX)
			editorTemp.spawn[0]--
		}
		game.editor = tempstr
		editorTemp.width--
		updateEditor()
		document.getElementById("cadd").textContent = editorTemp.width
		save()
	}
}

function setTo(event) {
	const pos = editorCanvas.getBoundingClientRect()
	let y = Math.floor((event.clientY - pos.top)/60)
	let x = Math.floor((event.clientX - pos.left)/60)
	let selected = editorTemp.brush
	if (selected === 'player'){
		editorTemp.spawn = [x,y]
		//tempstr = game.editor.substr(9,game.editor.length)
		game.editor = game.editor.substr(0,3) + 
		("000"+String(editorTemp.spawn[0])).substr(-3,3) + 
		("000"+String(editorTemp.spawn[1])).substr(-3,3) + 
		game.editor.substr(9,game.editor.length)
	}	else {
		game.editor = game.editor.replaceAt(9+x+y*editorTemp.width, selected)
	}
	updateEditor()
	save()
}

function exportEditor(){
	navigator.clipboard.writeText(game.editor)
	let btn=document.getElementById("edexpbtn")
	btn.style.background=("#449944")
	btn.innerHTML="Copied!"
	setTimeout(() => {
		btn.style.background=("")
		btn.innerHTML="Export"
	}, 600);
}

function importEditor(imported = undefined) {
	if (imported === undefined) imported = (prompt("paste your level here"))
	if (imported.length>13){
		game.editor = imported
		editorTemp.width = Number(game.editor.substr(0,3))
		editorTemp.height = (game.editor.length-9)/(Number(game.editor.substr(0,3)))
		editorTemp.spawn = [Number(game.editor.substr(3,3)),Number(game.editor.substr(6,3))] 
		updateEditor()
		save()
	} else {
		alert("incorrect import")
	}
}

function clearEditor(){
	if(confirm("Are you sure you want to delete everything in the editor?")){
		game.editor = game.editor.substring(0,9)+"0".repeat(game.editor.length-9)
		updateEditor()
	}
}