//noinspection JSAnnotator
return (function(){
  var scrollThreshold = 30;

  bindClass("android.widget.Toast");

  function log(){}

  try{// noinspection JSAnnotator
    return (function(){
      var logScript = getScriptByName('logScript');
      if(logScript){
        eval('function run(){' + logScript.getText() + '}');
        return run();
      }
    })();
  }catch(e){alert("At line " + e.lineNumber + ": " + e);}
  /*logScriptEnd*/

  // noinspection JSCheckFunctionSignatures
  var script = getCurrentScript()
    , scriptId = script.getId()
    , screen = getActiveScreen()
    , context = screen.getContext()
    , thisScript = self;

  eval(getScriptByName('geometryHelpers').getText());
  eval(getScriptByName('selectHelpers').getText());
  eval(getScriptByName('eventHandlerHelpers').getText());

  function toast(msg){
    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
  }

  function FancyFolder(root){
    Saveable.call(this, root, 'FancyFolder');

    if(root){
      var edit = root.getProperties().edit();
      prependEventHandler("i.touch", new EventHandler(EventHandler.RUN_SCRIPT, scriptId), edit);
      prependEventHandler("i.longTap", new EventHandler(EventHandler.RUN_SCRIPT, scriptId), edit);
      prependEventHandler('i.swipeUp', new EventHandler(EventHandler.ITEM_MENU));
      edit.commit();

      //TODO create container
    }
  }

  FancyFolder.prototype = Saveable.prototype;
  FancyFolder.prototype.constructor = FancyFolder;
  FancyFolder.prototype.isOpen = false;

  FancyFolder.prototype.close = function(){
    // TODO close subfolders

    this.makeUnPersistent();

    //TODO set container visibility

    if(this.ocd)
      c.setPosition(ocd.x, ocd.y, ocd.sc, true);

    this.isOpen = false;

    /*this.onCloseListeners.forEach(function(f){
     f();
     })*/
  };

  FancyFolder.prototype.onLongClick = function(){
    this.isOpen ? this.close() : this.open();
  };

  FancyFolder.prototype.onMove = function(event){
    var p = {
      x: event.getX()
      , y: event.getY()
    };

    if(this.selectedIt && !itemBoxContainsPoint(this.selectedIt)){
      deselectIt(this.selectedIt);
      //clearTimeout(this.longClickTimeout);
      delete this.selectedIt;
    }else if(typeof this.selectedIt === 'undefined'){
      var nearestIt = this.getNearestItemToPoint(p);
      if(itemBoxContainsPoint(nearestIt, p)){
        selectIt(nearestIt);
        this.selectedIt = nearestIt;
        /*var thisFolder = this;
         this.longClickTimeout = setTimeout(function(){
         clearTimeout(thisFolder.longClickTimeout);
         handleOverriddenEventHandler(nearestIt.getProperties.getEventHandler("i.longTap"), function(){
         Saveable.getObject("FancyFolder", nearestIt).onLongClick();
         })
         },1000)*/
      }
    }
  };

  FancyFolder.prototype.onRelease = function(){
    if(typeof this.selectedIt !== 'undefined'){
      deselectIt(this.selectedIt);
      handleClick(this.selectedIt);
      this.close();
    }
  };

  FancyFolder.prototype.open = function(){
    //this.subFolders = [];
    this.makePersistent();
    var parent = this.getParent();

    //TODO set container visibility

    var ocd = {
      x: parent.getPositionX()
      , y: parent.getPositionY()
      , sc: parent.getPositionScale()
    };

    this.preOpenContainerData = ocd;

    var contWidth = parent.getWidth()
      , contHeight = parent.getHeight();

    // TODO change to container data
    var dLeft = this.left - ocd.x
      , dRight = this.right - ocd.x - contWidth
      , dTop = this.top - ocd.y
      , dBottom = this.bottom - ocd.y - contHeight;
    //log("this.left:"+this.left+", dLeft:"+dLeft+", this.right:"+this.right+", dRight:"+dRight+", this.top:"+this.top+", dTop:"+dTop+", this.bottom:"+this.bottom+", dBottom:"+dBottom)

    var contScaleX = contWidth / (dRight - dLeft + contWidth)
      , contScaleY = contHeight / (dBottom - dTop + contHeight)
      , newContScale = contScaleX < contScaleY ? contScaleY : contScaleX;

    var dx = 0
      , dy = 0;

    if(dLeft < 0){
      dx = dLeft;
    }else if(dRight > 0){
      dx = dRight;
    }

    if(dTop < 0){
      dy = this.top;
    }else if(dBottom > 0){
      dy = dBottom;
    }

    if(dx !== 0 || dy !== 0){
      parent.setPosition(ocd.x + dx, ocd.y + dy, newContScale > ocd.sc ? newContScale : ocd.sc, true);
    }

    this.isOpen = true;

    /*this.onOpenListeners.forEach(function(f){
     f();
     })*/
  };

  function handleClick(it){
    var evHa = it.getProperties().getEventHandler("i.tap");
    if(evHa.getAction() === EventHandler.UNSET)
      it.launch();
    else
      handleOverriddenEventHandler(evHa);
  }

  function handleOverriddenEventHandler(evHa, thisScriptFunction){
    var evHaAction = evHa.getAction()
      , evHaData = evHa.getData();

    if(evHaAction === EventHandler.RUN_SCRIPT){
      if(evHaData === scriptId){
        if(thisScriptFunction) thisScriptFunction();
      }else{
        //runScript(evHa.getData()) //TODO
      }
    }else{
      screen.runAction(evHaAction, it, evHaData);
    }
  }

  var touchEvent;
  try{
    touchEvent = typeof event === 'undefined';
  }catch(e){
    touchEvent = false;
  }
  if(touchEvent){
    var dx = thisScript.downX - event.getX()
      , dy = thisScript.downY - event.getY();
    switch(event.getActionMasked()){
      case MotionEvent.ACTION_DOWN:
        thisScript.downX = event.getX();
        thisScript.downY = event.getY();
        thisScript.downTime = new Date().getTime();
        thisScript.t = setTimeout(function(){
          handleOverriddenEventHandler(item.getProperties().getEventHandler("i.longTap"), function(){
            //long tap
            var folder = Saveable.getObject("FancyFolder", item);
            thisScript.originFolder = folder;
            folder.onLongClick();
          });
        }, 1000);
        break;
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_UP:
        if(thisScript.t) clearTimeout(thisScript.t);
        if(thisScript.originFolder){
          thisScript.originFolder.onRelease();
          delete thisScript.originFolder;
        }else{
          var dTime = new Date().getTime() - thisScript.downTime
            , absDx = Math.abs(dx)
            , absDy = Math.abs(dy)
            , d = Math.sqrt(dx * dx + dy * dy);
          if(dTime < 1000 && d < scrollThreshold){
            log("click");
            handleClick(item);
          }else if(absDx > 3 * scrollThreshold || absDy > 3 * scrollThreshold){
            if(absDx > 2 * absDy){
              if(dx > 0){
                log("swipeLeft");
                handleOverriddenEventHandler(item.getProperties().getEventHandler("i.swipeLeft"));
              }else{
                log("swipeRight");
                handleOverriddenEventHandler(item.getProperties().getEventHandler("i.swipeRight"));
              }
            }else if(absDy > 2 * absDx){
              if(dy > 0){
                log("swipeUp");
                handleOverriddenEventHandler(evHa);
              }else{
                log("swipeDown");
                handleOverriddenEventHandler(evHa);
              }
            }
          }
        }
        delete thisScript.downTime;
        delete thisScript.downX;
        delete thisScript.downY;
        clearTimeout(thisScript.t);
        delete thisScript.t;
        break;
      case MotionEvent.ACTION_MOVE:
        if(thisScript.originFolder){
          thisScript.originFolder.onMove(event);
        }else{
          if(Math.sqrt(dx * dx + dy * dy) > scrollThreshold){
            clearTimeout(thisScript.t);
          }
        }
        break;
      default:
        break;
    }
  }else{
    // item menu
    // noinspection JSCheckFunctionSignatures
    var folder = new FancyFolder(getEvent().getItem());
    folder.save();
  }
})();

function cleanEval(text){
  eval('function execute() {' + text + '}');
  execute();
}
