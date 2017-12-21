const fetch = require('node-fetch');
const btvjson = require('./btv.json');
const BigNumber = require('bignumber.js');

const job = async () => {
	const resp = await fetch('http://api.etherscan.io/api?module=account&action=txlist&address=0x47B8B6256F49CBA6c8bd37361cAc8b0Fe324D605');
	const json = await resp.json();

	const txList = json["result"];
	const addrList = btvjson.map((el) => el.address.toUpperCase());

	let out = 0;
	const bonuses = txList.reduce((acc, tx) => {
		if (addrList.indexOf(tx.from.toUpperCase()) >= 0) {
			const ts = parseInt(tx.timeStamp, 10);
			if (ts        < 1512752400) {
				out++;
			} else if (ts < 1513749600) {
				acc.push({"from": tx.from, "value": tx.value, "lc": (new BigNumber(tx.value)).times(new BigNumber(2700)).dividedBy('1000000000000000000').toString()});
				console.log(`${tx.from},${tx.value},${(new BigNumber(tx.value)).times(new BigNumber(2700)).dividedBy('1000000000000000000').toString()}`);
			} else {
				out++;
			}
		} else {
			out++;
		}
		return acc;
	}, []);

	// console.log(bonuses);
	console.log(out);
};

job();