"use strict";

var Util = {
	'Debug': function() {},
	'Info': console.log,
	'Error': console.error,
}

class GotQuitPacket extends Error { };
class NotEnoughBytes extends Error { };
class UndefinedPacket extends Error { };
class UndefinedQueueFormat extends Error { };
class UndefinedRLEMethod extends Error { };
class OutOfBounds extends Error { };

function register_protocol(name, handler) {
	if (!window.mang_protocols) window.mang_protocols = {};
	window.mang_protocols[name] = handler;
}
function get_protocol(name) {
	if (!window.mang_protocols || !window.mang_protocols[name])
		throw Error("No protocol found for " + name);
	return window.mang_protocols[name];
}

class MAngbandNetworkClient {
	constructor(config, on_event) {
		this.config = config;
		this.net = new Websock(config['server'], [config['protocol']]);
		this.protocol = new (get_protocol(config['protocol']))(this.net);
		this.on_event = on_event || function () { };

		bnd(this, 'connected');
		bnd(this, 'net_read');
		this.net.on('open', this.connected);
		this.net.on('message', this.net_read);
		this.net.open(config['server']);
		this.last_pkt = -1;

		this.eventHandlers = {}

		if (!config['login'] || !config['password'])
			throw new Error("Must provide login and password in config!");

		this.protocol.setCredentials(
			config['login'],
			config['password'],
			config['username'] || 'webclient',
			config['hostname'] || window.location.origin,
		)
		bnd(this, 'bubble')
		this.protocol.on('client_ready', this.bubble);
		this.protocol.on('client_setup', this.bubble);

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
	bubble(e) {
		this.trigger(e.name, e);
	}
	net_read() {
		if (this.protocol.bypass) return;
		let start_at = this.net.get_rQi();
		let len = this.net.rQlen();
		while (len > 0) {
			//console.log("Bytes still in buffer: ", len);
			let start_at = this.net.get_rQi();
			let pkt = this.net.rQshift8();
			let handler = this.protocol.packets[pkt];
			if (!handler) {
				Util.Error("UNDEFINED PACKET " + pkt + " (previous packet:" + this.last_pkt + ")");
				this.protocol.close();
				this.net.close();
				return;
			}
			try {
				let info = handler(pkt);
				let name = handler.name.substring('bound '.length);
				let event = {
					'name': name,
					'info': info,
				};
				let synth = this.protocol.trigger(name, event);
				if (!event.stopped)
					this.trigger(name, event);
					if (synth) this.trigger(synth.name, synth)
			} catch (e) {
				if (e instanceof NotEnoughBytes) {
					/* Rewind */
					this.net.set_rQi(start_at);
					//console.log("Bytes left in buffer: ", this.net.get_rQi());
					return;
				} else {
					Util.Error("FATAL ERROR IN "+ handler.name + ": "+ e.message);
					console.error(e);
					this.protocol.close();
					this.net.close();
					return;
				}
			}
			//console.log(pkt, info);
			this.net.set_rQi(this.net.get_rQi());
			len = this.net.rQlen();
			this.last_pkt = pkt;
		}
	}
	connected() {
		Util.Debug("Connected");
		this.trigger('connected')
		this.protocol.handShake();
	}
	/* Protocol wrappers */
	setCredentials(a, b, c, d) { this.protocol.setCredentials(a, b, c, d); }
	cmd_stay() { this.protocol.cmd_stay(); }
	cmd_walk(dir) {	this.protocol.cmd_walk(dir); }
	cmd_run(dir) { this.protocol.cmd_run(dir); }
	cmd_alter(dir) { this.protocol.cmd_alter(dir); }
	cmd_rest(enable) { this.protocol.cmd_rest(enable); }
	cmd_pathfind(x, y) { this.protocol.cmd_pathfind(x, y); }
	cmd_message(message, chan) { this.protocol.cmd_message(message, chan); }
	cmd_custom(cmd, args) { this.protocol.cmd_custom(cmd, args); }
	cmd_pickup(floor_slot, item) { this.protocol.cmd_pickup(floor_slot, item); }
	cmd_wear_inven(inven_slot, item) { this.protocol.cmd_wear_inven(inven_slot, item); }
	cmd_wear_floor(floor_slot, item) { this.protocol.cmd_wear_floor(floor_slot, item); }
	cmd_takeoff_equip(equip_slot, item) { this.protocol.cmd_takeoff_equip(equip_slot, item); }
	cmd_drop_equip(equip_slot, item) { this.protocol.cmd_drop_equip(equip_slot, item); }
	cmd_drop_inven(inven_slot, item) { this.protocol.cmd_drop_inven(inven_slot, item); }
	cmd_drop_quiver(quiver_slot, item) { this.protocol.cmd_drop_quiever(quiver_slot, item); }
	cmd_destroy_equip(equip_slot, item) { this.protocol.cmd_destroy_equip(equip_slot, item); }
	cmd_destroy_inven(inven_slot, item) { this.protocol.cmd_destroy_inven(inven_slot, item); }
	cmd_destroy_floor(floor_slot, item) {	this.protocol.cmd_destroy_floor(floor_slot, item); }
	cmd_useitem_equip(equip_slot, item) { this.protocol.cmd_useitem_equip(equip_slot, item); }
	cmd_useitem_inven(inven_slot, item) { this.protocol.cmd_useitem_inven(inven_slot, item); }
	cmd_useitem_floor(floor_slot, item) {	this.protocol.cmd_useitem_floor(floor_slot, item); }
	getCommands() { return this.protocol.getCommands(); }
}

class MetaMorph {
	constructor(url) {
		this.url = url;
	}
	update(cb) {
		fetch(this.url)
		.then(
			function(response) {
				if (response.status !== 200) {
					console.log('Looks like there was a problem. Status Code: ' +
						response.status);
					return;
				}
				// Examine the text in the response
				response.json().then(function(data) {
					cb(data);
				});
			}
		)
		.catch(function(err) {
			console.log('Fetch Error :-S', err);
		});
	}
}

class GameCommand {
	constructor(config) {
		this.key = config['key']
		this.context = config['context'] || 'game';
		this.item_argument = config['item_argument'] || false;
		this.dir_argument = config['dir_arguemnt'] || false;
		this.requires_string = config['requires_string'] || false;
		this.requires_char = config['requires_char'] || false;
		this.inven_groups = config['inven_groups'] || ['inven', 'equip', 'quiver', 'floor'];
		this.aggressive = config['aggressive'] || false;
		this.asset = null;
		this.item_tester = config['item_tester'] || function() { return true; };
	}
	test_item(item) {
		return this.item_tester(item);
	}
}

class GameItem {
	constructor(config) {
		this.inven_group = config['inven_group'] || 'inven';
		this.slot = config['slot'] || 0;
		this.tval = config['tval'] || 0;
		this.weight = config['weight'] || 0;
		this.name = config['name'] || 'nothing';
		this.attr = config['attr'] !== undefined ? config['attr'] : 1;
		this.testflag = config['testflag'] || 0;
		this.price = config['price'] || 0;
	}
}

class MAngbandProtocolHandler {
	constructor(net, config, on_event) {
		if (!on_event) on_event = function() { };
		/* 'net' - instance of Websock. */
		this.net = net;
		this.packets = {};
		/* 'config' - object. */
		this.eventHandlers = {}
		this.bypass = false;
		/* mark teardown */
		this.teardown = false;
		/* other hacks */
		this.blockread_timeout_multiplier = 1;
	}
	close() {
		this.teardown = true;
	}
	on(evt, callback) {
		this.eventHandlers[evt] = callback;
	}
	trigger(evt, info) {
		let listener = this.eventHandlers[evt];
		if (!listener) return;
		let result = listener(info);
		if (result === false || info.stopped) {
			return;
		}
		return result;
	}
	/* For old-style netcode, some blocking reading is needed.
	 * Since we can't do it in JavaScript (everything must be async),
	 * here's a helper facility, called "block-read timer".
	 *
	 * To use it in your protocol handler:
	 * 1. call 'setup_blockread_timer()' in the constructor.
	 * 2. when blockread starts:
	 *    - call 'bypassPackets(true)'
	 *    - send your data (with fine-tuned 'flush' calls)
	 *    - call 'waitThen(check_callback, timeout, success_callback)
	 * 3. 'check_callback' should:
	 *    - return data it read
         *    - throw NotEnoughBytes if there isn't enough data
	 * 4. call 'bypassPackets(false)' when you're done!
	 */
	bypassPackets(val) {
		if (val !== true && val !== false) throw Error(val + " must be a boolean.");
		this.bypass = val;
	}
	waitThen(check_cb, timeout, success_cb) {
		this.enable_blockread_timer(check_cb, timeout * this.blockread_timeout_multiplier, success_cb);
	}
	setup_blockread_timer() {
		this.waiting = false;
		this.wait_timeout = 0;
		this.wait_started = 0;
		this.wait_timer = null;
		this.wait_callback = null;
		this.wait_check_callback = null;
		bnd(this, 'iter_blockread_timer');
	}
	iter_blockread_timer() {
		if (this.waiting) {
			let done = false;
			let reply = null
			let start_pos = this.net.get_rQi();
			try {
				reply = this.wait_check_callback();
			} catch(e) {
				this.net.set_rQi(start_pos);
				if (e instanceof NotEnoughBytes) {
					reply = null;
				} else {
					throw e;
				}
			}
			if (reply !== null) {
				this.waiting = false;
				this.wait_check_callback = null;
				this.wait_timer = null;
				this.wait_callback(reply);
				return;
			}
			let passed = (Date.now() - this.wait_started) / 1000;
			if (passed >= this.wait_timeout) {
				throw new Error("Time out!" + this.wait_check_callback.name);
			}
			/* Re-scheduler timer */
			this.wait_timer = setTimeout(this.iter_blockread_timer, 100);
		}
	}
	enable_blockread_timer(check_cb, timeout, success_cb) {
		if (this.waiting) {
			throw new Error("Blockread timer already on!");
		}
		this.waiting = true;
		this.wait_timeout = timeout;
		this.wait_started = Date.now();
		this.wait_timer = setTimeout(this.iter_blockread_timer, 100);
		this.wait_callback = success_cb;
		this.wait_check_callback = check_cb;
	}
	/* In addition, here is a way to send data with
	 * fine-grained flush control. */
	flush() {
		this.net.flush();
	}
	send(arr, flush) {
		if (flush === undefined) flush = true;
		let sq = this.net.get_sQ();
		sq.set(arr, this.net._sQlen);
		this.net._sQlen += arr.length;
		if (flush) this.flush();
	}
	send_string(str, flush) {
		if (flush === undefined) flush = true;
		this.send(str.split('').map(function (chr) {
			return chr.charCodeAt(0);
		}), flush);
	}

	/* Your protocol handlers MUST implements the following:
	 */
	init_transformers() {
		/* Implement your event transformers here:
		
		this.on('recv_something', function(e) {
			return {
				'name': 'synth_event',
				'info': {...}
			}

		})

		*/
	}

	setCredentials(login, password, realname, hostname) {
	}

	handShake() {
		/* This function MUST initialize the client/server handshake
		 * after connection has been established. */
	}

	/* Receiving functions */

	/* Implement all the needed receiving functions in the
	 * following form:

	recv_char_info() {
		return this.read("%d%d%d%d", ['state', 'race', 'plcass', 'sex']);
	}

	 */

	/* Byte-based IO */
	read(fmt, names) {
	}

	write(fmt, args) {
	}

	read_cave(rle, cols) {
	}

	/* Send functions */
	/* Implement all the needed send functions, in the
	 * following form:

	send_play(mode) {
		this.write("%c%c", [ PKT_PLAY, mode ]);
	}

	*/

	/* Logical inven slot convertes. */
	item_slot_equip(equip_slot) {
	}
	item_slot_inven(inven_slot) {
	}
	item_slot_floor(floor_slot) {
	}
	item_slot_quiver(quiver_slot) {
	}

	/* Commands */
	getCommands() {
		return [ ];/* an Array of GameCommand entries.*/
	}
	/* All those MUST be implemented. */
	cmd_stay() { }
	cmd_walk(dir) { }
	cmd_run(dir) { }
	cmd_alter(dir) { }
	cmd_rest(enable) { }
	cmd_pathfind(x, y) { }
	cmd_message(message, chan) { }
	cmd_custom(cmd, args) { }
	cmd_pickup(floor_slot) { }
	cmd_wear_inven(inven_slot) { }
	cmd_wear_floor(floor_slot) { }
	cmd_takeoff_equip(equip_slot) { }
	cmd_drop_equip(equip_slot) { }
	cmd_drop_inven(inven_slot) { }
	cmd_drop_quiver(quiver_slot) { }
	cmd_destroy_equip(equip_slot) { }
	cmd_destroy_inven(inven_slot) { }
	cmd_destroy_floor(floor_slot) { }
	cmd_useitem_equip(equip_slot) { }
	cmd_useitem_inven(inven_slot) { }
	cmd_useitem_floor(floor_slot) { }
}

/* Some helper methods. */
function bnd(o,a) {o[a]=o[a].bind(o);return o[a];}
function ord(c) { return c.charCodeAt(0); }
function chr(i) { return String.fromCharCode(i); }
function hex(v) {return v.toString(16);}
function as16bit(v) {
	let a = (value >> 0) & 0xFF;
	let b = (value >> 8) & 0xFF;
	return [b, a];
}
function massivebind(o, attrs) {
	for (let k in attrs) {
		const a = attrs[k].name; o[a] = o[a].bind(o)
		attrs[k] = o[a];
	}
}
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill#Polyfill
if (!Array.prototype.fill) {
	Object.defineProperty(Array.prototype, 'fill', {
		value: function(value) {
			if (this == null) throw new TypeError('this is null or not defined');
			var O = Object(this); var len = O.length >>> 0;
			var start = arguments[1]; var relativeStart = start >> 0;
			var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
			var end = arguments[2]; var relativeEnd = end === undefined ? len : end >> 0;
			var finalValue = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
			while (k < finalValue) { O[k] = value; k++; }
			return O;
		}
	});
}
