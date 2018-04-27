/**
 * @fileoverview enhancements.js is used to add a Potential Accuracy column to
 *               the tables of the Cyber Skyline Score Reports.
 * @author Rob Dukarski <rob@purplest.com>
 * @copyright 2018 Rob Dukarski
 * @version 1.0.0
 */

/**
 * Adds a Potential Accuracy column to the tables of the Score Report.
 */

document.addEventListener('DOMContentLoaded', () => {
	let data = window.preload;
	let challengeCount = data.challenges.length;
	let clusterCount = data.clusters.length;
	let clusters = {};
	let modules = {};
	let moduleCount = data.modules.length;
	let questions = {};
	let scoreBreakdownTableBody = document.querySelector('.ui.grid > .sixteen:last-child .sixteen + .sixteen table.sortable > tbody');
	let scoreBreakdownTableHead = document.querySelector('.ui.grid > .sixteen:last-child .sixteen + .sixteen table.sortable > thead tr th:nth-child(7)');
	let scoreSummaryTableBody = document.querySelector('.ui.grid > .sixteen:last-child .sixteen:first-child table.sortable > tbody');
	let scoreSummaryTableFoot = document.querySelector('.ui.grid > .sixteen:last-child .sixteen:first-child table.sortable > tfoot tr th:nth-child(6)');
	let scoreSummaryTableHead = document.querySelector('.ui.grid > .sixteen:last-child .sixteen:first-child table.sortable > thead tr th:nth-child(6)');
	let tableHeads = [scoreBreakdownTableHead, scoreSummaryTableHead];
	let tempChallenge;
	let tempCluster;
	let tempModule;
	let totalAttempts = 0;
	let totalCorrect = 0;
	let world = {};

	tableHeads.forEach((thead) => {
		thead.insertAdjacentHTML('afterend', '<th>Potential Accuracy</th>');
	});

	let breakdown = document.querySelector('.ui.grid > .sixteen:last-child .sixteen:last-child');
	let challengesBreakdown = breakdown.cloneNode(true);

	breakdown.parentElement.appendChild(challengesBreakdown);

	let challenges = document.querySelector('.ui.grid > .sixteen:last-child .sixteen:last-child');
	let challengesBreakdownTableBody = challenges.querySelector('table.sortable > tbody');
	let challengesBreakdownTableHead = challenges.querySelector('table.sortable > thead tr');

	challengesBreakdownTableHead.innerHTML = '<th>Module</th><th>Challenge</th><th>Points</th>';
	challenges.querySelector('h3').innerText = 'Challenge Breakdown';

	for (let i = 0; i < moduleCount; i++) {
		let tempModuleId = data.world.modules[i];

		for (let j = 0; j < moduleCount; j++) {
			if (data.modules[j]._id === tempModuleId) {
				let tempModule = data.modules[j];

				modules[tempModule._id] = tempModule.name;

				let tempAccuracy = ((tempModule.correct / tempModule.attempts) * 100).toFixed(2);

				if (isNaN(tempAccuracy)) {
					tempAccuracy = '0.00';
				}

				world[tempModule._id] = {
					accuracy: tempAccuracy + '%',
					attempts: tempModule.attempts,
					challenges: tempModule.challenges,
					clustersArray: tempModule.clusters,
					clusters: {},
					clusterCount: tempModule.clusters.length,
					completion: ((tempModule.correct / tempModule.challenges) * 100).toFixed(2) + '%',
					correct: tempModule.correct,
					hints: tempModule.hints,
					id: tempModule._id,
					name: tempModule.name,
					points: tempModule.points,
					potentialAccuracy: ((tempModule.challenges / (tempModule.challenges + (tempModule.attempts - tempModule.correct))) * 100).toFixed(2) + '%',
					skipped: tempModule.skipped,
					totalPoints: tempModule.totalPoints
				};

				totalAttempts += tempModule.attempts;
				totalCorrect += tempModule.correct;

				for (let k = 0; k < tempModule.clusters.length; k++) {
					let tempClusterId = tempModule.clusters[k];

					for (let l = 0; l < clusterCount; l++) {
						if (data.clusters[l]._id === tempClusterId) {
							let tempCluster = data.clusters[l];

							clusters[tempCluster._id] = {
								module: tempCluster.module,
								name: tempCluster.name
							};

							tempAccuracy = ((tempCluster.correct / tempCluster.attempts) * 100).toFixed(2);

							if (isNaN(tempAccuracy)) {
								tempAccuracy = '0.00';
							}

							world[tempCluster.module].clusters[tempCluster._id] = {
								accuracy: tempAccuracy + '%',
								attempts: tempCluster.attempts,
								challenges: {},
								challengeCount: tempCluster.challenges,
								completion: ((tempCluster.correct / tempCluster.challenges) * 100).toFixed(2) + '%',
								correct: tempCluster.correct,
								hints: tempCluster.hints,
								id: tempCluster._id,
								name: tempCluster.name,
								points: tempCluster.points,
								potentialAccuracy: ((tempCluster.challenges / (tempCluster.challenges + (tempCluster.attempts - tempCluster.correct))) * 100).toFixed(2) + '%',
								skipped: tempCluster.skipped,
								totalPoints: tempCluster.totalPoints
							};

							questions[tempCluster._id] = 1;
						}
					}
				}
			}
		}
	}

	for (let i = 0; i < challengeCount; i++) {
		tempChallenge = data.challenges[i];

		world[clusters[tempChallenge.cluster].module].clusters[tempChallenge.cluster].challenges[tempChallenge._id] = {
			id: tempChallenge._id,
			points: tempChallenge.points
		};
	}

	challengesBreakdownTableBody.innerHTML = '';
	scoreBreakdownTableBody.innerHTML = '';
	scoreSummaryTableBody.innerHTML = '';

	for (let i = 0; i < moduleCount; i++) {
		let tempModuleId = data.world.modules[i];

		for (let j = 0; j < moduleCount; j++) {
			if (data.modules[j]._id === tempModuleId) {
				tempModule = world[data.modules[j]._id];
				break;
			}
		}

		console.log('Adding module: ' + tempModule.id);

		scoreSummaryTableBody.insertAdjacentHTML('beforeend', '<tr data-module-id="' + tempModule.id + '"><td>' + tempModule.name + '</td><td>' + tempModule.correct + '</td><td>' + tempModule.attempts + '</td><td>' + tempModule.skipped + '</td><td>' + tempModule.hints + '</td><td>' + tempModule.accuracy + '</td><td>' + tempModule.potentialAccuracy + '</td><td>' + tempModule.completion + '</td><td>' + tempModule.points + ' / ' + tempModule.totalPoints + '</td></tr>');

		for (let j = 0; j < tempModule.clustersArray.length; j++) {
			let tempClusterId = tempModule.clustersArray[j];

			for (let k = 0; k < clusterCount; k++) {
				if (data.clusters[k]._id === tempClusterId) {
					tempCluster = world[tempModule.id].clusters[data.clusters[k]._id];
					break;
				}
			}

			console.log('Adding cluster: ' + tempCluster.id);

			scoreBreakdownTableBody.insertAdjacentHTML('beforeend', '<tr data-module-id="' + tempCluster.id + '"><td>' + tempModule.name + '</td><td>' + tempCluster.name + '</td><td>' + tempCluster.correct + '</td><td>' + tempCluster.attempts + '</td><td>' + tempCluster.skipped + '</td><td>' + tempCluster.hints + '</td><td>' + tempCluster.accuracy + '</td><td>' + tempCluster.potentialAccuracy + '</td><td>' + tempCluster.completion + '</td><td>' + tempCluster.points + ' / ' + tempCluster.totalPoints + '</td></tr>');

			for (let k = 0; k < challengeCount; k++) {
				if (data.challenges[k].cluster === tempCluster.id) {
					tempChallenge = world[tempModule.id].clusters[tempCluster.id].challenges[data.challenges[k]._id];

					console.log('Adding challenge: ' + tempChallenge.id);

					challengesBreakdownTableBody.insertAdjacentHTML('beforeend', '<tr data-challenge-id="' + tempChallenge.id + '"><td data-module-id="' + tempModule.id + '">' + tempModule.name + '</td><td data-cluster-id="' + tempCluster.id + '">' + tempCluster.name + '</td><td>' + tempChallenge.points + '</td></tr>');
				}
			}
		}
	}

	scoreSummaryTableFoot.insertAdjacentHTML('afterend', '<th>' + ((challengeCount / (challengeCount + (totalAttempts - totalCorrect))) * 100).toFixed(2) + '%' + '</th>');
});