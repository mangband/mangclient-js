"use strict";

/* This file implements basic protocol handling for some version
 * of PWMangband. I'm basing this off the "master-linuxbuild" branch,
 * as that's the version I can actually build and run on my machine.
 *
 * The protocol is a mix of 0.6.0-era stuff, some modern MAngband
 * additions and some custom improvements. Let's see. */


(function() {/* Fake namespace. */

/* Protocol-specific errors. */
//class ObjFlagsOutOfBounds extends OutOfBounds { };
//class StreamOutOfBounds extends OutOfBounds { };
//class UnknownIndicator extends OutOfBounds { };
//class UnknownStream extends OutOfBounds { };

/* Port helpers */
const FALSE = false;
const TRUE = true;

const SUCCESS         =0x00
const E_VERSION_OLD   =0x01
const E_INVAL         =0x02
const E_ACCOUNT       =0x03
const E_GAME_FULL     =0x04
const E_SOCKET        =0x05
const E_VERSION_NEW   =0x06

const KF_SIZE = 3;
const OBJ_MOD_MAX = 17;
const SKILL_MAX = 10;
const PF_SIZE = 4;
const OF_SIZE = 7;
const OF_MAX = 49;
/* Getting those was also hard :( */
const ELEM_MAX = 30;
const SETTING_MAX = 9;
const OPT_MAX = 38;
const PROJ_MAX = 78;
const BOLT_MAX = 9;
const LIGHTING_MAX = 4;
const STAT_MAX = 5;


/* Network packets */
/* In PWMA, the order is loosely-defined :(
 * Trying my best to extract correct values. Sad thing is,
 * this information is next to useless, as those defines
 * can change at any minute (unless PW is very careful or
 * is explicitly commited to keep it the same).
 */

/* Undefined packet */
const PKT_UNDEFINED = 0
/* Packets sent to the client */
const PKT_BASIC_INFO = 1
const PKT_END = 2
const PKT_STRUCT_INFO = 3
const PKT_DEATH_CAUSE = 4
const PKT_WINNER = 5
const PKT_LEV = 6
const PKT_WEIGHT = 7
const PKT_PLUSSES = 8
const PKT_AC = 9
const PKT_EXP = 10
const PKT_GOLD = 11
const PKT_HP = 12
const PKT_SP = 13
const PKT_VARIOUS = 14
const PKT_STAT = 15
const PKT_INDEX = 16
const PKT_ITEM_REQUEST = 17
const PKT_TITLE = 18
const PKT_TURN = 19
const PKT_DEPTH = 20
const PKT_FOOD = 21
const PKT_STATUS = 22
const PKT_RECALL = 23
const PKT_STATE = 24
const PKT_LINE_INFO = 25
const PKT_SPEED = 26
const PKT_STUDY = 27
const PKT_COUNT = 28
const PKT_SHOW_FLOOR = 29
const PKT_CHAR = 30
const PKT_SPELL_INFO = 31
const PKT_BOOK_INFO = 32
const PKT_FLOOR = 33
const PKT_SPECIAL_OTHER = 34
const PKT_STORE = 35
const PKT_STORE_INFO = 36
const PKT_TARGET_INFO = 37
const PKT_SOUND = 38
const PKT_MINI_MAP = 39
const PKT_SKILLS = 40
const PKT_PAUSE = 41
const PKT_MONSTER_HEALTH = 42
const PKT_AWARE = 43
const PKT_EVERSEEN = 44
const PKT_EGO_EVERSEEN = 45
const PKT_CURSOR = 46
const PKT_OBJFLAGS = 47
const PKT_SPELL_DESC = 48
const PKT_DTRAP = 49
const PKT_TERM = 50
const PKT_PLAYER = 51
const PKT_MESSAGE_FLUSH = 52
/* Packets sent from the client */
const PKT_VERIFY = 53
const PKT_ICKY = 54
const PKT_SYMBOL_QUERY = 55
const PKT_POLY_RACE = 56
const PKT_BREATH = 57
const PKT_WALK = 58
const PKT_RUN = 59
const PKT_TUNNEL = 60
const PKT_AIM_WAND = 61
const PKT_DROP = 62
const PKT_IGNORE_DROP = 63
const PKT_FIRE = 64
const PKT_PICKUP = 65
const PKT_DESTROY = 66
const PKT_TARGET_CLOSEST = 67
const PKT_SPELL = 68
const PKT_OPEN = 69
const PKT_QUAFF = 70
const PKT_READ = 71
const PKT_TAKE_OFF = 72
const PKT_USE = 73
const PKT_THROW = 74
const PKT_WIELD = 75
const PKT_ZAP = 76
const PKT_TARGET = 77
const PKT_INSCRIBE = 78
const PKT_UNINSCRIBE = 79
const PKT_ACTIVATE = 80
const PKT_DISARM = 81
const PKT_EAT = 82
const PKT_FILL = 83
const PKT_LOCATE = 84
const PKT_MAP = 85
const PKT_STEALTH_MODE = 86
const PKT_QUEST = 87
const PKT_CLOSE = 88
const PKT_GAIN = 89
const PKT_GO_UP = 90
const PKT_GO_DOWN = 91
const PKT_DROP_GOLD = 92
const PKT_REDRAW = 93
const PKT_REST = 94
const PKT_GHOST = 95
const PKT_SUICIDE = 96
const PKT_STEAL = 97
const PKT_MASTER = 98
const PKT_MIMIC = 99
const PKT_CLEAR = 100
const PKT_OBSERVE = 101
const PKT_STORE_EXAMINE = 102
const PKT_ALTER = 103
const PKT_FIRE_AT_NEAREST = 104
const PKT_JUMP = 105
const PKT_SOCIAL = 106
const PKT_MONLIST = 107
const PKT_FEELING = 108
const PKT_INTERACTIVE = 109
const PKT_FOUNTAIN = 110
const PKT_TIME = 111
const PKT_OBJLIST = 112
const PKT_CENTER = 113
const PKT_TOGGLE_IGNORE = 114
const PKT_USE_ANY = 115
const PKT_STORE_ORDER = 116
const PKT_TRACK_OBJECT = 117
/* Packets sent from either the client or server */
const PKT_PLAY = 118
const PKT_QUIT = 119
const PKT_FEATURES = 120
const PKT_TEXT_SCREEN = 121
const PKT_KEEPALIVE = 122
const PKT_CHAR_INFO = 123
const PKT_OPTIONS = 124
const PKT_CHAR_DUMP = 125
const PKT_MESSAGE = 126
const PKT_ITEM = 127
const PKT_SELL = 128
const PKT_PARTY = 129
const PKT_SPECIAL_LINE = 130
const PKT_FULLMAP = 131
const PKT_POLY = 132
const PKT_PURCHASE = 133
const PKT_STORE_LEAVE = 134
const PKT_STORE_CONFIRM = 135
const PKT_IGNORE = 136
const PKT_FLUSH = 137
const PKT_CHANNEL = 138
const PKT_HISTORY = 139
const PKT_AUTOINSCR = 140

const RLE_NONE    = 0;
const RLE_CLASSIC = 1;
const RLE_LARGE   = 2;

/*
 * PKT_STRUCT_INFO helpers
 */
const  STRUCT_INFO_UNKNOWN =0
const  STRUCT_INFO_LIMITS  =1
const  STRUCT_INFO_RACE    =2
const  STRUCT_INFO_CLASS   =3
const  STRUCT_INFO_BODY    =4
const  STRUCT_INFO_SOCIALS =5
const  STRUCT_INFO_KINDS   =6
const  STRUCT_INFO_EGOS    =7
const  STRUCT_INFO_RINFO   =8
const  STRUCT_INFO_RBINFO  =9
const  STRUCT_INFO_CURSES = 10
const  STRUCT_INFO_REALM  = 11
const  STRUCT_INFO_FEAT   = 12
const  STRUCT_INFO_TRAP   = 13
const  STRUCT_INFO_TIMED  = 14


const VERSION_MAJOR = 1
const VERSION_MINOR = 4
const VERSION_PATCH = 0
const VERSION_EXTRA = 0
const MY_VERSION = (VERSION_MAJOR << 12 | VERSION_MINOR << 8 | VERSION_PATCH
	<< 4 | VERSION_EXTRA)

const VERSION_BETA = 1;

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

class PWMAngband140ProtocolHandler extends MAngbandProtocolHandler {

	constructor(net, config, on_event) {
		super(net, config, on_event);
		bnd(this, 'recv_char_info');
		this.packets[PKT_BASIC_INFO] = this.recv_basic_info;
		this.packets[PKT_STRUCT_INFO] = this.recv_struct_info;
		this.packets[PKT_CHAR_INFO] = this.recv_char_info_conn;
		this.packets[PKT_END] = this.recv_end;
		this.packets[PKT_QUIT] = this.recv_quit;
		this.packets[PKT_KEEPALIVE] = this.recv_keepalive;
		this.packets[PKT_OPTIONS] = this.recv_options;
		this.packets[PKT_PLAY] = this.recv_play;
		this.packets[PKT_PARTY] = this.recv_party;
		this.packets[PKT_CHANNEL] = this.recv_channel;
		this.packets[PKT_HISTORY] = this.recv_history;
		this.packets[PKT_VARIOUS] = this.recv_various;
		this.packets[PKT_TURN] = this.recv_turn;
		this.packets[PKT_IGNORE] = this.recv_ignore;
		this.packets[PKT_AWARE] = this.recv_aware;
		this.packets[PKT_EVERSEEN] = this.recv_everseen;
		this.packets[PKT_EGO_EVERSEEN] = this.recv_ego_everseen;
		this.packets[PKT_MESSAGE] = this.recv_message;
		this.packets[PKT_SOUND] = this.recv_sound;
		this.packets[PKT_POLY] = this.recv_poly;
		this.packets[PKT_SKILLS] = this.recv_skills;
		this.packets[PKT_WEIGHT] = this.recv_weight;
		this.packets[PKT_TITLE] = this.recv_title;
		this.packets[PKT_LEV] = this.recv_lvl;
		this.packets[PKT_EXP] = this.recv_exp;
		this.packets[PKT_STAT] = this.recv_stat;
		this.packets[PKT_AC] = this.recv_ac;
		this.packets[PKT_HP] = this.recv_hp;
		this.packets[PKT_SP] = this.recv_sp;
		this.packets[PKT_GOLD] = this.recv_gold;
		this.packets[PKT_MONSTER_HEALTH] = this.recv_monster_health;
		this.packets[PKT_SPEED] = this.recv_speed;
		this.packets[PKT_STUDY] = this.recv_study;
		this.packets[PKT_DEPTH] = this.recv_depth;
		this.packets[PKT_FOOD] = this.recv_food;
		this.packets[PKT_STATUS] = this.recv_status;
		this.packets[PKT_OBJFLAGS] = this.recv_objflags;
		this.packets[PKT_CURSOR] = this.recv_cursor;
		this.packets[PKT_STATE] = this.recv_state;
		this.packets[PKT_RECALL] = this.recv_recall;
		this.packets[PKT_LINE_INFO] = this.recv_line_info;
		this.packets[PKT_CHAR] = this.recv_cave_char;
		this.packets[PKT_ITEM] = this.recv_item;
		this.packets[PKT_INDEX] = this.recv_index;
		this.packets[PKT_COUNT] = this.recv_count;
		this.packets[PKT_PLUSSES] = this.recv_plusses;
		this.packets[PKT_DTRAP] = this.recv_dtrap;
		this.packets[PKT_STORE] = this.recv_store;
		this.packets[PKT_STORE_LEAVE] = this.recv_store_leave;
		this.packets[PKT_STORE_INFO] = this.recv_store_info;
		this.packets[PKT_PLAYER] = this.recv_player_pos;
		this.packets[PKT_SPELL_INFO] = this.recv_spell_info;
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
		this.on('recv_item', function(e) {
//todo: lots of properties here
console.log(e.info.xtra.slot, e.info);
			let group = 'inven';
			if (e.info.base.equipped) group = 'equip';
			return {
				"name": "item",
				"info": new GameItem({
					'inven_group': group,
					'slot': e.info.obj.oidx,
					'tval': e.info.base.tval,
					'weight': e.info.obj.wgt,
					'name': e.info.desc.name,
					'testflag': 0,
					'attr': e.info.xtra.attr,
				}),
			}
		});
		this.on('recv_store', function(e) {
			//console.log("STORE:", e.info);
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
		this.on('recv_store_leave', function(e) {
			return {
				"name": "item_wipe",
				"info": {
					'inven_group': 'store',
				},
			}
		});
		this.on('recv_line_info', function(e) {
			if (!e.info.main) return;
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
			/* In PWMA, message repeat is handled as a single
			 * whitespace. This would be a good place to handle it. */
			/* TODO... */
			return {
				"name": "log_message",
				"info": {
					'channel': '&log',
					'message': e.info.buf,
					//PWMAngband doesn't have colored messages,
					//so we just dump as white.
					'multicolor': [
						{a:TERM_WHITE, str: e.info.buf},
					]
				},
			}
		});
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
		const conntype = 0;
		this.write("%hu", [conntype], false);
		this.write("%hu%c", [MY_VERSION, VERSION_BETA], false);
		this.write("%s%s%s%s", [this.realname, this.hostname, this.login, this.password], false);
		this.flush();

		let that = this;
		this.waitThen(this.mustReceiveInitialStatus, 10, function(reply) {
			console.log("Initial info", reply);
			this.finishHandShake();
			this.trigger('client_setup', {'name':'client_setup'});
		});
		return;
	}

	mustReceiveInitialStatus() {
		let info = this.read("%c%hu%hu", ['status','num','max']);
		const INIT_ERRORS = {
			1: "Version is too old.",
			2: "Invalid handshake.",
			3: "Account error(?).",
			4: "Game is full.",
			5: "Socket error!",
			6: "Version is too new.",
		}
		if (info.status != 0) {
			throw new Error("Server didn't like us. Status: " + INIT_ERRORS[info.status]);
		}
		const max_account_chars = info.max;
		const char_num = info.num;
		info.characters = [];
		for (let i = 0; i < char_num; i++) {
			let cinfo = this.read("%c%s", ['expiry', 'buffer']);
			info.characters.push(cinfo);
		}
		let num_types = this.read("%c");
		const RANDNAME_NUM_TYPES = num_types;
		info.randnames = [];
		for (let i = 0; i < RANDNAME_NUM_TYPES; i++) {
			let num_name = this.read("%lu");
			let names = [];
			for (let j = 0; j < num_name; j++) {
				let buffer = this.read("%s");
				names.push(buffer);
			}
			info.randnames.push(names);
		}
		return info;
	}
	finishHandShake() {
		console.log("Handshake complete...");
		this.send_play(0);
		this.bypassPackets(false);
	}

	setGameOption(option_name, value) {
	}
	getGameOpton(option_name) {
	}

	setup_keepalive_timer() {
		bnd(this, 'run_keepalive_timer');
		this.keepalive_timer = setTimeout(this.run_keepalive_timer, 1000);
	}
	run_keepalive_timer() {
		this.send_keepalive();
		this.keepalive_timer = setTimeout(this.run_keepalive_timer, 1000);
	}

	/* Setup phase */
	init_base_info() {
		this.z_info = null;
		this.TMD_MAX = 0;
		this.settings = new Array(SETTING_MAX);
		this.options = new Array(OPT_MAX);
	}
	init_data_sync() {
	}
	sync_data_piece(rq, ask_var, rcv, max, ready) {
	}
	sync_data() {
	}

	gather_settings() {
		const SETTING_USE_GRAPHICS = 0;
		const SETTING_SCREEN_COLS = 1;
		const SETTING_SCREEN_ROWS = 2;
		const SETTING_TILE_WID = 3;
		const SETTING_TILE_HGT = 4;
		const SETTING_TILE_DISTORTED = 5;
		const SETTING_MAX_HGT = 6;
		const SETTING_WINDOW_FLAG = 7;
		const SETTING_HITPOINT_WARN = 8;
		this.settings[SETTING_SCREEN_COLS] = 66+1;
		this.settings[SETTING_SCREEN_ROWS] = 22+1;
		this.settings[SETTING_TILE_WID] = 1;
		this.settings[SETTING_TILE_HGT] = 1;
		return;
		//todo
		/*
		let new_settings = new Array(SETTING_MAX);
		new_settings[SETTING_USE_GRAPHICS] = use_graphics;
		new_settings[SETTING_SCREEN_COLS] = Term->wid - COL_MAP - 1;
		new_settings[SETTING_SCREEN_ROWS] = Term->hgt - ROW_MAP - 1;
		new_settings[SETTING_TILE_WID] = tile_width;
		new_settings[SETTING_TILE_HGT] = tile_height;
		new_settings[SETTING_TILE_DISTORTED] = tile_distorted;
		new_settings[SETTING_MAX_HGT] = Term->max_hgt;
		new_settings[SETTING_WINDOW_FLAG] = 0;
		for (let i = 0; i < 8; i++) new_settings[SETTING_WINDOW_FLAG] |= window_flag[i];
		new_settings[SETTING_HITPOINT_WARN] = player->opts.hitpoint_warn;
		*/
	}

	client_ready() {
		this.gather_settings();
		this.send_options(true);
//		this.send_autoinscriptions();
//		for (let i = 0; i < 5; i++) this.send_verify(i);
//		this.send_features(0, 0);
		this.setup_keepalive_timer();
		this.trigger('client_ready', {'name': 'client_ready'});
console.log("CLIENT IS READY");
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
	recv_keepalive() {
		return this.read("%lu", ['ctime']);
	}

	recv_basic_info() {
		return this.read("%hd%b%b%b%b", [
			'frames_per_second',
			'min_col',
			'min_row',
			'max_col',
			'max_row']);
	}
	recv_struct_info() {
		let info = this.read("%c%hu", ['typ','max']);
		//console.log("STRUCT INFO", info);
		/* Which struct? */
		switch (info.typ) {
			case STRUCT_INFO_LIMITS:
			{
				let limits = this.read("%hu%hu%hu%hu%hu%hu%hu%hu%hu%hu%hu%hu%hu", [
				'a_max', 'e_max', 'k_max', 'r_max', 'f_max', 'trap_max', 'flavor_max',
				'pack_size', 'quiver_size', 'floor_size', 'quiver_slot_size',
				'store_inven_max', 'curse_max']);
				this.z_info = limits;
				break;
			}
			case STRUCT_INFO_RACE:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let race = this.read("%b%s", ['ridx', 'name']);
					for (let j = 0; j < OBJ_MOD_MAX; j++) {
						race.obj_mod = this.read("%hd%hd%hd%hd%b", [
							'base', 'dice', 'sides', 'm_bonus', 'lvl']);
					}
					for (let j = 0; j < SKILL_MAX; j++)
					{
						race.skill = this.read("%hd", ['r_skills']);
					}
					let extra = this.read("%b%hd", ['r_mhp', 'r_exp']);
					for (let j = 0; j < PF_SIZE; j++)
					{
						race.pf_info = this.read("%b", ['pflag']);
					}
					for (let j = 0; j < OF_SIZE; j++)
					{
						race.of_info = this.read("%b", ['pflag']);
					}
					for (let j = 1; j < OF_MAX; j++)
					{
						race.of_levels = this.read("%b", ['lvl']);
					}
					for (let j = 0; j < ELEM_MAX; j++)
					{
						race.elem_levels = this.read("%hd%b", ['res_level', 'lvl']);
					}
					//console.log("RACE", race);
				}
				break;
			}
			case STRUCT_INFO_CLASS:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let pclass = this.read("%b%s", ['cidx', 'name']);
					for (let j = 0; j < OBJ_MOD_MAX; j++)
					{
						pclass.omod = this.read("%hd%hd%hd%hd%b", [
							'base', 'dice', 'sides', 'm_bonus', 'lvl']);
					}
					for (let j = 0; j < SKILL_MAX; j++)
					{
						pclass.skill = this.read("%hd", [
							'c_skills']);
					}
					pclass.mhp = this.read("%b");
					for (let j = 0; j < PF_SIZE; j++)
					{
						pclass.pf_info = this.read("%b", ['pflag']);
					}
					for (let j = 0; j < OF_SIZE; j++)
					{
						pclass.of_info = this.read("%b", ['pflag']);
					}
					for (let j = 1; j < OF_MAX; j++)
					{
						pclass.of_lvlo = this.read("%b", ['lvl']);
					}
					for (let j = 0; j < ELEM_MAX; j++)
					{
						pclass.of_elem_lvlo = this.read("%hd%b", ['res_level', 'lvl']);
					}
					pclass.spells = this.read("%b%b%c", ['total_spells', 'tvla', 'num_books']);
					pclass.books = [];
					for (let j = 0; j < pclass.spells.num_books; j++)
					{
						let book = this.read("%b%b%s", ['tval', 'sval', 'realm']);
						pclass.books.push(book);
					}
					//console.log("CLASS:", pclass);
				}
				break;
			}
			case STRUCT_INFO_BODY:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let body = this.read("%hd%s", ['count', 'name']);
					body.slots = [];
					/* Transfer other fields here */
					for (let j = 0; j < body.count; j++)
					{
						let slot = this.read("%hd%s", ['type', 'name']);
						body.slots.push(slot);
					}
				}
				break;
			}
			/* Socials */
			case STRUCT_INFO_SOCIALS:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
					/* Transfer other fields here */
					let target = this.read("%b");
				}
				break;
			}
			/* Object kinds */
			case STRUCT_INFO_KINDS:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
					let rest = this.read("%b%b%lu%hd", ['tval', 'sval', 'kidx', 'ac']);
					for (let j = 0; j < KF_SIZE; j++) {
						let pflag = this.read("%b");
					}
				}
				break;
			}
			/* Object egos */
			case STRUCT_INFO_EGOS:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
					/* Transfer other fields here */
					let other = this.read("%lu%hu", ['eidx', 'pmax']);
					for (let p = 0; p < other.pmax; p++) {
						let einfo = this.read("%lu", ['kidx']);
					}
				}
				break;
			}
			/* Monster races */
			case STRUCT_INFO_RINFO:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
				}
				break;
			}
			/* Monster base races */
			case STRUCT_INFO_RBINFO:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
				}
				break;
			}
			/* Object curses */
			case STRUCT_INFO_CURSES:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
					let desc = this.read("%s");
				}
				break;
			}
			/* Player magic realms */
			case STRUCT_INFO_REALM:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
					let inf = this.read("%s%s", ['spell_noun', 'verb']);
					//console.log("REALM:", name, inf);
				}
				break;
			}
			/* Terrain features */
			case STRUCT_INFO_FEAT:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
				}
				break;
			}
			/* Traps */
			case STRUCT_INFO_TRAP:
			{
				/* Fill */
				for (let i = 0; i < info.max; i++) {
					let name = this.read("%s");
				}
				break;
			}
			/* Player timed effects */
			case STRUCT_INFO_TIMED:
			{
				let i = -1;
				while (true) {
					let timed = this.read("%b%b%hd%s", [
						'dummy', 'grade_color', 'grade_max', 'name',
					]);
					if (timed.name) {
						//console.log("+ timed", timed);
					} else {
						i++;
						if (i == info.max) break;
					}
				}
				this.TMD_MAX = info.max;
				break;
			}
		}
	}

	recv_char_info_conn() {
		let info = this.read("%b%b%b%b", ['char_state', 'ridx','cidx', 'psex']);
		//console.log("Char info:", info);

		if (info.char_state == 0) {
			this.send_char_info();
		}
		if (this.sent_play) return;
		this.client_ready();
		//console.log("Now start play");
		this.send_play(1);
		this.sent_play = true;
		return info;
	}
	recv_char_info() {
		let info = this.read("%b%b%b", ['ridx','cidx', 'psex']);
		//console.log("Char info:",info);
		return info;
	}
	recv_end() {
		return true;
	}
	recv_play() {
		this.is_playing = true;
	}
	recv_options() {
		let info = this.read("%c%c%c%c%c%c%c%c%c",
			['force_descend', 'no_recall',
			'no_artifacts', 'feelings', 'no_selling', 'start_kit', 'no_stores', 'no_ghost',
			'fruit_bat']);
		return info;
	}
	recv_party() {
		let info = this.read("%S", ['buf']);
		return info;
	}
	recv_channel() {
		let info = this.read("%b%s", ['i','buf']);
		//console.log("CHAN:", info);
		return info;
	}
	recv_history() {
		return this.read("%hd%s", ['line','buf']);
	}
	recv_various() {
		return this.read("%hd%hd%hd", ['hgt','wgt','age']);
	}
	recv_turn() {
		return this.read("%lu%lu%lu", ['game_turn', 'player_turn', 'active_turn']);
	}
	recv_ignore() {
		for (let i = 0; i < this.z_info.k_max; i++) {
			this.read("%b", ['setting']);
		}
		const ITYPE_NONE = 0;
		const ITYPE_MAX = 30;
		let i = 0;
		let j = 0;
		let total =0;
		while (i < this.z_info.e_max) {
			let enfo = this.read("%hd%b", ['repeat', 'last']);
			for (let k = 0; k < enfo.repeat; k++) {
				j++;
				if (j == ITYPE_MAX) {
					j = 0;
					i++;
				}
			}
		}
		for (let i = ITYPE_NONE; i < ITYPE_MAX; i++) {
			let set = this.read("%b", ['setting']);
		}
	}
	recv_aware() {
		let num = this.read("%hu");
		if (num == this.z_info.k_max) {
			for (let i = 0; i < this.z_info.k_max; i++) {
				this.read("%b");
			}
		} else {
			this.read("%b");
		}
	}
	recv_everseen() {
		let num = this.read("%hu");
		if (num == this.z_info.k_max) {
			for (let i = 0; i < this.z_info.k_max; i++) {
				this.read("%b");
			}
		} else {
			this.read("%b");
		}
	}
	recv_ego_everseen() {
		let num = this.read("%hu");
		if (num == this.z_info.e_max) {
			for (let i = 0; i < this.z_info.e_max; i++) {
				this.read("%b");
			}
		} else {
			this.read("%b");
		}
	}
	recv_message() {
		return this.read("%S%hu", ['buf', 'type']);
	}
	recv_sound() {
		return this.read("%b", ['val']);
	}
	recv_poly() {
		return this.read("%hd", ['race']);
	}
	recv_skills() {
		let skills = [];
		for (let i = 0; i < 11; i++) {
			this.read("%hd");
			//to be mapped later
		}
		return skills;
	}
	recv_weight() {
		let info = this.read("%hd%hd", ['weight', 'max_weight']);
/* HAAAAAAAAAAAACK */
		this.packets[PKT_CHAR_INFO] = this.recv_char_info;
		return info;
	}

	recv_player_pos() {
		return this.read("%hd%hd%hd%hd", [
			'grid_x', 'offset_grid.x',
			'grid_y', 'offset_grid_y']);
	}
	recv_spell_info() {
		let info = this.read("%hd%hd%s%b%b%b%b", [
			'book', 'line', 'buf', 'line_attr', 'flag',
			'dir_attr', 'proj_attr']);
		return info;
	}

	recv_store() {
		return this.read("%c%b%hd%b%b%ld%b%b%hd%s", [
			'pos', 'attr', 'wgt', 'num', 'owned',
			'price', 'tval', 'max', 'bidx', 'name']);
	}
	recv_store_info() {
		return this.read("%hd%s%s%s%hd%ld", [
			'type', 'store_name', 'store_owner_name',
			'welcome', 'num_items', 'max_cost']);
	}
	recv_store_leave() {
		return true;
	}
	recv_apply_auto_insc() {
		let info = this.read("%c", ['slot']);
		return info;
	}
	recv_title() {
		let info = this.read("%s");
		return info;
	}
	recv_lvl() {
		return this.read("%hd%hd", ['lev', 'mlev']);
	}
	recv_exp() {
		return this.read("%ld%ld%hd", ['max','cur','expfact']);
	}
	recv_stat() {
		return this.read("%c%hd%hd%hd%hd%hd", [
			'stat', 'stat_top', 'stat_use', 'stat_max',
			'stat_add', 'stat_cur']);
	}
	recv_ac() {
		return this.read("%hd%hd", ['base', 'plus']);
	}
	recv_hp() {
		return this.read("%hd%hd", ['max', 'cur']);
	}
	recv_sp() {
		return this.read("%hd%hd", ['max', 'cur']);
	}
	recv_gold() {
		return this.read("%ld", ['gold']);
	}
	recv_monster_health() {
		return this.read("%c%b", ['num', 'attr']);
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
		return this.read("%hd%hd", ['speed', 'mult']);
	}
	recv_study() {
		return this.read("%hd%c", ['study', 'can_study_book']);
	}
	recv_depth() {
		return this.read("%hd%hd%s", ['depth','maxdepth', 'depths']);
	}
	recv_food() {
		return this.read("%hu", ['food']);
	}
	recv_status() {
		for (let i = 0; i < this.TMD_MAX; i++) {
			this.read("%hd", ['effect']);
		}
	}
	recv_objflags() {
		const PLAYER_BODY_COUNT = 13;
		//wait.. does body count come from STRUCT INFO?
		let y = this.read("%hd");
		let flags = this.read_cave(RLE_CLASSIC, PLAYER_BODY_COUNT + 1);
		return {
			"y": y,
			"flags": flags,
		}
	}
	recv_state() {
		return this.read("%hd%hd%hd%hd%hd", ['stealthy', 'resting', 'unignoring',
			'obj_feeling', 'mon_feeling']);
	}
	recv_recall() {
		let recall = this.read("%hd%hd", ['word_recall','deep_descent']);
		return recall;
	}
	recv_cursor() {
		let info = this.read("%c%c%c", ['vis','x','y']);
		return info;
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

	recv_line_info() {
		let y = this.read("%hd");
		let cols = this.read("%hd");
		if (y < 0) return { "y": y, "main": null };
		let main = this.read_cave(RLE_CLASSIC, cols);
		return {
			"y": y,
			"main": main,
		}
	}
	recv_cave_char() {
		return this.read("%b%b%hu%c", ['x', 'y', 'a', 'c']);
	}

	recv_item() {
		let base = this.read("%b%b", ['tval','equipped']);
		let obj = this.read("%b%hd%hd%ld%lu%ld%b%hd", [
			'sval', 'wgt', 'amt', 'price', 'note', 'pval',
			'notice', 'oidx']);
		let xtra = this.read("%b%b%b%b%b%hd%b%b%b%b%b%b%hd%b%hd", [
			'attr', 'act', 'aim', 'fuel',
			'fail', 'slot', 'stuck', 'known', 'known_effect',
			'sellable', 'quality_ignore', 'ignored', 'eidx',
			'magic', 'bidx']);
		let desc = this.read("%s%s%s%s%s", [
			'name', 'name_terse', 'name_base', 'name_curse',
			'name_power']);
		return {
			base: base,
			obj: obj,
			xtra: xtra,
			desc: desc,
		}
	}
	recv_index() {
		return this.read("%hd%hd%b", ['slot', 'index', 'type']);
	}
	recv_count() {
		return this.read("%b%hd", ['type', 'count']);
	}
	recv_plusses() {
		return this.read("%hd%hd%hd%hd%hd%hd", [
			'dd', 'ds', 'mhit', 'mdam', 'shit', 'sdam']);
	}
	recv_dtrap() {
		return this.read("%b", ['dtrap']);
	}


	recv_poison() {
		return this.read("%c", ['poision']);
	}

	/* Byte-based IO */

	/* Notation is:
	    %c - 1 char
	    %b - 1 byte
	    %hd - 2 bytes, signed
	    %hu - 2 bytes, unsigned
	    %ld - 4 bytes, signed
	    %lu - 4 bytes, unsgined
	    %s - small strings (<= 80)
	    %S - big strings (> 80)
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
			if (format == 'c' || format == 'b') { /* Char, Byte */
				if (len < 1) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift8();
			} else if (format == 'hd' || format == 'hu') { /* 16-bit value */
				if (len < 2) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift16();
				if (ret[name] == 65535) ret[name] = -1;
			} else if (format == 'ld' || format == 'lu') { /* 32-bit value */
				if (len < 4) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift32();
			} else if (format == 's' || format == 'S') { /* C String */
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

	write(fmt, args, flush) {
		if (flush === undefined) flush = true;
		let formats = fmt.split("%");
		formats = formats.slice(1);
		if (formats.length != args.length) {
			throw new Error("Passed " + formats.length + " formats yet " + args.length + " arguments.");
		}
		for (let k in formats) {
			let format = formats[k];
			let value = args[k];
			if (format == 'c' || format == 'b') { /* Char, Byte */
				this.send([value], flush);
			} else if (format == 'hd' || format == 'hu') { /* 16-bit value */
				let a = (value >> 0) & 0xFF;
				let b = (value >> 8) & 0xFF;
				this.send([b, a], flush);
			} else if (format == 'ld' || format == 'lu') { /* 32-bit value */
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
		else if (rle == RLE_CLASSIC) this.cv_decode_rle1pw(ret, null, cols);
		else if (rle == RLE_LARGE) this.cv_decode_rle2pw(ret, null, cols);
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
	cv_decode_rle1pw(dst, src, len) {
		for (let x = 0; x < len; x++)
		{
			let n;
			let c;
			let a;

			/* Read the char/attr pair */
			if (this.net.rQlen() < 3) throw new NotEnoughBytes(2);
			c = this.net.rQshift8();
			a = this.net.rQshift16();

			/* Start with count of 1 */
			n = 1;

			/* Check for bit 0x40 on the attribute */
			if (a & 0x40)
			{
				/* First, clear the bit */
				a &= ~(0x40);

				/* Read the number of repetitions */
				if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
				n = this.net.rQshift16();
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
			if (this.net.rQlen() < 3) throw new NotEnoughBytes(2);
			c = this.net.rQshift8();
			a = this.net.rQshift16();

			/* Start with count of 1 */
			n = 1;
			/* Check for bit 0x8000 on the attribute */
			if (a & 0x8000)
			{
				a &= ~(0x8000);
				/* Read the number of repetitions */
				if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
				n = this.net.rQshift16();
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
	send_play(mode) {
		this.write("%b%b%s%s", [PKT_PLAY, mode, this.login, this.password], false);
		this.flush();
	}
	send_char_info() {
		let ridx = 0;
		let cidx = 0;
		let psex = 1;
		this.write("%b%b%b%b", [PKT_CHAR_INFO, ridx, cidx, psex]);
		for (let i = 0; i <= STAT_MAX; i++)
		{
			this.write("%hd", [0]);//[stat_roll[i]]);
		}
	}
	send_options(with_settings) {
		this.write("%b%b", [PKT_OPTIONS, with_settings]);
		if (with_settings) {
			for (let i = 0; i < SETTING_MAX; i++)
			{
				this.write("%hd", [this.settings[i]]);
			}
		}
		for (let i = 0; i < OPT_MAX; i++) {
			this.write("%c", [this.options[i]]);
		}
	}
	send_autoinscriptions() {
		this.write("%b", [PKT_AUTOINSCR]);
		for (let i = 0; i < this.z_info.k_max; i++) {
			this.write("%s", [""]);//this.note_aware[i]);
		}
	}
	send_verify(type) {
		let size = 0;
		switch (type)
		{
			case 0: size = this.flavor_max; break;
			case 1: size = this.z_info.k_max; break;
			case 2: size = this.z_info.r_max; break;
			case 3: size = PROJ_MAX * BOLT_MAX; break;
			case 4: size = this.z_info.trap_max * LIGHTING_MAX; break;
			default: return 0;
		}
		this.write("%b%c%hd", [PKT_VERIFY, type, size]);
		for (let i = 0; i < size; i++)
		{
			/*switch (type)
			{
				case 0:
					a = 0; //flvr_x
					c = 0;
					break;
				//etc...
			}*/
			let a = 0;
			let c = 0;
			this.write("%b%c", [a, c]);
		}
	}
	send_features(lighting, off) {
		const MAX_FEATURE_CHUNK = 512;
		if ((lighting < 0) || (lighting >= LIGHTING_MAX)) return 0;
		/* Size */
		const offset = off;
		const size = this.z_info.f_max;
		let max = MAX_FEATURE_CHUNK;
		if (offset + max > size) max = size - offset;
		if (offset > size) offset = size;

		this.write("%b%c%hd%hd", [PKT_FEATURES,lighting, max, offset]);
		for (let i = offset; i < offset + max; i++)
		{
			//a = Client_setup.f_attr[i][lighting];
			//c = Client_setup.f_char[i][lighting];
			let a = 0;
			let c = 0;
			this.write("%b%c", [a, c]);
		}
	}
	send_keepalive() {
		//this should be similar to mang, but I'm too exhausted
		//looks like I can just send zeros and be done with it
		this.write("%c%lu", [PKT_KEEPALIVE, 0]);
	}
	send_walk(dir) {
		this.write("%c%c", [PKT_WALK, dir]);
	}
	send_run(dir) {
		this.write("%c%c", [PKT_RUN, dir]);
	}
	send_tunnel(dir) {
		this.write("%b%c%b", [PKT_TUNNEL, dir, 1]);
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

register_protocol('pwmangband140', PWMAngband140ProtocolHandler);

})()/* End Fake Namespace */
