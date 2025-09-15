// @ts-ignore
import { Logger } from './vendor/logger.min.mjs';

class CollectorSingleton {
	/**
	 * The version of the module.
	 */
	version = "VERSION_REPLACE_ME";
	/**
	 * The constructor of the Diob class
	 */
	static DiobConstructor = (() => {
		const protoDiob = VYLO.newDiob();
		const DiobConstructor = protoDiob.__proto__.constructor;
		VYLO.delDiob(protoDiob);
		return DiobConstructor;
	})();
	/**
	 * Collection limit on arrays.
	 */
	collectionLimit: number = 20;
	/**
	 * Warning limit.
	 */
	static WARNING_LIMIT: number = 200;
	/**
	 * A default collection to use.
	 */
	basicCollection: any[] = [];
	/**
	 * The logger module this module uses to log errors / logs.
	 */
	private logger: Logger;

	constructor() {
        this.logger = new Logger();
        this.logger.registerType('Collector-Module', '#ff6600');
	}
	/**
	 * Sets the max collection limit of this module.
	 * @param pLimit - The max limit of instances a collection can hold.
	 */
	setMaxLimit(pLimit: number): void {
		if (typeof(pLimit) === 'number') {
			this.collectionLimit = Math.round(pLimit);
			if (this.collectionLimit > CollectorSingleton.WARNING_LIMIT) {
				this.logger.prefix('Collector-Module').warn('Collector: This is a high value to use for a max limit in a collection! Only use this high of a value if you know what you are doing.')
			}
		}
	}
	/**
	 * Collects a instance into a collection.
	 * @param pCollected - The instance to collect.
	 * @param pCollection - The collection array to collect the instance to.
	 */
	collect(pCollected: any, pCollection: any[]): void {
		const arrayCollected = Array.isArray(pCollected);
		// If there was nothing passed to be collected
		if (!pCollected) {
			this.logger.prefix('Collector-Module').error('Collector: There was nothing passed for the %cpCollected', 'font-weight: bold', 'parameter. Expecting a instance or an object.');
			return;
		}
		// If you are passing a empty object it will not be collected
		if (typeof(pCollected) === 'object' && !arrayCollected && !Object.keys(pCollected).length) {
			this.logger.prefix('Collector-Module').error('Collector: OOPS! %cpCollected', 'font-weight: bold', ' is an empty object and will NOT be collected.');
			return;
		}
		// If you are passing an object that is not a Diob or a Object, it will not be accepted. Vylocity types all have the type variable
		if (!pCollected.type && !arrayCollected) {
			this.logger.prefix('Collector-Module').error('Collector: OOPS! %cpCollected', 'font-weight: bold', ' is not a valid object It has no type.');
			return;
		}

		if (Array.isArray((pCollection))) {
			if (pCollection.includes(pCollected)) {
				this.logger.prefix('Collector-Module').error('Collector: OOPS! %cpCollected', 'font-weight: bold', 'already belongs to the provided collection.');
				return;
			}
			if (arrayCollected) {
				if (!pCollected.length) {
					this.logger.prefix('Collector-Module').error('Collector: OOPS! %cpCollected', 'font-weight: bold', 'is an array. But it contains nothing to recycle.');
					return;
				}
			}

			if (arrayCollected) {
				// If you try to collect a instance to be recycled and the collection you are recycling it to is full, it is deleted instead.
				if (pCollection.length >= this.collectionLimit) {
					for (let i = pCollected.length - 1; i >= 0; i--) {
						const instance = pCollected[i];
						if (instance instanceof CollectorSingleton.DiobConstructor) {
							this.cleanInstance(instance);
							VYLO.delDiob(instance);
						} else {
							this.cleanInstance(instance);
							VYLO.delObject(instance);
						}
						pCollected.splice(i, 1);
					}
					return;
				// If this collectedArray has more instances than the collection can handle, the access is deleted
				} else if (pCollected.length + pCollection.length > this.collectionLimit) {
					const remainder = pCollected.length - (this.collectionLimit - pCollection.length);
					for (let c = remainder; c > 0; c--) {
						const instance = pCollected[c];
						if (instance instanceof CollectorSingleton.DiobConstructor) {
							this.cleanInstance(instance);
							VYLO.delDiob(instance);
						} else {
							this.cleanInstance(instance);
							VYLO.delObject(instance);
						}
						pCollected.splice(c, 1);
					}
				}
				// The remaining instances that are in the collectedArray is now cleaned and processed and added to the collection
				for (let k = pCollected.length - 1; k >= 0; k--) {
					const instance = pCollected[k];
					if (typeof(instance.onCollected) === 'function') instance.onCollected();
					if (!pCollection.includes(instance)) pCollection.push(instance);
					this.cleanInstance(instance);
				}
				return;
			} else {
				// If you try to collect a instance to be recycled and the collection you are recyling it to is full, it is deleted instead.
				if (pCollection.length >= this.collectionLimit) {
					if (pCollected instanceof CollectorSingleton.DiobConstructor) {
						this.cleanInstance(pCollected);
						VYLO.delDiob(pCollected);
					} else {
						this.cleanInstance(pCollected);
						VYLO.delObject(pCollected);
					}
					return;
				}
				if (typeof(pCollected.onCollected) === 'function') pCollected.onCollected();
				if (!pCollection.includes(pCollected)) pCollection.push(pCollected);
				this.cleanInstance(pCollected);
				return;
			}
		} else {
			this.logger.prefix('Collector-Module').error('Collector: Invalid variable type passed for the %cpCollection', 'font-weight: bold', 'parameter. Expecting an array. Collect failed.');
		}
	}
	/**
	 * Gets diob instance(s) from the named collection and returns them. If no instances exist in the collection, a new one is created as a last resort.
	 * @param pType - The diob type to find in the collection.
	 * @param pNum - How many of the diob instances to get from the collection.
	 * @param pCollection - The collection to retrieve these instances from.
	 * @param pRest - Remaining args to be passed into the new constructor of the diob or onDumped event
	 * @returns The diob instance that was in the collection.
	 */
	grab(pType: string = 'Diob', pNum: number = 1, pCollection: any[] = [], ...pRest: any[]): any {
		const reuseArray: any[] = [];
		let added = 0;
		let quantity = pNum;
		// Objects do not have a baseType variable
		let isObject = !VYLO.Type.getVariable(pType, 'baseType');
		if (!pCollection.length) {
			for (let i = 0; i < pNum; i++) {
				if (isObject) {
					reuseArray.push((VYLO.newObject as any)(pType, ...pRest));
				} else {
					reuseArray.push((VYLO.newDiob as any)(pType, ...pRest));
				}
			}
			if (reuseArray.length === 1) return reuseArray.pop();
			return reuseArray;
		} else {
			for (let j = pCollection.length - 1; j >= 0; j--) {
				if (quantity) {
					let instanceInCollection = pCollection[j];
					if (instanceInCollection.type === pType) {
						// Remove it from the collection
						pCollection.splice(j, 1);
						// Add it to the array that you will be getting from this collection
						reuseArray.push(instanceInCollection);
						// Label that this instance is no longer considered to be collection
						instanceInCollection.collectorCollected = false;
						// If this instance has a `onDumped` function defined call it.
						if (typeof(instanceInCollection.onDumped) === 'function') instanceInCollection.onDumped(...pRest);
						added++;
						quantity--;
					}
				}
			}
			// If the amount of instances we were supposed to get is greater than the instances we have gotten from the array, we need to generate more.
			if (pNum > added) {
				const missingQuantity = pNum - added;
				for (let x = 0; x < missingQuantity; x++) {
					if (isObject) {
						reuseArray.push((VYLO.newObject as any)(pType, ...pRest));
					} else {
						reuseArray.push((VYLO.newDiob as any)(pType, ...pRest));
					}
				}
			}
				
			if (reuseArray.length === 1) return reuseArray.pop();
			return reuseArray;
		}
	}
	/**
	 * Gets diob instance(s) from the named collection and returns them. If no instances exist in the collection, a new one is created as a last resort.
	 * @deprecated
	 * @param pType - The diob type to find in the collection.
	 * @param pNum - How many of the diob instances to get from the collection.
	 * @param pCollection - The collection to retrieve these instances from.
	 * @param pRest - Remaining args to be passed into the new constructor of the diob or onDumped event
	 * @returns The diob instance that was in the collection.
	 */
	isInCollection = this.grab;
	/**
	 * Cleans the diob instance so it can be reused from a fresh state
	 * @param pDiob - The diob instance to clean.
	 */
	private cleanInstance(pDiob: any): void {
		if (pDiob) {
			if (pDiob instanceof CollectorSingleton.DiobConstructor) {
				const isInterface = (pDiob.baseType === 'Interface' || pDiob.type === 'Interface' || VYLO.Type.getInheritances(pDiob.type).includes('Interface'));
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
					if (VYLO.World.getCodeType() !== 'server') {
						VYLO.Client.removeInterfaceElement(pDiob.getInterfaceName(), pDiob, true);
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
			pDiob.collectorCollected = true;
			pDiob.inTicker = null;
			if (typeof(pDiob.clean) === 'function') pDiob.clean();
		}
	}
}
export const Collector = new CollectorSingleton();
