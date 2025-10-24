var addBookmarkObj = {
  linkText:'Bookmark This Page',
  addTextLink:function(parId){
    var a=addBookmarkObj.makeLink(parId);
    if(!a) return;
    a.appendChild(document.createTextNode(addBookmarkObj.linkText));
  },
  addImageLink:function(parId,imgPath){
    if(!imgPath || isEmpty(imgPath)) return;
    var a=addBookmarkObj.makeLink(parId);
    if(!a) return;
    var img = document.createElement('img');
    img.alt = addBookmarkObj.linkText;
    img.title = '';
    img.src = imgPath;
    a.appendChild(img);
  },
  makeLink:function(parId) {
    if(!document.getElementById || !document.createTextNode) return null;
    parId=((typeof(parId)=='string')&&!isEmpty(parId))
      ?parId:'addBookmarkContainer';
    var cont=document.getElementById(parId);
    if(!cont) return null;
    var a=document.createElement('a');
    a.href=location.href;
    if(window.opera) {
      a.rel='sidebar'; // this makes it work in Opera 7+
    } else {
      a.onclick=function() {
        addBookmarkObj.exec(this.href,this.title);
        return false;
      }
    }
    a.title=document.title;
    return cont.appendChild(a);
  },
  exec:function(url, title) {
    var isKonq=(isLikelyKonqueror3 && isLikelyKonqueror3());
    var isMac=(navigator.userAgent.toLowerCase().indexOf('mac')!=-1);
    var buttonStr = isMac?'Command/Cmd':'CTRL';

    if(window.external && (!document.createTextNode ||
      (typeof(window.external.AddFavorite)=='unknown'))) {
        window.external.AddFavorite(url, title); // IE/Win
    } else if(isKonq) {
      alert('You need to press CTRL + B to bookmark our site.');
    } else if(window.opera) {
      void(0); // do nothing here (Opera 7+)
    } else if(window.home) { // Netscape, iCab
      alert('You need to press '+buttonStr+' + D to bookmark our site.');
    } else if(!window.print || isMac) { // IE5/Mac and Safari 1.0
      alert('You need to press Command/Cmd + D to bookmark our site.');    
    } else {
      alert('In order to bookmark this site you need to do so manually '+
        'through your browser.');
    }
  }
}

function isEmpty(s){return ((s=='')||/^\s*$/.test(s));}

function isLikelyKonqueror3() {
  if(!document.getElementById) return false;
  if(document.defaultCharset || window.opera || !window.print) return false;
  if(window.home) return false; // Konqueror doesn't support this but Firefox,
    // which has silent support for document.all when in Quirks Mode does
  if(document.all) return true; // Konqueror versions before 3.4
  var likely = 1;
  // testing for silent document.all support; try-catch used to keep it from
  // generating errors in other browsers.
  // try-catch causes errors in IE4 and NS4.x so we use the eval() to hide it.
  // try {
  //   var str=document.all[0].tagName;
  // } catch(err) { likely=0; }
  eval("try{var str=document.all[0].tagName;}catch(err){likely=0;}");
  return likely;
}

function dss_addEvent(el,etype,fn) {
  if(el.addEventListener && (!window.opera || opera.version) &&
  (etype!='load')) {
    el.addEventListener(etype,fn,false);
  } else if(el.attachEvent) {
    el.attachEvent('on'+etype,fn);
  } else {
    if(typeof(fn) != "function") return;
    if(typeof(window.earlyNS4)=='undefined') {
      // to prevent this function from crashing Netscape versions before 4.02
      window.earlyNS4=((navigator.appName.toLowerCase()=='netscape')&&
      (parseFloat(navigator.appVersion)<4.02)&&document.layers);
    }
    if((typeof(el['on'+etype])=="function")&&!window.earlyNS4) {
      var tempFunc = el['on'+etype];
      el['on'+etype]=function(e){
        var a=tempFunc(e),b=fn(e);
        a=(typeof(a)=='undefined')?true:a;
        b=(typeof(b)=='undefined')?true:b;
        return (a&&b);
      }
    } else {
      el['on'+etype]=fn;
    }
  }
}

/* dss_addEvent(window,'load',addBookmarkObj.addTextLink);*/

dss_addEvent(window,'load',function(){
  addBookmarkObj.addImageLink('','sites/all/themes/h/images/books.png');
});
