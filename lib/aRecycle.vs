#ENABLE LOCALCLIENTCODE
#BEGIN CLIENTCODE

Client
	onNew()
		this.___EVITCA_aRecycle = true

#BEGIN SERVERCODE

const aRecycle = new Object('aRecycle')

aRecycle
	const version = 'v1.0.0'
	const COLLECTION_LIMIT = 200
	var basicCollection = []
	
	function collect(pDiob, pCollection)
		var collectionArray = false
		if (Util.isArray(pCollection))
			if (pDiob)
				if (Util.isArray(pDiob))	
					if (pDiob.length)
						collectionArray = true
					else
						return

				if (collectionArray)
					if (pDiob.length + pCollection.length >= this.COLLECTION_LIMIT)
						var deleteAmount = pDiob.length - (this.COLLECTION_LIMIT - pCollection.length)
						for (var c = pDiob.length - 1; c >= 0; c--)
							var ref = pDiob[c]
							if (ref.baseType)
								pDiob.splice(c, 1)
								del Diob(ref)
							else
								pDiob.splice(c, 1)
								del Object(ref)
					
				if (pCollection.length >= this.COLLECTION_LIMIT)
					if (collectionArray)
						for (var i = pDiob.length - 1; i >= 0; i--)
							if (pDiob[i].baseType)
								del Diob(pDiob[i])
							else
								del Object(pDiob[i])
						pDiob.length = 0
						return

					if (pDiob.baseType)
						del Diob(pDiob)
					else
						del Object(pDiob)
					return

				if (collectionArray)
					for (var k = pDiob.length - 1; k >= 0; k--)
						pDiob[k].aRecycleCollected = true;
						if (pDiob[k].onCollected)
							pDiob[k].onCollected()
						if (pDiob[k].clean)	
							pDiob[k].clean()
						if (!pCollection.includes(pDiob[k]))
							pCollection.push(pDiob[k])
					return pDiob
				
				pDiob.aRecycleCollected = true;
				if (pDiob.onCollected)
					pDiob.onCollected()
				if (pDiob.clean)
					pDiob.clean()
				if (!pCollection.includes(pDiob))
					pCollection.push(pDiob)
				return pDiob
		else
			JS.console.error('aRecycle Module [collect]: Invalid variable type passed for the %cpCollection', 'font-weight: bold', 'parameter. Expecting an array. Collect failed.', 'pCollection: ', pCollection, 'pDiob: ', pDiob);

	function isInCollection(pType='Diob', pNum=1, pCollection=[], pObject=false, ...pArgs)
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
				rd.aRecycleCollected = false;
				if (rd.onDumped)
					rd.onDumped(...pArgs)

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
	function clean()
		if (Util.isObject(this.color))
			this.color.tint = 0xFFFFFF
		else
			this.color = null
		this.color = this.color
		this.angle = 0
		this.alpha = 1
		this.xPos = 0
		this.yPos = 0
		this.mapName = ''
		this.text = ''
		this.composite = ''
		if (Util.isObject(this.scale))
			this.scale.x = this.scale.y = 1
			this.scale = this.scale
		else
			this.scale = 1
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

#END CLIENTCODE
#END SERVERCODE
