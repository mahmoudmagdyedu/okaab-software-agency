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

export function createYouTubePlayerHtml(videoId) {
  const safeId = String(videoId).replace(/[^a-zA-Z0-9_-]/g, "");
  return `<!doctype html><html dir="rtl"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#player{width:100%;height:100%;margin:0;background:#0D0D0D;overflow:hidden}</style></head><body><div id="player"></div><script>var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);var player,last=0;function emit(type,data){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({type:type,idempotencyKey:'youtube-'+Date.now()+'-'+Math.random().toString(36).slice(2)},data||{})))}function sample(){if(!player||!player.getDuration)return;var duration=player.getDuration(),current=player.getCurrentTime();if(duration>0){var percent=Math.min(100,Math.max(0,current/duration*100));if(percent-last>=5||percent>=85){last=percent;emit('video_progress',{percent:percent})}}}function onYouTubeIframeAPIReady(){player=new YT.Player('player',{videoId:'${safeId}',host:'https://www.youtube-nocookie.com',playerVars:{rel:0,playsinline:1},events:{onReady:function(){setInterval(sample,10000)},onStateChange:function(e){if(e.data===YT.PlayerState.ENDED)emit('video_progress',{percent:100})}}})}</script></body></html>`;
}
