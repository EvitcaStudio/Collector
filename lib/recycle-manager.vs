#ENABLE LOCALCLIENTCODE

#BEGIN CLIENTCODE
Client
	onNew()
		this.___EVITCA_recycle = true

#BEGIN SERVERCODE

const RecycleM = new Object('RecycleManager')

RecycleManager
	const version = '_RecycleManager_ v1.3.0'
	const COLLECTION_LIMIT = 100

	function collect(pDiob, pCollection)
		var collectionArray = false
		// This function adds the diob to a array of choice instead of deleting it, a healthy alternative to del Diob()
		if (pDiob)
			if (Util.isArray(pDiob))	
				if (pDiob.length)
					collectionArray = true
				else
					return

			if (collectionArray)
				if (pDiob.length + pCollection.length >= this.COLLECTION_LIMIT)
					var deleteAmount = pDiob.length - (this.COLLECTION_LIMIT - pCollection.length)
					var deleteIndex = pDiob.length - 1
					for (var c = 0; c < deleteAmount; c++)
						var ref = pDiob[deleteIndex]
						if (ref.baseType)
							pDiob.splice(deleteIndex, 1)
							del Diob(ref)
						else
							pDiob.splice(deleteIndex, 1)
							del Object(ref)
						deleteIndex--
				
			if (pCollection.length >= this.COLLECTION_LIMIT)
				if (collectionArray)
					for (var i = pDiob.length - 1; i >= 0; i--)
						if (pDiob[i].baseType)
							del Diob(pDiob[i])
						else
							del Object(pDiob[i])
					pDiob.length = 0
					return

				if (pDiob.baseType) // quick check to see if its a object or a diob
					del Diob(pDiob)
				else
					del Object(pDiob)
				return

			if (collectionArray)
				for (var k = pDiob.length - 1; k >= 0; k--)
					if (pDiob[k].onCollected)
						pDiob[k].onCollected(pCollection)
					pDiob[k].clean()
					if (!pCollection.includes(pDiob[k]))
						pCollection.push(pDiob[k])
				return pDiob
			
			if (pDiob.onCollected)
				pDiob.onCollected(pCollection)
			pDiob.clean()
			if (!pCollection.includes(pDiob))
				pCollection.push(pDiob)
			return pDiob

	function isInCollection(pType, pNum, pCollection=[], pObject, ...pArgs)
		// This function returns a diob just the same way new Diob() would as well as returning a array of diobs if you need more than one. This is a healthy alternative to it. This will dump a diob for use or a array of diobs for use rather than creating it
		// if the collection does not have a diob of this type, a new one is created as a last resort. This is the heart of the recycle manager.
		var collectionArray = []
		var found = 0
		var count = pNum
		if (!pCollection.length)
			for (var i = pNum; i > 0;)
				i--
				if (pObject)
					collectionArray.push(new Object(pType, ...pArgs))
				else
					collectionArray.push(new Diob(pType, ...pArgs))

				if (i <= 0)
					if (collectionArray.length === 1)
						return collectionArray.pop()
					return collectionArray
				continue
		else
			for (var j = pCollection.length - 1; j >= 0; j--)
				if (count)
					if (pCollection[j].type === pType)
						collectionArray.push(pCollection[j])
						pCollection.splice(j, 1)
						found++
						count--

			foreach (var rd in collectionArray)
				if (rd.onDumped)
					rd.onDumped(pCollection, ...pArgs)

			if (pNum > found)
				for (var x = 0; x < (pNum - found); x++)
					if (pObject)
						collectionArray.push(new Object(pType, ...pArgs))
					else
						collectionArray.push(new Diob(pType, ...pArgs))
				
			if (collectionArray.length === 1)
				return collectionArray.pop()
				
			return collectionArray

Diob
	function onCollected(pCollection)
		// When this object is collected, called before the diob is cleaned and before it is collected into an array, but after this has been called indetical to diob.onDel()

	function onDumped(pCollection)
		// This function is identical to diob.onNew(), when the diob is dumped from a array, do something with it. This should mimic your onNew() event function. Define it under diobs that will be dumped
		// the first param will ALWAYS be the array this diob came from
		
	function clean()
		// This function wipes away any binding info that is connected to this diob when it is collected. So that when it is dumped it can be modified from a fresh state, if you want to do specific things per diob, define this function under another diob and do extra things there
		this.color = null
		this.iconState = ''
		this.angle = 0
		this.alpha = 1
		this.xPos = 0
		this.yPos = 0
		this.mapName = ''
		this.text = ''
		this.playAnimation()
		this.setTransition()

		if (this.inTicker)
			Event.removeTicker(this)

		if (this.baseType === 'Movable')
			this.move()

		foreach (var o in this.getOverlays())
			this.removeOverlay(o.type)

		foreach(var fN in this.getFilters())
			this.removeFilter(fN)

Object
	function onCollected(pCollection)
		// When this object is collected, called before the diob is cleaned and before it is collected into an array, but after this has been called indetical to diob.onDel()

	function onDumped(pCollection)
		// This function is identical to diob.onNew(), when the diob is dumped from a array, do something with it. This should mimic your onNew() event function. Define it under diobs that will be dumped
		// the first param will ALWAYS be the collection this diob came from
		
	function clean()
		//

#END CLIENTCODE
#END SERVERCODE
