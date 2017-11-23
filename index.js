const fetch = require('node-fetch');
const BigNumber = require('bignumber.js');
const admin = require("firebase-admin");
const serviceAccount = require("./auth/serviceAccountKey.json");

const addressToIdMapping = [{wallet: '0x3f85B7012d3e4F9E17896bA0e98B4b15691C4b91', refID: '0x2114'}];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lordmancer-2-ico.firebaseio.com"
});

const job = async () => {
	const resp = await fetch('http://api.etherscan.io/api?module=account&action=txlist&address=0x47B8B6256F49CBA6c8bd37361cAc8b0Fe324D605');
	const json = await resp.json();

	const txList = json["result"];

	const result = txList.reduce((acc, el) => {
		const address = el.from;
		const userMapping = addressToIdMapping.find((e) => e.wallet.toUpperCase() === address.toUpperCase());
		if (userMapping) {
			let user = acc[userMapping.refID];
			if (!user) {
				user = {
					balance: '0',
					referals: []
				};
				acc[userMapping.refID] = user;
			}
			user.balance = (new BigNumber(user.balance)).plus(new BigNumber(el.value)).toString();

			if (!addressToIdMapping.some((e) => e.refID === el.input)) {
				return acc;
			}

			let parent = acc[el.input];
			if (!parent) {
				parent = {
					balance: '0',
					referals: []
				};
				acc[el.input] = parent;
			}

			let referal = parent.referals.find((e) => e.wallet === address);
			if (!referal) {
				referal = {
					wallet: address,
					balance: '0'
				};
				parent.referals.push(referal);
			}
			referal.balance = (new BigNumber(referal.balance)).plus(new BigNumber(el.value)).toString();
			return acc;
		} else {
			if (addressToIdMapping.some((e) => e.refID === el.input)) {

				let parent = acc[el.input];
				if (!parent) {
					parent = {
						balance: '0',
						referals: []
					};
					acc[el.input] = parent;
				}

				let referal = parent.referals.find((e) => e.wallet === address);
				if (!referal) {
					referal = {
						wallet: address,
						balance: '0'
					};
					parent.referals.push(referal);
				}
				referal.balance = (new BigNumber(referal.balance)).plus(new BigNumber(el.value)).toString();
				
			}

			return acc;
		}
	}, {});

	admin.database().ref("ico/referals").set(result);
};

job();