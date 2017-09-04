var e = LL.getEvent()
var rootItem = e.getItem()
name = rootItem.getLabel()
desk = rootItem.getParent()
dummy = desk.getItemById(196660)
var source = e.getSource()
panel = desk.getItemByName(name +" Panel")
rootx = rootItem.getPositionX()
rooty = rootItem.getPositionY()
if(panel.getPositionX() != rootx-150 || panel.getPositionY() != rooty-200){
  storex = panel.getPositionX()
  storey = panel.getPositionY()
}

function open(){
  panel.setPosition(rootx-150, rooty-200)
}

function close(){
  panel.setPosition(storex, storey)
}

if(source=="I_CLICK"){
   rootItem.launch()
} else {
  container = panel.getContainer()
  items = container.getItems()
  count = items.getLength()
  for(i=0;i<count;i++){
    item = items.getAt(i)
    //item.setLabel(i)

    //dummy.setLabel(count)

    item.setTag("storex", storex)
    item.setTag("storey", storey)

    if(item.getTag("customized")==null|| item.getTag("custom tap")==false){
      item.getProperties().edit().setEventHandler("i.tap", EventHandler.RUN_SCRIPT, LL.getScriptByName("Fancy Folder Touch Handler").getId().toString()).commit()
      item.setTag("customized", true)
      //item.setLabel(item.getTag("custom tap"))
    }

    cell = item.getCell()
    left = cell.getLeft()
    top = cell.getTop()

    if(left == 2){
      //item.setTag("relPos", "right")
      rightItem = item
    }else if(left == 0){
      // item.setTag("relPos", "left")
      leftItem = item
    }
    if(top == 2){
      // item.setTag("relPos", "bottom")
      bottomItem = item
    }else if(top==0){
      // item.setTag("relPos", "top")
      topItem = item
    }
    
  }
  if(source=="I_LONG_CLICK"){
			  	if(panel.getPositionX() == storex && panel.getPositionY() == storey){
     			open()
   			}else{
      close()
     }
     //item.getProperties().edit().commit() //workaround for disappearing items
  }else	if (source=="I_SWIPE_RIGHT"){
    rightItem .launch()
  }else if(source=="I_SWIPE_LEFT"){
    leftItem .launch()
  }else if(source=="I_SWIPE_UP"){
    topItem .launch()
  }else if(source=="I_SWIPE_DOWN"){
    bottomItem .launch()
  }
}