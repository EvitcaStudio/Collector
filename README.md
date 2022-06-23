# aRecycle
This plugin gives you an easy and beneficial way to reuse objects, as well as slow down the garbage collector.

#INCLUDE SCRIPT aRecycle.js for client side
#INCLUDE SERSCRIPT aRecycle.js for server side

__**aRecycle.js**__
** Supports the following library's internal methods automatically **
**-aParticleGenerator**
**-aBlip**
**-aUtils**
```js
aRecycle.setMaxLimit(pLimit) // Sets a limit on how much each array can recycle before deleting the access. The max is 50 by default. If using >= 200 a warning will be displayed to warn you of the dangers. 
aRecycle.collect(pCollected, pCollection); // Recycle a object for reuse into pCollection
aRecycle.isInCollection(pType='Diob', pNum=1, pCollection=[], pObject=false, ...pRest); // Get a object by type out of a collection and by quantity. Pass in params that will be used in it's event function or `onNew`
aRecycle.toggleDebug();

DiobInstance.clean(); // A function you can define that will run to clean this object type of custom things assigned to it
DiobInstance.onDumped(pArgs); // Event function that is called when this object is raedy for use. Identicaly to `onNew`
DiobInstance.onCollected(); // Event function that is called when this object is added to a collection. Identical to `onDel`
```

**🚧🚧 Docs coming soon 🚧🚧**
