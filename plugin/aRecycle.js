(() => {
	// Client and Server library
	const engineWaitId = setInterval(() => {
		if (VS.Client) {
			clearInterval(engineWaitId);
			buildRecycle();
		}
	})

	const buildRecycle = () => {
		const WARNING_LIMIT = 200;
		let COLLECTION_LIMIT = 20;
		const aRecycle = {};
		aRecycle.version = '0.1.0';
		// debugging is whether this library is in debug mode. Extra warnings will be thrown in this mode to help explain any issues that may arise.
		aRecycle.debugging = false;
		aRecycle.basicCollection = [];

		VS.Client.___EVITCA_aRecycle = true;
		VS.Client.aRecycle = aRecycle;
		VS.World.global.aRecycle = aRecycle;

		aRecycle.setMaxLimit = function(pLimit) {
			if (typeof(pLimit) === 'number') {
				COLLECTION_LIMIT = Math.round(pLimit);
				if (COLLECTION_LIMIT > WARNING_LIMIT) {
					console.warn('aRecycle: This is a high value to use for a max limit in a collection! Only use this high of a value if you know what you are doing.')
				}
			}
		}

		aRecycle.collect = function(pCollected, pCollection) {
			let recycledArray = false;
			if (pCollected && typeof(pCollected) === 'object' && !Array.isArray((pCollection)) && Object.keys(pCollected).length) {
				console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', ' is a empty object and will NOT be collected.', 'pCollected: ', pCollected);
				return;
			}

			if (Array.isArray((pCollection))) {
				if (pCollected) {
					if (pCollection.includes(pCollected)) {
						if (this.debugging) console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', 'already belongs to the provided collection.', 'pCollected: ', pCollected);
						return;
					}
					if (Array.isArray((pCollected))) {
						if (!pCollected.length) {
							console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', 'is an array. But it contains nothing to recycle.', 'pCollected: ', pCollected);
							return;
						}
						recycledArray = true;
					}

					if (recycledArray) {
						// if you try to collect a diob to be recycled and the collection you are recyling it to is full, it is deleted instead.
						if (pCollection.length >= COLLECTION_LIMIT) {
							for (let i = pCollected.length - 1; i >= 0; i--) {
								if (pCollected[i].constructor === Diob) {
									this.cleanDiob(pCollected[i]);
									VS.delDiob(pCollected[i]);
								} else if (Object.keys(pCollected[i]).length) {
									this.cleanDiob(pCollected[i]);
									VS.delObject(pCollected[i]);
								}
							}
							return;
						}
						// if this recycledArray has more diobs than the collection can handle, the access is deleted
						if (pCollected.length + pCollection.length > COLLECTION_LIMIT) {
							const remainder = pCollected.length - (COLLECTION_LIMIT - pCollection.length);
							for (let c = pCollected.length; c >= remainder; c--) {
								if (pCollected[c].constructor === Diob) {
									pCollected.splice(c, 1);
									this.cleanDiob(pCollected[c]);
									VS.delDiob(pCollected[c]);
								} else if (Object.keys(pCollected).length) {
									pCollected.splice(c, 1);
									this.cleanDiob(pCollected[c]);
									VS.delObject(pCollected[c]);
								}
							}
						}
						// the remaining diobs that are in the recycledArray is now cleaned and processed and added to the collection
						for (let k = pCollected.length - 1; k >= 0; k--) {
							if (pCollected[k].onCollected && typeof(pCollected[k].onCollected) === 'function') pCollected[k].onCollected();
							if (!pCollection.includes(pCollected[k])) pCollection.push(pCollected[k]);
							this.cleanDiob(pCollected[k]);
						}
						return;
					} else {
						// if you try to collect a diob to be recycled and the collection you are recyling it to is full, it is deleted instead.
						if (pCollection.length >= COLLECTION_LIMIT) {
							if (pCollected.constructor === Diob) {
								this.cleanDiob(pCollected);
								VS.delDiob(pCollected);
							} else if (Object.keys(pCollected).length) {
								this.cleanDiob(pCollected);
								VS.delObject(pCollected);
							}
							return;
						}
						if (pCollected.onCollected && typeof(pCollected.onCollected) === 'function') pCollected.onCollected();
						if (!pCollection.includes(pCollected)) pCollection.push(pCollected);
						this.cleanDiob(pCollected);
						return;
					}
				} else {
					console.error('aRecycle Module [collect]: There was nothing passed for the %cpCollected', 'font-weight: bold', 'parameter. Expecting a diob or an object.', 'pCollected: ', pCollected);
				}

			} else {
				console.error('aRecycle Module [collect]: Invalid variable type passed for the %cpCollection', 'font-weight: bold', 'parameter. Expecting an array. Collect failed.', 'pCollection: ', pCollection);
			}
		}

		aRecycle.isInCollection = function(pType='Diob', pNum=1, pCollection=[], pObject=false, ...pRest) {
			const reuseArray = [];
			let added = 0;
			let quantity = pNum;
			if (!pCollection.length) {
				for (let i = 0; i < pNum; i++) {
					if (pObject) {
						reuseArray.push(VS.newObject(pType, ...pRest));
					} else {
						reuseArray.push(VS.newDiob(pType, ...pRest));
					}
				}
				if (reuseArray.length === 1) return reuseArray.pop();
				return reuseArray;
			} else {
				for (let j = pCollection.length - 1; j >= 0; j--) {
					if (quantity) {
						let diobInCollection = pCollection[j];
						if (diobInCollection.type === pType) {
							// remove it from the collection
							pCollection.splice(j, 1);
							// add it to the array that you will be getting from this collection
							reuseArray.push(diobInCollection);
							// label that this diob is no longer considered to be collection
							diobInCollection.aRecycleCollected = false;
							// if this diob has a `onDumped` function defined call it.
							if (diobInCollection.onDumped && typeof(diobInCollection.onDumped) === 'function') diobInCollection.onDumped(...pRest);
							added++;
							quantity--;
						}
					}
				}
				// if the amount of diobs we were supposed to get is greater than the diobs we have gotten from the array, we need to generate more.
				if (pNum > added) {
					const missingQuantity = pNum - added;
					for (let x = 0; x < missingQuantity; x++) {
						if (pObject) {
							reuseArray.push(VS.newObject(pType, ...pRest));
						} else {
							reuseArray.push(VS.newDiob(pType, ...pRest));
						}
					}
				}
					
				if (reuseArray.length === 1) return reuseArray.pop();
				return reuseArray;
			}
		}

		aRecycle.cleanDiob = function(pDiob) {
			if (pDiob.constructor === Diob) {
				if (pDiob.color) {
					if (typeof(pDiob.color) === 'object' && pDiob.color.constructor === Object) {
						pDiob.color.tint = 0xFFFFFF;
						pDiob.color = pDiob.color;
					} else {
						pDiob.color = null;
					}
				}
				if (typeof(pDiob.scale) === 'object') {
					pDiob.scale.x = pDiob.scale.y = 1;
					pDiob.scale = pDiob.scale;
				} else {
					pDiob.scale = 1;
				}
				if (pDiob.baseType === 'Interface') {
					if (pDiob.getInterfaceName()) {
						pDiob.hide();
						VS.Client.removeInterfaceElement(pDiob.getInterfaceName(), pDiob, true);
					}
				}
				pDiob.playAnimation();
				pDiob.setTransition();
				pDiob.angle = 0;
				pDiob.alpha = 1;
				pDiob.xPos = null;
				pDiob.yPos = null;
				if (pDiob.baseType !== 'Interface') pDiob.mapName = null;
				// PINGABLE
				pDiob.setLoc();
				pDiob.text = '';
				pDiob.composite = '';
				if (pDiob.baseType === 'Movable') pDiob.move();
				for (const o of pDiob.getOverlays()) pDiob.removeOverlay(o.type);
				for (const fN of pDiob.getFilters()) pDiob.removeFilter(fN);
			}
			pDiob.aRecycleCollected = true;
			pDiob.inTicker = null;
			if (pDiob.clean && typeof(pDiob.clean) === 'function') pDiob.clean();
		}

		aRecycle.toggleDebug = function() {
			this.debugging = !this.debugging;
		}
	}
})();