// TODO: revive root item after load
// SEE BELOW FOR CONFIG1!

//noinspection JSAnnotator
return (function(){
  // CONFIG
  var scrollThreshold = 30
    // if the script should automatically change the item menu event of a folder item
    , newOpenItemMenuEvent = true
    // what event should open the item menu if the above is enabled (see: http://www.lightninglauncher.com/scripting/reference/api/reference/net/pierrox/lightning_launcher/script/api/PropertySet.html > Item properties > Event handlers
    , openItemMenuEvent = 'i.swipeUp';

  // @formatter:off
  function log(){}try{// noinspection JSAnnotator
    return (function(){var logScript = getScriptByName('logScript');if(logScript){eval('function run(){' + logScript.getText() + '}');return run();}})();}catch(e){alert("At line " + e.lineNumber + ": " + e);}/*logScriptEnd*/
  // @formatter:on

  bindClass("android.widget.Toast");

  eval(getScriptByName('geometryHelpers').getText());
  eval(getScriptByName('selectHelpers').getText());
  eval(getScriptByName('eventHandlerHelpers').getText());

  // noinspection JSCheckFunctionSignatures
  var script = getCurrentScript()
    , scriptId = script.getId()
    , screen = getActiveScreen()
    , context = screen.getContext()
    , thisScript = self
    , FFTagName = "FancyFolder";

  function toast(msg, length){
    Toast.makeText(context, msg, length || Toast.LENGTH_SHORT).show();
  }

  function sourceIsOnTouch(){
    try{
      event.getX()
    }catch(e){
      return false;
    }
    return true;
  }

  function FancyFolder(root){
    Saveable.call(this, root, FFTagName);

    if(root){
      this.root = root;
      if(root.getTag(FFTagName) === null){
        var edit = root.getProperties().edit();
        prependEventHandler("i.longTap", new EventHandler(EventHandler.RUN_SCRIPT, scriptId), edit);
        /*if(newOpenItemMenuEvent)
          prependEventHandler(openItemMenuEvent, new EventHandler(EventHandler.ITEM_MENU));*/
        edit.commit();

        //TODO create container
      }else if(prompt('This item is already a folder item. Do you want to uninstall?')){
        // TODO uninstallation
      }
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

  FancyFolder.prototype.toggleOpen = function(){
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
         Saveable.getObject("ReleaseToLaunchFolder", nearestIt).onLongClick();
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
    var parent = this.getParent()
      , root = this.root;

    //TODO: setEventHandlerRestorably
    /*root
      .getProperties()
      .edit()
      .setEventHandler('i.touch', EventHandler.RUN_SCRIPT, getScriptByName('Test').getId())
      .commit();*/

    /*setTimeout(function(){
      //TODO: get correct parameters from android classes
      var rootCenter = getCenter(root);
      c.getView().dispatchTouchEvent(MotionEvent.obtain(0, 0, 0, rootCenter.x, rootCenter.y, 0));
    }, 0);*/

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

  if(sourceIsOnTouch()){
    //TODO
    // thisScript.originFolder.handleTouchEvent(event);
    log(event.getActionMasked());
    switch(event.getActionMasked()){
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_UP:

    }
  }else{
    switch(getEvent().getSource()){
      case 'I_LONG_CLICK':
        var item = getEvent().getItem();
        var folder = Saveable.getObject("FancyFolder", item);
        thisScript.originFolder = folder;
        folder.toggleOpen();
        break;
      case 'ITEM_MENU':
        (new FancyFolder(getEvent().getItem())).save();
        break;
    }
  }
})();
