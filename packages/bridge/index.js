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
    window.Reveal.on("slidechanged", ({ indexh = 0, indexv = 0 }) =>
      send("slide_changed", { index: indexh + indexv }),
    );
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
  return `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body,#player{width:100%;height:100%;margin:0;background:#0d0d0d;overflow:hidden}body{position:fixed;inset:0}</style></head><body><div id="player"></div><script>
var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';tag.referrerPolicy='strict-origin-when-cross-origin';tag.onerror=function(){emit('player_error',{code:'api_load_failed'})};document.head.appendChild(tag);
var player,last=0,timer=null;
function emit(type,data){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({type:type,idempotencyKey:'youtube-'+Date.now()+'-'+Math.random().toString(36).slice(2)},data||{})))}}
function sample(force){if(!player||!player.getDuration)return;var duration=Number(player.getDuration())||0,current=Number(player.getCurrentTime())||0;if(duration>0){var percent=Math.min(100,Math.max(0,current/duration*100));if(force||percent-last>=5||percent>=85){last=percent;emit('video_progress',{percent:percent,currentTime:current,duration:duration})}}}
function command(raw){try{var message=typeof raw==='string'?JSON.parse(raw):raw;if(!message||message.source!=='okaab-player'||!player)return;switch(message.command){case'play':player.playVideo();break;case'pause':player.pauseVideo();break;case'mute':player.mute();break;case'unmute':player.unMute();break;case'volume':player.setVolume(Math.max(0,Math.min(100,Number(message.value)||0)));break;case'rate':player.setPlaybackRate(Number(message.value)||1);break;case'seek':player.seekTo(Math.max(0,Number(message.value)||0),true);break}}catch(_){}}
document.addEventListener('message',function(event){command(event.data)});window.addEventListener('message',function(event){command(event.data)});
function onYouTubeIframeAPIReady(){player=new YT.Player('player',{videoId:'${safeId}',host:'https://www.youtube.com',playerVars:{controls:1,enablejsapi:1,playsinline:1,rel:0,origin:'${safeOrigin}',widget_referrer:'${safeOrigin}'},events:{onReady:function(){emit('player_ready',{duration:Number(player.getDuration())||0,muted:player.isMuted()});timer=setInterval(function(){sample(false)},2000)},onStateChange:function(e){emit('player_state',{state:e.data,currentTime:Number(player.getCurrentTime())||0,duration:Number(player.getDuration())||0});if(e.data===YT.PlayerState.ENDED){sample(true);emit('video_finished',{percent:100})}},onError:function(e){emit('player_error',{code:e.data})}}})}
window.addEventListener('beforeunload',function(){if(timer)clearInterval(timer)});
</script></body></html>`;
}
