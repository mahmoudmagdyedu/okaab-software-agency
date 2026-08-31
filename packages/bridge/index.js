function runtime() {
  if (window.__okaabBridgeInstalled) return;
  window.__okaabBridgeInstalled = true;
  const send = (type, payload = {}) => {
    const event = {
      type,
      ...payload,
      idempotencyKey: `bridge-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    const serialized = JSON.stringify(event);
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(serialized);
    } else if (window.parent !== window) {
      window.parent.postMessage({ source: "okaab-lesson", event }, window.location.origin);
    }
  };
  window.OkaabBridge = { emit: send };

  let revealConnected = false;
  const connectReveal = () => {
    if (revealConnected || !window.Reveal?.on) return false;
    revealConnected = true;
    const reportCurrentSlide = () => {
      const indices = window.Reveal?.getIndices?.() || {};
      send("slide_changed", {
        index: Number(indices.h || 0) + Number(indices.v || 0),
      });
    };
    window.Reveal.on("slidechanged", ({ indexh = 0, indexv = 0 }) =>
      send("slide_changed", { index: indexh + indexv }),
    );
    window.Reveal.on("ready", reportCurrentSlide);
    window.setTimeout(reportCurrentSlide, 0);
    return true;
  };
  if (!connectReveal()) {
    const timer = window.setInterval(() => {
      if (connectReveal()) window.clearInterval(timer);
    }, 250);
    window.setTimeout(() => window.clearInterval(timer), 15000);
  }

  window.addEventListener("okaab:quiz-finished", (event) =>
    send("quiz_finished", event.detail || {}),
  );
  window.addEventListener("okaab:task-result", (event) =>
    send("task_result", event.detail || {}),
  );
  window.addEventListener("okaab:lesson-finished", () => send("lesson_finished"));
}

export function createBridgeScript() {
  return `;(${runtime.toString()})();true;`;
}

export function createYouTubePlayerHtml(videoId, options = {}) {
  const safeId = String(videoId).replace(/[^a-zA-Z0-9_-]/g, "");
  const safeOrigin = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(String(options.origin || ""))
    ? String(options.origin)
    : "https://okaab.org";
  const safeHost = options.privacyEnhanced === false
    ? "https://www.youtube.com"
    : "https://www.youtube-nocookie.com";
  const playerUrl = `${safeHost}/embed/${safeId}?enablejsapi=1&playsinline=1&controls=1&rel=0&fs=1&iv_load_policy=3&origin=${encodeURIComponent(safeOrigin)}&widget_referrer=${encodeURIComponent(safeOrigin)}`;
  return `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body,#player{width:100%;height:100%;margin:0;background:#0d0d0d;overflow:hidden}body{position:fixed;inset:0}iframe{display:block;width:100%!important;height:100%!important;border:0}</style></head><body><iframe id="player" title="فيديو الدرس" src="${playerUrl}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><script>
var player,last=0,timer=null,ready=false,iframe=document.getElementById('player');
function emit(type,data){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({type:type,idempotencyKey:'youtube-'+Date.now()+'-'+Math.random().toString(36).slice(2)},data||{})))}}
var readyTimer=setTimeout(function(){if(!ready)emit('player_error',{code:'player_timeout',host:'${safeHost}'})},18000);
iframe.addEventListener('load',function(){emit('player_frame_loaded',{host:'${safeHost}'})});
setTimeout(function(){emit('player_frame_loaded',{host:'${safeHost}',mounted:true})},300);
var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';tag.async=true;tag.referrerPolicy='strict-origin-when-cross-origin';tag.onerror=function(){clearTimeout(readyTimer);emit('player_error',{code:'api_load_failed',host:'${safeHost}'})};document.head.appendChild(tag);
function sample(force){if(!player||!player.getDuration)return;var duration=Number(player.getDuration())||0,current=Number(player.getCurrentTime())||0;if(duration>0){var percent=Math.min(100,Math.max(0,current/duration*100));if(force||percent-last>=5||percent>=85){last=percent;emit('video_progress',{percent:percent,currentTime:current,duration:duration})}}}
function command(raw){try{var message=typeof raw==='string'?JSON.parse(raw):raw;if(!message||message.source!=='okaab-player'||!player)return;switch(message.command){case'play':player.playVideo();break;case'pause':player.pauseVideo();break;case'mute':player.mute();break;case'unmute':player.unMute();break;case'volume':player.setVolume(Math.max(0,Math.min(100,Number(message.value)||0)));break;case'rate':player.setPlaybackRate(Number(message.value)||1);break;case'seek':player.seekTo(Math.max(0,Number(message.value)||0),true);break}}catch(_){}}
document.addEventListener('message',function(event){command(event.data)});window.addEventListener('message',function(event){command(event.data)});
function initializePlayer(){if(player||!window.YT||!window.YT.Player)return;player=new YT.Player(iframe,{events:{onReady:function(){ready=true;clearTimeout(readyTimer);emit('player_ready',{duration:Number(player.getDuration())||0,muted:player.isMuted(),host:'${safeHost}'});timer=setInterval(function(){sample(false)},2000)},onStateChange:function(e){emit('player_state',{state:e.data,currentTime:Number(player.getCurrentTime())||0,duration:Number(player.getDuration())||0});if(e.data===YT.PlayerState.ENDED){sample(true);emit('video_finished',{percent:100})}},onError:function(e){clearTimeout(readyTimer);emit('player_error',{code:e.data,host:'${safeHost}'})}}})}
window.onYouTubeIframeAPIReady=initializePlayer;if(window.YT&&window.YT.Player)initializePlayer();
window.addEventListener('beforeunload',function(){clearTimeout(readyTimer);if(timer)clearInterval(timer)});
</script></body></html>`;
}
