"use strict";

(function() {/* Fake namespace. */

/* Protocol-specific errors. */
class ObjFlagsOutOfBounds extends OutOfBounds { };
class StreamOutOfBounds extends OutOfBounds { };
class UnknownIndicator extends OutOfBounds { };
class UnknownStream extends OutOfBounds { };

/* Port helpers */
const FALSE = false;
const TRUE = true;
const MAX_FLVR_IDX = 330;

/* Network packets */
const PKT_LOGIN       = 1;
const PKT_PLAY        = 3;
const PKT_QUIT        = 4;
const PKT_BASIC_INFO  = 7;
const PKT_OPTION      = 10;
const PKT_KEEPALIVE   = 12;
const PKT_STRUCT_INFO = 13;
const PKT_VISUAL_INFO = 15;
const PKT_RESIZE      = 16;
const PKT_COMMAND     = 17;
const PKT_GHOST       = 25;
const PKT_CHAR_INFO   = 26;

const PKT_INVEN       = 30;
const PKT_EQUIP       = 31;

const PKT_MESSAGE_REPEAT = 45;
const PKT_MESSAGE     = 46;
const PKT_SPELL_INFO  = 48;
const PKT_FLOOR       = 49
const PKT_STORE       = 51;
const PKT_STORE_INFO  = 52;
const PKT_SOUND       = 54;
const PKT_PARTY       = 63;

const PKT_WALK        = 70;
const PKT_REST        = 72;

const PKT_STORE_LEAVE = 108;

const PKT_SETTINGS    = 115;
const PKT_OPTIONS     = 116;

const PKT_CURSOR      = 151;
const PKT_OBJFLAGS    = 163;
const PKT_CHANNEL     = 165;
const PKT_TERM        = 167;
const PKT_ITEM_TESTER = 169;

/* Packet types 170-190 are for data streams. */
const PKT_STREAM      = 170;

/* Packet types 191-254 are for indicators. */
const PKT_INDICATOR   = 191;

/* RLE modes. */
const RLE_NONE    = 0;
const RLE_CLASSIC = 1;
const RLE_LARGE   = 2;
const RLE_COLOR   = 3;

/* Player state */
const PLAYER_EMPTY   = 0 /* Freshly allocated structure, empty */
const PLAYER_NAMED   = 1 /* Empty structure with name & password fields filled */
const PLAYER_SHAPED  = 2 /* Name, race, class, sex and stat order are filled (ready for roll) */
const PLAYER_BONE    = 3 /* A complete (but dead) character (ready for roll/resurrect)  */
const PLAYER_FULL    = 4 /* A complete and living character, ready for playing */
const PLAYER_READY   = 5 /* All suplimentary data has been transfered */
const PLAYER_PLAYING = 6 /* -Playing the game- */
const PLAYER_LEAVING = 7 /* Leaving the game */

/*
 * Player states in verb form (c2s PKT_PLAY helpers)
 */
const PLAY_ROLL    = PLAYER_FULL;
const PLAY_KILL    = PLAYER_BONE;
const PLAY_ENTER   = PLAYER_READY;
const PLAY_PLAY    = PLAYER_PLAYING;
const PLAY_RESTART = PLAYER_NAMED
const PLAY_REROLL  = PLAYER_SHAPED

const BASIC_INFO_UNKNOWN      = 0;
const BASIC_INFO_INDICATORS   = 1;
const BASIC_INFO_STREAMS      = 2;
const BASIC_INFO_ITEM_TESTERS = 3;
const BASIC_INFO_COMMANDS     = 4;
const BASIC_INFO_OPTIONS      = 5;
const RQ_INDI = BASIC_INFO_INDICATORS;
const RQ_STRM = BASIC_INFO_STREAMS;
const RQ_ITEM = BASIC_INFO_ITEM_TESTERS;
const RQ_CMDS = BASIC_INFO_COMMANDS;
const RQ_OPTS = BASIC_INFO_OPTIONS;

/* Indicator 'type' */
const INDITYPE_TINY   = 0;
const INDITYPE_NORMAL = 1;
const INDITYPE_LARGE  = 2;
const INDITYPE_STRING = 3;

const IN_FILTER_SPELL_BOOK = 0x10000000 /* Do not show if class is magic-less */

const IN_STOP_ONCE         = 0x01000000 /* Only display one value */
const IN_STOP_STRIDE       = 0x02000000 /* Stop parsing if striding test failed */
const IN_STOP_EMPTY       = 0x04000000 /* Stop parsing if coffer is empty */
const IN_AUTO_CUT         = 0x08000000 /* Squeeze indicator into terminal */

const IN_STRIDE_EMPTY      =0x00100000 /* Step over empty values */
const IN_STRIDE_LARGER    =	0x00200000 /* Step over to next coffer it's lower then current */ 
const IN_STRIDE_POSITIVE  =	0x00400000 /* Step over values > 0 */
const IN_STRIDE_NONZERO   =	0x00800000 /* Step over values != 0 */

const IN_STRIDE_LESSER    =	0x00010000 /* Step over values < next coffer */
const IN_STRIDE_NOT       =	0x00080000 /* Invert ALL the tests ("if not") */

const IN_VT_CR            =	0x00000100 /* Do a carriage return on Vertical Tab */
const IN_VT_LF            =	0x00000200 /* Do a line feed  on Vertical Tab */
const IN_VT_FF            =	0x00000400 /* Do a form feed  on Vertical Tab */
const IN_VT_COLOR_SET     =	0x00000800 /* Readout next character as color on Vertical Tab */

const IN_VT_COLOR_RESET   =	0x00001000 /* Reset color on Vertical Tab */
const IN_VT_STRIDE_FLIP  = 	0x00002000 /* Enable/Disable striding on Vertical Tab */
const IN_VT_DEC_VALUE    = 	0x00004000 /* Decrease value on Vertical Tab */
const IN_VT_XXX_XXX_1     =	0x00008000 /* Unused effect of Vertical Tab */

const IN_VT_COFFER_RESET  =	0x00040000 /* Reset coffer back to 0 on Vertical Tab */

const IN_TEXT_LABEL       =	0x00000001 /* Pick a string by value */
const IN_TEXT_PRINTF      =	0x00000002 /* Display value via sprintf format */
const IN_TEXT_STAT        =	0x00000004 /* Hack: Display in 18/XXX format */
const IN_TEXT_CUT         =	0x00000008 /* Display a string from prompt and cut it */
const IN_TEXT_LIKERT      =	0x00000010 /* Hack: Display in "likert" format */



/* Stream flags */
const SF_NONE        = 0x00; /* No special flags */
const SF_TRANSPARENT = 0x01; /* Stream has secondary layer */
const SF_OVERLAYED   = 0x02; /* Stream shouldn't be 'memorized' */
const SF_NEXT_GROUP  = 0x04; /* Stream does not belong to previous group */
const SF_AUTO        = 0x08; /* Stream is auto-subscribed to */
const SF_KEEP_X      = 0x10; /* Stream respects window's X offset */
const SF_KEEP_Y      = 0x20; /* Stream respects window's Y offset */
const SF_MAXBUFFER   = 0x40; /* Be prepared to receive max_rows */
const SF_HIDE        = 0x80; /* Hide stream subscription from UI */

/* Command flags */
const COMMAND_TEST_ALIVE = 0x00000001 /* Test if player is alive */
const COMMAND_TEST_DEAD  = 0x00000002 /* Test if player is dead */
const COMMAND_TEST_SPELL = 0x00000004 /* Test if player class is spell-able (by TV) */
const COMMAND_ITEM_QUICK = 0x00000008 /* Do not interact with player, while selecting item */

const COMMAND_ITEM_AMMOUNT = 0x00000010 /* Allow player to specify ammount from item stack */
const COMMAND_ITEM_INVEN   = 0x00000020 /* Select item from inventory */
const COMMAND_ITEM_EQUIP   = 0x00000040 /* Select item from equipment */
const COMMAND_ITEM_FLOOR   = 0x00000080 /* Select item from floor */

const COMMAND_ITEM_RESET   = 0x00000100 /* Item sets its own "Second" and "Target" needs */
const COMMAND_SECOND_INVEN = 0x00000200 /* Select second item from inventory */
const COMMAND_SECOND_EQUIP = 0x00000400 /* Select second item from equipment */
const COMMAND_SECOND_FLOOR = 0x00000800 /* Select second item from floor */

const COMMAND_TARGET_DIR    = 0x00001000 /* Pick direction */
const COMMAND_TARGET_ALLOW  = 0x00002000 /* Pick direction OR target */
const COMMAND_TARGET_FRIEND = 0x00004000 /* Allow friendly targeting */
const COMMAND_TARGET_XXX2   = 0x00008000 /* XXX Unused */

const COMMAND_SPELL_BOOK   = 0x00010000 /* Choose a spell from TV book */
const COMMAND_SPELL_CUSTOM = 0x00020000 /* Choose a spell from an offset */
const COMMAND_SPELL_RESET  = 0x00040000 /* Set its own "Second" and "Target" needs */
const COMMAND_SPELL_INDEX  = 0x00080000 /* XXX Unused */
 
const COMMAND_NEED_VALUE   = 0x00100000 /* Ask for s32b value */
const COMMAND_NEED_CONFIRM = 0x00200000 /* Ask for confirmation */
const COMMAND_NEED_CHAR    = 0x00400000 /* Ask for "char" */
const COMMAND_NEED_STRING  = 0x00800000 /* Ask for "string" (60 chars) */

const COMMAND_NEED_SPELL = (COMMAND_SPELL_BOOK   |
							 COMMAND_SPELL_CUSTOM |
							 COMMAND_SPELL_RESET  |
							 COMMAND_SPELL_INDEX);

const COMMAND_NEED_ITEM = (COMMAND_ITEM_INVEN |
						   COMMAND_ITEM_EQUIP |
						   COMMAND_ITEM_FLOOR |
						   COMMAND_ITEM_AMMOUNT);
const COMMAND_NEED_SECOND = (COMMAND_SECOND_INVEN |
							 COMMAND_SECOND_EQUIP |
							 COMMAND_SECOND_FLOOR);
const COMMAND_NEED_TARGET = (COMMAND_TARGET_DIR    |
							 COMMAND_TARGET_ALLOW  |
							 COMMAND_TARGET_FRIEND |
							 COMMAND_TARGET_XXX2);

const COMMAND_SPECIAL_FILE = 0x01000000 /* Begin file perusal with mode "tval" */
const COMMAND_INTERACTIVE  = 0x02000000 /* Begin interactive mode "tval" */
const COMMAND_PROMPT_ITEM  = 0x04000000 /* Auto-modify prompt using "item" and "value" */
const COMMAND_STORE        = 0x08000000 /* This command will only work is stores */

const COMMAND_ITEM_STORE   = 0x10000000	/* Select item from store */
const COMMAND_SECOND_VALUE = 0x20000000	/* Put second item into value */
const COMMAND_SECOND_DIR   = 0x40000000	/* Put second item into dir */
const COMMAND_SECOND_CHAR  = 0x80000000	/* Put second item into entry[0] */


const TV_MAX       = 100;
const ITH_WEAR     = 1;
const ITH_WEAPON   = 2;
const ITH_ARMOR    = 3;
const ITH_AMMO     = 4;
const ITH_RECHARGE = 5;
const ITH_ACTIVATE = 6;
const ITH_REFILL   = 7;
//const item_test(A) (TV_MAX + (ITH_ ## A))
const ITEM_ANY = 0

/*
 * PKT_VISUAL_INFO helpers
 */
const VISUAL_INFO_FLVR = 0
const VISUAL_INFO_F    = 1
const VISUAL_INFO_K    = 2
const VISUAL_INFO_R    = 3
const VISUAL_INFO_TVAL = 4
const VISUAL_INFO_MISC = 5
const VISUAL_INFO_PR   = 6


class MAngband153ProtocolHandler extends MAngbandProtocolHandler {

	constructor(net, config, on_event) {
		super(net, config, on_event);
		this.packets[PKT_PLAY] = this.recv_play;
		this.packets[PKT_KEEPALIVE] = this.recv_keepalive;
		this.packets[PKT_QUIT] = this.recv_quit;
		this.packets[PKT_OPTION] = this.recv_option_info;
		this.packets[PKT_BASIC_INFO] = this.recv_basic_info;
		this.packets[PKT_STRUCT_INFO] = this.recv_struct_info;
		this.packets[PKT_CHAR_INFO] = this.recv_char_info;
		this.packets[PKT_GHOST] = this.recv_ghost;
		this.packets[PKT_SPELL_INFO] = this.recv_spell_info;
		this.packets[PKT_ITEM_TESTER] = this.recv_item_tester;
		this.packets[PKT_COMMAND] = this.recv_command_info;
		this.packets[PKT_TERM] = this.recv_term_info;
		this.packets[PKT_STREAM] = this.recv_stream_info;
		this.packets[PKT_INDICATOR] = this.recv_indicator_info;
		this.packets[PKT_RESIZE] = this.recv_stream_size;
		this.packets[PKT_CHANNEL] = this.recv_channel;
		this.packets[PKT_CURSOR] = this.recv_cursor;
		this.packets[PKT_SOUND] = this.recv_sound;
		this.packets[PKT_PARTY] = this.recv_party_info;
		this.packets[PKT_INVEN] = this.recv_inven;
		this.packets[PKT_EQUIP] = this.recv_equip;
		this.packets[PKT_FLOOR] = this.recv_floor;
		this.packets[PKT_STORE] = this.recv_store;
		this.packets[PKT_STORE_INFO] = this.recv_store_info;
		this.packets[PKT_STORE_LEAVE] = this.recv_store_leave;
		this.packets[PKT_OBJFLAGS] = this.recv_objflags;
		this.packets[PKT_MESSAGE_REPEAT] = this.recv_message_repeat;
		this.packets[PKT_MESSAGE] = this.recv_message;
		massivebind(this, this.packets);
		massivebind(this, this.eventHandlers);
		bnd(this, 'recv_stream');
		bnd(this, 'recv_indicator');
		bnd(this, 'recv_indicator_str');
		this.old_state = -1;
		this.asked_game = false;
		this.asked_play = false;
		this.data_sent = false;
		this.init_base_info();
		this.init_data_sync();
		/* Calling this manually */
		this.init_transformers();
	}
	render_indicator(i_ptr, values, first_col, first_row) {
		first_col = first_col || 0;
		first_row = first_row || 0;

		let ret = [];
		const MAX_LEN = 32;

		let prompt = i_ptr.buf;

		let flag = i_ptr.flag;
		let amnt = i_ptr.amnt;

		let row = first_row;
		let col = first_col;

		let color = 1;

		let val = values[0];

		let value;
		let warn = FALSE;
		let stride = TRUE;
		let n, cut = 0;
		let coff = 0;

		///* Hack -- count rows from bottom of term */
		//if (row < 0) row += Term->hgt;

		function strend(str) {
			let i;
			for (let i = 0; i < str.length; i++)
			{
				if (ord(str[i]) <= 31) break;
			}
			return i;
		}
		let likert_color = 1;
		function likert(va1l, val2) {
			return 1;
		}
		function strnfmt(fmt, arg1) {
			fmt = fmt.substring(1);
			let len = parseInt(fmt);
			//console.log("FMT:", fmt, "LEN:", len);
			let rlen = (""+arg1).length;
			//console.log("ARG:", arg1, "RLEN:", rlen);
			let s = "";
			for (let i = 0; i < len - rlen; i++)
			{
				s += " ";
			}
			s += arg1;
			return s;
		}
		function ascii_to_color(a) {
			return 1;
		}
		function cnv_stat(val) {
			if (val > 18)
			{
				let bonus = (val - 18);
				if (bonus >= 220)
				{
					return "18/***";
				}
				else if (bonus >= 100)
				{
					return "18/" + strnfmt("%03d", bonus);
				}
				else
				{
					return " 18/"+ strnfmt("%02d", bonus);
				}
			}
			else
			{
				return "    " + strnfmt("%2d", val);
			}
		}
		function color_spotlight(val1, val2, val3) {
			return 1;
		}
		function color_dualstat(val1, val2, warn) {
			return 1;
		}
		/* Hack -- count auto-cut */
		//if (flag & IN_AUTO_CUT) cut = MIN((Term->wid - col) / amnt, strend(prompt));

		/* Parse prompt */
		let done = FALSE;
		for ( ; prompt.length > 0 ; prompt = prompt.substring(1))
		{
			value = FALSE;

			switch(prompt[0])
			{
	 			/* Horizontal tab (Move right) */
				case '\t':
				{
					col++;
					continue;
				}
				/* Backspace (Move left) */
				case '\b':
				{
					col--;
					continue;
				}
				/* Carriage return */
				case '\r':
				{
					col = first_col;
					continue;
				}
				/* Line feed */
				case '\0':
				case '\n':
				{
					row++;
					continue;
				}
				/* Form feed (Next coffer) */
				case '\f':
				{
					////advance_coffer();
					coff++;
					if (--amnt <= 0) {
						done = TRUE;
						break;
					}
					val = values[coff];
					continue;
				}
				/* Vertical Tab (Do something flag told us) */
				case '\v':
				{
					if (flag & IN_VT_CR) col = first_col;
					if (flag & IN_VT_LF) row++;
					if (flag & IN_VT_COLOR_RESET) color = 1;
					if (flag & IN_VT_COFFER_RESET) {
						val = values[(coff = 0)]
						amnt = i_ptr.amnt;
					}
					if (flag & IN_VT_DEC_VALUE) val--;
					if (flag & IN_VT_STRIDE_FLIP) stride = !stride;
					if (flag & IN_VT_FF) { 
						coff++;
						if (--amnt <= 0) {
							done = TRUE;
							break;
						}
						val = values[coff];
					}
					if (!(flag & IN_VT_COLOR_SET)) continue;
					/* if IN_VT_COLOR_SET is not set, fallthrough */
				}			
				/* Bell (Change color) */
				case chr(7): // '\a'
				{
					/* Read out the color-code */
					prompt = prompt.substring(1);
					switch (prompt[0]) 
					{
						case '@': warn = TRUE; /* fallhrough */
						case '#': color = color_spotlight(val, (amnt > 1 ? values[coff + 1] : val), warn);
						break;
						case ';': warn = TRUE; /* fallhrough */
						case ':': color = color_dualstat(val, (amnt > 1 ? values[coff + 1] : val), warn);
						break;
						case '!': color = (val ? 1 : 0);
						break;
						case ' ': color = val;
						break;
						default: color = ascii_to_color(prompt[0]);
						break;
					}
					warn = FALSE;
					continue;
				}
				/* String Format (enable VALUE mode and fall thru) */
				case '%':
				{
					value = TRUE;
				}
				/* Not a control character! */
				default: if ((n = strend(prompt)))
				{
					/* Skip this value */
					if (stride)
					{
						let test_for = TRUE;
						let passed = FALSE;

						/* Hack -- quit prematurely */
					   	if ((flag & IN_STOP_EMPTY) && (val == 0)) {
					   		done = TRUE;
					   		break;
					   	}

						/* Hack -- test is inverted */
						if (flag & IN_STRIDE_NOT) test_for = FALSE;

						/* Perfrom striding tests */
					    if ((( (flag & IN_STRIDE_POSITIVE) && (val > 0) == test_for) ||
							 ( (flag & IN_STRIDE_NONZERO) && (val != 0) == test_for)) || 
							    ((amnt > 1) && 
							 	(( (flag & IN_STRIDE_EMPTY) && (values[coff] == 0) == test_for) ||
								 ( (flag & IN_STRIDE_LARGER) && (val > values[coff + 1]) == test_for) ||
								 ( (flag & IN_STRIDE_LESSER) && (val < values[coff + 1]) == test_for)
							)))
						{
							/* For each test, we see if it is enabled (flag & IN_STRIDE_* check),
							 * then perform the test. The _EMPTY, _LARGER and _LESSER tests require
							 * at least one succeeding value step to perfrom. */
							passed = TRUE;
						}

	 					/* If any of the tests succeeds, the value is being stepped over. */
						if (passed)
						{
							/* Hack -- a stop is requested */ if (flag & IN_STOP_STRIDE) return;
							continue;
						}
					}
					let out;

					/* Readout value */
					n = Math.min(n, MAX_LEN - 1);
					out = prompt.substring(0, n);

					/* Advance prompt */
					prompt = prompt.substring(n - 1);

					/* Format output */
					if ((value) || (flag & IN_TEXT_LABEL))
					{
						if (i_ptr.type == INDITYPE_STRING)
						{
							out = str_value;
						}
						else if (flag & IN_TEXT_STAT)
						{
							out = cnv_stat(val);
						}
						else if (flag & IN_TEXT_LIKERT)
						{
							out = likert(val, values[coff + 1]);
							color = likert_color;
						}
						else if (flag & IN_TEXT_CUT)
						{
							out = out.substring(1);
							cut = val + 1;
						}
						else if (!(flag & IN_TEXT_LABEL))
						{
							out = strnfmt(out, val);
						}
						value = TRUE;
					}

					/* Cut */
					if (cut < 0) cut = 0;
					if (cut)
					{
						if (cut >= MAX_LEN) cut = MAX_LEN-1;
						out = out.substring(0, cut);
					}

					/* Send to terminal */
					ret.push({
						'x': col,
						'y': row,
						'attr': color,
						'str': out,
					})

					/* Move "cursor" */
					col = col + out.length;

					/* Hack -- quit prematurely */
					if ((flag & IN_STOP_ONCE) && (value == TRUE)) {
						done = TRUE;
						break;
					}
				}
				break;
			}
			if (done) break;
		}
		return ret;
	}
	init_transformers() {
		/* Generate 'synthetic' events out of raw ones. */
		let renderer = this.render_indicator
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
		});
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
		this.on('recv_floor', function(e) {
			return {
				"name": "item",
				"info": new GameItem({
					'inven_group': 'floor',
					'slot': 0,
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
					'price': e.info.price,
					'testflag': e.info.flag,
					'attr': e.info.attr,
				}),
			}
		});
		this.on('recv_stream', function(e) {
			let name = "cave_data";
			//or something else
			return {
				"name": name,
				"info": {
					'x': e.info.x,
					'y': e.info.y,
					'main': e.info.main,
				},
			}
		});
		this.on('recv_message', function(e) {
			return {
				"name": "log_message",
				"info": {
					'channel': '&log',
					'message': e.info.message,
					//MAngband doesn't have colored messages,
					//so we just dump as white.
					'multicolor': [
						{a:TERM_WHITE, str: e.info.message},
					]
				},
			}
		});
		this.on('recv_message', function(e) {
			//In MAngband, message type is also a sound.
			return {
				"name": "sound_effect",
				"info": {
					//TODO: Ang306 sound name
					'type': e.info.type,
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
		this.net.send([0x00, 0x01]);
	}

	setGameOption(option_name, value) {
		let opt = this.option_ref[option_name];
		opt.set = value ? 1 : 0;
		if (this.old_state == PLAYER_PLAYING) {
			this.send_options();
		}
	}
	getGameOpton(option_name) {
		let opt = this.option_ref[option_name];
		return opt;
	}

	setup_keepalive_timer() {
		bnd(this, 'run_keepalive_timer');
		this.keepalive_timer = setTimeout(this.run_keepalive_timer, 1000);
		/* Reset counters */
		this.sent_pings = 0;
		this.recd_pings = 0;
	}
	run_keepalive_timer() {
		if (this.teardown) return;
		if (this.recd_pings == this.sent_pings)
		{
			this.send_keepalive(this.sent_pings++);
		}
		this.keepalive_timer = setTimeout(this.run_keepalive_timer, 1000);
	}

	/* Setup phase */
	init_base_info() {
		this.MAX_OBJFLAGS_ROWS = 0;
		this.MAX_OBJFLAGS_COLS = 0;

		this.options_groups_max = 0;
		this.options_max = 0;

		this.option_ref = {}; /* Option-by-name reference. */
		this.game_options = {};
		this.game_settings = new Array(16).fill(0);
	}
	init_data_sync() {
		this.asked_indicators = -1;
		this.asked_streams = -1;
		this.asked_commands = -1;
		this.asked_testers = -1;
		this.asked_options = -1;
		this.known_indicators = 0;
		this.known_streams = 0;
		this.known_commands = 0;
		this.known_item_testers = 0;
		this.known_options = 0;
		this.options_max = 0;
		this.serv_info = {};
		this.streams = {}
		this.stream_ref = {}; /* PKT-to-ID reference */
		this.indicators = {};
		this.indicator_ref = {}; /* PKT-to-ID reference */
		this.custom_commands = {};
		this.item_testers = {};
	}
	sync_data_piece(rq, ask_var, rcv, max, ready) {
		if (rcv < max)
		{
			if (this[ask_var] < rcv)
			{
				//if (ask_let == 'asked_options') {
					//console.log("Requesting CMD", rcv);
				//}
				this.send_request(rq, rcv);
				this[ask_var] = rcv;
			}
			return 0;
		}
		return 1;
	}
	sync_data() {
		let data_ready = 0;

		/* Indicators */
		data_ready += this.sync_data_piece(RQ_INDI, 'asked_indicators', this.known_indicators, this.serv_info.val1);

		/* Streams */
		data_ready += this.sync_data_piece(RQ_STRM, 'asked_streams', this.known_streams, this.serv_info.val2);

		/* Commands */
		data_ready += this.sync_data_piece(RQ_CMDS, 'asked_commands', this.known_commands, this.serv_info.val3);

		/* Item Testers */
		data_ready += this.sync_data_piece(RQ_ITEM, 'asked_testers', this.known_item_testers, this.serv_info.val4);

		/* Options */
		data_ready += this.sync_data_piece(RQ_OPTS, 'asked_options', this.known_options, this.options_max);

		return (data_ready == 5);
	}

	/* Subscribe to a "stream" */
	send_stream_size(id, rows, cols) {
		this.write("%c" + "%c%ud%c", [ PKT_RESIZE, id, rows, cols ]);
	}

	client_ready() {
		this.setup_keepalive_timer();
		this.trigger('client_ready', {'name': 'client_ready'});
	}

	client_setup() {
		this.setGameOption('use_color', true);

		this.send_options();
		this.send_settings();

		this.send_visuals();
		this.send_stream_size(0, 23, 63);
		this.trigger('client_setup', {'name': 'client_setup'});
	}

	/* TODO: set as event listener */
	during_setup(e) {
		let state = e.state;
		if (state === undefined) state = this.old_state;
		this.enter(state);
	}

	enter(state) {
		this.data_ready = this.sync_data();

		if (this.old_state != state)
		{
			console.log("Changing setup state", this.old_state, "-->", state);
			/* Handshake complete */
			if (state == PLAYER_EMPTY)
			{
				this.send_login();
			}
			/* No character is ready */
			if (state == PLAYER_NAMED)
			{
				/* Generate one */
				//get_char_info();
				this.send_char_info(0, 0, 1, [0,1,2,3,4,5]);
				//this.send_play(PLAY_ROLL);
			}
			/* Character is dead! */
			if (state == PLAYER_BONE)
			{
				if (0) // (get_bone_decision())
				{
					/* Ask for similar one */
					this.send_play(PLAY_REROLL);
				}
				else
				{
					/* Generate new one */
					this.send_play(PLAY_RESTART);
				}
			}
			/* Character is ready for rolling */
			if (state == PLAYER_SHAPED)
			{
				/* Let's roll */
				this.send_play(PLAY_ROLL);
			}
			/* Character is ready to play */
			if (state == PLAYER_READY)
			{
				this.char_ready = TRUE;
			}
			/* Character was leaving the game */
			if (state == PLAYER_LEAVING)
			{
				this.char_ready = TRUE;
			}
			this.old_state = state;
		}
		if (state >= PLAYER_FULL && this.data_sent == FALSE)
		{
			//console.log("DATA READY:", this.data_ready);
			if (this.data_ready == TRUE)
			{
				this.client_setup();
				this.data_sent = TRUE;
				this.old_state=-state;this.enter(state);//hack
			}
		}
		else
		if (state >= PLAYER_FULL && this.data_ready == TRUE)
		{
			if (this.asked_game == FALSE)
			{
				this.send_play(PLAY_ENTER);
			}
			this.asked_game = TRUE;
		}
		if (this.char_ready && this.data_ready && this.data_sent)
		{
			if (this.asked_play == FALSE)
			{
				this.client_ready();
				this.send_play(PLAY_PLAY);
			}
			this.asked_play = TRUE;
		}
	}

	/* Helpers */

	get_indicator_by_ref(pkt) {
		let id = this.indicator_ref[pkt];
		if (id === undefined) throw new UnknownIndicator('PKT ' + pkt);
		return this.get_indicator_by_id(id);
	}
	get_indicator_by_id(id) {
		let i_ptr = this.indicators[id];
		if (!i_ptr) throw new UnknownIndicator(id);
		return i_ptr;
	}

	get_stream_by_pkt(pkt) {
		return this.get_stream_by_id(this.stream_ref[pkt]);
	}
	get_stream_by_id(id) {
		return this.streams[id];
	}

	/* Recv... */
	recv_play() {
		let mode = this.net.rQshift8();
		this.enter(mode);
		return {
			'mode': mode,
		};
	}

	recv_quit() {
		let reason;
		try {
			reason = this.read("%S");
		} catch (e) {
			if (e instanceof NotEnoughBytes) {
				reason = "unknwon reason";
			} else {
				throw e;
			}
		}
		throw new GotQuitPacket(reason);
	}

	recv_basic_info() {
		let info1to4 = this.read("%b%b%b%b", ["val1", "val2", "val3", "val4" ]);
		let info9to12 = this.read("%ul%ul%ul%ul", ["k_max", "r_max", "f_max", "val12" ]);
		let info = {};
		for (let k in info1to4) {
			info[k] = info1to4[k];
		}
		for (let k in info9to12) {
			info[k] = info9to12[k];
		}
		this.serv_info = info;
		//console.log("basic info", info);
		return info;
	}

	recv_struct_info() {
		let header = this.read(
			"%c%ud%ul%ul", [
			'typ', 'max', 'fake_name_size', 'fake_text_size'
		]);

		const STRUCT_INFO_UNKNOWN = 0; /* Error! */
		const STRUCT_INFO_LIMITS = 1;
		const STRUCT_INFO_RACE = 2;
		const STRUCT_INFO_CLASS = 3;
		const STRUCT_INFO_INVEN = 5;
		const STRUCT_INFO_OPTION = 6
		const STRUCT_INFO_OPTGROUP = 7;
		const STRUCT_INFO_FLOOR = 8
		const STRUCT_INFO_OBJFLAGS = 9
		const STRUCT_INFO_STATS = 10;

		if (header['typ'] == STRUCT_INFO_OPTGROUP) {
			this.options_groups_max = header['max'];
			this.options_max = header['fake_name_size'];
			for (let i = 0; i < header['max']; i++)
			{
				let name = this.read("%s");
				//console.log("OPTION", i, name);
			}
		} else if (header['typ'] == STRUCT_INFO_STATS) {
			for (let i = 0; i < header['max']; i++)
			{
				let name = this.read("%s");
				//console.log("STAT", i, name);
			}
		} else if (header['typ'] == STRUCT_INFO_RACE) {
			for (let i = 0; i < header['max']; i++)
			{
				let name = this.read("%s")
				let offset = this.read("%ul");
				//console.log("RACE", i, name, offset);
			}
			this.serv_info.p_max = header['max'];
		} else if (header['typ'] == STRUCT_INFO_CLASS) {
			for (let i = 0; i < header['max']; i++)
			{
				let name = this.read("%s");
				let offset = this.read("%ul");
				let marker = this.read("%c");
				//console.log("CLASS", i, name, offset, marker);
			}
			this.serv_info.c_max = header['max'];
		} else if (header['typ'] == STRUCT_INFO_INVEN) {
			this.INVEN_TOTAL = header['max'];
			this.INVEN_WIELD = header['fake_text_size'];
			this.INVEN_PACK = this.read("%ul");
			for (let i = 0; i < header['max']; i++)
			{
				let name = this.read("%s");
				let offset = this.read("%ul");
				//console.log("INVEN", name, offset);
			}
		} else if (header['typ'] == STRUCT_INFO_OBJFLAGS) {
			this.MAX_OBJFLAGS_ROWS = header['max'];
			this.MAX_OBJFLAGS_COLS = header['fake_name_size'];
		} else if (header['typ'] == STRUCT_INFO_FLOOR) {
			
		} else {
			console.log("UNDEFINED TYPE!", header['typ']);
			return false;
		}
		return true;
	}

	recv_option_info()
	{
		let info = this.read("%c%c%s%s", ['opt_page', 'opt_default', 'name', 'desc']);
		/* Hack -- ignore most bits on opt_default (for now) */
		info.opt_default = (info.opt_default & 0x01);
		/* Start in default position */
		info.set = info.opt_default;
		let id = this.known_options;
		this.game_options[id] = info;
		this.option_ref[info.name] = info;
		this.known_options++;
		this.enter(this.old_state);
		return info;
	}

	recv_char_info() {
		let info = this.read("%d%d%d%d", ['state', 'race', 'plcass', 'sex']);
		this.enter(info['state']);//FIXME
		return info;
	}

	recv_ghost() {
		let mode = this.read("%d");
		let info = {
			"ghost": false,
			"fruit_bat": false,
		}
		const PALIVE_ALIVE    = 0;
		const PALIVE_GHOST    = 1;
		const PALIVE_FRUITBAT = 2;
		if (mode == PALIVE_GHOST   ) info.ghost = true;
		if (mode == PALIVE_FRUITBAT) info.fruit_bat = true;
		return info;
	}

	recv_command_info() {
		let info = this.read("%c%c%d%ul%c%S%s",
			['pkt', 'scheme', 'key', 'flag', 'tval', 'buf', 'disp']);
		let id = this.known_commands;
		info.key = chr(info.key);
		this.custom_commands[id] = info;
		this.known_commands++;
	}

	recv_stream_info() {
		let info = this.read("%c%c%c%c" + "%s%s" + "%ud%c%ud%c",
				[ 'pkt', 'addr', 'rle', 'flag',
				  'mark', 'buf',
				  'min_row', 'min_col', 'max_row', 'max_col' ]);
		let id = this.known_streams;

		let stream = new MAngStream(info);
		/* Save info for later. */
		this.streams[id] = stream;
		this.stream_ref[info['pkt']] = id;
		this.known_streams++;
		/* Set packet handler. */
		this.packets[info['pkt']] = this.recv_stream;

		/* Continue setup process. */
		this.enter(this.old_state);
		return info;
	}

	recv_indicator_info() {
		let info = this.read(
			"%c%c%c%c%d%d%ul%S%s", [
			'pkt', 'type', 'amnt', 'win', 'row', 'col', 'flag', 'buf', 'mark'
		]);
		let id = this.known_indicators;

		this.packets[info.pkt] = (
			(info.type != INDITYPE_STRING)
			? this.recv_indicator
			: this.recv_indicator_str);

		this.indicators[id] = info;
		this.indicator_ref[info['pkt']] = id;
		this.known_indicators++;
		this.enter(this.old_state);
		return info;
	}

	recv_item_tester() {
		let info = this.read("%c%c", ['id', 'flag']);
		let id = info.id;
		const MAX_ITH_TVAL = 16;
		info.tvals = [];
		for (let i = 0; i < MAX_ITH_TVAL; i++)
		{
			info.tvals.push(this.read("%c"));
		}
		this.item_testers[id] = info;
		if (id + 1 > this.known_item_testers) this.known_item_testers = id + 1;
		//console.log("ITEM TESTER:", id, info);
		this.enter(this.old_state);
		return info;
	}

	recv_spell_info() {
		let info = this.read(
			"%b%b%ud%ud%s", [
			'flag', 'tester', 'book', 'line', 'buf'
		]);
//	if (line >= SPELLS_PER_BOOK)
//	{
//		plog(format("Spell out of bounds! Getting %d, SPELLS_PER_BOOK=%d!", line, SPELLS_PER_BOOK));
//		return -1;
//	}
		return info;
	}

	recv_keepalive() {
		let ticks = this.read("%l");
		if (ticks == this.sent_pings - 1)
		{
			if (this.old_state == PLAYER_PLAYING)
			{
				//TODO: calculate lag
				this.recd_pings++;
			}
		}
	}

	recv_indicator_str(pkt) {
		let id = this.indicator_ref[pkt];
		let i_ptr = this.indicators[id];
		let buf = this.read("%s");
		let info = {
			"indicator": i_ptr,
			"str": buf,
		}
		return info;
	}

	recv_indicator(pkt) {
		let i_ptr = this.get_indicator_by_ref(pkt);
		let values = [];
		let i;
		/* Read (i_ptr->amnt) values of type (i_ptr->type) */
		for (let i = 0; i < i_ptr.amnt; i++)
		{
			/* Read */
			let val = 0;
			let n = 0;
			if (i_ptr.type == INDITYPE_TINY)
			{
				val = this.read("%c");
			}
			else if (i_ptr.type == INDITYPE_NORMAL)
			{
				val = this.read("%d");
			}
			else if (i_ptr.type == INDITYPE_LARGE)
			{
				val = this.read("%l");
			}
			values.push(val);
		}
		return {
			"indicator": i_ptr,
			"values": values,
		};
	}

	recv_stream_size() {
		let info = this.read("%c%ud%c", ['id', 'row', 'col']);
		let stream = this.get_stream_by_id(info.id);
		stream.set_size(info.row, info.col);
		return info;
	}

	recv_objflags() {
		let rle = (this.use_graphics ? RLE_LARGE : RLE_CLASSIC);

		/* Header (line number) */
		let y = this.read("%d");

		/* Verify */
		if (y < 0 || y >= this.MAX_OBJFLAGS_ROWS)
		{
			throw new ObjFlagsOutOfBounds(y, this.MAX_OBJFLAGS_ROWS);
		}

		/* Body (39 grids of cave) */
		let body = this.read_cave(rle, this.MAX_OBJFLAGS_COLS);
		return body;
	}

	recv_term_info() {
		let flag = this.read("%b");
		let line = (flag & 0xF0) ? this.read("%ud") : 0;
		return {
			'flag': flag,
			'line': line,
		}
	}

	recv_channel() {
		let info = this.read("%ud%c%s", ['id', 'mode', 'name']);
		return info;
	}

	recv_cursor() {
		let info = this.read("%c%c%c", ['vis', 'x', 'y']);
		return info;
	}

	recv_equip() {
		let info = this.read("%c%c%ud%c%b%s", 
			['pos', 'attr', 'wgt', 'tval', 'flag', 'name']);
		return info;
	}

	recv_inven() {
		let info = this.read("%c%c%ud%d%c%b%b%s",
			['pos', 'attr', 'wgt', 'amt', 'tval', 'flag', 'tester', 'name'])
		return info;
	}

	recv_floor() {
		return this.read("%c%c%d%c%b%b%s",
			['pos', 'attr', 'amt', 'tval', 'flag', 'tester', 'name'])
	}

	recv_store()
	{
		let info = this.read("%c%c%d%d%ul%s", ['pos', 'attr', 'wgt', 'num', 'price', 'name']);

		//store.stock[pos].sval = attr;
		//store.stock[pos].weight = wgt;
		//store.stock[pos].number = num;
		//store_prices[(int) pos] = price;
		//my_strcpy(store_names[(int) pos], name, MAX_CHARS);

		/* Make sure that we're in a store */
//		if (shopping)
//		{
//			if (shopping_buying) inkey_exit = TRUE; /* Cancel input */
//			display_inventory();
//		}
		return info;
	}
	recv_store_info()
	{
		let info = this.read(
			"%c%s%s%d%l",
			['flag', 'store_name', 'store_owner_name', 'num_items', 'max_cost']);
	//store_flag = flag;
	//store.stock_num = num_items;
	//store_owner.max_cost = max_cost;

	/* Only enter "display_store" if we're not already shopping */
	//if (!shopping)
	//	enter_store = TRUE;
	//else
	//	display_inventory();
	//return 1;
		return info;
	}
	recv_store_leave() {
		return true;
	}
	
	recv_message() {
		let info = this.read("%ud%S", ['type', 'message']);
		return info;
	}
	recv_message_repeat() {
		let info = this.read("%ud", ['type']);
		return info;
	}

	read_stream_char(stream, line) {
		let main = [this.read("%c%c", ['a', 'c'])];
		let y = ((line >> 8) & 0x007F);
		let x = (line & 0xFF);

		let trn = null
		if (stream.is_transparent())
			trn = [this.read("%c%c", ['a', 'c'])];

		let info = {
			'stream': stream,
			'x': x,
			'y': y,
			'main': main,
			'trn': trn,
		}
		return info;
	}

	read_stream_line(stream, line) {
		let trn = null
		if (stream.is_transparent())
			trn = this.read_cave(stream.rle, stream.columns);

		let main = this.read_cave(stream.rle, stream.columns);
		return {
			'stream': stream,
			'y': line,
			'x': 0,
			'main': main,
			'trn': trn,
		};
	}

	recv_stream(next_pkt) {
		let stream = this.get_stream_by_pkt(next_pkt);
		let line = this.read("%ud");
		if (line & 0x8000) return this.read_stream_char(stream, line);
		else return this.read_stream_line(stream, line);
	}

	recv_sound() {
		return this.read("%ud");
	}

	recv_party_info() {
		return this.read("%s%s", ['name','owner']);
	}

	/* Byte-based IO */

	read(fmt, names) {
		let return_single_value = false;
		let ret = {};
		let formats = fmt.split("%");
		formats = formats.slice(1);
		if (names === undefined && formats.length == 1) {
			names = ['anyval'];
			return_single_value = true;
		}
		for (let k in formats) {
			let format = formats[k];
			let name = names[k];
			let len = this.net.rQlen();
			let signed_at_bit = 0;
			if (format == 'c' || format == 'b') { /* Char, Byte */
				if (len < 1) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift8();
				if (format == 'c') signed_at_bit = 8;
			} else if (format == 'ud' || format == 'd') { /* 16-bit value */
				if (len < 2) throw NotEnoughBytes();
				ret[name] = this.net.rQshift16();
				if (format == 'd') signed_at_bit = 16;
			} else if (format == 'ul' || format == 'l') { /* 32-bit value */
				if (len < 4) throw new NotEnoughBytes();
				ret[name] = this.net.rQshift32();
				if (format == 'l') signed_at_bit = 32;
			} else if (format == 's' || format == 'S') { /* C String */
				let done = false;
				let str = "";
				for (let i = 0; i < len; i++) {
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
			if (signed_at_bit)
			{
				/* Unwrap two's complement */
				let bits = (32 - signed_at_bit);
				ret[name] = ret[name] << bits >> bits;
			}
		}
		if (return_single_value) {
			return ret['anyval'];
		}
		return ret;
	}

	write(fmt, args) {
		let formats = fmt.split("%");
		formats = formats.slice(1);
		for (let k in formats) {
			let format = formats[k];
			let value = args[k];
			if (format == 'c' || format == 'b') { /* Char, Byte */
				this.net.send([value]);
			} else if (format == 'ud' || format == 'd') { /* 16-bit value */
				let a = (value >> 0) & 0xFF;
				let b = (value >> 8) & 0xFF;
				this.net.send([b, a]);
			} else if (format == 'ul' || format == 'l') { /* 32-bit value */
				let a = (value >> 0) & 0xFF;
				let b = (value >> 8) & 0xFF;
				let c = (value >> 16) & 0xFF;
				let d = (value >> 24) & 0xFF;
				this.net.send([d, c, b, a]);
			} else if (format == 's') { /* C String */
				this.net.send_string(value);
				this.net.send([0]);
			} else if (format == 'S') { /* Large C String */
				this.net.send_string(value);
				this.net.send([0]);
			} else if (format == 'n') { /* Pascal String */
				this.net.send([value.length]);
				this.net.send_string(value);
			} else if (format == 'N') { /* Large Pascal String */
				this.net.send(as16bit(value.length));
				this.net.send_string(value);
			}
		}
	}

	read_cave(rle, cols) {
		let ret = new Array(cols).fill();
		for (let i = 0; i < cols; i++) {
			ret[i] = new Object({'a': 0, 'c': 0});
		}
		if (rle == RLE_NONE) this.cv_decode_none(ret, null, cols);
		else if (rle == 1) this.cv_decode_rle1(ret, null, cols);
		else if (rle == 2) this.cv_decode_rle2(ret, null, cols);
		else if (rle == 3) this.cv_decode_rle3(ret, null, cols);
		else throw new UndefinedRLEMethod(rle);
		let s = ""
		for (let i = 0; i < cols; i++) {
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
	cv_decode_rle2(dst, src, len) {
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
				/* Get the number of repetitions */
				n = c;

				/* Is it even legal? */
				if (x + n > len) throw new StreamOutOfBounds(x + n, len);

				/* Read the attr/char pair */
				if (this.net.rQlen() < 2) throw new NotEnoughBytes(2);
				c = this.net.rQshift8();
				a = this.net.rQshift8();
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
	cv_decode_rle3(dst, src, len) {
		for (let x = 0; x < len; x++)
		{
			let i, n;
			let a;

			/* Read the attr */
			if (this.net.rQlen() < 1) throw NotEnoughBytes(1);
			a = this.net.rQshift8();

			/* Start with count of 1 */
			n = 1;

			/* Check for bit 0x40 on the attribute */
			if (a & 0x40)
			{
				/* First, clear the bit */
				a &= ~(0x40);

				/* Read the number of repetitions */
				if (this.net.rQlen() < 1) throw NotEnoughBytes(1);
				n = this.net.rQShift8();

				/* Is it even legal? */
				if (x + n > len) throw new StreamOutOfBounds(x + n, len);
			}

			/* 'Draw' a character n times */
			if (this.net.rQlen() < n) throw new NotEnoughBytes(n);
			for (let i = 0; i < n; i++)
			{
				let c = this.net.rQshift8();
				if (dst)
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

	send_login() {
		this.write("%c%ud%s%s%s%s", [
			PKT_LOGIN,
			0x1530,
			this.realname,
			this.hostname,
			this.login,
			this.password,
		]);
	}

	send_keepalive(last_keepalive) {
		this.write("%c%l", [ PKT_KEEPALIVE, last_keepalive ]);
	}

	send_play(mode) {
		this.write("%c%c", [ PKT_PLAY, mode ]);
	}

	send_request(mode, id) {
		this.write("%c%c%ud", [PKT_BASIC_INFO, mode, id]);
	}

	send_char_info(race, pclass, sex, stat_order) {
		//compare stat_order.length to A_MAX
		this.write("%c%ud%ud%ud", [ PKT_CHAR_INFO, race, pclass, sex ]);
		for (let i = 0; i < stat_order.length; i++)
		{
			this.write("%d", stat_order[i]);
		}
	}

	send_visual_info(type) {
		let size = 0;
		if (type == VISUAL_INFO_FLVR) {
			size = MAX_FLVR_IDX;
		} else if (type == VISUAL_INFO_F) {
			size = this.serv_info.f_max;
		} else if (type == VISUAL_INFO_K) {
			size = this.serv_info.k_max;
		} else if (type == VISUAL_INFO_R) {
			size = this.serv_info.r_max;
		} else if (type == VISUAL_INFO_TVAL) {
			size = 128;
		} else if (type == VISUAL_INFO_MISC) {
			size = 1024;
		} else if (type == VISUAL_INFO_PR) {
			size = (this.serv_info.c_max + 1) * this.serv_info.p_max;
		} else {
			throw new Error("??"+type)
		}
		this.write("%c%c%d", [PKT_VISUAL_INFO, type, size]);
		for (let i = 0; i < size; i++) {
			this.write("%c%c", [0, 0]);
		}
	}
	send_visuals() {
		for (let i = 0; i < VISUAL_INFO_PR+1; i++) {
			this.send_visual_info(i);
		}
	}

	send_options() {
		let next = 0;
		let bit = 0;

		this.write("%c", [PKT_OPTIONS]);

		/* Pack each option as bit. Send every 8 options as byte */
		for (let i = 0; i < this.options_max; i++)
		{
			if (this.game_options[i].set)
				next |= (0x01 << bit);
			bit++;
			if (bit > 7)
			{
				this.write("%b", [next]);
				next = 0;
				bit = 0;
			}
		}
		/* Leftovers */
		if (bit != 0) this.write("%b", [next]);
	}
	send_settings() {
		this.write("%c", [PKT_SETTINGS]);
		for (let i = 0; i < 16; i++)
			this.write("%d", this.game_settings[i]);
	}

	send_mouse(mod, x, y) {
		this.write("%c%c%c%c", [PKT_CURSOR, mod, x, y]);
	}

	send_walk(dir) {
		this.write("%c%c", [PKT_WALK, dir]);
	}
	send_rest() {
		this.write("%c", [PKT_REST]);
	}
	send_message(message) {
		this.write("%c%S", [PKT_MESSAGE, message]);
	}


	send_custom_command(id, args) {
		let cc = id.key !== undefined ? id : this.custom_commands[id];
		let pkt = cc.pkt;
		//console.log(pkt, 'vs', PKT_COMMAND);
		if (pkt == PKT_COMMAND) {
			this.write("%c%c", [PKT_COMMAND, id]);
		} else {
			this.write("%c", [pkt]);
		}
		const SCHEME_EMPTY = 0;
		const SCHEME_FULL  = 1

		const SCHEME_ITEM  = 2;
		const SCHEME_DIR   = 3;
		const SCHEME_VALUE = 4;
		const SCHEME_SMALL = 5;
		const SCHEME_STRING= 6;
		const SCHEME_CHAR  = 7;

		const SCHEME_ITEM_DIR     =8;
		const SCHEME_ITEM_VALUE   =9;
		const SCHEME_ITEM_SMALL   =10;
		const SCHEME_ITEM_STRING  =11;
		const SCHEME_ITEM_CHAR    =12;

		const SCHEME_DIR_VALUE    =13;
		const SCHEME_DIR_SMALL    =14;
		const SCHEME_DIR_STRING   =15;
		const SCHEME_DIR_CHAR     =16;

		const SCHEME_VALUE_STRING =17;
		const SCHEME_VALUE_CHAR   =18;
		const SCHEME_SMALL_STRING =19;
		const SCHEME_SMALL_CHAR   =20;

		const SCHEME_ITEM_DIR_VALUE=21;
		const SCHEME_ITEM_DIR_SMALL=22;
		const SCHEME_ITEM_DIR_STRING=23;
		const SCHEME_ITEM_DIR_CHAR=24;

		const SCHEME_ITEM_VALUE_STRING= 25;
		const SCHEME_ITEM_VALUE_CHAR  = 26;
		const SCHEME_ITEM_SMALL_STRING =27;
		const SCHEME_ITEM_SMALL_CHAR  = 28;
		const SCHEME_PPTR_CHAR = 29;

		switch (cc.scheme) {
			case SCHEME_EMPTY: break;
			case SCHEME_ITEM: this.write("%c", [args['item']]); break;
			case SCHEME_DIR: this.write("%c", [args['dir']]); break;
			case SCHEME_VALUE: this.write("%l", [args['value']]); break;
			case SCHEME_SMALL: this.write("%c", [args['value']]); break;
			case SCHEME_STRING: this.write("%n", [args['prompt']]);	break;
			case SCHEME_CHAR: this.write("%c", [ord(args['prompt'][0])]); break;
			case SCHEME_ITEM_DIR: this.write("%c%c", [args['item'], args['dir']]); break;
			case SCHEME_ITEM_VALUE:	this.write("%c%l", [args['item'], args['value']]); break;				
			case SCHEME_ITEM_SMALL:	this.write("%c%c", [args['item'], args['value']]); break;
			case SCHEME_ITEM_STRING: this.write("%c%n", [args['item'], args['prompt']]);	break;
			case SCHEME_ITEM_CHAR: this.write("%c%c", [args['item'], ord(args['prompt'][0])]); break;
			default:
				alert('undefined cc shceme ' + cc.scheme);
		}
		//console.log("WROTE COMMAND", cc.scheme)

	}

	/* CC helpers */
	item_test__tester(item, id) {
		let item_tester = this.item_testers[id];
		/* STOP on flag mismatch */
		if (item_tester.flag && !(item.testflag & item_tester.flag)) {
			return FALSE;
		}
	
		/* OK on tval match */
		let j = 0;
		for (j = 0; j < item_tester.tvals.length; j++)
		{
			if (item_tester.tvals[j] == 0) break;
			if (item_tester.tvals[j] == item.tval) {
				//console.log("----- Match on tval", j,'=',item_tester.tvals[j], '(', item.tval,')')
				return (TRUE);
			}
			//console.log("----- no match on tval", j,'=',item_tester.tvals[j], '(', item.tval,')')
		}
		/* Acceptable */
		if (!j) return (TRUE);
		return (FALSE);
	}
	item_test__tval(item, tval)
	{
		/* Require an item */
		if (!item.tval) {
			return (FALSE);
		}
		/* Hack -- ignore "gold" */
		if (item.tval == TV_MAX) {
			return (FALSE);
		}
		/* Check the tval */
		if (tval)
		{
			/* Check the fake hook */
			if (tval > TV_MAX)
			{
				return this.item_test__tester(item, tval - TV_MAX - 1);
			}
			/* Or direct (mis)match */
			else if (!(tval == item.tval)) {
				return (FALSE);
			}
		}
		/* Assume okay */
		return (TRUE);
	}
	matchCustomCommand(item) {
		let tval = item.tval;
		for (let i = 0; i < this.known_commands; i++) {
			let cc = this.custom_commands[i];
			if (!(cc.flag & COMMAND_NEED_ITEM)) {
				continue;
			}
			//if (item.inven_group == 'inven'
			//	&& !(cc.flag & COMMAND_ITEM_INVEN)) continue;
			if (item.inven_group == 'equip'
				&& !(cc.flag & COMMAND_ITEM_EQUIP)) {
				let m = cc.flag & COMMAND_ITEM_EQUIP;
				continue;
			}
			if (!this.item_test__tval(item, cc.tval)) {
				continue;
			}
			if (item.inven_group != 'equip' && cc.tval == 0) { // Skip generics
				continue;
			}
			return cc;
		}
		return null;
	}
	get_custom_command(cmd) {
		for (let i = 0; i < this.known_commands; i++) {
			let cc = this.custom_commands[i];
			if (cc.key == cmd) {
				return cc;
			}
		}
		return null;
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

	/* Commands */
	cmd_message(message, chan) {
		this.send_message(message);
	}
	cmd_stay() {
		this.send_walk(5);
	}
	cmd_walk(dir) {
		this.send_walk(dir);
	}
	cmd_run(dir) {
		this.cmd_custom('.', {'dir':dir});
	}
	cmd_alter(dir) {
		this.cmd_custom('+', {'dir':dir});
	}
	cmd_rest(enable) {
		this.send_rest();
	}
	cmd_pathfind(x, y) {
		this.send_mouse(1, x, y);
	}
	cmd_custom(cmd, args) {
		args = args || { };
		let cc = this.get_custom_command(cmd);
		if (!cc) return;
		//console.log("SEND:", cc.disp, args);
		this.send_custom_command(cc, args);
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

class MAngStream {
	constructor(info) {
		for (let k in info) {
			this[k] = info[k];
		}
		this.rows = 0;
		this.columns = 0;
	}
	set_size(rows, cols) {
		this.rows = rows;
		this.columns = cols;
	}
	is_overlayed() {
		return (this.flag & SF_OVERLAYED)
	}
	is_transparent() {
		return (this.flag & SF_TRANSPARENT)
	}
}

register_protocol('mangband153', MAngband153ProtocolHandler);

})()/* End Fake Namespace */
