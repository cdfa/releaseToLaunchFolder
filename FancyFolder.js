LL.bindClass("android.widget.Toast");

var logScript=LL.getScriptByName('logScript');if(logScript){try{return eval('(function(){'+logScript.getText()+'})()');}catch(e){if(e.message!="Custom view not found!"&&e.message!="Custom view not loaded!"){alert(e);}function log(){}}}else{function log(){}}/*logScriptEnd*/

var script = LL.getCurrentScript();
var scriptId = script.getId();
var e = LL.getEvent();
var src = e.getSource();
var context = LL.getContext();
var item = e.getItem()
var rootId = item.getId()
var cont = item.getParent()
var tag = item.getTag("FF")
var linkedItems = JSON.parse(item.getTag("linkedItems"));
if(linkedItems==null)linkedItems=[];

var rootX = item.getPositionX()
    var rootY = item.getPositionY()
    var boxSize = getBoxSize(item)
    var rootBoxWidth = boxSize.w;
    var rootBoxHeight = boxSize.h;
    var rootCenterX = rootX+rootBoxWidth/2
    var rootCenterY = rootY+rootBoxHeight/2


function getBoxSize(it){
  var rot = it.getRotation()*(Math.PI/180);
  var cos = Math.abs(Math.cos(rot));
  var sin = Math.abs(Math.sin(rot));
  var w = it.getWidth()*it.getScaleX();
  var h = it.getHeight()*it.getScaleY();
  return {w:w*cos+h*sin, h:w*sin+h*cos};
}

function openClose(){
  var isClosed = JSON.parse(item.getTag("isClosed"))

  if(isClosed){
    var maxRight=rootCenterX
    var maxLeft=rootCenterX
    var maxTop=rootCenterY
    var maxBottom=rootCenterY
  }
  
  for(i=0; i<linkedItems.length; i++){
    var child = null
    try{
      child = cont.getItemById(linkedItems[i])
      child.setVisibility(isClosed)
    }catch(err){
      if(err != 'TypeError: Cannot call method "setVisibility" of null'){
        alert(err+" on "+linkedItems[i]+"i: "+i)
      }else{
        linkedItems.slice(i,1);
        continue;
      }
    }
    var childX = child.getPositionX()
    var childY = child.getPositionY()
    var boxSize = getBoxSize(item)
    var childBoxWidth = boxSize.w;
    var childBoxHeight = boxSize.h;
    
    if(child!=null){
      if(isClosed){
        if(childX<maxLeft) maxLeft=childX

        var newRight = childX+childBoxWidth
        if(newRight>maxRight) maxRight=newRight

        if(childY<maxTop) maxTop=childY

        var newBottom = childY+childBoxHeight
        if(newBottom>maxBottom) maxBottom=newBottom
      }
    }
  }
  var contX = cont.getPositionX()
  var contY = cont.getPositionY()
  var oldContScale = cont.getPositionScale()
  if(isClosed){
    var contWidth = cont.getWidth()
    var contHeight = cont.getHeight()
    var contProp = {x:contX, y:contY, sc:oldContScale}
    item.setTag("contProp", JSON.stringify(contProp))

    var dLeft = maxLeft-contX
    var dRight = maxRight-contX-contWidth
    var dTop = maxTop-contY
    var dBottom = maxBottom-contY-contHeight
    //log("maxLeft:"+maxLeft+", dLeft:"+dLeft+", maxRight:"+maxRight+", dRight:"+dRight+", maxTop:"+maxTop+", dTop:"+dTop+", maxBottom:"+maxBottom+", dBottom:"+dBottom)
    
    var contScaleX = contWidth/(dRight-dLeft+contWidth)
    var contScaleY = contHeight/(dBottom-dTop+contHeight)
    
    var newContScale = contScaleX<contScaleY? contScaleX : contScaleY
    if(newContScale>oldContScale) newContScale=oldContScale

    dx=0
    dy=0

    if(dLeft<0){
      dx=dLeft
    }else if(dRight>0){
      dx=dRight
    }

    if(dTop<0){
      dy=maxTop
    }else if(dBottom>0){
      dy=dBottom
    }

    if(dx!=0 || dy!=0){
      cont.setPosition(contX+dx,contY+dy,newContScale,true)
    }
  }else{
    contProp = JSON.parse(item.getTag("contProp"))
    if(contProp==null){
      contProp = {x:contX, y:contY, sc:oldContScale}
    }
    cont.setPosition(contProp.x, contProp.y, contProp.sc,true)
  }
  item.setTag("isClosed",!isClosed)
}

function openCircle(){
  item.setTag("FF", "Adding Items")

  if(typeof circle =="undefined"){
    circle = LL.createImage(101,101)
    var c = circle.draw()
    var p = new Paint(Paint.ANTI_ALIAS_FLAG)
    p.setColor(Color.WHITE)
    c.drawCircle(51,51,50,p)
    p.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC))
    p.setColor(Color.TRANSPARENT)
    c.drawCircle(51,51,45,p)
  }
  item.setBoxBackground(circle,"n",true)
  
  var width = item.getWidth()
  var height = item.getHeight()

  item.setTag("original width", width)
  item.setTag("original height", height)

  if(width<400){
    item.setSize(400, height)
    item.setPosition(item.getPositionX()-(400-width)/2, item.getPositionY())
  }
  if(height<400){
    item.setSize(item.getWidth(), 400)
    item.setPosition(item.getPositionX(), item.getPositionY()-(400-height)/2)
  }
  
  Toast.makeText(context, "put items in circle and run script again to add or delete", Toast.LENGTH_SHORT).show()
}

function removeItem(itId, i){
  if(i==null)var i = linkedItems.indexOf(itId)
  linkedItems.splice(i, 1);
}

function getCenter(item){
	var r=item.getRotation()*Math.PI/180;
	var sin=Math.abs(Math.sin(r));
	var cos=Math.abs(Math.cos(r));
	var w=item.getWidth()*item.getScaleX();
	var h=item.getHeight()*item.getScaleY();
	return{x:item.getPositionX()+(w*cos+h*sin)*0.5, y:item.getPositionY()+(h*cos+w*sin)*0.5};﻿
}﻿

function getDistance(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))
}

if(tag==null){
  item.getProperties().edit().setEventHandler("i.longTap", EventHandler.RUN_SCRIPT, scriptId).commit()
  openCircle()
}else if(tag=="rootItem"){
  if(src=="MENU_ITEM"){
    openCircle()
  }else{
    openClose()
  }
}else if(tag=="Adding Items"){
    item.setTag("FF", "rootItem")
    var items = cont.getItems()
    for(i=0; i<items.length; i++){
      var newItem=items.getAt(i)
      if(newItem.isVisible()){
        var center = getCenter(newItem)
        var newX = center.x
        var newY = center.y
        if(getDistance(rootCenterX, rootCenterY, newX, newY)<item.getWidth()/2 && newItem!=item){
          var newId = newItem.getId()
          var linked = false
          for(j=0; j<linkedItems.length; j++){
            if(newId==linkedItems[j]){
              linked = true
              break
            }
          }
          if(linked){
            removeItem(newId, j)
          }else{
            linkedItems.push(newItem.getId())
          }
        }
      }
    }
    if(linkedItems.length==0){
      var defaultEvHa = cont.getProperties().getEventHandler("i.longTap")
      item.getProperties().edit().setEventHandler("i.longTap", defaultEvHa.getAction(), defaultEvHa.getData()).commit()
      item.setTag("FF", null)
    }
    item.setBoxBackground(null,"n",true)
    
    var orWidth = item.getTag("original width")
    var orHeight = item.getTag("original height")
    item.setPosition(rootCenterX-orWidth/2, rootCenterY-orHeight/2)
    item.setSize(orWidth,orHeight)
    
    item.setTag("isClosed",false)
    Toast.makeText(context, "You can now place the items wherever you want in this container", Toast.LENGTH_SHORT).show()
}

item.setTag("linkedItems", JSON.stringify(linkedItems));
