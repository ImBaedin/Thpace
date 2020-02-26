import { expect } from 'chai';
import {parseColor} from  '../utils';

describe('#parseColor', () => {
	it('Should convert colors to RGBA', ()=>{
		expect(parseColor('#eb4034')).eql([235, 64, 52, 1]);
		expect(parseColor('hsl(4,82%,56%)')).eql([235, 63, 51, 1]);
		expect(parseColor('hsla(4,82%,56%, .3)')).eql([235, 63, 51, .3]);
		expect(parseColor('rgb(235, 64, 52)')).eql([235, 64, 52, 1]);
		expect(parseColor('rgba(100, 50, 30, .33)')).eql([100, 50, 30, .33]);
	});
});