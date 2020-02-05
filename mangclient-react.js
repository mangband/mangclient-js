"use strict";

var Util = {
	'Debug': function() {},
	'Info': console.log,
	'Error': function(e) {
		alert(e);
	},
}

class MAngbandReactClient {
	constructor(root_node, config) {
		bnd(this, 'connected');
		bnd(this, 'network_event');
		bnd(this, 'client_ready');
		bnd(this, 'client_setup');
		bnd(this, 'on_indication');
		bnd(this, 'on_item');
		bnd(this, 'on_item_wipe');

		let dungeon_offset_x = 13;
		let dungeon_offset_y = 1;

		if (config['protocol'] != 'mangband150') {
			dungeon_offset_x = 0;
			dungeon_offset_y = 0;
		}

		this.client = new MAngbandNetworkClient(config, this.network_event);
		this.root_node = root_node;
		this.config = config;
		this.term = new ZTerm(root_node, {
			'dungeon_offset_col': dungeon_offset_x,//13,
			'dungeon_offset_row': dungeon_offset_y,//1,
		});
		this.ui = new ZWindow(root_node);
		this.logger = new ZLogger(root_node);

		this.client.on('connected', this.connected);
		this.client.protocol.on('client_ready', this.client_ready);
		this.client.protocol.on('client_setup', this.client_setup);
		this.client.on('indication', this.on_indication);
		this.client.on('item', this.on_item);
		this.client.on('item_wipe', this.on_item_wipe);

		this.eventHandlers = {}

		bnd(this, 'term_key_press');
		bnd(this, 'term_mouse_click');
		this.term.on('keypress', this.term_key_press);
		this.term.on('click', this.term_mouse_click);

		this.client.on('cave_data', this.term.parse_stream);
		let logger = this.logger;
		this.client.on('log_message', function(e) {
			if (e.info['multicolor'])
				logger.addMulticolorMessage(e.info['channel'], e.info['multicolor']);
			else
				logger.addMessage(e.info['channel'], e.info['message']);
			console.log("MSG:", e.info['channel'], e.info['message']);
		});
		let client = this.client;
		logger.input_button.addEventListener('click', function(e) {
			let input = logger.input_node;
			client.cmd_message(input.value);
			input.value = '';
		});
		this.client.setCredentials(
			config['login'],
			config['password'],
			config['username'] || 'webclient',
			config['hostname'] || window.location.origin,
		)

		this.item_groups = {
			'inven': new Array(64),
			'equip': new Array(64),
			'quiver': new Array(64),
			'floor': new Array(64),
			'store': new Array(64),
		}

		bnd(this, 'on_use_item');
		this.ui.on('use_item', this.on_use_item);
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
	}
	term_mouse_click(e) {
		let ok = this.trigger('keypress', e);
		if (ok === false || e.stopped) return;
		this.client.cmd_pathfind(e.col - 13, e.row - 1);
	}
	term_key_press(e) {
		let ok = this.trigger('keypress', e);
		if (ok === false || e.stopped) return;
		let dir;
		const walkmap = {
			'left': 4, 'kp_left': 4,
			'right': 6, 'kp_right': 6,
			'up': 8, 'kp_up': 8,
			'down': 2, 'kp_down': 2,
			'home': 7, 'kp_home': 7,
			'end': 1, 'kp_end': 1,
			'page_up': 9, 'kp_page_up': 8,
			'page_down': 3, 'kp_page_down': 3,
		}
		dir = walkmap[e.name];
		if (dir !== undefined) {
			this.client.cmd_walk(dir);
			return;
		}
		const runmap = {
			'shift-left': 4, 'shift-kp_left': 4,
			'shift-right': 6, 'shift-kp_right': 6,
			'shift-up': 8, 'shift-kp_up': 8,
			'shift-down': 2, 'shift-kp_down': 2,
			'shift-home': 7, 'shift-kp_home': 7,
			'shift-end': 1, 'shift-kp_end': 1,
			'shift-page_up': 9, 'shift-kp_page_up': 8,
			'shift-page_down': 3, 'shift-kp_page_down': 3,
		};
		dir = runmap[e.name];
		if (dir !== undefined) {
			this.client.cmd_run(dir);
			return;
		}
		const digmap = {
			'control-left': 4, 'control-kp_left': 4,
			'control-right': 6, 'control-kp_right': 6,
			'control-up': 8, 'control-kp_up': 8,
			'control-down': 2, 'control-kp_down': 2,
			'control-home': 7, 'control-kp_home': 7,
			'control-end': 1, 'control-kp_end': 1,
			'control-page_up': 9, 'control-kp_page_up': 8,
			'control-page_down': 3, 'control-kp_page_down': 3,
		}
		dir = digmap[e.name];
		if (dir !== undefined) {
			this.client.cmd_alter(dir);
			return;
		}
		if (e.key == 'R') {
			this.client.cmd_rest(true);
			return;
		}
	}
	connected(e) {
		console.log("CONNECTED!", e);
	}
	network_event(e) {

	}
	client_ready(e) {
		console.log("READY!", e);
	}
	client_setup(e) {
		console.log("SETUP!", e);
	}
	on_indication(e) {
		console.log("INDI!", e);
		if (!(e.info.window_ref & 0x01)
		&&  !(e.info.window_ref & 0x02)) return;
		for (let i in e.info.text_render) {
			let inst = e.info.text_render[i];
			this.term.draw_text(
				inst.x,
				inst.y,
				inst.attr,
				inst.str,
			)
		}
	}
	on_item(e) {
		const item = e.info;
		this.item_groups[item.inven_group][item.slot] = item;
		this.ui.setProps({
			"inven_items": this.item_groups["inven"],
			"equip_items": this.item_groups["equip"],
			"quiver_items": this.item_groups["quiver"],
			"floor_items": this.item_groups["floor"],
			"store_items": this.item_groups["store"],
		});
		this.ui.render();
	}
	on_item_wipe(e) {
		this.item_groups[e.info.inven_group] = [];
		this.ui.setProps({
			"inven_items": this.item_groups["inven"],
			"equip_items": this.item_groups["equip"],
			"quiver_items": this.item_groups["quiver"],
			"floor_items": this.item_groups["floor"],
			"store_items": this.item_groups["store"],
		});
		this.ui.render();
	}
	on_use_item(e) {
		let item = this.item_groups[e.group][e.slot];
		console.log(item);

		if (e.group == 'inven') {
			this.client.cmd_useitem_inven(e.slot, item);
		} else if (e.group == 'equip') {
			this.client.cmd_useitem_equip(e.slot, item);
		} else if (e.group == 'floor') {
			this.client.cmd_pickup(e.slot, item);
		}

//		console.log(e);
//		alert(e);
	}

}
