// ===== Nav Scroll =====
(function(){
  var nav=document.getElementById('nav');
  var toggle=document.getElementById('navToggle');
  var links=document.getElementById('navLinks');
  window.addEventListener('scroll',function(){
    if(window.scrollY>40)nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
  if(toggle)toggle.addEventListener('click',function(){
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });
  if(links)links.querySelectorAll('a').forEach(function(l){
    l.addEventListener('click',function(){links.classList.remove('open');toggle&&toggle.classList.remove('active');});
  });
})();

// ===== Floating Leaves =====
(function(){
  var layer=document.getElementById('leavesLayer');
  if(!layer)return;
  var colors=['#4a7c59','#7ba88a','#d4b896','#c4956c','#8dba6b'];
  var leafSVG='<svg viewBox="0 0 20 20" fill="none"><path d="M10 2C6 2 3 5 3 9C3 14 7 18 10 18C13 18 17 14 17 9C17 5 14 2 10 2Z" fill="COLOR" opacity="0.7"/><path d="M10 2V18" stroke="COLOR" stroke-width="0.5" opacity="0.4"/></svg>';
  function createLeaf(){
    var leaf=document.createElement('div');
    leaf.className='leaf';
    var color=colors[Math.floor(Math.random()*colors.length)];
    leaf.innerHTML=leafSVG.replace(/COLOR/g,color);
    var size=12+Math.random()*16;
    leaf.style.width=size+'px';
    leaf.style.height=size+'px';
    leaf.style.left=Math.random()*100+'%';
    leaf.style.opacity='0';
    layer.appendChild(leaf);
    var dur=8000+Math.random()*6000;
    var drift=(Math.random()-0.5)*200;
    var rot=(Math.random()-0.5)*720;
    leaf.animate([
      {transform:'translate(0,-30px) rotate(0deg)',opacity:0},
      {opacity:0.6,offset:0.1},
      {opacity:0.6,offset:0.9},
      {transform:'translate('+drift+'px,calc(100vh + 30px)) rotate('+rot+'deg)',opacity:0}
    ],{duration:dur,easing:'linear'}).onfinish=function(){leaf.remove();};
  }
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    setInterval(createLeaf,2500);
    for(var i=0;i<3;i++)setTimeout(createLeaf,i*800);
  }
})();

// ===== FAQ =====
(function(){
  var items=document.querySelectorAll('.faq-item');
  items.forEach(function(item){
    var q=item.querySelector('.faq-q');
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      items.forEach(function(i){i.classList.remove('open');i.querySelector('.faq-q').setAttribute('aria-expanded','false');});
      if(!open){item.classList.add('open');q.setAttribute('aria-expanded','true');}
    });
  });
})();

// ===== Account Login & Video Verification =====
(function(){
  var accountBtn=document.getElementById('accountBtn');
  var modal=document.getElementById('accountModal');
  var modalClose=document.getElementById('modalClose');
  var steps=modal?modal.querySelectorAll('.modal-step'):[];
  var video=document.getElementById('verifyVideo');
  var videoOverlay=document.getElementById('videoOverlay');
  var videoStatus=document.getElementById('videoStatus');
  var scanLine=document.getElementById('scanLine');
  var startBtn=document.getElementById('startVerifyBtn');
  var passBtn=document.getElementById('verifyPassBtn');
  var enterBtn=document.getElementById('enterApplyBtn');
  var accountLabel=document.getElementById('accountLabel');
  var stream=null;
  var verified=false;
  var curStep=1;

  function openModal(){
    if(verified){
      var top=document.getElementById('lease');
      if(top)top.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(modal)modal.classList.add('open');
    showStep(1);
  }
  function closeModal(){
    if(modal)modal.classList.remove('open');
    stopCamera();
    showStep(1);
  }
  function showStep(n){
    curStep=n;
    steps.forEach(function(s){s.classList.remove('active');});
    var t=modal.querySelector('.modal-step[data-ms="'+n+'"]');
    if(t)t.classList.add('active');
    if(n===2)startCamera();
    if(n!==2)stopCamera();
  }
  function startCamera(){
    if(stream)return;
    if(videoStatus){videoStatus.textContent='正在启动摄像头…';videoStatus.className='video-status';}
    if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false})
        .then(function(s){
          stream=s;
          if(video)video.srcObject=s;
          if(videoStatus){videoStatus.textContent='摄像头已就绪，点击「拍照」完成验证';}
        })
        .catch(function(e){
          if(videoStatus){videoStatus.textContent='无法访问摄像头：'+(e.message||e.name);videoStatus.className='video-status error';}
        });
    }else{
      if(videoStatus){videoStatus.textContent='当前浏览器不支持摄像头访问';videoStatus.className='video-status error';}
    }
  }
  function stopCamera(){
    if(stream){
      stream.getTracks().forEach(function(t){t.stop();});
      stream=null;
      if(video)video.srcObject=null;
    }
    if(videoOverlay){videoOverlay.classList.remove('scanning','success');}
    if(startBtn)startBtn.style.display='';
    if(passBtn)passBtn.style.display='none';
  }

  if(accountBtn)accountBtn.addEventListener('click',openModal);
  if(modalClose)modalClose.addEventListener('click',closeModal);
  if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});

  var nextBtn=modal?modal.querySelector('[data-ms-next]'):null;
  if(nextBtn)nextBtn.addEventListener('click',function(){
    showStep(2);
  });

  if(startBtn)startBtn.addEventListener('click',function(){
    if(!stream){if(videoStatus){videoStatus.textContent='请先允许摄像头权限';videoStatus.className='video-status error';}return;}
    if(videoOverlay)videoOverlay.classList.add('success');
    if(startBtn)startBtn.style.display='none';
    if(videoStatus){videoStatus.textContent='✓ 拍照完成，人脸已识别';videoStatus.className='video-status success';}
    if(passBtn)passBtn.style.display='';
  });

  if(passBtn)passBtn.addEventListener('click',function(){
    stopCamera();
    showStep(3);
  });

  if(enterBtn)enterBtn.addEventListener('click',function(){
    verified=true;
    if(modal)modal.classList.remove('open');
    if(accountBtn){accountBtn.classList.add('verified');}
    if(accountLabel)accountLabel.textContent='艾文杰 ✓';
    var top=document.getElementById('lease');
    if(top)top.scrollIntoView({behavior:'smooth',block:'start'});
  });

  var prevBtn=modal?modal.querySelector('[data-ms-prev]'):null;
  if(prevBtn)prevBtn.addEventListener('click',function(){stopCamera();showStep(1);});
})();

// ===== Contract Signing Flow =====
(function(){
  var readCheck=document.getElementById('contractRead');
  var nextBtn=document.getElementById('contractNextBtn');
  var prevBtn=document.getElementById('contractPrevBtn');
  var signInput=document.getElementById('signName');
  var signErr=document.getElementById('signNameErr');
  var signBtn=document.getElementById('contractSignBtn');
  var steps=document.querySelectorAll('.cf-step');

  if(!readCheck)return;

  function showStep(n){
    steps.forEach(function(s){s.classList.remove('active');});
    var t=document.querySelector('.cf-step[data-cs="'+n+'"]');
    if(t)t.classList.add('active');
  }

  readCheck.addEventListener('change',function(){
    if(readCheck.checked){nextBtn.disabled=false;}
    else{nextBtn.disabled=true;}
  });

  if(nextBtn)nextBtn.addEventListener('click',function(){
    if(readCheck.checked)showStep(2);
  });

  if(prevBtn)prevBtn.addEventListener('click',function(){showStep(1);});

  if(signBtn)signBtn.addEventListener('click',function(){
    var name=signInput.value.trim();
    if(!name){signErr.textContent='请输入您的姓名';signInput.style.borderColor='var(--berry)';return;}
    if(name!=='艾文杰'){signErr.textContent='姓名与申请人不一致，请确认';signInput.style.borderColor='var(--berry)';return;}
    signErr.textContent='';
    // Set sign time
    var now=new Date();
    var ts=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    var stEl=document.getElementById('signTime');
    if(stEl)stEl.textContent=ts;
    showStep(3);
    // Scroll into view
    var box=document.querySelector('.cf-success-box');
    if(box)box.scrollIntoView({behavior:'smooth',block:'center'});
  });

  if(signInput)signInput.addEventListener('input',function(){
    signErr.textContent='';
    signInput.style.borderColor='';
  });
})();

// ===== Resume Upload & Job Push =====
(function(){
  // Resume upload
  document.querySelectorAll('.resume-input').forEach(function(inp){
    inp.addEventListener('change',function(){
      var job=inp.id.split('-')[1];
      var st=document.getElementById('resume-status-'+job);
      var lbl=document.querySelector('.resume-label-text[data-job="'+job+'"]');
      if(inp.files&&inp.files[0]){
        if(st){st.textContent='已上传: '+inp.files[0].name;st.classList.add('uploaded');}
        if(lbl)lbl.textContent='重新上传';
      }else{
        if(st){st.textContent='未上传';st.classList.remove('uploaded');}
        if(lbl)lbl.textContent='上传简历';
      }
    });
  });

  // Toast element
  var toast=document.createElement('div');
  toast.className='job-push-toast';
  toast.id='pushToast';
  document.body.appendChild(toast);

  function showToast(msg){
    toast.textContent=msg;
    toast.classList.add('show');
    setTimeout(function(){toast.classList.remove('show');},3000);
  }

  // Push resume
  document.querySelectorAll('.job-push-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var job=btn.getAttribute('data-job');
      var name=btn.getAttribute('data-name');
      var inp=document.getElementById('resume-'+job);
      if(!inp||!inp.files||!inp.files[0]){
        showToast('请先上传简历后再推送');
        return;
      }
      btn.textContent='已推送 ✓';
      btn.classList.add('pushed');
      showToast('简历已成功推送至「'+name+'」，请等待用人单位联系');
    });
  });
})();

// ===== Smooth Scroll =====
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(l){
    l.addEventListener('click',function(e){
      var hr=l.getAttribute('href');
      if(hr.length>1){
        var t=document.querySelector(hr);
        if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-70,behavior:'smooth'});}
      }
    });
  });
})();

// ===== Scroll Reveal =====
(function(){
  if(!('IntersectionObserver' in window))return;
  var els=[
    {sel:'.bento-card',delay:80},
    {sel:'.apt-card',delay:100},
    {sel:'.profile-card',delay:80},
    {sel:'.detail-item',delay:50},
    {sel:'.job-card',delay:80},
    {sel:'.apt-applied-info',delay:0},
    {sel:'.comm-item',delay:60},
    {sel:'.faq-item',delay:50},
    {sel:'.section-head-left',delay:0},
    {sel:'.section-head-center',delay:0}
  ];
  els.forEach(function(c){
    document.querySelectorAll(c.sel).forEach(function(el,i){
      el.classList.add('reveal');
      el.style.transitionDelay=(i%6*c.delay)+'ms';
    });
  });
  var ob=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ob.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ob.observe(el);});
})();

// ===== Hero Number Counter =====
(function(){
  var nums=document.querySelectorAll('.hs-num[data-count]');
  if(!nums.length)return;
  var triggered=false;
  function animate(){
    if(triggered)return;
    triggered=true;
    nums.forEach(function(el){
      var target=parseInt(el.getAttribute('data-count'));
      var start=0;
      var dur=1200;
      var t0=performance.now();
      function tick(now){
        var p=Math.min((now-t0)/dur,1);
        var eased=1-Math.pow(1-p,3);
        el.textContent=Math.floor(start+(target-start)*eased);
        if(p<1)requestAnimationFrame(tick);
        else el.textContent=target;
      }
      requestAnimationFrame(tick);
    });
  }
  var hero=document.querySelector('.hero-stats');
  if(hero){
    var ob=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){animate();ob.disconnect();}});},{threshold:.5});
    ob.observe(hero);
  }
})();