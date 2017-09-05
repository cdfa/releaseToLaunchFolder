//noinspection JSAnnotator
return (function(){
  bindClass("android.widget.Toast");

  function log(){}

  try{
    var logScript = getScriptByName('logScript');
    if(logScript){
      eval('function run(){' + logScript.getText() + '}');
      return run();
    }
  }catch(e){alert("At line " + e.lineNumber + ": " + e);}
  /*logScriptEnd*/

  // noinspection JSCheckFunctionSignatures
  var script = getCurrentScript()
    , scriptId = script.getId()
    , screen = getActiveScreen()
    , context = screen.getContext()
    , thisScript = self;

  eval(getScriptByName('geometryHelpers').getText());
  eval(getScriptByName('eventHandlerHelpers').getText());
  eval(getScriptByName('selectHelpers').getText());
  eval(getScriptByName('Idable').getText());
  eval(getScriptByName('ItemCollection').getText());

  function toast(msg){
    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
  }

  function FancyFolder(root, tagObj, tagName){
    ItemCollection.call(this, [root], tagObj, tagName);

    if(root){
      //this.add(root)
      root.setTag("myFolderId", this.getId());
      this.rootId = root.getId();
      var edit = root.getProperties().edit();
      edit.setEventHandler("i.touch", EventHandler.RUN_SCRIPT, scriptId);
      edit.setEventHandler("i.longTap", EventHandler.RUN_SCRIPT, scriptId);
      edit.commit();
    }

    this.setSizeTracking(true);
  }

  FancyFolder.getIdFromRoot = function(root){
    var id = root.getTag("myFolderId");
    if(id === null) throw new Error(root + "is not a rootItem!");
    return id;
  };

  FancyFolder.isRoot = function(it){
    return it.getTag("myFolderId") !== null;
  };

  FancyFolder.prototype = ItemCollection.prototype;
  FancyFolder.prototype.constructor = FancyFolder;
  FancyFolder.prototype.isOpen = false;

  /*FancyFolder.prototype.add = function(it, isRoot, containsCheckDone){
   if(isRoot===null) FancyFolder.isRoot(it);

   if(isRoot){
   if(!this.subFolderIds) this.subFolderIds = []
   this.subFolderIds.push(FancyFolder.getIdFromRoot(it))
   }
   return ItemCollection.prototype.add.call(this, it, containsCheckDone);
   }*/

  FancyFolder.prototype.close = function(){
    this.makeUnPersistent();
    for(var i = 1; i < getCount(); i++){
      var it = this.getAt(i);
      if(it){
        child.setVisibility(false)
      }else{
        this.remove(it);
      }
    }

    if(this.ocd)
      c.setPosition(ocd.x, ocd.y, ocd.sc, true);

    this.isOpen = false;

    /*this.onCloseListeners.forEach(function(f){
     f();
     })*/
  };

  FancyFolder.prototype.getRoot = function(){
    return this.getAt(0);
  };

  FancyFolder.prototype.interactWith = function(it){
    //the same it?
    if((this.itIds && it.getId() === this.itIds[0]) || (this.getAt(0).getId() === it.getId())){
      return false;
    }else{
      if(this.contains(it)){
        this.remove(it);
      }else{
        this.add(it, true);
      }
      return true;
    }
  };

  FancyFolder.prototype.onLongClick = function(){
    if(this.isOpen && this.closeOnLongHover){
      this.close();
    }else{
      this.open();
    }
  };

  FancyFolder.prototype.onMove = function(){
    var p = {
      x: event.getX()
      , y: event.getY()
    };

    if(!closeOnLongHover && !itemBoxContainsPoint(this.getRoot(), p))
      this.closeOnLongHover = true;

    if(this.prevNearestIt && !itemBoxContainsPoint(this.prevNearestIt)){
      deselectIt(prevNearestIt);
      //clearTimeout(this.longClickTimeout)
      this.prevNearestIt = null;
    }else if(!this.prevNearestIt){
      var nearestIt = this.getNearestItemToPoint(p);
      if(itemBoxContainsPoint(nearestIt, p)){
        selectIt(nearestIt);
        this.prevNearestIt = nearestIt;
        /*var thisFolder = this;
         this.longClickTimeout = setTimeout(function(){
         clearTimeout(thisFolder.longClickTimeout);
         handleOverriddenEventHandler(nearestIt.getProperties.getEventHandler("i.longTap"), function(){
         Saveable.getObject("FancyFolder", FancyFolder.getIdFromRoot(nearestIt)).onLongClick();
         })
         },1000)*/
      }
    }
  };

  FancyFolder.prototype.onRelease = function(){
    this.close();
    setTimeout(function(){
      if(this.prevNearestIt){
        deselectIt(prevNearestIt);
        handleOverriddenEventHandler(this.prevNearestIt.getProperties().getEventHandler("i.tap"));
      }
    }, 0);
  };

  FancyFolder.prototype.open = function(){
    //this.subFolders = [];
    this.makePersistent();
    var c = this.getParent();

    for(var i = 1; i < getCount(); i++){
      var it = this.getAt(i);
      if(it){
        child.setVisibility(true)
      }else{
        this.remove(it);
      }
    }

    var ocd = {
      x: c.getPositionX()
      , y: c.getPositionY()
      , sc: c.getPositionScale()
    };

    this.preOpenContainerData = ocd;

    var contWidth = c.getWidth()
      , contHeight = c.getHeight();

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
      c.setPosition(ocd.x + dx, ocd.y + dy, newContScale > ocd.sc ? newContScale : ocd.sc, true);
    }

    this.closeOnLongHover = false;
    this.isOpen = true;

    /*this.onOpenListeners.forEach(function(f){
     f();
     })*/
  };

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

  function onClick(){
    var firstIt = getSelectedIt()
      , secondIt = it;

    if(it.getId() === getSelectedIt().getId()){
      deselectIt(it)
    }else{
      var firstItIsRoot = FancyFolder.isRoot(firstIt)
        , secondItIsRoot = FancyFolder.isRoot(secondIt)
        , folder;

      if(!firstItIsRoot && !secondItIsRoot){
        folder = new FancyFolder(firstIt);
        folder.add(secondIt, true)
      }else if(firstItIsRoot && !secondItIsRoot){
        folder = Saveable.getObject("FancyFolder", FancyFolder.getIdFromRoot(firstIt));
        folder.interactWith(secondIt, false);
      }else if(!firstItIsRoot && secondItIsRoot){
        folder = Saveable.getObject("FancyFolder", FancyFolder.getIdFromRoot(secondItIt));
        folder.interactWith(firstIt, false);
        deselectIt(firstIt)
      }

      /*else if(firstItIsRoot && secondItIsRoot){
       var folder = Saveable.getObject("FancyFolder",  FancyFolder.getIdFromRoot(firstIt))
       folder.add(secondIt, true);
       }else if(!firstItIsRoot && !secondItIsRoot){
       var folder = new FancyFolder(firstIt)
       folder.add(secondIt, false)
       }*/

      folder.save();
    }
  }

  var touchEvent;
  try{
    // noinspection JSUnusedLocalSymbols
    var x = event.getX();
    touchEvent = true;
  }catch(err){
    touchEvent = false;
  }
  if(touchEvent){
    var scrollThreshold = 30;

    switch(event.getActionMasked()){
      case MotionEvent.ACTION_DOWN:
        thisScript.downX = event.getX();
        thisScript.downY = event.getY();
        thisScript.downTime = new Date().getTime();
        thisScript.t = setTimeout(function(){
          handleOverriddenEventHandler(item.getProperties().getEventHandler("i.longTap"), function(){
            //long tap
            thisScript.open = true;
            var folder = Saveable.getObject("FancyFolder", FancyFolder.getIdFromRoot(item));
            thisScript.originFolderId = folder.getId();
            folder.onLongClick();
          });
        }, 1000);
        break;
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_UP:
        if(thisScript.t) clearTimeout(thisScript.t);
        if(thisScript.open){
          delete thisScript.open;
          delete thisScript.originFolderId;
          Saveable.getObject("FancyFolder", thisScript.originFolderId).onRelease();
        }else{
          var dTime = new Date().getTime() - thisScript.downTime
            , dx = thisScript.downX - event.getX()
            , dy = thisScript.downY - event.getY()
            , absDx = Math.abs(dx)
            , absDy = Math.abs(dy)
            , evHa = item.getProperties().getEventHandler("i.tap");
          if(dTime < 1000 && absDx < scrollThreshold && absDy < scrollThreshold){
            log("click");
            handleOverriddenEventHandler(evHa, onClick);
          }else if(absDx > 3 * scrollThreshold || absDy > 3 * scrollThreshold){
            if(absDx > 2 * absDy){
              if(dx > 0){
                log("swipeLeft");
                handleOverriddenEventHandler(evHa);
              }else{
                log("swipeRight");
                handleOverriddenEventHandler(evHa);
              }
            }else if(absDy > 2 * absDx){
              if(dy > 0){
                log("swipeUp");
                // TODO: open item menu
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
        if(thisScript.open){
          Saveable.getObject("FancyFolder", thisScript.originFolderId).onMove();
        }else{
          if(Math.abs(thisScript.downX - event.getX()) > scrollThreshold || Math.abs(thisScript.downY - event.getY()) > scrollThreshold){
            clearTimeout(thisScript.t);
          }
        }
        break;
      default:
        break;
    }
  }else{
    // noinspection JSCheckFunctionSignatures
    var e = getEvent()
      , it = e.getItem();
    if(it){
      var src = e.getSource();

      if(src === "MENU_ITEM"){
        // noinspection JSCheckFunctionSignatures
        var firstIt = e.getItem();
        var c = firstIt.getParent();
        selectIt(firstIt);
        setEventHandlerRestorably(c, "i.tap", EventHandler.RUN_SCRIPT, scriptId);
        script.setTag("cId", c.getId());
        setEventHandlerRestorably(screen.getCurrentDesktop(), "backKey", EventHandler.RUN_SCRIPT, scriptId);
      }else if(src === "I_CLICK"){
        onClick()
      }
    }else{
      //back key
      restoreEventHandler(screen.getContainerById(script.getTag("cId")), "i.tap");
      restoreEventHandler(screen.getCurrentDesktop(), "backKey");
      deselectIt();
      toast("Canceled");
    }
  }

  /*function getDistance(x1, y1, x2, y2){
   return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))
   }*/
})();

function cleanEval(text){
  eval('function execute() {' + text + '}');
  execute();
}
