(() => {
	const engineWaitId = setInterval(() => {
		clearInterval(engineWaitId);
		buildRecycle();
	})

	const buildRecycle = () => {
		const WARNING_LIMIT = 200;
		const aRecycle = {};
		// Debugging is whether this library is in debug mode. Extra warnings will be thrown in this mode to help explain any issues that may arise.
		aRecycle.debugging = false;
		aRecycle.collectionLimit = 20;
		aRecycle.basicCollection = [];
	
		if (VS.World.getCodeType() !== 'server') VS.Type.setVariables('Client', {___EVITCA_aRecycle: true, aRecycle: aRecycle});
		VS.global.aRecycle = aRecycle;

		aRecycle.setMaxLimit = function(pLimit) {
			if (typeof(pLimit) === 'number') {
				this.collectionLimit = Math.round(pLimit);
				if (this.collectionLimit > WARNING_LIMIT) {
					console.warn('aRecycle: This is a high value to use for a max limit in a collection! Only use this high of a value if you know what you are doing.')
				}
			}
		}

		aRecycle.collect = function(pCollected, pCollection) {
			let recycledArray = false;
			if (pCollected && typeof(pCollected) === 'object' && Object.keys(pCollected).length) {
				console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', ' is an empty object and will NOT be collected.');
				return;
			}

			if (!pCollected.type) {
				console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', ' is not a valid object It has no type.');
				return;
			}

			if (Array.isArray((pCollection))) {
				if (pCollected) {
					if (pCollection.includes(pCollected)) {
						if (this.debugging) console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', 'already belongs to the provided collection.');
						return;
					}
					if (Array.isArray((pCollected))) {
						if (!pCollected.length) {
							console.error('aRecycle Module [collect]: OOPS! %cpCollected', 'font-weight: bold', 'is an array. But it contains nothing to recycle.');
							return;
						}
						recycledArray = true;
					}

					if (recycledArray) {
						// If you try to collect a diob to be recycled and the collection you are recyling it to is full, it is deleted instead.
						if (pCollection.length >= this.collectionLimit) {
							for (let i = pCollected.length - 1; i >= 0; i--) {
								const diob = pCollected[i];
								if (diob.constructor === Diob) {
									this.cleanDiob(diob);
									VS.delDiob(diob);
								} else if (Object.keys(diob).length) {
									this.cleanDiob(diob);
									VS.delObject(diob);
								}
							}
							return;
						}
						// If this recycledArray has more diobs than the collection can handle, the access is deleted
						if (pCollected.length + pCollection.length > this.collectionLimit) {
							const remainder = pCollected.length - (this.collectionLimit - pCollection.length);
							for (let c = pCollected.length - 1; c >= remainder; c--) {
								const diob = pCollected[c];
								if (diob.constructor === Diob) {
									pCollected.splice(c, 1);
									this.cleanDiob(diob);
									VS.delDiob(diob);
								} else if (Object.keys(diob).length) {
									pCollected.splice(c, 1);
									this.cleanDiob(diob);
									VS.delObject(diob);
								}
							}
						}
						// The remaining diobs that are in the recycledArray is now cleaned and processed and added to the collection
						for (let k = pCollected.length - 1; k >= 0; k--) {
							const diob = pCollected[k];
							if (typeof(diob.onCollected) === 'function') diob.onCollected();
							if (!pCollection.includes(diob)) pCollection.push(diob);
							this.cleanDiob(diob);
						}
						return;
					} else {
						// If you try to collect a diob to be recycled and the collection you are recyling it to is full, it is deleted instead.
						if (pCollection.length >= this.collectionLimit) {
							if (pCollected.constructor === Diob) {
								this.cleanDiob(pCollected);
								VS.delDiob(pCollected);
							} else if (Object.keys(pCollected).length) {
								this.cleanDiob(pCollected);
								VS.delObject(pCollected);
							}
							return;
						}
						if (typeof(pCollected.onCollected) === 'function') pCollected.onCollected();
						if (!pCollection.includes(pCollected)) pCollection.push(pCollected);
						this.cleanDiob(pCollected);
						return;
					}
				} else {
					console.error('aRecycle Module [collect]: There was nothing passed for the %cpCollected', 'font-weight: bold', 'parameter. Expecting a diob or an object.');
				}

			} else {
				console.error('aRecycle Module [collect]: Invalid variable type passed for the %cpCollection', 'font-weight: bold', 'parameter. Expecting an array. Collect failed.');
			}
		}

		aRecycle.isInCollection = function(pType='Diob', pNum=1, pCollection=[], ...pRest) {
			const reuseArray = [];
			let added = 0;
			let quantity = pNum;
			// Objects do not have a baseType variable
			let isObject = !VS.Type.getVariable(pType, 'baseType');
			if (!pCollection.length) {
				for (let i = 0; i < pNum; i++) {
					if (isObject) {
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
							// Remove it from the collection
							pCollection.splice(j, 1);
							// Add it to the array that you will be getting from this collection
							reuseArray.push(diobInCollection);
							// Label that this diob is no longer considered to be collection
							diobInCollection.aRecycleCollected = false;
							// If this diob has a `onDumped` function defined call it.
							if (typeof(diobInCollection.onDumped) === 'function') diobInCollection.onDumped(...pRest);
							added++;
							quantity--;
						}
					}
				}
				// If the amount of diobs we were supposed to get is greater than the diobs we have gotten from the array, we need to generate more.
				if (pNum > added) {
					const missingQuantity = pNum - added;
					for (let x = 0; x < missingQuantity; x++) {
						if (isObject) {
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
			if (pDiob) {
				if (pDiob.constructor === Diob) {
					const isInterface = (pDiob.baseType === 'Interface' || pDiob.type === 'Interface' || VS.Type.getInheritances(pDiob.type).includes('Interface'));
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
					if (isInterface) {
						pDiob.hide();
						if (VS.World.getCodeType() !== 'server') {
							VS.Client.removeInterfaceElement(pDiob.getInterfaceName(), pDiob, true);
						}
					}
					pDiob.playAnimation();
					pDiob.setTransition();
					pDiob.angle = 0;
					pDiob.alpha = 1;
					pDiob.xPos = 0;
					pDiob.yPos = 0;
					if (!isInterface) {
						pDiob.mapName = null;
						// PINGABLE
						pDiob.setLoc();
					}
					pDiob.text = '';
					pDiob.composite = '';
					if (pDiob.baseType === 'Movable') pDiob.move();
					for (const o of pDiob.getOverlays()) pDiob.removeOverlay(o.type);
					for (const fN of pDiob.getFilters()) pDiob.removeFilter(fN);
				}
				pDiob.aRecycleCollected = true;
				pDiob.inTicker = null;
				if (typeof(pDiob.clean) === 'function') pDiob.clean();
			}
		}

		aRecycle.toggleDebug = function() {
			this.debugging = !this.debugging;
		}
	}
})();