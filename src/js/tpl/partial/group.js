import template from 'lodash/template';

export default template`
<li class="zotero-group<%- obj.expand ? ' zotero-group-expanded' : '' %>" aria-expanded="<%- obj.expand ? 'true' : 'false' %>" role="listitem">

	<h2 class="zotero-group-title" data-trigger="expand-group"><%- obj.title %></h2>
	<%= obj.renderer.renderItems(obj.items) %>
</li>`;
