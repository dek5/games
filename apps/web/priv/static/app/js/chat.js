
// Online User Chat and In-Game Chat

var scrollSensitivity = 0.2;
var scroll_left = 5;
var scroll_left_chat = 5;
var scroll_right = -10000;
var currentChat = null;
var user_count = 0;

function barHover(evt)       { $("#Right-Bar").attr("fill","skyblue"); }
function barHoverOut(evt)    { $("#Right-Bar").attr("fill","lightblue"); }
function onlineHover(evt)    { $("#Left-Bar") .attr("fill","skyblue"); }
function onlineHoverOut(evt) { $("#Left-Bar") .attr("fill","lightblue"); }

function onlineHoverColor(evt) {
    onlineHover(evt);
    var name = evt.target.getAttribute("xmlns:data");
    if (null != name) document.getElementById(name).setAttribute("fill","#FFF687"); }

function onlineHoverOutColor(evt) { 
    onlineHoverOut(evt);
    var name = evt.target.getAttribute("xmlns:data");
    if (null != name) document.getElementById(name).setAttribute("fill","#DBEBED"); }

function mouseWheelHandler(e) {

    var leftBar = document.getElementById("Left-Bar");
    var rightBar = document.getElementById("Right-Bar");
    var leftFill = leftBar.getAttribute("fill");
    var rightFill = rightBar.getAttribute("fill");
    var leftActive = leftFill == "skyblue";
    var rightActive = rightFill == "skyblue";
    if (!leftActive && !rightActive) return;

    var evt = e;
    var scroll_dy = evt.detail ? evt.detail * scrollSensitivity * 100 : evt.wheelDelta * scrollSensitivity;
    var ori = leftActive ? (currentChat == null ? scroll_left : scroll_left ) : scroll_right;
    var scroll = parseFloat(scroll_dy) + parseFloat(ori);
    var selectedBar = leftActive ? (currentChat == null ? "Online-List" : currentChat) : "Chat";
    var selectedClip = leftActive ? (currentChat == null ? "Clip-Path-Left" : "Clip-Path-Left-Chat") : "Clip-Path-Right";
    var selectedBarShift = leftActive ? 
        (adaptiveDesign()?-globalShiftX:0) :
        (adaptiveDesign()?globalRightPosition:857);
    var limit = parseFloat(document.getElementById(selectedBar).getBBox().height) - 400;
    if (scroll > 5) scroll = 5;
    if (scroll < -limit) scroll = -limit;
    document.getElementById(selectedClip).setAttribute("transform", "translate(0,"+parseFloat(-scroll)+")");
    document.getElementById(selectedBar).setAttribute("transform", "translate("+selectedBarShift+","+(parseFloat(95+scroll))+")");
    if (leftActive) scroll_left = scroll; else scroll_right = scroll;
    return true; 
}


function chatMessage(chatName, id, me, string) {
    var i=0;
    var d=10;
    var colors=['#FDFDFD','#DFF1F4'];
    var x1 = d;
    var y1 = 0;
    var container = chatName == "Chat" ? "Right-Bar" : "Left-Bar";
    var hover = chatName == "Chat" ? "barHover" : "onlineHover";
    var chatElement = document.getElementById(chatName);
    if (null == chatElement) createChat(chatName);
    var translate_y = parseFloat(document.getElementById(chatName).getBBox().height);
    var containerX = $("#"+container).position().left;
    var x2 = 206; //$("#"+container).width();
    var textElement = chatText(container,id,me,string);
//    var textElement = chatText(chatName,id,me,string);
    var dy = translate_y == 0 ? 0 : translate_y + d;
    var html = "<g xmlns='http://www.w3.org/2000/svg' " + 
        "id='Message-"+id+"' transform='translate("+
         0
        +","+dy+")'></g>";
    var messageElement = svg(html);
    messageElement.appendChild(textElement);
    document.getElementById(chatName).appendChild(messageElement);
    create_multiline(textElement);
    var y2 = textElement.getBBox().height + 5;
    var rec = "<rect xmlns:data='"+container+"' xmlns='http://www.w3.org/2000/svg' >";
    var box = "<path xmlns:data='"+container+"' xmlns='http://www.w3.org/2000/svg' d='M"+x1+","+y1+
                " L"+x2+","+y1+
            ((me == document.user) ?
                (" L"+x2+","+parseFloat(y2-d)+
                " L"+parseFloat(x2+d)+","+y2+
                " L"+x1+","+y2)
            :
                (" L"+x2+","+y2+
                " L"+0+","+y2+
                " L"+x1+","+parseFloat(y2-d)))
        + " L"+x1+","+y1+"' fill='"+colors[me==document.user?1:0]+"'></path>";
    var boxElement = svg(box);
//    textElement.setAttribute("xmlns:data",container);
    textElement.setAttribute("xmlns:data",chatName);
    messageElement.insertBefore(boxElement,textElement);
    boxElement.setAttribute("mouseover",hover+"(evt);");
    boxElement.setAttribute("mouseout",hover+"Out(evt);");
    textElement.setAttribute("mouseover",hover+"(evt);");
    textElement.setAttribute("mouseout",hover+"Out(evt);");
    messageElement.setAttribute("onmouseover",hover+"(evt);");
    messageElement.setAttribute("onmouseout",hover+"Out(evt);");
}

function chatText(container, id, me, string) {
    var i = 0;
    var colors=['#3B5998'];
    var html = "<text xmlns:data='"+container+"' id='ChatText-"+id+"' width='180' " +
        " xmlns='http://www.w3.org/2000/svg' "+
        " font-family='Exo 2' font-size='16' font-weight='normal' fill='"+colors[i]+"'>" +
            string + "</text>";
    return svg(html);
}

function showOnlineList(evt)
{
    document.getElementById("onlineChatEdit").style.display = 'none';
    if (null != currentChat) { document.getElementById(currentChat).style.display = 'none'; }
    document.getElementById("Online-List").style.display = '';
    currentChat = null;

    scroll_left = 5;
    onlineHover();
    mouseWheelHandler({'detail':scroll_left,'wheelDelta':scroll_left});
    onlineHoverOut();
}

if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;'); // "
  };
}

if (!String.prototype.entag) {
  String.prototype.entag = function () {
    return (this[0]!="_"?"_":"")+this.replace(/\./g, '-dot-').replace(/@/g, '-at-'); }; }

if (!String.prototype.detag) {
  String.prototype.detag = function () { return this.substr(1).replace(/-at-/g,'@').replace(/-dot-/g,'.').replace(/tag-/,''); }; }

function addOnlineUser(name,full_name,score,insertMode) {
    name = name.entag();
    var listElement = document.getElementById("Online-List");
    var clickEvent = ' onclick="openChat(evt);" '; 
    var events = ' onmouseover="onlineHover(evt);" onmouseout="onlineHoverOut(evt);" ' + clickEvent;
    var eventsColor = ' onmouseover="onlineHoverColor(evt);" onmouseout="onlineHoverOutColor(evt);" ' + clickEvent;
    var color = insertMode == "insertTop" ? "red" : "green";
    var y = (insertMode == "insertTop") ? 0 : listElement.getBBox().height;
    var html = '<g xmlns="http://www.w3.org/2000/svg" height="60" transform="translate(0, '+y+')">' +
            '<g xmlns:data="'+name+'" fill="#DBEBED" '+eventsColor+'>' +
            '    <rect cursor="pointer" xmlns:data="'+name+'" fill="#DBEBED" id="'+name+'"'+
            ' x="10" y="0" width="'+
        (adaptiveDesign()?(scope.fixedChatBars?196:"100%"):196)+
        '" height="48" ' +'>'+full_name+'</rect></g>' +
            '<text xmlns:data="'+name+'" '+eventsColor+' '+
            'font-family="Exo 2" font-size="18" cursor="pointer" font-weight="normal" line-spacing="18"'+
            ' fill="#3B5998">' +
                '<tspan xmlns:data="'+name+'" font-weight="normal" fill="'+color+'" x="19" y="22">'+utf8decode(full_name)+'</tspan>' + 
                '<tspan xmlns:data="'+name+'" font-size="14" x="19" y="40">'+i18n("Score")+': '+score+' </tspan></text>'+
            '<rect '+
            '  x="10" y="48" width="196" height="8"></rect></g>';
    var element = svg(html);
    if (insertMode == "insertTop") {
        var firstElement = listElement.firstElementChild;
        if (null == firstElement) listElement.appendChild(element); else {
            var first = firstElement.firstElementChild.getAttribute("xmlns:data");
            shiftTranslate(first, 1);
            listElement.insertBefore(element,firstElement);
        }
    } else listElement.appendChild(element);
}

function shiftTranslate(name,shiftValue) {
    var rect = document.getElementById(name);
    if (null == rect) return;
    var remove = rect.parentNode.parentNode;
    var children = document.getElementById("Online-List").childNodes;
    var removeIndex = -1;
    for(var i = 0; i<children.length; i++) { 
        var child = children[i];
        if (child == remove) removeIndex = i;
        if (removeIndex != -1 && i>=removeIndex)
            child.setAttribute("transform","translate(0,"+(parseFloat(i)+parseFloat(shiftValue))
                *remove.getBBox().height+")");
    }
    return rect.parentNode.parentNode;
}

function removeOnlineUser(name) { shiftTranslate(name.entag(),-1).remove(); }

function createChat(chatName) {
    var html = '<g xmlns="http://www.w3.org/2000/svg" id="'+chatName+
    '" y="0" clip-path="url(#myClip3)" transform="translate(1, 107.000000)"></g>';
    var settings = document.getElementById("Settings");
    document.getElementById("Kakaranet-Scene").insertBefore(svg(html),settings);
    document.getElementById(chatName).style.display = 'none';
}

function openChat(evt) {
    if (leftFlag) $("#Left-Menu").trigger("click");

    document.getElementById("Online-List").style.display = 'none';
    document.getElementById("onlineChatEdit").style.display = '';
    var name = evt.target.getAttribute("xmlns:data");
    var full_name = $("#Online-List").find("#"+name)[0].textContent;
    currentChat = "Chat+"+name;
    var chatElement = document.getElementById(currentChat);
    if (null == chatElement) {
        // read from local KVS
        createChat(currentChat);
        chatMessage(currentChat,"1","System",utf8decode(full_name)+" "+i18n("PrivateChat"));
    }
    document.getElementById(currentChat).style.display = '';
    document.getElementById("onlineChatEdit").setAttribute("xmlns:data",currentChat);
    scroll_left = -1000000;

    onlineHover();
    mouseWheelHandler({'detail':-100000,'wheelDelta':-100000});
    onlineHoverOut();
}

function openGameChat()
{
    chatMessage("Chat","0","Maxim","Kakaranet:\n"+i18n("GameChat"));
    scroll_left = -1000000;

    barHover();
    mouseWheelHandler({'detail':-100000,'wheelDelta':-100000});
    barHoverOut();

}

function create_multiline(target) {
    var text_element = target; // evt.target;
    var width = 188; //target.getAttribute("width");
    var words = text_element.firstChild.data.split('');
//    console.log(words);
//    var words = [].concat.apply([],lines.map(function(line) { return line.split(' '); }));;
    var start_x = 15; //text_element.getAttribute('x');
    text_element.firstChild.data = '';

    var tspan_element = document.createElementNS(svgNS, "tspan");
    tspan_element.setAttribute("x", start_x);
    tspan_element.setAttribute("xmlns:data", text_element.getAttribute("xmlns:data"));
    tspan_element.setAttribute("dy", 18);
    var text_node = document.createTextNode(words[0]);

    tspan_element.appendChild(text_node);
    text_element.appendChild(tspan_element);

    for(var i=1; i<words.length; i++) {
        if (words[i]=="") continue; 
        var len = tspan_element.firstChild.data.length;
        tspan_element.firstChild.data += words[i];

        if (tspan_element.getComputedTextLength() > width || words[i]=="\n") {
            if (words[i]=='\n') words[i]="";
            tspan_element.firstChild.data = tspan_element.firstChild.data.slice(0, len);
            var tspan_element = document.createElementNS(svgNS, "tspan");
            tspan_element.setAttribute("x", start_x);
            tspan_element.setAttribute("xmlns:data", text_element.getAttribute("xmlns:data"));
            tspan_element.setAttribute("dy", 18);
            text_node = document.createTextNode(words[i]);
            tspan_element.appendChild(text_node);
            text_element.appendChild(tspan_element);
        }
    }
}

function initChat()
{

    var inGameChat = '<g id="Chat"         x="10" y="0" clip-path="url(#myClip2)" transform="translate('+globalRightPosition+', 107.000000)" xmlns="http://www.w3.org/2000/svg" />';
    var onlineList = '<g id="Online-List"  x="10" y="0" clip-path="url(#myClip1)" transform="translate(7.000000, 107.000000)" xmlns="http://www.w3.org/2000/svg" />';

    var page = document.getElementById("Kakaranet-Scene");
    var settings = document.getElementById("Settings");

    page.insertBefore(svg(inGameChat),settings);
    page.insertBefore(svg(onlineList),settings);

    $("#Right-Bar").attr("fill","lightblue");
    $("#Right-Bar").attr("xmlns:data","Right-Bar");
    $("#Left-Bar").attr("fill","lightblue");
    $("#Left-Bar").attr("xmlns:data","Left-Bar");

    $("#Right-Bar").on("mouseover", barHover);
    $("#Right-Bar").on("mouseout", barHoverOut);
    $("#Left-Bar").on("mouseover", onlineHover);
    $("#Left-Bar").on("mouseout", onlineHoverOut);

try {

    $('#onlineChatEdit').attr("contentEditable","true");
    $('#onlineChatEdit').on("keydown", chatEditor);
    $('#onlineChatEdit').on("focus", chatEditorClearContent);
    $("#onlineChatEdit").hide();

    $('#edit').attr("contentEditable","true");
    $('#edit').on("keydown",chatEditor);
    $('#edit').on("focus",chatEditorClearContent);
    $("#edit").show();

} catch (e) { console.log("foreignObjects missing from SVG.txt"); }

    document.getElementById('Page-1').addEventListener(mousewheelevt,
        mouseWheelHandler, false);

}

var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

function chatEditorClearContent(evt) {
    var e = evt.target;
    var chatContainer = e.getAttribute("xmlns:data");
    e.innerHTML = '';
}

function chatEditor(evt) {
    var chatContainer = evt.target.getAttribute("xmlns:data");
    if (evt.keyCode == 13 && evt.altKey == false) {
        var e = evt.target;
        var text = e.textContent == null?"":e.textContent.trim();
        if (text != ""){
            text = text.encodeHTML();
            if ("Chat" != chatContainer)
            {
                chatMessage(chatContainer,"100",document.user,text);
                ws.send(enc(tuple(atom('client'),
                    tuple(atom('message'),
                         bin(document.user),
                         bin(document.names),
                         bin(chatContainer.substr(5).detag()),
                         utf8toByteArray(text)))));
            }
            else
            {
                chatMessage(chatContainer,"100",document.user,text);
                ws.send(enc(tuple(atom('client'),
                    tuple(atom('chat'),
                         scope.gameId,
                         bin(document.user),
                         utf8toByteArray(document.names),
                         utf8toByteArray(text)))));
            }
            e.innerHTML = '';
        }
    } else if (evt.keyCode == 13 && evt.altKey == true) {
//        document.execCommand('insertText',false, '\n');
    }
    var scroll = -100000;
    if (chatContainer == "Chat") { 
        right_scroll = scroll;
        barHover();
        mouseWheelHandler({'detail':scroll,'wheelDelta':scroll});
        barHoverOut();
    } else {
        left_scroll = scroll;
        onlineHover();
        mouseWheelHandler({'detail':scroll,'wheelDelta':scroll});
        onlineHoverOut();
    }
}
