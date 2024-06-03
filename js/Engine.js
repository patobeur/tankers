let _Engine = {
	currentGear: 2,
	currentPower: 2,
	delay: {
		cur: 0,
		max: 20,
	},
	GEARS: [
		{ name: 'FAST_BACKWARD', power: -3 },
		{ name: 'SLOW_BACKWARD', power: -1 },
		{ name: 'STOPPED', power: 0 },
		{ name: 'SLOW_FORWARD', power: 1 },
		{ name: 'FAST_FORWARD', power: 2.5 },
		{ name: 'VERY_FAST_FORWARD', power: 4 },
		{ name: 'VERY_VERY_FAST_FORWARD', power: 7 }
	],
	init: function (playerTank) {
		this.max = this.GEARS.length - 1
	},
	get_currentPower: function () {
		let power = this.GEARS[this.currentGear]
		return power
	},
	powerUp: function () {
		if (this.delay.cur === 0) {
			if (this.currentGear < this.max) this.currentGear++;
			this.delay.cur++
			console.log(this.GEARS[this.currentGear].name)
		}
	},
	powerDown: function () {
		if (this.delay.cur === 0) {
			if (this.currentGear > 0) this.currentGear--;
			this.delay.cur++
			console.log(this.GEARS[this.currentGear].name)
		}
	},
	update: function () {
		if (this.delay.cur > 0 && this.delay.cur < this.delay.max) {
			this.delay.cur++
		}
		// si max est dépassé
		if (this.delay.cur >= this.delay.max) {
			console.log('gers ready !!!')
			this.delay.cur = 0
		}
	}
}
export { _Engine }
