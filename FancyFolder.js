var e = LL.getEvent()
var rootItem = e.getItem()
name = rootItem.getLabel()
desk = rootItem.getParent()
dummy = desk.getItemById(196660)
var source = e.getSource()
panel = desk.getItemByName(name +" Panel")
container = panel.getContainer()
items = container.getItems()

function open(){
  panel.setSize(750, 1000)
}

function close(){
  panel.setSize(0.01, 0.01)
}

highestX = 0
highestY = 0
for(i=0;i<items.length;i++){
  item = items.getAt(i)
  if(item.getPositionX()>highestX){
    
  y = item.getPositionY()
}

close()
setTimeout(open, 2000)