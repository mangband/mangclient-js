const e = React.createElement;

class ZWindow {
	constructor(root_node, config, on_event) {
		if (!on_event) on_event = function() { };
		let div = document.createElement('div');
		root_node.appendChild(div);
		div.style.cssText = "position: absolute; top: 0px; height: 0px; width: 100%;"
		this.root_node = root_node;
		this.main_node = div;
		this.on_event = on_event;
		this.props = {'root': this};
		this.eventHandlers = {};
		this.colors = {
			0: '#000000', /* TERM_DARK */
			1: '#FFFFFF', /* TERM_WHITE */
			2: '#808080', /* TERM_SLATE */
			3: '#FF8000', /* TERM_ORANGE */
			4: '#C00000', /* TERM_RED */
			5: '#008040', /* TERM_GREEN */
			6: '#0040FF', /* TERM_BLUE */
			7: '#804000', /* TERM_UMBER */
			8: '#606060', /* TERM_L_DARK */
			9: '#C0C0C0', /* TERM_L_WHITE */
			10:'#FF00FF', /* TERM_VIOLET */
			11:'#FFFF00', /* TERM_YELLOW */
			12:'#FF4040', /* TERM_L_RED */
			13:'#00FF00', /* TERM_L_GREEN */
			14:'#00FFFF', /* TERM_L_BLUE */
			15:'#C08040',/* TERM_L_UMBER */
		};
		this.render();
	}
	on(evt, func) {
		if (!this.eventHandlers[evt]) this.eventHandlers[evt] = [];
		this.eventHandlers[evt].push(func);
	}
	off(evt) {
		this.eventHandler[evt] = [];
	}
	trigger(evt, e) {
		if (e === undefined) e = { 'name': evt, 'info': {} };
		//console.log("Event", evt, e);
		if (!this.eventHandlers[evt]) return;
		for (let k in this.eventHandlers[evt]) {
			let callback = this.eventHandlers[evt][k];
			callback(e);
			if (e.stopped) {
				break;
			}
		}
		if (e.stopped) return;
		this.on_event(e);
	}
	setProps(props) {
		for (let k in props) {
			this.props[k] = props[k];
		}
	}
	render() {
		ReactDOM.render(e(UIWindow, this.props), this.main_node);
	}
	use_item(group, slot) {
		this.trigger('use_item', {
			'group': group,
			'slot': slot,
		})
	}
	
}

class UIWindow extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return e('div', {style: {cssText: 'position: absolute; right: 0; width: 30%; background: #000; font-size: smaller'}},
			e(InventoryGrid, {group: 'equip', items: this.props.equip_items, root: this.props.root}),
			e(InventoryGrid, {group: 'quiver', items: this.props.quiver_items, root: this.props.root}),
			e(InventoryGrid, {group: 'floor', items: this.props.floor_items, root: this.props.root}),
			e(InventoryGrid, {group: 'inven', items: this.props.inven_items, root: this.props.root}),
			e(InventoryGrid, {
				style: {cssText: 'position: absolute; left: 0; top: 0; margin-left: -200%; background: #000;'},
				group: 'store', items: this.props.store_items, root: this.props.root}),
		)
	}
}

class InventoryLine extends React.Component {
	constructor(props) {
		super(props);
		bnd(this, 'onClick');
	}
	onClick(e) {
		this.props.root.use_item(this.props.inven_group, this.props.slot);
	}
	render() {
		let colors = this.props.root.colors;
		return e('div', {
				style: {
					color: colors[this.props.attr]
				},
				onClick: this.onClick,
			},
			this.props.name
		)
	}
}

class InventoryGrid extends React.Component {
	render() {
		const items_ = this.props.items || [];
		let children = items_.map((item) => 
			e(InventoryLine, {root: this.props.root, key: item.slot, ...item})
		)
		return e('div', {
			style: this.props.style,
		}, children);
	}
}
