var gol=null,golAnimator=null,golUI=null;window.onerror=function(a){GOLUIPanelSupport.show(!0,a,!1,gol)},$(document).ready(function(){var a=document.getElementById("golCanvas"),b=4,c=window.location.search.match(/^\?cs=(\d+)$/);if(null!==c){var d=parseInt(c[1]);d>=1&&20>=d&&(b=d)}a.width=window.innerWidth,a.height=window.innerHeight,a.height-=6;try{gol=new GOL(a,b)}catch(e){return void GOLUIPanelSupport.show(!0,e.message,!0,null)}try{gol.init()}catch(e){return void GOLUIPanelSupport.show(!0,e.message,!1,gol)}golAnimator=new GOLAnimator(gol,"divActualFramerate"),golUI=new GOLUI(gol,golAnimator),golUI.init(),golAnimator.start()});