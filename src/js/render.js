import _ from 'lodash';
import itemTpl from './tpl/item.tpl';
import itemsTpl from './tpl/items.tpl';
import groupTpl from './tpl/group.tpl';
import groupsTpl from './tpl/groups.tpl';
import brandingTpl from './tpl/branding.tpl';
import detailsTpl from './tpl/details.tpl';
import {
	GROUP_EXPANDED_SUMBOL,
	GROUP_TITLE
} from './data.js';
import {
	formatCategoryName,
	closest
} from './utils.js';

export function ZoteroRenderer(container, config) {
	this.container = container;
	this.config = config;
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @param  {String} childItemsMarkup - Rendered markup of a list of Zotero child items
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItem = function(zoteroItem) {
	return itemTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render a list of Zotero items
 * @param  {ZoteroData|Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */
ZoteroRenderer.prototype.renderItems = function(zoteroItems) {
	return itemsTpl({
		'items': zoteroItems,
		'renderer': this
	});
};

/**
 * Render an expandable group of Zotero items
 * @param  {String} title       - A title of a group
 * @param  {boolean} expand     - Indicates whether group should appear pre-expanded
 * @param  {String} itemsMarkup - Rendered markup of underlying list of Zotero items
 * @return {String}             - Rendered markup of a group
 */
ZoteroRenderer.prototype.renderGroup = function(items) {
	return groupTpl({
		'title': formatCategoryName(items[GROUP_TITLE]),
		'items': items,
		'expand': items[GROUP_EXPANDED_SUMBOL],
		'renderer': this
	});
};

/**
 * Render a list of groups of Zotero items
 * @param  {ZoteroData|Object} data - Grouped data where each key is a group titles and
 *                                    each value is an array Zotero items
 * @return {String}                 - Rendered markup of a list of groups
 */
ZoteroRenderer.prototype.renderGroups = function(data) {
	return groupsTpl({
		'groups': data,
		'renderer': this
	});
};

/**
 * [renderBranding description]
 * @return {[type]} [description]
 */
ZoteroRenderer.prototype.renderBranding = function() {
	return brandingTpl();
};

/**
 * Render Zotero item details
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
ZoteroRenderer.prototype.renderDetails = function(item) {
	return detailsTpl({
		'item': item,
		'data': item.data,
		'renderer': this
	});
};

/**
 * Render Zotero item details into a DOM element
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
ZoteroRenderer.prototype.displayDetails = function(item) {
	this.container.innerHTML = this.renderDetails(item);
};

/**
 * Render Zotero publications into a DOM element
 * @param  {HTMLElement} container - DOM element of which contents is to be replaced
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
ZoteroRenderer.prototype.displayPublications = function(data) {
	var markup;

	if(data.grouped > 0) {
		markup = this.renderGroups(data);
	} else {
		markup = this.renderItems(data);
	}

	this.data = data;
	this.container.innerHTML = markup;
	this.previous = markup;
	this.addHandlers();
};

/**
 * Attach interaction handlers for expanding groups and shortened abstracts.
 * @param {HTMLElement} container - A top-level DOM element (e.g. container) that contains Zotero items.
 */
ZoteroRenderer.prototype.addHandlers = function() {
	this.container.addEventListener('click', function(ev) {
		var target;

		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'expand-group');

		if(target) {
			let groupEl = ev.target.parentNode;
			let expanded = groupEl.classList.toggle('zotero-group-expanded');
			groupEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
			return;
		}

		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'details');
		if(target) {
			let key = target.dataset.item;
			let item = _.where(this.data.raw, {'key': key})[0];
			this.displayDetails(item);
			return;
		}

		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'details-exit');
		if(target) {
			this.container.innerHTML = this.previous;
			return;
		}
	}.bind(this));
};

/**
 * Toggle CSS class that gives a visual loading feedback. Optionally allows to explicetly specify
 * whether to display or hide visual feedback.
 * @param  {HTMLElement} container - A DOM element to which visual feedback class should be attached
 * @param  {boolean} [activate]    - Explicitely indicate whether to add or remove visual feedback
 */
ZoteroRenderer.prototype.toggleSpinner = function (container, activate) {
	var method = activate === null ? container.classList.toggle : activate ? container.classList.add : container.classList.remove;
	method.call(container.classList, 'zotero-loading');
};
