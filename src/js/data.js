import _ from 'lodash';

export const GROUPED_NONE = 0;
export const GROUPED_BY_TYPE = 1;
export const GROUPED_BY_COLLECTION = 2;
export const CHILD_ITEMS_SYMBOL = Symbol.for('childItems');
export const GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');

/**
 * Store, Encapsulate and Manipulate Zotero API data
 * @param {Object[]} data - Zotero API data to encapsulate
 */
export function ZoteroData(data) {
	this.raw = data;
	this.data = data;
	this.grouped = GROUPED_NONE;

	Object.defineProperty(this, 'length', {
		enumerable: false,
		configurable: false,
		get: function() {
			return this.data.length;
		}
	});
}

/**
 * Group data by type
 * @param  {String|String[]} [expand=[]] - List of types which should appear pre-expanded.
 *                                         Alternatively string "all" is accepted.
 */
ZoteroData.prototype.groupByType = function(expand) {
	let groupedData = {};
	expand = expand || [];
	for(let i = this.raw.length; i--; ) {
		let item = this.raw[i];

		if(!groupedData[item.data.itemType]) {
			groupedData[item.data.itemType] = [];
		}
		groupedData[item.data.itemType].push(item);
		groupedData[item.data.itemType][GROUP_EXPANDED_SUMBOL] = expand === 'all' || _.contains(expand, item.data.itemType);
	}
	this.data = groupedData;
	this.grouped = GROUPED_BY_TYPE;
};

/**
 * Group data by top-level collections
 */
ZoteroData.prototype.groupByCollections = function() {
	throw new Error('groupByCollections is not implemented yet.');
};

/**
 * Custom iterator to allow for..of interation regardless of whether data is grouped or not.
 * For ungrouped data each interation returns single Zotero item
 * For grouped data each interationr returns an a pair of group title and an Array of Zotero items
 */
ZoteroData.prototype[Symbol.iterator] = function() {
	let i = 0;
	if(this.grouped > 0) {
		let keys = Object.keys(this.data);
		return {
			next: function() {
				return {
					value: i < keys.length ? [keys[i], this.data[keys[i]]] : null,
					done: i++ >= keys.length
				};
			}.bind(this)
		};
	} else {
		return {
			next: function() {
				return {
					value: i < this.data.length ? this.data[i] : null,
					done: i++ >= this.data.length
				};
			}.bind(this)
		};
	}
};