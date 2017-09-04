var script = LL.getCurrentScript()
var scriptId = script.getId()
var event = LL.getEvent()
var src = event.getSource()
var item = event.getItem()
var dx, dy, label, connector, linkedItems, openItems, center, i

try{
  defaultIconWidth = item.getTag("defaultIconWidth")
}catch(err){
}

function Prop(item){
  this.x = item.getPositionX()
  this.y = item.getPositionY()
  this.w = item.getWidth()
  this.h = item.getHeight()
  this.sx = item.getScaleX()
  this.sy = item.getScaleY()
  this.r = item.getRotation()
}

function saveProp(item, prop){
  item.setTag("prop", JSON.stringify(prop))
}

function hasChanged(item){
  var oldProp = item.getTag("prop")
  var newProp = new Prop(item)
  if(oldProp!=null && oldProp==JSON.stringify(newProp)){
    return false
  }else{
    saveProp(item,newProp)
    return true
  }
}

function addConnector(newId){
  connector = cont.addShortcut("", new Intent(), 0, 0)
  connector.setName(newId+" connector")
  connector.setSize(10, 100)
  connector.setVisibility(false)
  connector.getProperties().edit().setBoolean("s.iconVisibility", false).commit()
  if(typeof stick =="undefined"){
    var stick = LL.createImage(10,100)
    var c = stick.draw()
    c.drawARGB(255, 255, 255, 255)
  }
  connector.setBoxBackground(stick,"n",true)
}

function getEllipsRadius(rot, right, top){
  return (right*top)/Math.sqrt(Math.pow(right*Math.sin(rot), 2)+Math.pow(top*Math.cos(rot), 2))
}

function getDistance(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))
}

function tag(){
  return item.getTag("FF3")
}

function getCenter(item){
    return{x:item.getPositionX()+getBoxWidth(item)*0.5, y:item.getPositionY()+getBoxHeight(item)*0.5};﻿
}

function getBoxWidth(item){
  var rot = item.getRotation()*Math.PI/180;
  return (item.getWidth()*item.getScaleX())*Math.abs(Math.cos(rot))+(item.getHeight()*item.getScaleY())*Math.abs(Math.sin(rot))
}

function getBoxHeight(item){
  var rot = item.getRotation()*Math.PI/180;
  return (item.getWidth()*item.getScaleX())*Math.abs(Math.sin(rot))+(item.getHeight()*item.getScaleY())*Math.abs(Math.cos(rot))
}

function openCircle(){
  item.setTag("FF3", "Adding Items")

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
  item.getProperties().edit().setFloat("s.iconEffectScale", 0.9).commit()
  
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
  
  Android.makeNewToast("put items in circle and run script again to add or delete", true).show()
}

function removeItem(index){
  try{
    cont.removeItem(cont.getItemByName(linkedItems[index]+" connector"))
  }catch(err2){
  }
  try{
    cont.removeItem(cont.getItemByName(linkedItems[index]+" label"))
  }catch(err2){
  }
  try{
    cont.getItemById(linkedItems[index]).setIconLayer(null,"n",true)
  }catch(err2){
  }
  linkedItems.splice(index,1)
}

function openClose(){
  var linkedItems = getArrayTag(item, "linkedItems")
  var isClosed = JSON.parse(item.getTag("isClosed"))
  
  var itemScaleX = item.getScaleX()
  var itemScaleY = item.getScaleY()
  var itemRot = item.getRotation()

  label = null
  try{
    label = cont.getItemByName(rootId+" label")
    if(label.getLabel()!=item.getLabel()){
      updateLabelText(item, label)
    }
  }catch(err){
  }

  var updateAll=false
  if(hasChanged(item)){
    updateAll=true
    if(label != null) updateLabelPos(item, rootCenterY, label)
  }

  if(isClosed){
    var maxRight=rootX+rootBoxWidth
    var maxLeft=rootX
    var maxTop=rootY
    var maxBottom=rootY+rootBoxHeight
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
        removeItem(i)
        item.setTag("linkedItems", JSON.stringify(linkedItems))
        i=i-1
      }
    }
    
    if(child!=null){
      var childX = child.getPositionX()
      var childY = child.getPositionY()
      var childBoxWidth = getBoxWidth(child)
      var childBoxHeight = getBoxHeight(child)

      openItems = getArrayTag(script, "openItems")
      if(isClosed){
        if(childX<maxLeft) maxLeft=childX

        var newRight = childX+childBoxWidth
        if(newRight>maxRight) maxRight=newRight

        if(childY<maxTop) maxTop=childY

        var newBottom = childY+childBoxHeight
        if(newBottom>maxBottom) maxBottom=newBottom
        
        openItems.push(rootId)
      }else{
        openItems.splice(openItems.indexOf(rootId), 1)
      }
      script.setTag("openItems", JSON.stringify(openItems))
    }
  }
  
  var closeInfo;
  var contX = cont.getPositionX()
  var contY = cont.getPositionY()
  var oldContScale = cont.getPositionScale()
  if(isClosed){
    var contWidth = cont.getWidth()
    var contHeight = cont.getHeight()

    var dLeft = maxLeft-contX
    var dRight = maxRight-contX-contWidth
    var dTop = maxTop-contY
    var dBottom = maxBottom-contY-contHeight
    //alert("maxLeft:"+maxLeft+", dLeft:"+dLeft+", maxRight:"+maxRight+", dRight:"+dRight+", maxTop:"+maxTop+", dTop:"+dTop+", maxBottom:"+maxBottom+", dBottom:"+dBottom)
    
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
      dy=dTop
    }else if(dBottom>0){
      dy=dBottom
    }

    if(dx!=0 || dy!=0){
      cont.setPosition(contX+dx,contY+dy,newContScale,true)
    }
    
    var bgWidth = maxRight-maxLeft
    alert(maxRight)
    var bgHeight = maxBottom-maxTop
    var bgItem = cont.addShortcut("", new Intent(), maxLeft, maxTop) 
    bgItem.setName(rootId+"bg")
    //bgItem.setSize(bgWidth, bgHeight)
    cont.setItemZIndex(bgItem.getId, 0)
    var ed = bgItem.getProperties().edit();
    ed.setBoolean("s.iconVisibility", false);
    ed.setBoolean("s.labelVisibility", false);
    //ed.setEventHandler("i.touch", EventHandler.RUN_SCRIPT, script_touch.getId());
    ed.commit();
    
    var bg = LL.createImage(bgWidth, bgHeight);
    bg.draw().drawARGB(100, 255, 255, 255);
    bgItem.setBoxBackground(bg, "n");
    
    closeInfo = {x:contX, y:contY, sc:oldContScale, bgId:bgItem.getId()}
    item.setTag("closeInfo", JSON.stringify(closeInfo))
  }else{
    closeInfo = JSON.parse(item.getTag("closeInfo"))
    if(closeInfo==null){
      closeInfo = {x:contX, y:contY, sc:oldContScale}
    }
    cont.setPosition(closeInfo.x, closeInfo.y, closeInfo.sc, true)
    try{
      cont.removeItem(cont.getItemById(closeInfo.bgId))
    }catch(e){   
    }
  }

  for(i=0; i<linkedItems.length; i++){
      child = cont.getItemById(linkedItems[i])
      var center=getCenter(child)
      var childCenterX = center.x
      var childCenterY = center.y
      var childBoxWidth = getBoxWidth(child)
      var childBoxHeight = getBoxHeight(child)
      var childScaleX = child.getScaleX()
      var childScaleY = child.getScaleY()
      var childRot = child.getRotation()
      
      connector = null
      label = null
      try{
        connector = cont.getItemByName(linkedItems[i]+" connector")
        connector.setVisibility(isClosed)
      }catch(err){
      }
      try{
        label = cont.getItemByName(linkedItems[i] + " label")
        label.setVisibility(isClosed)
        if(label.getLabel()!=child.getLabel()){
          updateLabelText(child, label)
        }
      }catch(err){
      }
      
      if((hasChanged(child) && connector != null) || updateAll){
        if(label!=null) updateLabelPos(child, childCenterY, label)

        dx = rootCenterX-childCenterX
        dy = rootCenterY-childCenterY

        var a = Math.atan(dy/dx)
        if(dx>=0) a=a+Math.PI
        connector.setRotation(a*(180/Math.PI)+90)

        if(itemScaleX == itemScaleY && childScaleX == childScaleY ){
          connector.setSize(10, getDistance(rootCenterX, rootCenterY, childCenterX, childCenterY)-defaultIconWidth*itemScaleX+2)
          var rx = rootCenterX
          var ry = rootCenterY
        }else{
          var rootR = getEllipsRadius(a, defaultIconWidth*itemScaleX/2, defaultIconWidth*itemScaleY/2)
          var childR = getEllipsRadius(a+Math.PI, defaultIconWidth*childScaleX/2, defaultIconWidth*childScaleY/2)
          rx = rootCenterX+rootR*Math.cos(a)
          ry = rootCenterY+rootR*Math.sin(a)
          var cx = childCenterX + childR*Math.cos(a+Math.PI)
          var cy = childCenterY + childR*Math.sin(a+Math.PI)

          dx = rx-cx
          dy = ry-cy
          
          var ch = getDistance(rx, ry, cx, cy)
          if(ch<=0)ch=1
          connector.setSize(10, ch+10)
        }
      connector.setPosition(rx-dx/2-getBoxWidth(connector)/2, ry-dy/2-getBoxHeight(connector)/2)
      }
  }
  item.setTag("isClosed",!isClosed)
}

function updateLabelPos(item, centerY, label){
  var itemProp = item.getProperties()
  label.setSize(getBoxWidth(item), itemProp.getFloat("s.labelFontSize") * itemProp.getInteger("s.labelMaxLines")*4.2)
  //alert( item.getPositionX()+", "+ centerY+defaultIconWidth*item.getScaleY()/2 + itemProp.getInteger("s.labelVsIconMargin"))
  label.setPosition(item.getPositionX(), centerY+defaultIconWidth*item.getScaleY()/2 + itemProp.getInteger("s.labelVsIconMargin"))
}

function updateLabelText(item, label){
  label.setLabel(item.getLabel(), true)
}

function addLabel(item, centerY){
  var itemProp = item.getProperties()
  itemEd = itemProp.edit()
  itemEd.setBoolean("s.labelVisibility", false)
  itemEd.commit()
  label = cont.addShortcut("", new Intent(), 0,0)
  if(item.getTag("FF3")=="Adding Items"){
    defaultIconWidth = label.getWidth()
    item.setTag("defaultIconWidth", defaultIconWidth)
  }
  label.setName(item.getId()+" label")
  updateLabelPos(item, centerY, label)
  updateLabelText(item, label)
  cont.setItemZIndex(label.getId(), cont.getItemZIndex(rootId)-1)
  var labelEd = label.getProperties().edit()
  labelEd.setBoolean("s.iconVisibility", false)
  labelEd.setString("s.labelVsIconPosition", "TOP")
  labelEd.commit()
  return label
}

function getArrayTag(ob, tagname){
  var array = JSON.parse(ob.getTag(tagname))
  if(array==null){
    return []
  }else{
    return array
  }
}

if(src=="RUN_SCRIPT"){
  rootItems = getArrayTag(script, "rootItems")
  for(i2=0;i2<rootItems.length;i2++){
    item = LL.getItemById(rootItems[i2])
    item.setTag("isClosed", false)
    var rootId = item.getId()
    var cont = item.getParent()
    var rootX = item.getPositionX()
    var rootY = item.getPositionY()
    var rootBoxWidth = getBoxWidth(item)
    var rootBoxHeight = getBoxHeight(item)
    var rootCenterX = rootX+rootBoxWidth/2
    var rootCenterY = rootY+rootBoxHeight/2
    openClose()
  }
}else{
  var rootId = item.getId()
  var cont = item.getParent()
  var rootX = item.getPositionX()
  var rootY = item.getPositionY()
  var rootBoxWidth = getBoxWidth(item)
  var rootBoxHeight = getBoxHeight(item)
  var rootCenterX = rootX+rootBoxWidth/2
  var rootCenterY = rootY+rootBoxHeight/2
  if(tag()==null){
    item.getProperties().edit().setEventHandler("i.longTap", EventHandler.RUN_SCRIPT, scriptId).commit()
    //LL.runScript("eventBus", JSON.stringify({funct:"sub", obId:cont.getId(), name:"paused", action:EventHandler.RUN_SCRIPT, extra:scriptId}))
    rootItems = getArrayTag(script, "rootItems")
    rootItems.push(rootId)
    script.setTag("rootItems", JSON.stringify(rootItems))
    openCircle()
    addLabel(item, rootCenterY)
  }else if(tag()=="rootItem"){
    if(src=="MENU_ITEM"){
      openCircle()
    }else{
      openClose()
    }
  }else if(tag()=="Adding Items"){
    item.setTag("FF3", "rootItem")
    var items = cont.getItems()
    linkedItems = getArrayTag(item, "linkedItems")
    for(i=0; i<items.length; i++){
      var newItem=items.getAt(i)
      center = getCenter(newItem)
      var newX=center.x
      var newY=center.y
      if(getDistance(rootCenterX, rootCenterY, newX, newY)<item.getWidth()/2 && newItem!=item){
        var name = newItem.getName()
        if(name!=null && name.slice(-5) != "label" && name.slice(-9) != "connector"){
          var newId = newItem.getId()
          var linked = false
          for(j=0; j<linkedItems.length; j++){
            if(newId==linkedItems[j]){
              linked = true
              newItem.setLabel("reAdding")
              break
            }
          }
          if(linked){
            removeItem(linkedItems.indexOf(newId))
          }else{
            addLabel(newItem, newY)
            newItem.setTag("FF3 rootItem", rootId)
            linkedItems.push(newItem.getId())
            newItem.getProperties().edit().setFloat("s.iconEffectScale", 0.9).commit()
            newItem.setIconLayer(circle,"b",true)
            
            addConnector(newId)
  
            saveProp(newItem, new Prop(newItem))
          }
        }
      }
    }
    item.setBoxBackground(null,"n",true)
    item.setIconLayer(circle, "b", true)
    
    var orWidth = item.getTag("original width")
    var orHeight = item.getTag("original height")
    item.setPosition(rootCenterX-orWidth/2, rootCenterY-orHeight/2)
    item.setSize(orWidth,orHeight)
    
    item.setTag("linkedItems", JSON.stringify(linkedItems))
    item.setTag("isClosed",false)
    Android.makeNewToast("You can now place the items wherever you want in this container", true).show()
  }
}
