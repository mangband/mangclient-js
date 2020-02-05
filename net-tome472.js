"use strict";

/* This file implements basic protocol handling for TomeNET 4.7.2.
 * Note: the actual protocol version might be different, I'm just
 * basing this on the latest tomenet.
 *
 * The protocol is based on XPilot/MAngband 0.6.0, therefore
 * this file can be used to also write "early mangband"/"pwmangband"
 * protocol handlers, and/or create a base class for those. */

(function() {/* Fake namespace. */

/* Protocol-specific errors. */
//class ObjFlagsOutOfBounds extends OutOfBounds { };
//class StreamOutOfBounds extends OutOfBounds { };
//class UnknownIndicator extends OutOfBounds { };
//class UnknownStream extends OutOfBounds { };

/* Port helpers */
const FALSE = false;
const TRUE = true;
const MSG_LEN = 256;
const MAX_CHARS = 80;
const MAX_CHARS_WIDE = 160;
const ONAME_LEN = 160;
const OPT_MAX = 154;
const TV_MAX = 127;
const MAX_F_IDX = 256;
const MAX_K_IDX = 1280;
const MAX_R_IDX = 1280;

/* Network packets */
const PKT_VERIFY      = 1;
const PKT_REPLY       = 2;
const PKT_PLAY        = 3;
const PKT_QUIT        = 4;
const PKT_LEAVE       = 5;
const PKT_MAGIC       = 6;

const PKT_END         = 11;
const PKT_LOGIN       = 12;
const PKT_KEEPALIVE   = 13;
const PKT_FILE        = 14;
const PKT_PLUSSES     = 20;
const PKT_AC          = 21;
const PKT_EXPERIENCE  = 22;
const PKT_GOLD        = 23;
const PKT_HP          = 24;
const PKT_SP          = 25;
const PKT_CHAR_INFO   = 26;
const PKT_VARIOUS     = 27;
const PKT_STAT        = 28;
const PKT_HISTORY     = 29;
const PKT_INVEN       = 30;
const PKT_EQUIP       = 31;
const PKT_TITLE       = 32;
const PKT_DEPTH       = 34;
const PKT_FOOD        = 35;
const PKT_BLIND       = 36;
const PKT_CONFUSED    = 37;
const PKT_FEAR        = 38;
const PKT_POISON      = 39;
const PKT_STATE       = 40;
const PKT_LINE_INFO   = 41;
const PKT_SPEED       = 42;
const PKT_STUDY       = 43;
const PKT_CUT         = 44;
const PKT_STUN        = 45;
const PKT_MESSAGE     = 46;
const PKT_CAVE_CHAR   = 47;
const PKT_SPELL_INFO  = 48;
const PKT_FLOOR       = 49;

const PKT_STORE          = 51;
const PKT_STORE_INFO     = 52;
const PKT_SOUND          = 54;
const PKT_SKILLS         = 57;
const PKT_MONSTER_HEALTH = 59;

const PKT_DIRECTION    = 60;
const PKT_ITEM         = 61;
const PKT_SELL         = 62;
const PKT_PARTY        = 63;
const PKT_SPECIAL_LINE = 64;
const PKT_SKILL_MOD    = 65;

/* 67-116 client packets */
const PKT_WALK        = 70;
const PKT_RUN         = 71;
const PKT_TUNNEL      = 72;
const PKT_AIM_WAND    = 73;
const PKT_DROP        = 74;
const PKT_FIRE        = 75;
const PKT_STAND       = 76;
const PKT_DESTROY     = 77;
const PKT_LOOK        = 78;
const PKT_SPELL       = 79;
const PKT_OPEN        = 80;
const PKT_PRAY        = 81;
const PKT_QUAFF       = 82;
const PKT_READ        = 83;
const PKT_SEARCH      = 84;
const PKT_TAKE_OFF    = 85;
const PKT_USE         = 86;
const PKT_THROW       = 87;
const PKT_WIELD       = 88;
const PKT_ZAP         = 89;
const PKT_TARGET      = 90;
const PKT_INSCRIBE    = 91;
const PKT_UNINSCRIBE  = 92;
const PKT_ACTIVATE    = 93;
const PKT_BASH        = 94;
const PKT_DISARM      = 95;
const PKT_EAT         = 96;
const PKT_FILL        = 97;
const PKT_LOCATE      = 98;
const PKT_MAP         = 99;
const PKT_STORE_LEAVE = 108;
const PKT_REST        = 112;

const PKT_FAILURE        = 121;
const PKT_SUCCESS        = 122;
const PKT_BPR            = 129;
const PKT_SANITY         = 130;
const PKT_GUILD_CFG      = 132;
const PKT_BONI_COL       = 133;
const PKT_AUTOINSCRIBE   = 135;
const PKT_PALETTE        = 137;
const PKT_SFX_VOLUME     = 148;
const PKT_SFX_AMBIENT    = 149;
const PKT_GUILD          = 153;
const PKT_SKILL_INIT     = 154;
const PKT_BACT           = 158;
const PKT_SKILL_PTS      = 160;
const PKT_SERVERDETAILS  = 162;
const PKT_AFK            = 163;
const PKT_ENCUMBERMENT   = 164;
const PKT_STAMINA        = 172;
const PKT_TECHNIQUE_INFO = 173;
const PKT_EXTRA_STATUS   = 174;
const PKT_UNIQUE_MONSTER = 176;
const PKT_WEATHER        = 177;
const PKT_MUSIC          = 183;

/* Sub-commands */
const PKT_FILE_DATA=	1
const PKT_FILE_END=	2
const PKT_FILE_CHECK=	3
const PKT_FILE_ACK=	4	/* acknowledge whatever */
const PKT_FILE_ERR=	5	/* failure - close */
const PKT_FILE_SUM=	6	/* checksum reply */
const PKT_FILE_INIT=	7	/* initiate a transfer */

const RLE_NONE    = 0;
const RLE_CLASSIC = 1;
const RLE_LARGE   = 2;


const VERSION_MAJOR = 4
const VERSION_MINOR = 7
const VERSION_PATCH = 2
const VERSION_EXTRA = 0
const VERSION_BRANCH = 0xFF
const VERSION_BUILD  = 0
const MY_VERSION = (VERSION_MAJOR << 12 | VERSION_MINOR << 8 | VERSION_PATCH
	<< 4 | VERSION_EXTRA)

const VERSION_OS = 0; /* Unknown OS */

/* TODO: fill whole table.... */
const TERM_DARK   = 0;
const TERM_WHITE  = 1;
const TERM_SLATE  = 2;
const TERM_BLUE   = 6;
const TERM_YELLOW = 11;
const TERM_L_BLUE = 14;
let ASCII_COLORS = {
    'w': TERM_WHITE,
    'y': TERM_YELLOW,
    'b': TERM_BLUE,
    'B': TERM_L_BLUE,
};

class TomeNET472ProtocolHandler extends MAngbandProtocolHandler {

	constructor(net, config, on_event) {
		super(net, config, on_event);
		this.packets[PKT_QUIT] = this.recv_quit;
		this.packets[PKT_CHAR_INFO] = this.recv_char_info;
		this.packets[PKT_PARTY] = this.recv_party_info;
		this.packets[PKT_GUILD] = this.recv_guild_info;
		this.packets[PKT_GUILD_CFG] = this.recv_guild_cfg;
		this.packets[PKT_END] = this.recv_end;
		this.packets[PKT_SKILL_MOD] = this.recv_skill_mod;
		this.packets[PKT_TECHNIQUE_INFO] = this.recv_technique_info;
		this.packets[PKT_SKILL_INIT] = this.recv_skill_init;
		this.packets[PKT_PALETTE] = this.recv_palette;
		this.packets[PKT_SKILL_PTS] = this.recv_skill_pts;
		this.packets[PKT_EQUIP] = this.recv_equip;
		this.packets[PKT_INVEN] = this.recv_inven;
		this.packets[PKT_FLOOR] = this.recv_floor;
		this.packets[PKT_SPELL_INFO] = this.recv_spell_info;
		this.packets[PKT_BONI_COL] = this.recv_boni_col;
		this.packets[PKT_FILE] = this.recv_file;
		this.packets[PKT_SOUND] = this.recv_sound;
		this.packets[PKT_WEATHER] = this.recv_weather;
		this.packets[PKT_SFX_VOLUME] = this.recv_sfx_volume;
		this.packets[PKT_SFX_AMBIENT] = this.recv_sfx_ambient;
		this.packets[PKT_MUSIC] = this.recv_music;
		this.packets[PKT_UNIQUE_MONSTER] = this.recv_unique_monster;
		this.packets[PKT_LINE_INFO] = this.recv_line_info;
		this.packets[PKT_CAVE_CHAR] = this.recv_cave_char;
		this.packets[PKT_MESSAGE] = this.recv_message;
		this.packets[PKT_TITLE] = this.recv_title;
		this.packets[PKT_EXPERIENCE] = this.recv_experience;
		this.packets[PKT_STAT] = this.recv_stat;
		this.packets[PKT_AC] = this.recv_ac;
		this.packets[PKT_HP] = this.recv_hp;
		this.packets[PKT_SP] = this.recv_sp;
		this.packets[PKT_STAMINA] = this.recv_stamina;
		this.packets[PKT_GOLD] = this.recv_gold;
		this.packets[PKT_SANITY] = this.recv_sanity;
		this.packets[PKT_POISON] = this.recv_poison;
		this.packets[PKT_DEPTH] = this.recv_depth;
		this.packets[PKT_MONSTER_HEALTH] = this.recv_monster_health;
		this.packets[PKT_ENCUMBERMENT] = this.recv_encumberment;
		this.packets[PKT_HISTORY] = this.recv_history;
		this.packets[PKT_VARIOUS] = this.recv_various;
		this.packets[PKT_PLUSSES] = this.recv_plusses;
		this.packets[PKT_SKILLS] = this.recv_skills;
		this.packets[PKT_AFK] = this.recv_afk;
		this.packets[PKT_CUT] = this.recv_cut;
		this.packets[PKT_STUN] = this.recv_stun;
		this.packets[PKT_STUDY] = this.recv_study;
		this.packets[PKT_SPEED] = this.recv_speed;
		this.packets[PKT_FOOD] = this.recv_food;
		this.packets[PKT_BLIND] = this.recv_blind;
		this.packets[PKT_FEAR] = this.recv_fear;
		this.packets[PKT_CONFUSED] = this.recv_confused;
		this.packets[PKT_STATE] = this.recv_state;
		this.packets[PKT_BPR] = this.recv_bpr;
		this.packets[PKT_EXTRA_STATUS] = this.recv_extra_status;
		this.packets[PKT_AUTOINSCRIBE] = this.recv_apply_auto_insc;
		this.packets[PKT_STORE] = this.recv_store;
		this.packets[PKT_STORE_INFO] = this.recv_store_info;
		this.packets[PKT_BACT] = this.recv_store_action;
		this.packets[PKT_STORE_LEAVE] = this.recv_store_kick;
		massivebind(this, this.packets);
		massivebind(this, this.eventHandlers);

		this.setup_blockread_timer();

		this.init_base_info();
		/* Calling this manually */
		this.init_transformers();
	}
	init_transformers() {
		/* Generate 'synthetic' events out of raw ones. */
		let renderer = this.render_indicator
/*
	//TODO: catch every indicator and convert it to
	//this:
		this.on('recv_indicator', function(e) {
			return {
				"name": "indication",
				"info": {
					"type": e.info['indicator']['mark'],
					"values": e.info['values'],
					"str": e.info['str'],
					"text_render": renderer(
						e.info['indicator'], e.info['values'],
						e.info['indicator'].col,
						e.info['indicator'].row
					),
					"window_ref": e.info['indicator'].win,
				}
			}
		})
*/
		this.on('recv_inven', function(e) {
			return {
				"name": "item",
				"info": new GameItem({
					'inven_group': 'inven',
					'slot': e.info.pos - ord('a'),
					'tval': e.info.tval,
					'weight': e.info.wgt,
					'name': e.info.name,
					'testflag': e.info.flag,
					'attr': e.info.attr,
				}),
			}
		});
		this.on('recv_equip', function(e) {
			return {
				"name": "item",
				"info": new GameItem({
					'inven_group': 'equip',
					'slot': e.info.pos - ord('a'),
					'tval': e.info.tval,
					'weight': e.info.wgt,
					'name': e.info.name,
					'testflag': e.info.flag,
					'attr': e.info.attr,
				}),
			}
		});
		this.on('recv_store', function(e) {
			return {
				"name": "item",
				"info": new GameItem({
					'inven_group': 'store',
					'slot': e.info.pos,
					'tval': e.info.tval,
					'weight': e.info.wgt,
					'name': e.info.name,
					'num': e.info.num,
					'price': e.info.price,
					'testflag': 0,
					'attr': e.info.attr,
				}),
			}
		});
		this.on('recv_store_kick', function(e) {
			return {
				"name": "item_wipe",
				"info": {
					'inven_group': 'store',
				},
			}
		});
		this.on('recv_line_info', function(e) {
			return {
				"name": "cave_data",
				"info": {
					"x": 0,
					"y": e.info.y,
					"main": e.info.main,
				},
			}
		});
		this.on('recv_cave_char', function(e) {
			return {
				"name": "cave_data",
				"info": {
					"x": e.info.x,
					"y": e.info.y,
					"main": [{
						"a": e.info.a,
						"c": e.info.c,
					}],
				},
			}
		});
		let that = this;
		this.on('recv_message', function(e) {
			let multicolor = that.parse_message(e.info.message);
			let singlecolor = that.remove_color_codes(e.info.message);
			return {
				"name": "log_message",
				"info": {
					"channel": "&log",
					"message": singlecolor,
					"multicolor": multicolor,
				},
			}
		});
	}
	parse_message(s) {
		let r = [];
		let d = "";
		let color_code = 1;
		for (let i = 0; i < s.length; i++) {
			let code = ord(s[i]);
			if (code == 255) { //color?
				let ascii_color = s[i+1];
				//Dump prev. run
				if (d.length > 0) r.push({"a": color_code, "str": d});
				color_code = ASCII_COLORS[ascii_color];
				if (color_code === undefined) {
					console.log("ERROR color", ascii_color);
				}
				i += 1; // skip it
				d = ""; //start next run;
				continue;
			} else if (code == 253) {
				//skip it, +1 next color
				i += 1;
				continue;
			}
			d = d + s[i];
			//console.log(i, s[i], ord(s[i]));
		}
		if (d.length > 0) {
			r.push({"a": color_code, "str": d});
		}
		//console.log(d);
		return r;
	}
	remove_color_codes(s) {
		let r = "";
		for (let i = 0; i < s.length; i++) {
			//console.log(i, s[i], ord(s[i]));
			let code = ord(s[i]);
			if (code == 255) { //color?
				let ascii_color = s[i+1];
				let color_code = ASCII_COLORS[ascii_color];
				// skip it
				i += 1;
				continue;
			} else if (code == 253) {
				//skip it, +1 next color
				i += 1;
				continue;
			}
			r = r + s[i];

		}
		//console.log(r);
		return r;
	}

	setCredentials(login, password, realname, hostname) {
		this.login = login;
		this.password = password;
		this.realname = realname || 'webclient';
		this.hostname = hostname || window.location.origin;
	}

	handShake() {
		/* IMPORTANT: Enable bypass mode, so that no packets
		 * are handled (yet!). We will re-enable it later. */

		this.bypassPackets(true);

		/* Perform the flush-dance handshake */
		const magic = 12345;
		const PORT_NUM = 0;
		this.write("%u", [magic], false);
		this.write("%s%hu%c", [this.realname, PORT_NUM, 0xFF], false);
		this.write("%s%s%hu", [this.login, this.hostname, MY_VERSION], false);
		this.flush();
/*
		this.write("%d%d%d%d%d%d", [
			VERSION_MAJOR,
			VERSION_MINOR,
			VERSION_PATCH,
			VERSION_EXTRA,
			VERSION_BRANCH,
			VERSION_BUILD + (VERSION_OS) * 1000000
		]);
*/
		let that = this;
		this.waitThen(this.mustReceiveInitialInfo, 5, function(reply) {

			//console.log("FROM", this.net._rQlen);
			//console.log("GOT", reply);

			this.waitThen(this.mustReceiveServerVersion, 10, function(result) {
				console.log("Got server version:", result);
				this.netVerify();
			});
		});
		return;
	}

	mustReceiveLogin() {
		return this.net.rQlen() > 1 ? true : null;
	}
	mustReceiveStatus() {
		return this.read("%c");
	}
	mustReceiveReply() {
		let info = this.read("%c%c%c", ['pkt','ch1','ch2']);
		console.log("RECEIVED REPLY:", info);
		if (info.pkt != PKT_REPLY) {
			throw Error("Not a REPLY packet!");
		}
//		if (info.ch1 != PKT_VERIFY) {
//			throw Error("Verify wrong reply type!");
//		}
//		if (info.ch2 != PKT_SUCCESS) {
//			throw error("Verification failed!");
//		}
		info.type = info.ch1;
		info.result = info.ch2;
		return info;
	}
	mustReceiveMagic() {
		/* 2 bytes, 5 seconds */
		//if (this.net.rQlen() < 2) return null;
		return this.read("%c%u", ['ch', 'magic']);
	}
	mustReceiveServerVersion() {
		return this.read("%d%d%d%d%d%d", [
			'major', 'minor', 'patch', 'extra',
			'branch', 'build']);
	}
	mustReceiveInitialInfo() {
		return this.read("%c%c%d%d", ['reply_to', 'status', 'temp', 'char_creation_flags']);
	}
	netVerify() {
		this.write("%c%s%s%s", [
			PKT_VERIFY,
			this.realname,
			this.login,
			this.password
		], false);
		this.flush();

		let that = this;
		this.waitThen(this.mustReceiveReply, 10, function(reply) {
			if (reply.type != PKT_VERIFY)
			{
				throw new Error("Verify wrong reply");
			}
			if (reply.result != PKT_SUCCESS)
			{
				throw new Error("Verification failed");
			}
			this.waitThen(this.mustReceiveMagic, 5, function(magic) {
				console.log("GOT MAGIC", magic, hex(magic.magic));
				this.netSetup();
			});
		});
	}
	mustReceiveSetup() {
		let info = this.read("%d%hd%c%c%c%d", [
			'motd_len', 'frames_per_second', 'max_race',
			'max_class', 'max_trait', 'setup_size']);
		let i;
		console.log("INFO:", info);
		for (i = 0; i < info['max_race']; i++) {
			let race_info = this.read("%c%c%c%c%c%c%s%d", [
				'b1','b2','b3','b4','b5','b6',
				'str', 'choice',
			]);
		}
		for (i = 0; i < info['max_class']; i++) {
			let class_info = this.read("%c%c%c%c%c%c%s", [
				'b1','b2','b3','b4','b5','b6',
				'str',
			]);
			for (let j = 0; j < 6; j++) {
				let b1 = this.read("%c");
			}
		}
		for (i = 0; i < info['max_trait']; i++) {
			let trait_info = this.read("%s%d", ['str', 'choice']);
			//console.log(trait_info);
		}
		console.log("Read everything");
		return true;
	}
	mustReceiveMOTD() {
		let len = this.net.rQlen();
		let s = "";
		for (let i = 0; i < len; i++ ) {
			let c = this.read("%c");
			s += c;
		}
		console.log(s);
		return true;
	}
	netSetup() {
		this.waitThen(this.mustReceiveSetup, 10, function() {
			console.log("Setup complete, get", this.net.rQlen(), "bytes of buffer");
			this.waitThen(this.mustReceiveMOTD, 10, function() {

				console.log("Setup complete");
				this.netLogin();

			});
		});
	}
	wipeReadBuffer() {
		this.net._rQi = 0;
		this.net._rQlen = 0;
	}
	mustReceiveServerDetails() {
		return this.read("%c%d%d%d%d", ['ch', 'f3','f2','f1','f0']);
	}
	
	mustReceiveCharacters() {
		let i = 0;
		let max_chars = 12;
		let chars = [];
		for (i = 0; i < max_chars; i++) {
			let char = this.read("%c%hd%s%s%hd%hd%hd%s",[
				'ch', 'mode', 'colour_sequence',
				'c_name', 'level', 'c_race', 'c_class',
				'loc'])
			if (char['mode'] == 0 || char['c_name'] == "") break;
			//console.log("GOT", i,"chars", char);
			chars.push(char);
		}
		return chars;
	}
	netLogin() {
		/* Send first login packet */
		this.write("%c%s", [ PKT_LOGIN, "" ], false);
		this.flush();

		/* Wait for reply */
		this.waitThen(this.mustReceiveLogin, 5, function(reply) {

			/* Send second login packet */
			this.write("%c%s", [ PKT_LOGIN, this.login ], false);
			this.flush();

			this.waitThen(this.mustReceiveServerDetails, 5, function(details) {

				//console.log("Got details", details);

				this.waitThen(this.mustReceiveCharacters, 5, function(chars) {

					//console.log("Got characters", chars);

					/* Wait for reply */
					this.waitThen(this.mustReceiveStatus, 5, function(reply) {
						console.log("Got status:", reply);
		//			this.wipeReadBuffer();
						this.netStart();
					});

				});

			});
		});
	}
	netStart() {
		this.write("%c", [PKT_PLAY], false);
		let i;
		// HACK!!!! Replace with real values !!!!
		let sex = 1;
		let race = 0;
		let pclass = 0;
		let trait = 0;
		let audio_sfx = 0;
		let audio_music = 0;
		let stat_order = [ 0, 1, 2, 3, 4, 5 ];
		
		this.write("%hd%hd%hd%hd%hd%hd", [
			sex, race, pclass, trait, audio_sfx, audio_music
		], false);
		
		for (i = 0; i < 6; i++) {
			this.write("%hd", [stat_order[i]], false);
		}

		for (i = 0; i < OPT_MAX; i++) {
			this.write("%c", [0], false);// this.options[i] ? [1] : [0]);
		}

		this.screen_wid = 80;
		this.screen_hgt = 23;

		this.write("%d%d", [this.screen_wid, this.screen_hgt], false);

		//send redefs...
		for (i = 0; i < TV_MAX; i++) {
			this.write("%c%c", [0, 0], false);
		}
		for (i = 0; i < MAX_F_IDX; i++) {
			this.write("%c%c", [0, 0], false);
		}
		for (i = 0; i < MAX_K_IDX; i++) {
			this.write("%c%c", [0, 0], false);
		}
		for (i = 0; i < MAX_R_IDX; i++) {
			this.write("%c%c", [0, 0], false);
		}
		this.flush();

		/* Wait for reply */
		this.waitThen(this.mustReceiveReply, 10, function(reply) {
			//console.log("GOT REPLY:", reply);
			if (reply['type'] != PKT_PLAY) {
				throw Error("Can't receive reply packet after play")
			}
			if (reply['result'] != PKT_SUCCESS) {
				throw Error("Start play not allowed")
			}

//			this.waitThen(this.mustReceiveMagic, 10, function(magic) {
//				console.log("GOT EXTRA MAGIC!!", magic);
				this.finishHandShake();
				this.client_ready();
//			});
		});
	}
	finishHandShake() {
		console.log("Handshake complete...");
//		this.wipeReadBuffer();
		this.bypassPackets(false);
	}

	setGameOption(option_name, value) {
	}
	getGameOpton(option_name) {
	}

	setup_keepalive_timer() {
		bnd(this, 'run_keepalive_timer');
		this.keepalive_timer = setTimeout(this.run_keepalive_timer, 2000);
	}
	run_keepalive_timer() {
		this.send_keepalive();
		this.keepalive_timer = setTimeout(this.run_keepalive_timer, 2000);
	}

	/* Setup phase */
	init_base_info() {
	}
	init_data_sync() {
	}
	sync_data_piece(rq, ask_var, rcv, max, ready) {
	}
	sync_data() {
	}

	client_ready() {
		this.setup_keepalive_timer();
		this.trigger('client_ready', {'name': 'client_ready'});
	}

	client_setup() {
		this.trigger('client_setup', {'name': 'client_setup'});
	}

	enter(state) {
	}

	/* Helpers */

	/* Recv... */
	recv_quit() {
		let reason;
		try {
			reason = this.read("%s");
		} catch (e) {
			if (e instanceof NotEnoughBytes) {
				reason = "unknown reason";
			} else {
				throw e;
			}
		}
		throw new GotQuitPacket(reason);
	}

	recv_char_info() {
		let info = this.read("%hd%hd%hd%hd%hd%s",
			[ 'race', 'class', 'trait', 'sex', 'mode', 'cname']);
		//console.log(info);
		return info;
	}

	recv_equip() {
		let info = this.read("%c%c%hu%hd%c%c%hd%hd%c%I", [
			'pos', 'attr', 'wgt', 'amt', 'tval', 'sval', 'pval',
			'name1', 'uses_dir', 'name']);
		return info;
	}
	recv_inven() {
		let info = this.read("%c%c%hu%hd%c%c%hd%hd%c%I", [
			'pos', 'attr', 'wgt', 'amt',
			'tval', 'sval', 'pval',
			'name1', 'uses_dir', 'name']);
		return info;
	}
	recv_floor() {
		let info = this.read("%c", ['tval']);
		return info;
	}
	recv_store() {
		return this.read("%c%c%hd%hd%d%S%c%c%hd", [
			'pos', 'attr', 'wgt', 'num', 'price', 'name',
			'tval', 'sval', 'pval']);
	}
	recv_store_info() {
		return this.read("%hd%s%s%hd%d%c%c", [
			'store_num', 'store_name', 'owner_name',
			'num_items', 'max_cost', 'store_attr', 'store_char']);
	}
	recv_store_action() {
		return this.read("%c%hd%hd%s%c%c%hd%c", [
			'pos', '&bact', 'action', 'name', 'attr',
			'letter', 'cost', 'flag']);
	}
	recv_store_kick() {
		return true;
	}
	recv_apply_auto_insc() {
		let info = this.read("%c", ['slot']);
		return info;
	}
	recv_spell_info() {
		return this.read("%d%d%d%hu%hu%hu%s", [
			'spells0', 'spells1', 'spells2',
			'realm', 'book', 'line', 'buf']);
	}
	recv_boni_col() {
		 //0+22+16+2 bytes in total
		return this.read("%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c%c",
		['i',
		'spd', 'slth', 'srch', 'infr', 'lite', 'dig', 'blow', 'crit', 'shot',
		'migh', 'mxhp', 'mxmp', 'luck',
		'pstr', 'pint', 'pwis', 'pdex', 'pcon', 'pchr',
		'amfi', 'sigl',
		'cb0', 'cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6', 'cb7', 'cb8', 'cb9',
		'cb10', 'cb11', 'cb12', 'cb13', 'cb14', 'cb15',
		'color', 'symbol']);
	}
	recv_sound() {
		let info = this.read("%d%d%d%d%d", ['s1', 's2', 't', 'v', 'id']);
		return info;
	}
	recv_file() {
		/* HACK! Packet recv. functions should never write anything
		 * back... */
		let info = this.read("%c%hd", ['command', 'fnum']);
		let ok = true;
		switch(info.command){
			case PKT_FILE_INIT:
			{
				let fname = this.read("%s");
				//ok = local_file_init(0, info.fnum, fname);
				break;
			}
			case PKT_FILE_DATA:
				let len = this.read("%hd");
				//ok = local_file_write(0, info.fnum, len);
				break;
			case PKT_FILE_END:
				//x = local_file_close(0, info.fnum);
				break;
			case PKT_FILE_CHECK:
			{
				let fname = this.read("%s");
				//let x = local_file_check_new(fname, digest);
				//digest_net = md5_digest_to_bigendian_uint(digest_net, digest);
				let digest_net = [0, 0, 0, 0];
				// I think this is giving me some trouble...
				// Not sure, but looks like tomenet servers
				// sees those as undefined packets (sometimes).
				this.write("%c%c" + "%hd" + "%u%u%u%u", [
					PKT_FILE, PKT_FILE_SUM,
					info.fnum,
					digest_net[0], digest_net[1], digest_net[2], digest_net[3]
				]);
				return 1;
				break;
			}
			case PKT_FILE_SUM:
				let digest = this.read("%u%u%u%u", ['0','1','2','3']);
				//	md5_digest_to_char_array(digest, digest_net);
				//	check_return_new(0, info.fnum, digest, 0);
				return 1;
				break;
			case PKT_FILE_ACK:
				//local_file_ack(0, info.fnum);
				return 1;
				break;
			case PKT_FILE_ERR:
				//local_file_err(0, info.fnum);
				/* continue the send/terminate */
				return 1;
				break;
			case 0:
				return 1;
			default:
				ok = false;
		}
		this.write("%c%c%hd", [PKT_FILE, ok ? PKT_FILE_ACK : PKT_FILE_ERR, info.fnum]);
	}

	recv_weather() {
		let info = this.read("%d%d%d%d%d%d%d%d", [
			'wt', 'ww', 'wg', 'wi', 'ws', 'wx', 'wy',
			'cnum']);
		let clouds = info.cnum;
		if (clouds < 0) clouds = 0;
		if (clouds > 10) clouds = 10;

		info.clouds = [];

		for (let i = 0; i < clouds; i++) {
			let cloud = this.read("%d%d%d%d%d%d%d%d",
			['cidx', 'cx1', 'cy1', 'cx2', 'cy2', 'cd', 'cxm', 'cym']);
			info.clouds.push(cloud);
		}
		return info;
	}
	recv_sfx_volume() {
		let info = this.read("%c%c", ['c_ambient', 'c_weather']);
		return info;
	}
	recv_sfx_ambient() {
		return this.read("%d", ['a']);
	}
	recv_music() {
		return this.read("%c%c", ['m', 'm2']);
	}
	recv_unique_monster() {
		return this.read("%d%d%s", ['u_idx', 'killed', 'name']);
	}
	recv_title() {
		let info = this.read("%s");
		return info;
	}
	recv_experience() {
		let info = this.read("%hu%hu%hu%d%d%d%d", [
			'lev', 'max_lev', 'max_plv', 'max', 'cur',
			'adv', 'adv_prev']);
	}
	recv_stat() {
		return this.read("%c%hd%hd%hd%hd", [
			'stat', 'max', 'cur', 's_ind', 'max_base'
		]);
	}
	recv_ac() {
		return this.read("%hd%hd", ['base', 'plus']);
	}
	recv_hp() {
		return this.read("%hd%hd%c", ['max', 'cur', 'drain']);
	}
	recv_sp() {
		return this.read("%hd%hd", ['max', 'cur']);
	}
	recv_stamina() {
		return this.read("%hd%hd", ['max', 'cur']);
	}
	recv_depth() {
		return this.read("%hu%hu%hu%c%c%c%s%s%s", [
			'x', 'y', 'z', 'town',
			'colour', 'colour_sector',
			'buf', 'location_name2', 'location_pre']);
	}
	recv_monster_health() {
		return this.read("%c%c", ['num', 'attr']);
	}
	recv_history() {
		return this.read("%hu%s", ['line', 'buf']);
	}
	recv_various() {
		return this.read("%hu%hu%hu%hu%s", [
			'hgt', 'wgt', 'age', 'sc', 'buf']);
	}
	recv_plusses() {
		return this.read("%hd%hd%hd%hd%hd%hd", [
			'hit', 'dam', 'hit_r', 'dam_r', 'hit_m', 'dam_m']);
	}
	recv_skills() {
		return this.read(
			"%hd%hd%hd%hd%hd%hd%hd%hd"+
			"%hd%hd%hd%hd", [
			'skill_thn',//0
			'skill_thb',//1
			'skill_sav',//2
			'skill_stl',//3
			'skill_fos',//4
			'skill_srh',//5
			'skill_dis',//6
			'skill_dev',//7
			'num_blow',//8
			'num_fire',//9
			'num_spell',//10
			'see_infra',//11
		]);
	}
	recv_afk() {
		return this.read("%c", ['afk']);
	}
	recv_cut() {
		return this.read("%hd", ['cut']);
	}
	recv_stun() {
		return this.read("%hd", ['stun']);
	}
	recv_speed() {
		return this.read("%hd", ['speed']);
	}
	recv_study() {
		return this.read("%c", ['study']);
	}
	recv_food() {
		return this.read("%hu", ['food']);
	}
	recv_blind() {
		return this.read("%c", ['blind']);
	}
	recv_fear() {
		return this.read("%c", ['afraid']);
	}
	recv_confused() {
		return this.read("%c", ['confused']);
	}
	recv_state() {
		return this.read("%hu%hu%hu", ['paralyzed', 'searching', 'resting']);
	}
	recv_bpr() {
		return this.read("%c%c", ['bpr', 'attr']);
	}
	recv_extra_status() {
		return this.read("%s", ['status']);
	}
	recv_encumberment() {
		return this.read("%c%c%c%c%c%c%c%c%c%c%c%c%c", [
			'cumber_armor', 'awkward_armor', 'cumber_glove',
			'heavy_wield', 'heavy_shield', 'heavy_shoot',
			'icky_wield', 'awkward_wield', 'easy_wield',
			'cumber_weight', 'monk_heavyarmor',
			'rogue_heavyarmor', 'awkward_shoot']);
	}
	recv_gold() {
		return this.read("%d%d", ['gold', 'balance']);
	}
	recv_sanity() {
		return this.read("%c%s%c", ['attr', 'buf', 'dam']);
	}



	recv_line_info() {
		let y = this.read("%hd");
		let main = this.read_cave(RLE_LARGE, 80);
		return {
			"y": y,
			"main": main,
		}
	}
	recv_cave_char() {
		let info = this.read("%c%c%c%c", ['x', 'y', 'a', 'c']);
		return info;
	}
	recv_message() {
		let info = this.read("%S", ['message']);
		console.log("MSG", info);
		return info;
	}

	recv_poison() {
		return this.read("%c", ['poision']);
	}

	recv_end() {
		return true;
	}
	recv_skill_mod() {
		let info = this.read("%d%d%d%d%c%d", ['i', 'val', 'mod', 'dev', 'flags1', 'mkey']);
		return info;
	}
	recv_technique_info() {
		return this.read("%d%d", ['melee', 'ranged']);
	}
	recv_skill_init() {
		return this.read("%hd%hd%hd%hd%d%c%S%S%S", [
			'i', 'father', 'order',
			'mkey', 'flags1', 'tval',
			'name', 'desc', 'act']);
	}
	recv_skill_pts() {
		return this.read("%d");
	}
	recv_palette() {
		return this.read("%c%c%c%c", ['c', 'r', 'g', 'b']);
	}
	recv_party_info() {
		return this.read("%s%s%s", ['pname', 'pmembers', 'powner']);
	}
	recv_guild_info() {
		return this.read("%s%s%s", ['gname', 'gmembers', 'gowner']);
	}
	recv_guild_cfg() {
		let cfg = this.read("%d%d%d%d%d%d%d", [
			'master', 'guild_flags', 'minlev_32b',
			'guild_adders',
			'guildhall_wx', 'guildhall_wy', 'ghp']);
	/*
	switch (ghp) {
	case 0: strcpy(guildhall_pos, "north-western"); break;
	case 4: strcpy(guildhall_pos, "northern"); break;
	case 8: strcpy(guildhall_pos, "north-eastern"); break;
	case 1: strcpy(guildhall_pos, "western"); break;
	case 5: strcpy(guildhall_pos, "central"); break;
	case 9: strcpy(guildhall_pos, "eastern"); break;
	case 2: strcpy(guildhall_pos, "south-western"); break;
	case 6: strcpy(guildhall_pos, "southern"); break;
	case 10: strcpy(guildhall_pos, "south-eastern"); break;
	default: strcpy(guildhall_pos, "unknown");
	}*/
		let adders = [];
		for (let i = 0; i < cfg['guild_adders']; i++) {
			if (i >= 5) {
				let dummy = this.read("%s");
			} else {
				let adder = this.read("%s");
				adders.push(adder);
			}
		}
		cfg['adders'] = adders;
		return cfg;
	}

	/* Byte-based IO */

	/* Notation is:
	    %c - 1 byte
	    %d - 4 bytes, signed
	    %u - 4 bytes, unsigned
	    %hd - 2 bytes, signed
	    %hu - 2 bytes, unsigned
	    %ld - 4 bytes, signed
	    %lu - 4 bytes, unsgined
	    %S - big strings (MSG_LEN)
	    %I - seming-big string (ONAME_LEN)
	    %s - small strings (MAX_CHARS)
	*/
	read(fmt, names) {
		let return_single_value = false;
		let ret = {};
		let formats = fmt.split("%");
		formats = formats.slice(1);
		if (names === undefined && formats.length == 1) {
			names = ['anyval'];
			return_single_value = true;
		}
		if (formats.length != names.length) {
			throw new Error("Passed " + formats.length + " formats yet " + names.length + " names.");
		}
		for (let k in formats) {
			let format = formats[k];
			let name = names[k];
			let len = this.net.rQlen();
			if (format == 'c') { /* Char, Byte */
				if (len < 1) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift8();
			} else if (format == 'hd' || format == 'hu') { /* 16-bit value */
				if (len < 2) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift16();
			} else if (format == 'd' || format == 'u'
				|| format == 'ld' || format == 'lu') { /* 32-bit value */
				if (len < 4) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift32();
			} else if (format == 's' || format == 'S' || format == 'I') { /* C String */
				let i;
				let done = false;
				let str = "";
				for (i = 0; i < len; i++) {
					let byte = this.net.rQshift8();
					if (byte == 0) {
						done = true;
						break;
					}
					/* Slow and evil: */
					str = str + String.fromCharCode(byte);
				}
				if (!done) throw new NotEnoughBytes();
				ret[name] = str;
			} else {
				throw new UndefinedQueueFormat(`Unknown format '%${format}' for '${name}'`);
			}
		}
		if (return_single_value) {
			return ret['anyval'];
		}
		return ret;
	}

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
	write(fmt, args, flush) {
		if (flush === undefined) flush = true;
		let formats = fmt.split("%");
		formats = formats.slice(1);
		for (let k in formats) {
			let format = formats[k];
			let value = args[k];
			if (format == 'c') { /* Char, Byte */
				this.send([value], flush);
			} else if (format == 'hd' || format == 'hu') { /* 16-bit value */
				let a = (value >> 0) & 0xFF;
				let b = (value >> 8) & 0xFF;
				this.send([b, a], flush);
			} else if (format == 'd' || format == 'u'
				|| format == 'ld' || format == 'lu') { /* 32-bit value */
				let a = (value >> 0) & 0xFF;
				let b = (value >> 8) & 0xFF;
				let c = (value >> 16) & 0xFF;
				let d = (value >> 24) & 0xFF;
				this.send([d, c, b, a], flush);
			} else if (format == 's') { /* C String */
				this.send_string(value, flush);
				this.send([0], flush);
			} else if (format == 'S') { /* Large C String */
				this.send_string(value, flush);
				this.send([0], flush);
			} else if (format == 'I') { /* Semi-Large C String */
				this.send_string(value, flush);
				this.send([0], flush);
			}
		}
	}

	read_cave(rle, cols) {
		let ret = new Array(cols).fill();
		let i;
		for (i = 0; i < cols; i++) {
			ret[i] = new Object({'a': 0, 'c': 0});
		}

		if (rle == RLE_NONE) this.cv_decode_none(ret, null, cols);
		else if (rle == RLE_CLASSIC) this.cv_decode_rle1(ret, null, cols);
		else if (rle == RLE_LARGE) this.cv_decode_rle2tn(ret, null, cols);
		else throw new UndefinedRLEMethod(rle);
		let s = ""
		for (i = 0; i < cols; i++) {
			s = s + String.fromCharCode(ret[i].c);
		}
		console.log(s);
		return ret;
	}

	/* "Cave" decoders */
	cv_decode_none(dst, src, len) {
		if (this.net.rQlen() < len * 2) throw new NotEnoughBytes(len * 2);
		for (let x = 0; x < len; x++)
		{
			let c = this.net.rQshift8();
			let a = this.net.rQshift8();
			/* 'Draw' a character n times */
			if (dst)
			{
				/* Memorize */
				dst[x].a = a;
				dst[x].c = c;
			}
		}
		return len;
	}
	cv_decode_rle1(dst, src, len) {
		for (let x = 0; x < len; x++)
		{
			let n;
			let c;
			let a;

			/* Read the char/attr pair */
			if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
			c = this.net.rQshift8();
			a = this.net.rQshift8();

			/* Start with count of 1 */
			n = 1;

			/* Check for bit 0x40 on the attribute */
			if (a & 0x40)
			{
				/* First, clear the bit */
				a &= ~(0x40);

				/* Read the number of repetitions */
				if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
				n = this.net.rQshift8();
				/* Is it even legal? */
				if (x + n > len) throw new StreamOutOfBounds(x + n, len);
			}
			/* 'Draw' a character n times */
			if (dst)
			{
				let i;
				for (i = 0; i < n; i++)
				{
					/* Memorize */
					dst[x + i].a = a;
					dst[x + i].c = c;
				}
			}

			/* Reset 'x' to the correct value */
			x += n - 1;
		}
		return len;
	}
	cv_decode_rle2tn(dst, src, len) {
		for (let x = 0; x < len; x++)
		{
			let n;
			let c;
			let a;

			/* Read the char/attr pair */
			if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
			c = this.net.rQshift8();
			a = this.net.rQshift8();

			/* Start with count of 1 */
			n = 1;
			/* Check for bit 0xFF on the attribute */
			if (a == 0xFF)
			{
				/* Read the real attr and number of repetitions */
				if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
				a = this.net.rQshift8();
				n = this.net.rQshift8();
				/* Is it even legal? */
				if (x + n > len) throw new StreamOutOfBounds(x + n, len);
			}

			/* 'Draw' a character n times */
			if (dst)
			{
				for (let i = 0; i < n; i++)
				{
					/* Memorize */
					dst[x + i].a = a;
					dst[x + i].c = c;
				}
			}

			/* Reset 'x' to the correct value */
			x += n - 1;
		}
		return len;
	}

	/* Send... */
	send_keepalive() {
		this.write("%c", [PKT_KEEPALIVE]);
	}
	send_walk(dir) {
		this.write("%c%c", [PKT_WALK, dir]);
	}
	send_run(dir) {
		this.write("%c%c", [PKT_RUN, dir]);
	}
	send_tunnel(dir) {
		this.write("%c%c", [PKT_TUNNEL, dir]);
	}
	send_rest() {
		this.write("%c", [PKT_REST]);
	}
	send_drop(item, amt) {
		this.write("%c%hd%hd", [PKT_DROP, item, amt]);
	}
	send_msg(message) {
		this.write("%c%S", [PKT_MESSAGE, message]);
	}
	send_item(item) {
		this.write("%c%hd", [PKT_ITEM, item]);
	}
	item_slot_equip(equip_slot) {
		return equip_slot + this.INVEN_WIELD;
	}
	item_slot_inven(inven_slot) {
		return inven_slot;
	}
	item_slot_floor(floor_slot) {
		return -11;
	}
	item_slot_quiver(quiver_slot) {
		return flase;
	}

	all_in_one(item) {
		if (INVEN_WIELD <= item) {
			if (inventory[item].uses_dir) {

			}
			return;
		}
		switch (inventory[item].tval) {
			case TV_POTION:
			case TV_POTION2:
				Send_quaff(item);
				break;
			case TV_SCROLL:
			case TV_PARCHMENT:
				Send_read(item);
				break;
			case TV_WAND:
				Send_aim(item, dir);
				break;
			case TV_STAFF:
				Send_use(item);
				break;
			case TV_ROD:
				if (inventory[item].uses_dir == 0) {
					Send_zap(item);
				} else {
					Send_zap_dir(item, dir);
				}
				break;
			case TV_LITE:
				if (inventory[INVEN_LITE].tval)
					Send_fill(item);
				else
					Send_wield(item);
				break;
			case TV_FLASK:
				Send_fill(item);
				break;
			case TV_FOOD:
			case TV_FIRESTONE:
				Send_eat(item);
				break;
			case TV_SHOT:
			case TV_ARROW:
			case TV_BOLT:
				Send_wield(item);
				break;
			/* NOTE: 'item' isn't actually sent */
			case TV_SPIKE:
				Send_spike(dir);
				break;
			case TV_BOW:
			case TV_BOOMERANG:
			case TV_DIGGING:
			case TV_BLUNT:
			case TV_POLEARM:
			case TV_SWORD:
			case TV_AXE:
			case TV_MSTAFF:
			case TV_BOOTS:
			case TV_GLOVES:
			case TV_HELM:
			case TV_CROWN:
			case TV_SHIELD:
			case TV_CLOAK:
			case TV_SOFT_ARMOR:
			case TV_HARD_ARMOR:
			case TV_DRAG_ARMOR:
			case TV_AMULET:
			case TV_RING:
			case TV_TOOL:
			case TV_INSTRUMENT:
				Send_wield(item);
				break;
			case TV_TRAPKIT:
				do_trap(item);
				break;
			case TV_RUNE:
				/* (Un)Combine it */
				Send_activate(item);
				break;
			/* Presume it's sort of spellbook */
			case TV_BOOK:
			default:
			{
				let i;
				let done = FALSE;

				for (i = 1; i < MAX_SKILLS; i++) {
					if (s_info[i].tval == inventory[item].tval &&
					    s_info[i].action_mkey && p_ptr.s_info[i].value) {
						do_activate_skill(i, item);
						done = TRUE;
						break;
						/* Now a number of skills shares same mkey */
					}
				}
				if (!done) {
					/* XXX there should be more generic 'use' command */
					/* Does item require aiming? (Always does if not yet identified) */
					if (inventory[item].uses_dir == 0) {
						/* (also called if server is outdated, since uses_dir will be 0 then) */
						this.send_activate(item);
					} else {
						this.send_activate(item, dir);
					}
				}
				break;
			}
		}
	}

	/* Commands */
	cmd_stay() {
		this.send_walk(5);
	}
	cmd_walk(dir) {
		this.send_walk(dir);
	}
	cmd_run(dir) {
		this.send_run(dir);
	}
	cmd_alter(dir) {
		this.send_tunnel(dir);
	}
	cmd_rest(enable) {
		this.send_rest();
	}
	cmd_message(message) {
		this.send_msg(message);
	}
	cmd_pathfind(x, y) {
	}

	cmd_wear_inven(inven_slot) {
		this.cmd_custom('w', {'item':this.item_slot_inven(inven_slot)});
	}
	cmd_wear_floor(floor_slot) {
		this.cmd_custom('w', {'item':this.item_slot_floor(floor_slot)});
	}
	cmd_takeoff_equip(equip_slot) {
		this.cmd_custom('t', {'item':this.item_slot_equip(equip_slot)});
	}
	cmd_drop_equip(equip_slot) {
		
	}
	cmd_drop_inven(inven_slot) {
		
	}
	cmd_drop_quiver(quiver_slot) {
		return false;
	}
	cmd_destroy_equip(equip_slot) {
		
	}
	cmd_destroy_inven(inven_slot) {
		
	}
	cmd_destroy_floor(floor_slot) {
		
	}
	cmd_pickup(floor_slot, item) {
		this.cmd_custom('g', {'item':this.item_slot_floor(floor_slot)});
	}

	cmd_useitem_equip(equip_slot, item) {
		let cc = this.matchCustomCommand(item);
		if (!cc) return;
		this.cmd_custom(cc.key, {'item':this.item_slot_equip(equip_slot)});
	}
	cmd_useitem_inven(inven_slot, item) {
		let cc = this.matchCustomCommand(item);
		if (!cc) return;
		this.cmd_custom(cc.key, {'item':this.item_slot_inven(inven_slot)});
	}
	cmd_useitem_floor(floor_slot, item) {
		let cc = this.matchCustomCommand(item);
		if (!cc) return;
		this.cmd_custom(cc.key, {'item':this.item_slot_floor(floor_slot)});
	}
}

register_protocol('tomenet472', TomeNET472ProtocolHandler);

})()/* End Fake Namespace */
