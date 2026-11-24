(function(){
  var h=document.getElementById('cipher-text'),dial=document.getElementById('dial');
  if(!h||!dial)return;
  var cipher=h.dataset.cipher,plain=h.dataset.plain,SOLVE=+h.dataset.shift,N=26,STEP=360/N;
  var k=0,spans=[],solved=false;
  var ns='http://www.w3.org/2000/svg';
  function el(n,a,t){var e=document.createElementNS(ns,n);for(var i in a)e.setAttribute(i,a[i]);if(t)e.textContent=t;return e}

  // build headline as word > letter spans
  h.textContent='';
  cipher.split(' ').forEach(function(word){
    var w=document.createElement('span');w.className='w';
    word.split('').forEach(function(){var s=document.createElement('span');s.className='l';w.appendChild(s);spans.push(s)});
    h.appendChild(w);h.appendChild(document.createTextNode(' '));
  });
  function decode(c,s){
    var code=c.charCodeAt(0);
    return (code<65||code>90)?c:String.fromCharCode((code-65-s+N*2)%N+65);
  }
  var letters=cipher.replace(/ /g,'').split('');

  // build dial: outer ring fixed (cipher letters), inner ring turns (plain letters)
  var svg=el('svg',{viewBox:'-100 -100 200 200','aria-hidden':'true'});
  svg.appendChild(el('circle',{r:98,fill:'#1A0F5C',stroke:'#A9B4E8','stroke-width':1.5}));
  svg.appendChild(el('circle',{r:74,fill:'none',stroke:'#A9B4E8','stroke-width':1}));
  var inner=el('g',{'class':'inner'});
  inner.appendChild(el('circle',{r:74,fill:'#0C0032',stroke:'#22D3EE','stroke-width':2}));
  for(var i=0;i<N;i++){
    var a=i*STEP;
    var o=el('text',{x:0,y:-86,'font-size':9,fill:'#E8F7FF',transform:'rotate('+a+')'},String.fromCharCode(65+i));svg.appendChild(o);
    var t=el('text',{x:0,y:-60,'font-size':11,fill:'#22D3EE',transform:'rotate('+a+')'},String.fromCharCode(65+i));inner.appendChild(t);
  }
  inner.appendChild(el('circle',{r:36,fill:'#1A0F5C',stroke:'#A9B4E8','stroke-width':1}));
  inner.appendChild(el('path',{d:'M0 -30 6 -20H-6Z',fill:'#22D3EE'}));
  svg.appendChild(inner);
  svg.appendChild(el('path',{d:'M-5 -100 5 -100 0 -92Z',fill:'#22D3EE'}));
  dial.appendChild(svg);

  function render(){
    var prev=spans.map(function(s){return s.textContent});
    spans.forEach(function(s,i){
      var ch=decode(letters[i],k);
      if(prev[i]!==ch){s.textContent=ch;s.classList.remove('tick');void s.offsetWidth;s.classList.add('tick')}
    });
    inner.style.transform='rotate('+(k*STEP)+'deg)';
    dial.setAttribute('aria-valuenow',k);dial.setAttribute('aria-valuetext','Shift '+k+' of 25');
    document.getElementById('shiftval').textContent=k;
    var ok=(k===SOLVE);
    h.classList.toggle('solved',ok);
    if(ok&&!solved){document.getElementById('cta').hidden=false;document.getElementById('status').textContent='Solved. '+plain+'.'}
    if(!ok&&solved){document.getElementById('cta').hidden=true;document.getElementById('status').textContent=''}
    solved=ok;
  }
  function set(v){k=((v%N)+N)%N;render()}

  // pointer drag: rotate inner wheel
  var drag=null;
  function angle(e){var r=dial.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
  dial.addEventListener('pointerdown',function(e){drag={a:angle(e),k:k};dial.setPointerCapture(e.pointerId);dial.focus()});
  dial.addEventListener('pointermove',function(e){if(!drag)return;set(drag.k+Math.round((angle(e)-drag.a)/STEP))});
  ['pointerup','pointercancel'].forEach(function(n){dial.addEventListener(n,function(){drag=null})});
  dial.addEventListener('keydown',function(e){
    var m={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:5,PageDown:-5};
    if(m[e.key]){e.preventDefault();set(k+m[e.key])}
    else if(e.key==='Home'){e.preventDefault();set(0)}
    else if(e.key==='End'){e.preventDefault();set(N-1)}
  });
  document.getElementById('plus').addEventListener('click',function(){set(k+1)});
  document.getElementById('minus').addEventListener('click',function(){set(k-1)});
  render();
})();
