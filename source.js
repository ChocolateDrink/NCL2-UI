if (!window.ncl2core) window.ncl2core = {};

const core = {
	version: '1.0',

	toCamelCase: (text) => {
		return text
			.toLowerCase()
			.split(' ')
			.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
			.join('');
	},

	ui: {
		_state: {
			thisLogId: null,
			dragging: false,
			dragOffset: { x: 0, y: 0 },
			container: null,
			logTextareas: {}
		},

		makeElement: (type, thing, text = '') => {
			const element = document.createElement(type);
			if (thing) element.className = thing;
			if (text) element.textContent = text;
			return element;
		}
	},

	modules: {
		add: (options) => {
			const { id, tip } = options;

			const moduleContainer = core.ui.makeElement('div', 'module-container');
			const moduleContent = core.ui.makeElement('div', 'module-content');
			const textContainer = core.ui.makeElement('div', 'module-text-container');
			const moduleName = core.ui.makeElement('div', 'module-name', id);
			const moduleDesc = core.ui.makeElement('div', 'module-description', tip);
			const bindButton = core.ui.makeElement('button', 'module-bind', 'none');

			let enabled = false;
			let thisBind = null;
			let binding = false;
			let onEnabled = () => {};
			let onDisabled = () => {};

			const toggleModule = () => {
				enabled = !enabled;
				moduleContent.classList.toggle('enabled', enabled);

				if (enabled) {
					onEnabled();
				} else {
					onDisabled();
				}
			}

			moduleContent.addEventListener('click', toggleModule);

			const removeBind = () => {
				if (!thisBind) return;

				document.removeEventListener('keydown', bindHandler);
				thisBind = null;
				bindButton.textContent = 'none';
			}

			const setBind = (newBind) => {
				removeBind();
				if (!newBind) return;

				thisBind = newBind.toUpperCase();
				bindButton.textContent = thisBind;
				document.addEventListener('keydown', bindHandler);
			}

			const bindHandler = (e) => {
				if (!binding && thisBind && e.key.toUpperCase() === thisBind) {
					e.preventDefault();
					toggleModule();
				}
			}

			bindButton.addEventListener('click', (e) => {
				e.stopPropagation();
				if (binding) return;

				binding = true;
				bindButton.textContent = '...';
				bindButton.classList.add('binding');

				const bindKeyHandler = (e) => {
					e.preventDefault();
					const newBind = e.key.toUpperCase();

					if (newBind === thisBind) {
						removeBind();
					} else {
						setBind(newBind);
					}

					bindButton.classList.remove('binding');
					binding = false;
					document.removeEventListener('keydown', bindKeyHandler);
				}

				document.addEventListener('keydown', bindKeyHandler);
			});

			textContainer.appendChild(moduleName);
			textContainer.appendChild(moduleDesc);
			moduleContent.appendChild(textContainer);
			moduleContent.appendChild(bindButton);
			moduleContainer.appendChild(moduleContent);

			const mainPanel = document.querySelector('#main');
			mainPanel.appendChild(moduleContainer);

			const moduleObj = {
				element: moduleContainer,
				getState: () => enabled,
				getBind: () => thisBind,
				setBind,
				toggle: toggleModule,
				removeBind,
				set onEnabled(callback) {
					onEnabled = callback;
				},
				set onDisabled(callback) {
					onDisabled = callback;
				}
			};

			core.modules[core.toCamelCase(id)] = moduleObj;
			return moduleObj;
		}
	},

	settings: {
		addBind: (options) => {
			const { id, tip, bind } = options;

			const settingsContainer = core.ui.makeElement('div', 'module-container');
			const settingsContent = core.ui.makeElement('div', 'module-content');
			const textContainer = core.ui.makeElement('div', 'module-text-container');
			const settingsName = core.ui.makeElement('div', 'module-name', id);
			const settingsDesc = core.ui.makeElement('div', 'module-description', tip);
			const bindButton = core.ui.makeElement('button', 'module-bind', bind ? bind.toUpperCase() : 'none');

			let thisBind = bind ? bind.toUpperCase() : null;
			let binding = false;
			let onBind = () => {};

			const removeBind = () => {
				if (!thisBind) return;

				document.removeEventListener('keydown', bindHandler);
				thisBind = null;
				bindButton.textContent = 'none';
				onBind(null);
			}

			const setBind = (newBind) => {
				removeBind();
				if (!newBind) return;

				thisBind = newBind.toUpperCase();
				bindButton.textContent = thisBind;
				document.addEventListener('keydown', bindHandler);
				onBind(thisBind);
			}

			const bindHandler = (e) => {
				if (!binding && thisBind && e.key.toUpperCase() === thisBind) {
					e.preventDefault();
					onBind(thisBind);
				}
			}

			if (thisBind) {
				document.addEventListener('keydown', bindHandler);
			}

			bindButton.addEventListener('click', (e) => {
				e.stopPropagation();
				if (binding) return;

				binding = true;
				bindButton.textContent = '...';
				bindButton.classList.add('binding');

				const bindKeyHandler = (e) => {
					e.preventDefault();
					const newBind = e.key.toUpperCase();

					if (newBind === thisBind) {
						removeBind();
					} else {
						setBind(newBind);
					}

					bindButton.classList.remove('binding');
					binding = false;
					document.removeEventListener('keydown', bindKeyHandler);
				}

				document.addEventListener('keydown', bindKeyHandler);
			});

			textContainer.appendChild(settingsName);
			textContainer.appendChild(settingsDesc);
			settingsContent.appendChild(textContainer);
			settingsContent.appendChild(bindButton);
			settingsContainer.appendChild(settingsContent);

			const settingsPanel = document.querySelector('#settings');
			settingsPanel.appendChild(settingsContainer);

			const settingsObj = {
				element: settingsContainer,
				getBind: () => thisBind,
				setBind,
				removeBind,
				set onBind(callback) {
					onBind = callback;
					if (thisBind) onBind(thisBind);
				}
			};

			core.settings[core.toCamelCase(id)] = settingsObj;
			return settingsObj;
		},
		addToggle: (options) => {
			const { id, tip } = options;

			const settingsContainer = core.ui.makeElement('div', 'module-container');
			const settingsContent = core.ui.makeElement('div', 'module-content');
			const textContainer = core.ui.makeElement('div', 'module-text-container');
			const settingsName = core.ui.makeElement('div', 'module-name', id);
			const settingsDesc = core.ui.makeElement('div', 'module-description', tip);

			let enabled = false;
			let onEnabled = () => {};
			let onDisabled = () => {};

			const toggleSetting = () => {
				enabled = !enabled;
				settingsContent.classList.toggle('enabled', enabled);

				if (enabled) {
					onEnabled();
				} else {
					onDisabled();
				}
			};

			settingsContent.addEventListener('click', toggleSetting);

			textContainer.appendChild(settingsName);
			textContainer.appendChild(settingsDesc);
			settingsContent.appendChild(textContainer);
			settingsContainer.appendChild(settingsContent);

			const settingsPanel = document.querySelector('#settings');
			settingsPanel.appendChild(settingsContainer);

			const settingsObj = {
				element: settingsContainer,
				getState: () => enabled,
				toggle: toggleSetting,
				/**
				 * @param {() => void} callback
				 */
				set onEnabled(callback) {
					onEnabled = callback;
				},
				/**
				 * @param {() => void} callback
				 */
				set onDisabled(callback) {
					onDisabled = callback;
				}
			};

			core.settings[core.toCamelCase(id)] = settingsObj;
			return settingsObj;
		}
	},

	saves: {
		save: () => {
			const moduleData = {};
			const settingsData = {};

			Object.entries(core.modules).forEach(([id, module]) => {
				if (typeof module !== 'object') return;

				moduleData[id] = {
					enabled: module.getState(),
					bind: module.getBind()
				};
			});

			Object.entries(core.settings).forEach(([id, module]) => {
				if (typeof module !== 'object') return;

				settingsData[id] = {
					enabled: module.getState ? module.getState() : null,
					bind: module.getBind ? module.getBind() : null
				};
			});

			const uiPos = core.ui._state.container;
			const pos = {left: uiPos.style.left, top: uiPos.style.top};

			localStorage.setItem('ncl2', JSON.stringify({ moduleData, settingsData, pos }));
		},
		load: () => {
			try {
				const saved = localStorage.getItem('ncl2');
				if (!saved) return;

				const data = JSON.parse(saved);

				if (data.moduleData) {
					Object.entries(data.moduleData).forEach(([id, module]) => {
						const mod = core.modules[id];
						if (!mod) return;

						if (module.bind) {
							mod.setBind(module.bind);
						}

						if (module.enabled && mod.getState() !== module.enabled) {
							mod.toggle();
						}
					});
				}

				if (data.settingsData) {
					Object.entries(data.settingsData).forEach(([id, module]) => {
						const mod = core.settings[id];
						if (!mod) return;

						if (mod.getBind && module.bind) {
							mod.setBind(module.bind);
						}

						if (mod.getState && module.enabled !== null && mod.getState() !== module.enabled) {
							mod.toggle();
						}
					});
				}

				if (data.pos) {
					core.ui._state.container.style.left = data.pos.left;
					core.ui._state.container.style.top = data.pos.top;
				}

				core.ui.output.add('✔️ Successfully loaded config');
			} catch(ex) {
				localStorage.removeItem('ncl2');
				core.ui.output.add('❌ Failed to load config: ');
				core.ui.output.add(ex);
			}
		},
		init: () => {
			setInterval(core.saves.save, 5000);

			window.addEventListener('beforeunload', core.saves.save);
			core.saves.load();
		}
	}
};

// gui
(() => {
	core.ui.output = {
		add: (text) => {
			if (!core.ui._state.logTextareas.output) return;
			core.ui._state.logTextareas.output.value += (core.ui._state.logTextareas.output.value ? '\n' : '') + text;
			core.ui._state.logTextareas.output.scrollTop = core.ui._state.logTextareas.output.scrollHeight;
		},
		clear: () => {
			if (!core.ui._state.logTextareas.output) return;
			core.ui._state.logTextareas.output.value = '';
		},
		copy: () => {
			if (!core.ui._state.logTextareas.output) return;
			core.ui._state.logTextareas.output.select();
			document.execCommand('copy');
			window.getSelection().removeAllRanges();
		}
	};
	core.ui.debug = {
		add: (text) => {
			if (!core.ui._state.logTextareas.debug) return;
			core.ui._state.logTextareas.debug.value += (core.ui._state.logTextareas.debug.value ? '\n' : '') + text;
			core.ui._state.logTextareas.debug.scrollTop = core.ui._state.logTextareas.debug.scrollHeight;
		},
		clear: () => {
			if (!core.ui._state.logTextareas.debug) return;
			core.ui._state.logTextareas.debug.value = '';
		},
		copy: () => {
			if (!core.ui._state.logTextareas.debug) return;
			core.ui._state.logTextareas.debug.select();
			document.execCommand('copy');
			window.getSelection().removeAllRanges();
		}
	};

	const style = document.createElement('style');
	style.textContent = `
		.container {
			position: fixed;
			background-color: #1a1a1a;
			border-radius: 8px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			z-index: 9999;
		}

		.header {
			display: flex;
			border-bottom: 2px solid #2c2c2c;
			background-color: #232323;
			border-radius: 8px 8px 0 0;
			padding: 3px 5px 0 5px;
			cursor: default;
		}

		.tab {
			padding: 4px 16px;
			cursor: pointer;
			background-color: #1a1a1a;
			color: #808080;
			border-radius: 5px 5px 0 0;
			margin: 0 2px;
			border: 1px solid #2c2c2c;
			border-bottom: none;
			font-size: 13px;
			line-height: 1.4;
			user-select: none;
			-webkit-user-select: none;
		}

		.tab.active {
			background-color: #2c2c2c;
			color: #ffffff;
		}

		.content {
			flex-grow: 1;
			background-color: #1a1a1a;
			padding: 8px;
			overflow: hidden;
		}

		.panel {
			display: none;
			height: 100%;
		}

		.panel.active {
			display: block;
		}

		.textarea {
			width: 100%;
			height: 100%;
			background-color: #232323;
			color: #cccccc;
			border: 1px solid #3c3c3c;
			border-radius: 4px;
			padding: 8px;
			resize: none;
			font-family: 'Consolas', monospace;
			font-size: 13px;
			line-height: 1.4;
			cursor: pointer;
			box-sizing: border-box;
		}

		.textarea:focus {
			outline: none;
		}

		.textarea::-webkit-scrollbar {
			width: 8px;
		}

		.bottom {
			padding: 6px 8px;
			border-top: 2px solid #2c2c2c;
			font-size: 11px;
			color: #808080;
			background-color: #232323;
			display: flex;
			justify-content: space-between;
			align-items: center;
			user-select: none;
			-webkit-user-select: none;
		}

		.button {
			background-color: #2c2c2c;
			color: #cccccc;
			border: 1px solid #3c3c3c;
			border-radius: 4px;
			padding: 4px 8px;
			cursor: pointer;
			font-size: 11px;
			margin-left: 5px;
			user-select: none;
			-webkit-user-select: none;
		}

		.button:hover {
			background-color: #3c3c3c;
			color: #ffffff;
		}

		.module-container {
			margin-bottom: 8px;
		}

		.module-content {
			background-color: #232323;
			padding: 12px;
			border-radius: 4px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border: 1px solid #3c3c3c;
			cursor: pointer;
			user-select: none;
			transition: background-color 0.2s ease;
		}

		.module-content:hover {
			background-color: #2a2a2a;
		}

		.module-text-container {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.module-name {
			color: #ffffff;
			font-size: 14px;
			font-weight: bold;
			transition: color 0.2s ease;
		}

		.module-description {
			color: #a0a0a0;
			font-size: 12px;
			font-weight: normal;
		}

		.module-content.enabled .module-name {
			color: #90EE90;
		}

		.module-bind {
			background-color: #2c2c2c;
			color: #cccccc;
			border: 1px solid #3c3c3c;
			border-radius: 4px;
			padding: 4px 8px;
			cursor: pointer;
			font-size: 12px;
			height: min-content;
			min-width: 40px;
			text-align: center;
			text-transform: uppercase;
			transition: background-color 0.2s ease;
		}

		.module-bind:hover {
			background-color: #3c3c3c;
		}

		.module-bind.binding {
			background-color: #3c3c3c;
			color: #90EE90;
		}

		#main {
			padding: 12px;
			overflow-y: auto;
		}

		#main::-webkit-scrollbar {
			width: 8px;
		}

		#main::-webkit-scrollbar-track {
			background: transparent;
		}

		#main::-webkit-scrollbar-thumb {
			background: #3c3c3c;
			border-radius: 4px;
		}

		#main::-webkit-scrollbar-thumb:hover {
			background: #4c4c4c;
		}

		.search-container {
			padding: 0 12px 12px 12px;
			display: none;
		}

		.search-input {
			width: 100%;
			color: #cccccc;
			border: 1px solid #3c3c3c;
			border-radius: 4px;
			padding: 6px 12px;
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			font-size: 12px;
			background-color: #232323;
			box-sizing: border-box;
			user-select: none;
		}

		.search-input:focus {
			outline: none;
			border-color: #4c4c4c;
		}

		#main .search-container {
			display: block;
		}
	`;
	document.head.appendChild(style);

	(() => {
		core.ui._state.container = core.ui.makeElement('div', 'container');
		core.ui._state.container.style.width = '600px';
		core.ui._state.container.style.height = '400px';
		core.ui._state.container.style.left = '100px';
		core.ui._state.container.style.top = '100px';

		const header = core.ui.makeElement('div', 'header');
		const tabs = ['main', 'output', 'debug', 'settings'];
		tabs.forEach((tab, index) => {
			const tabElement = core.ui.makeElement('div', `tab${index === 0 ? ' active' : ''}`, tab.charAt(0).toUpperCase() + tab.slice(1));
			tabElement.setAttribute('data-tab', tab);
			header.appendChild(tabElement);
		});

		const content = core.ui.makeElement('div', 'content');
		tabs.forEach((tab, index) => {
			const panel = core.ui.makeElement('div', `panel${index === 0 ? ' active' : ''}`);
			panel.id = tab;

			if (tab === 'output' || tab === 'debug') {
				const textarea = core.ui.makeElement('textarea', 'textarea');
				textarea.id = `${tab}-log`;
				textarea.readOnly = true;
				core.ui._state.logTextareas[tab] = textarea;
				panel.appendChild(textarea);
			}

			content.appendChild(panel);
		});

		const bottomBar = core.ui.makeElement('div', 'bottom');
		const versionSpan = core.ui.makeElement('span', '', `version: ${core.version}`);
		const buttonContainer = core.ui.makeElement('div', 'buttons');
		buttonContainer.style.display = 'none';

		const clearButton = core.ui.makeElement('button', 'button', 'Clear');
		clearButton.setAttribute('data-action', 'clear');
		const copyButton = core.ui.makeElement('button', 'button', 'Copy All');
		copyButton.setAttribute('data-action', 'copy');

		buttonContainer.appendChild(clearButton);
		buttonContainer.appendChild(copyButton);
		bottomBar.appendChild(versionSpan);
		bottomBar.appendChild(buttonContainer);

		core.ui._state.container.appendChild(header);
		core.ui._state.container.appendChild(content);
		core.ui._state.container.appendChild(bottomBar);
		document.body.appendChild(core.ui._state.container);

		const searchContainer = core.ui.makeElement('div', 'search-container');
		const searchInput = core.ui.makeElement('input', 'search-input');
		searchInput.type = 'text';
		searchInput.placeholder = 'Search modules...';

		searchInput.addEventListener('input', (e) => {
			const searchTerm = e.target.value.toLowerCase();
			const moduleContainers = document.querySelectorAll('.module-container');

			moduleContainers.forEach(container => {
				const moduleName = container.querySelector('.module-name').textContent.toLowerCase();
				const moduleDesc = container.querySelector('.module-description').textContent.toLowerCase();
				const matches = moduleName.includes(searchTerm) || moduleDesc.includes(searchTerm);
				container.style.display = matches ? 'block' : 'none';
			});
		});

		searchContainer.appendChild(searchInput);

		const main = document.querySelector('#main');
		main.appendChild(searchContainer);
	})();

	const header = core.ui._state.container.querySelector('.header');
	header.addEventListener('mousedown', (e) => {
		if (e.target !== header) return;

		core.ui._state.dragging = true;
		const rect = core.ui._state.container.getBoundingClientRect();
		core.ui._state.dragOffset = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	});

	document.addEventListener('mousemove', (e) => {
		if (!core.ui._state.dragging) return;

		const x = e.clientX - core.ui._state.dragOffset.x;
		const y = e.clientY - core.ui._state.dragOffset.y;
		core.ui._state.container.style.left = `${x}px`;
		core.ui._state.container.style.top = `${y}px`;
	});

	document.addEventListener('mouseup', () => {
		core.ui._state.dragging = false;
	});

	core.ui._state.container.querySelectorAll('.tab').forEach(tab => {
		tab.addEventListener('click', () => {
			core.ui._state.container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
			core.ui._state.container.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

			tab.classList.add('active');
			const panelId = tab.getAttribute('data-tab');
			core.ui._state.container.querySelector(`#${panelId}`).classList.add('active');

			const buttons = core.ui._state.container.querySelector('.buttons');
			if (panelId === 'output' || panelId === 'debug') {
				buttons.style.display = 'block';
				core.ui._state.thisLogId = `${panelId}-log`;
			} else {
				buttons.style.display = 'none';
				core.ui._state.thisLogId = null;
			}
		});
	});

	core.ui._state.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
		if (!core.ui._state.thisLogId) return;
		core.ui._state.logTextareas[core.ui._state.thisLogId.replace('-log', '')].value = '';
	});

	core.ui._state.container.querySelector('[data-action="copy"]').addEventListener('click', () => {
		if (!core.ui._state.thisLogId) return;

		const textarea = core.ui._state.logTextareas[core.ui._state.thisLogId.replace('-log', '')];
		textarea.select();

		document.execCommand('copy');
		window.getSelection().removeAllRanges();
	});

	window.ncl2core = core;
})();

// settings
(() => {
	const guiToggle = core.settings.addBind({
		id: 'UI Toggle Key',
		tip: 'The key to toggle the visibility of the UI',
		bind: 'insert'
	});

	guiToggle.onBind = () => {
		const container = core.ui._state.container;
		container.style.display = container.style.display === 'none' ? 'flex' : 'none';
	};
})();

// modules
(() => {
	const module1 = core.modules.add({
		id: 'Example Module 1',
		tip: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
	});

	module1.onEnabled = () => core.ui.output.add('✔️ Module 1 Enabled');
	module1.onDisabled = () => core.ui.output.add('❌ Module 1 Disabled');
})();