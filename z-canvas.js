class ZTerm {
	constructor(root_node, config) {
		config = config || {}
		let cnv = document.createElement('canvas');

		this.rows = 0;
		this.cols = 0;
		this.cell_w = 0;
		this.cell_h = 0;

		this.dungeon_offset_col = config['dungeon_offset_col'] || 0;
		this.dungeon_offset_row = config['dungeon_offset_row'] || 0;

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

			16:'purple',//#define COLOUR_PURPLE         16  /* p */
			17:'#FF00FF',//#define COLOUR_VIOLET         17  /* v */     /* 4 0 4 */
			18:'teal',//#define COLOUR_TEAL           18  /* t */
			19:'brown',//#define COLOUR_MUD            19  /* m */
			20:'yellow',//#define COLOUR_L_YELLOW       20  /* Y */
			21: 'magenta',//#define COLOUR_MAGENTA        21  /* i */
			22: 'blue',//#define COLOUR_L_TEAL         22  /* T */
			23: 'violet',//#define COLOUR_L_VIOLET       23  /* V */
			24: 'pink',//#define COLOUR_L_PINK         24  /* I */
			25: 'yellow',//#define COLOUR_MUSTARD        25  /* M */
			26: 'blue',//#define COLOUR_BLUE_SLATE     26  /* z */
			27: 'blue',//#define COLOUR_DEEP_L_BLUE    27  /* Z */
			28: 'transparent'//*
//#define COLOUR_SHADE          28  /* for shaded backgrounds */
//#define COLOUR_MULTI          29  /* for object shimmering code */
//#define COLOUR_SPECIAL        30  /* special coloring */
//#define COLOUR_SYMBOL         31  /* special coloring */
		};

		cnv.tabindex = 1;
		root_node.appendChild(cnv);
		this.canvas = cnv;

		bnd(this, 'key_press');
		bnd(this, 'mouse_click');
		bnd(this, 'parse_stream');

		root_node.addEventListener('keydown', this.key_press)
		cnv.addEventListener('click', this.mouse_click)

		this.setFont('Monospace', '14px');
		this.setSize(24, 80);

		this.eventHandlers = {}
	}
	mouse_click(e) {
		let cp = getCursorPosition(this.canvas, e);
		this.trigger('click', {
			'code': 1,
			'name': 'lmb',
			'key': 'lmb',
			'x': cp[0],
			'y': cp[1],
			'col': parseInt(cp[0] / this.cell_w),
			'row': parseInt(cp[1] / this.cell_h),
		});
	}
	key_press(e) {
		if (e.target.nodeName == 'INPUT') return;
		let code = e.keyCode;
		console.log(e);
		const key_names = {
			13: 'return',
			16: 'shift',
			17: 'ctrl',
			18: 'alt',
			27: 'escape',
			32: 'space',
			33: 'page_up',
			34: 'page_down',
			35: 'end',
			36: 'home',
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			91: 'meta',
			97: 'kp_end',
			98: 'kp_down',
			99: 'kp_page_down',
			100: 'kp_left',
			101: 'kp_stay',
			102: 'kp_right',
			103: 'kp_home',
			104: 'kp_up',
			105: 'kp_page_up',
			112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6',
			118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12',
		}
		let name = key_names[code];
		if (!name) name = 'undefined'+code;
		if (name == 'shift' || name == 'ctrl'
			|| name == 'alt' || name == 'meta')
			return false;
		if (e.ctrlKey) name = 'control-'+name;
		if (e.altKey) name = 'alt-' + name;
		if (e.shiftKey) name = 'shift-' + name;
		if (e.metaKey) name = 'meta-'+name;
		this.trigger('keypress', {
			'code': code,
			'name': name,
			'key': e.key,
		});
		e.preventDefault();
		return false;
	}
	on(evt, func) {
		this.eventHandlers[evt] = func;
	}
	off(evt) {
		this.eventHandlers[evt] = undefined;
	}
	trigger(evt, e) {
		if (!this.eventHandlers[evt]) return;
		this.eventHandlers[evt](e);
	}
	wipe_tile(x, y) {
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.rect(x * this.cell_w, y * this.cell_h, this.cell_w, this.cell_h);
		ctx.fill();
	}
	wipe_text(x, y, s) {
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.rect(x * this.cell_w, y * this.cell_h, this.cell_w * (""+s).length, this.cell_h);
		ctx.fill();
	}
	draw_text(x, y, a, s) {
		this.wipe_text(x, y, s);
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = this.colors[a];
		ctx.textAlign = "left"; 
		ctx.textBaseline = "top";
		ctx.fillText(s, x * this.cell_w, y * this.cell_h);
	}
	draw_char(x, y, a, c) {
		this.wipe_tile(x, y);
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = this.colors[a];
		ctx.textAlign = "left"; 
		ctx.textBaseline = "top";
		ctx.fillText(chr(c), x * this.cell_w, y * this.cell_h, this.cell_w, this.cell_h);
	}
	draw_pict(x, y, a, c) {
		this.wipe_tile(x, y);		
		//...
	}

	setFont(fontName, fontSize) {
		let fs = getFontSize(fontName, fontSize);
		this.fontStyle = fontSize + " " + fontName;
		this.cell_w = fs[0];
		this.cell_h = fs[1];
		let ctx = this.canvas.getContext("2d");
		ctx.font = this.fontStyle;
		this.canvas.width = this.cols * this.cell_w;
		this.canvas.height = this.rows * this.cell_h;
	}
	setSize(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.canvas.width = this.cols * this.cell_w;
		this.canvas.height = this.rows * this.cell_h;
	}

	/* Hack ... */
	parse_stream(e) {
		let y = 0;
		let x = 0;
		for (let i = 0; i < e.info.main.length; i++) {
			let y = e.info.y;
			let x = e.info.x + i;
			let a = e.info.main[i].a;
			let c = e.info.main[i].c;
			this.draw_char(
				x + this.dungeon_offset_col,
				y + this.dungeon_offset_row,
				a, c);
		}
	}
}

function getFontSize(fontName, fontSize, parent){
	parent = parent || document.body;
	let who = document.createElement('div');
	let css = 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden;';
	css += 'font-family: ' + fontName + '; font-size: ' + fontSize + ';';
	who.style.cssText = css
	who.appendChild(document.createTextNode('M'));
	parent.appendChild(who);
	let fs = [who.offsetWidth, who.offsetHeight];
	parent.removeChild(who);
	return fs;
}
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

class ZLogger {
	constructor(root_node) {
		let main_node = document.createElement('div');
		main_node.style.cssText = 'width: 70%; height: 200px; overflow: scroll; background: #000;'
		let input_node = document.createElement('input');
		input_node.style.cssText = 'width: 60%;';
		input_node.placeholder = "Enter chat message...";
		let input_button = document.createElement('button');
		input_button.textContent = 'SEND';
		this.root_node = root_node;
		this.main_node = main_node;
		this.input_node = input_node;
		this.input_button = input_button;
		root_node.appendChild(main_node);
		root_node.appendChild(input_node);
		root_node.appendChild(input_button);
		/* TODO: move this somewhere else :( */
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
	}
	addMessage(chan, msg) {
		let p = document.createElement('p');
		p.textContent = msg;
		p.style.cssText = "font-size: smaller; margin: 0; color: #eee;"
		this.main_node.appendChild(p);
		this.main_node.scrollTop = this.main_node.scrollHeight;
	}
	addMulticolorMessage(chan, multicolor_message) {
		console.log("MC:", multicolor_message);
		let p = document.createElement('p');
		p.style.cssText = "font-size: smaller; margin: 0;"
		for (let k in multicolor_message) {
			let part = multicolor_message[k];
			let span = document.createElement('span');
			span.style.cssText = "color: " + this.colors[part.a];
			span.textContent = part.str;
			p.appendChild(span);
		}
		this.main_node.appendChild(p);
		this.main_node.scrollTop = this.main_node.scrollHeight;
	}
}
