(function(){
  var form=document.getElementById('reg');if(!form)return;
  form.noValidate=true; // we show our own messages; without JS the browser's own checks still run
  var summary=document.getElementById('summary'),list=document.getElementById('summary-list');
  var size=document.getElementById('team-size');

  // show only the optional player fields that match team size
  function players(){
    var n=+size.value||3;
    form.querySelectorAll('.pl').forEach(function(p){p.hidden=+p.dataset.n>n});
  }
  if(size){size.addEventListener('change',players);players();}

  function wrap(i){return i.closest('.field')}
  function msg(i){
    var v=i.value.trim();
    if(i.type==='checkbox')return i.checked?'':i.dataset.msg;
    if(!v)return i.dataset.msg;
    if(i.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return i.dataset.msg;
    if(i.id==='leader-whatsapp'){var d=v.replace(/\D/g,'');if(!/^[\d\s()+\-]+$/.test(v)||d.length<8||d.length>15)return i.dataset.msg}
    if(i.id==='leader-discord'&&(v.length<2||/\s/.test(v)))return i.dataset.msg;
    return '';
  }
  function check(i){
    var m=msg(i),f=wrap(i),e=document.getElementById(i.id+'-err');
    f.classList.toggle('invalid',!!m);
    if(m){e.textContent=m;i.setAttribute('aria-invalid','true');i.setAttribute('aria-describedby',((i.getAttribute('aria-describedby')||'').replace(i.id+'-err','')+' '+i.id+'-err').trim())}
    else{e.textContent='';i.removeAttribute('aria-invalid')}
    return m;
  }
  var req=[].slice.call(form.querySelectorAll('[required]'));
  req.forEach(function(i){i.addEventListener('blur',function(){check(i)});i.addEventListener('input',function(){if(wrap(i).classList.contains('invalid'))check(i)});i.addEventListener('change',function(){if(wrap(i).classList.contains('invalid'))check(i)})});

  form.addEventListener('submit',function(e){
    var bad=[];
    req.forEach(function(i){var m=check(i);if(m)bad.push({i:i,m:m})});
    var rc=form.querySelector('.g-recaptcha');
    if(rc&&window.grecaptcha&&!grecaptcha.getResponse()){bad.push({i:rc,m:'Tick "I\'m not a robot" to show you are human.'})}
    if(!bad.length){summary.hidden=true;
      var g=window.GOOGLE_FORM;
      if(g&&g.action){try{var b=new URLSearchParams();Object.keys(g.fields).forEach(function(k){var el=form.elements[k];if(el&&g.fields[k])b.append(g.fields[k],el.value)});
        fetch(g.action,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:b})}catch(x){}}
      return}
    e.preventDefault();
    list.textContent='';
    bad.forEach(function(b){
      var li=document.createElement('li'),a=document.createElement('a');
      a.href='#'+(b.i.id||'');a.textContent=b.m;
      a.addEventListener('click',function(ev){ev.preventDefault();b.i.focus&&b.i.focus()});
      li.appendChild(a);list.appendChild(li);
    });
    summary.hidden=false;summary.focus();summary.scrollIntoView({block:'center'});
  });
})();
