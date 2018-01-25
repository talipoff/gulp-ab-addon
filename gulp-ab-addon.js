'use strict';
const del = require('del');

function makeTasks(project, gulp) {
	function make(key, source) {
		if (source === '') {
			source = project.source[key];
			if (source[0] !== '.') {
				source = project.sourceDir + source;
			}
		}
		const handler = project.handler[key] || project.handler.other;
		const destination = project.destination[key] || project.destination.other;
		console.log('Start:', source, destination);
		handler(source, destination).on('end', () => {
			console.log('End:', source);
		});
	}

	gulp.task('build', () => {
		for (const key in project.source) {
			if (!Object.prototype.hasOwnProperty.call(project.source, key)) {
				continue;
			}
			make(key);
		}
	});

	gulp.task('watch', () => {
		for (const key in project.source) {
			if (!Object.prototype.hasOwnProperty.call(project.source, key)) {
				continue;
			}
			let source = project.source[key];
			if (source[0] !== '.') {
				source = project.sourceDir + source;
			}
			gulp.watch(source, event => {
				const path = event.path;
				if (path.slice(-1) === '\\') { // Skip directories
					return;
				}
				console.log('File ' + path + ' was ' + event.type + ', running tasks...');
				if (event.type === 'changed' || event.type === 'added') {
					make(key, event.path);
				}
			});
		}
	});

	if (project.destDir !== '') {
		gulp.task('clean', () => {
			del(project.destDir);
		});
	}
	if (project.destDirP !== '') {
		gulp.task('cleanP', () => {
			del(project.destDirP);
		});
	}
}

function error(e) {
	console.error('Error in plugin "' + e.plugin + '"', e.message);
}

module.exports.makeTasks = makeTasks;
module.exports.error = error;
