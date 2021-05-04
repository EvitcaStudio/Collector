#ENABLE LOCALCLIENTCODE

#BEGIN CLIENTCODE
Client
	onNew()
		this.___EVITCA_recycle = true

#BEGIN SERVERCODE

var RecycleM = new Object('RecycleManager')

RecycleManager
	const version = '_RecycleManager_ v1.1.0'
	const COLLECTION_LIMIT = 100

	function collect(diob, collection)
		// This function adds the diob to a array of choice instead of deleting it, a healthy alternative to del Diob()
		if (diob)
			if (Util.isArray(diob) && diob.length)
				var collectionArray = true

			if (collection.length >= this.COLLECTION_LIMIT)
				if (collectionArray)
					for (var i = diob.length - 1; i >= 0; i--)
						if (diob[i].baseType)
							del Diob(diob[i])
						else
							del Object(diob[i])
					return

				if (diob.baseType) // quick check to see if its a object or a diob
					del Diob(diob)
				else
					del Object(diob)
				return

			if (collectionArray)
				for (var k = diob.length - 1; k >= 0; k--)
					diob[k].onCollected(collection)
					diob[k].clean()
					collection.push(diob[k])
				return diob

			diob.clean()
			collection.push(diob)
			diob.onCollected(collection)
			return diob

	function isInCollection(type, num, collection, object, ...args)
		// This function returns a diob just the same way new Diob() would as well as returning a array of diobs if you need more than one. This is a healthy alternative to it. This will dump a diob for use or a array of diobs for use rather than creating it
		// if the collection does not have a diob of this type, a new one is created as a last resort. This is the heart of the recycle manager.
		var collectionArray = []
		var found = 0
		var count = num
		if (!collection.length)
			if (SEED?.verbose)
				Debug.log(num, type + '(s) created with ' + (object ? 'new Object' : 'new Diob') + '()')
			for (var i = num; i > 0;)
				i--
				if (object)
					collectionArray.push(new Object(type, ...args))
				else
					collectionArray.push(new Diob(type, ...args))

				if (i <= 0)
					if (collectionArray.length === 1)
						return collectionArray.pop()
					return collectionArray
				continue
		else
			for (var j = collection.length - 1; j >= 0; j--)
				if (count)
					if (collection[j].type === type)
						collectionArray.push(collection[j])
						collection.splice(j, 1)
						found++
						count--

			foreach (var rd in collectionArray)
				rd.onDumped(collection, ...args)

			if (num > found)
				for (var x = 0; x < (num - found); x++)
					if (object)
						collectionArray.push(new Object(type, ...args))
					else
						collectionArray.push(new Diob(type, ...args))

			if (SEED?.verbose)
				Debug.log(found, type + '(s) dumped &&', (num - found), type + '(s) created with ' + (object ? 'new Object' : 'new Diob') + '() ')

			if (collectionArray.length === 1)
				return collectionArray.pop()

			return collectionArray

Diob
	function onCollected(collection)
		// When this diob is collected

	function onDumped(collection)
		// This function is identical to diob.onNew(), when the diob is dumped from a array, do something with it. This should mimic your onNew() event function. Define it under diobs that will be dumped
		// the first param will ALWAYS be the array this diob came from

	function clean()
		// This function wipes away any binding info that is connected to this diob when it is collected. So that when it is dumped it can be modified from a fresh state, if you want to do specific things per diob, define this function under another diob and do extra things there
		this.color = ''
		this.mapName = ''
		this.text = ''
		this.iconState = ''
		this.angle = 0
		this.playAnimation()

		foreach (var o in this.getOverlays())
			this.removeOverlay(o.type)

Object
	function onCollected(collection)
		// When this object is collected, called before the diob is cleaned and before it is collected
		if (this.attachedTicker)
			this.attachedTicker.removeTicker(this)

	function onDumped(collection)
		// This function is identical to diob.onNew(), when the diob is dumped from a array, do something with it. This should mimic your onNew() event function. Define it under diobs that will be dumped
		// the first param will ALWAYS be the collection this diob came from

	function clean()
		//

#END CLIENTCODE
#END SERVERCODE
