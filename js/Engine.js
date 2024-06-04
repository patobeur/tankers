"use strict";
import { _front } from '/js/loaders.js';
let _Engine = {
	// INIT
	init: function () {
		this.max = this.GEARS.length - 1
		this.add_board()
	},
	// DATAS
	currentGear: 2,
	currentPower: 0,
	hotLimits: { cur: 0, max: 100 },
	delay: { cur: 0, max: 20, },
	GEARS: [
		{ name: 'FAST_BACKWARD', power: -3 },
		{ name: 'SLOW_BACKWARD', power: -1 },
		{ name: 'STOPPED', power: 0 },
		{ name: 'SLOW_FORWARD', power: 1 },
		{ name: 'FAST_FORWARD', power: 2.5 },
		{ name: 'VERY_FAST_FORWARD', power: 4 },
		{ name: 'VERY_VERY_FAST_FORWARD', power: 7 }
	],
	// front html
	boardInitiated: false,
	boards: {},
	// functions
	refresh_board: function () {
		if (this.boardInitiated === true) {
			let divs = document.body.getElementsByClassName('gear')
			for (let index = divs.length - 1; index >= 0; index--) divs[index].classList.remove('active');
		}
		this.boards[this.GEARS[this.currentGear].name].classList.add('active')
	},
	// functions
	add_board: function () {
		// ⚡
		this.boards['board'] = _front.createDiv({ tag: 'div', attributes: { id: 'board', }, style: {} })
		this.boards['board_speed'] = _front.createDiv({ tag: 'div', attributes: { id: 'board_speed', }, style: { display: 'flex' } })
		this.GEARS.forEach(element => {
			this.boards[element.name] = _front.createDiv({ tag: 'div', attributes: { id: element.name, textContent: element.power, className: 'gear' }, style: {} })
			this.boards['board_speed'].appendChild(this.boards[element.name])
		});
		this.boards['board_speed_emoji'] = _front.createDiv({ tag: 'div', attributes: { id: 'board_speed_emoji', textContent: '⚡', className: 'gear-emoji' }, style: {} })
		this.boards['board_speed'].appendChild(this.boards['board_speed_emoji'])
		this.boards['board'].appendChild(this.boards['board_speed'])
		document.body.appendChild(this.boards['board'])
		let css = '#board{position:absolute;bottom:5px;right:5px;display: flex;align-items: center;}' +
			'#board_speed{display: flex;align-items: center;}' +
			'.gear{line-height:0rem;margin:2px;width: 20px; height:20px; background-color: white;opacity:15%; border-radius:10%;display: flex;justify-content: center;align-items: center;}' +
			'.gear-emoji{margin:2px;width: 24px; height:24px; border-radius:10%;display: flex;justify-content: center;align-items: center;}' +
			'.gear-emoji.active{background-color: red; opacity:30%; }' +
			'.gear.active{font-size:.8rem;background-color: yellow; border-radius:25%;transform:scale(1.1);background-color: white; opacity:initial;  }' +
			'.gear:hover{font-size:.8rem;padding-bottom:2px;background-color: yellow; border-radius:25%;opacity:initial; }'
		_front.addCss(css, 'board')
		this.boards['STOPPED'].classList.add('active')
		this.boardInitiated = true
	},
	// ENGEENINERINERING
	get_engineStatus: function () {
		let status = this.GEARS[this.currentGear]
		return {
			name: status.name,
			power: status.power
		}
	},
	powerUp: function () {
		if (this.delay.cur === 0) {
			if (this.currentGear < this.max) this.currentGear++;
			this.delay.cur++
			this.refresh_board()
			this.boards['board_speed_emoji'].classList.add('active')
		}
	},
	powerDown: function () {
		if (this.delay.cur === 0) {
			if (this.currentGear > 0) this.currentGear--;
			this.delay.cur++
			this.refresh_board()
			this.boards['board_speed_emoji'].classList.add('active')
		}
	},
	// UPDATER for delay reset
	update: function () {
		if (this.delay.cur > 0 && this.delay.cur < this.delay.max) this.delay.cur++;
		if (this.delay.cur >= this.delay.max) {
			this.delay.cur = 0
			this.refresh_board('gears ready !!!')
			this.boards['board_speed_emoji'].classList.remove('active')
		}
	}
}
export { _Engine }
