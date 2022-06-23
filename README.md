# aRecycle
This plugin gives you an easy and beneficial way to reuse instances inside of the game engine [Vylocity](https://vylocity.com), as well as slow down the garbage collector.

## Supports the following plugin's internal methods automatically  
* **aParticleGenerator**  
* **aBlip**  
* **aUtils**  

## Implementation 

`CLIENT-SIDE`  
#### #INCLUDE SCRIPT aRecycle.js  
`SERVER-SIDE` 
#### #INCLUDE SERSCRIPT aRecycle.js  

## API  
### aRecyle.toggleDebug()
   - desc: Turn on/off the debugging mode of this plugin, which throws additional logs/warnings. Should be turned off in production code.
  
###  aRecycle.setMaxLimit(pLimit)
   - pLimit: The new max limit on collections.
   - desc: Sets a limit on how much each array can recycle before deleting the access. The max is 20 by default. 

###  aRecycle.collect(pCollected, pCollection)
  - pCollected: The instance to collect into the collection array pCollection.
  - pCollection: The collection array this instance is going to. If the collection's length is >= the max limit it will be deleted.
  - desc: Recycle a object for reuse into pCollection

###  aRecycle.isInCollection(pType, pNum, pCollection, pObject, [pArg[, pArg[, ... pArg]]])
  - pType: The type of instance you want to get
  - pNum: The amount of pType(s) you want to get out of this collection
  - pCollection: The collection array to check inside of
  - pObject: Whether this is of the `Object` base type
  - pArg: Any argument(s) to pass to the `instance.onNew` or the `instance.onDumped` event function.
  - desc: This is the plugin equivalent of `new Diob(pType)`. This returns either the instance you ask for (if it was only 1) Or it returns an array full of instances that you asked for. Gets a instance by type out of a collection and by quantity.

### Diob|Object.clean()
   - desc: This is a user defined function that will be called when this instance is collected. This should reset this instance to it's default state. This plugin does some basic cleaning of this instance when it is collected, but cannot do things it doesn't know about. Internal cleaning involves:
      - Removing color&text
      - Removing overlays&filters
      - Removing it from an interface if it is a interface element.
      - Removing it from the ticker system
      - Resetting animations&transitions
      - Resetting angle&scale&composite&positionalData
      - Cancels movement

### Diob|Object.onDumped(...pParam)
   - pParam: The argument(s) that were passed inside of `aReycle.isInCollection`.
   - desc: Event function that is called when this object has been removed from a collection and is ready for use. This is identical to the event function `Object.onNew`


### Diob|Object.onCollected(...pParam)
   - desc: Event function that is called when this object is added to a collection. This is the plugin's equivalent of `Object.onDel`
