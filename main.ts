import { Plugin } from 'obsidian';

interface HPTrackerData {
	maxHP: number;
	currentHP: number;
	tempHP: number;
}

export default class HPTrackerPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor("hp-tracker", (source, el, ctx) => {
			console.log("Markdown Post Processor Triggered"); // Log when the post processor runs
			const values = this.parseSource(source);
			this.renderHPTracker(el, values); // Pass values to render function
		});
	}

	parseSource(source: string): HPTrackerData {
		const values: HPTrackerData = {
			maxHP: 0,
			currentHP: 0,
			tempHP: 0
		};

		source.split("\n").forEach(line => {
			const [key, value] = line.split(":");
			if (key && value) {
				const trimmedKey = key.trim();
				if (trimmedKey === 'max-hp') values.maxHP = parseInt(value.trim());
				else if (trimmedKey === 'current-hp') values.currentHP = parseInt(value.trim());
				else if (trimmedKey === 'temporary-hp') values.tempHP = parseInt(value.trim());
			}
		});

		console.log(values);
		return values;
	}

	renderHPTracker(container: HTMLElement, hpData: HPTrackerData) {
		// Clear the container completely
		container.empty();

		// Create a new div to hold the tracker
		const hpDiv = container.createDiv({ cls: 'hp-tracker-container' });
		hpDiv.createEl('h2', { text: 'HP Tracker' });
		hpDiv.createEl('p', { text: `Max HP: ${hpData.maxHP}` });
		hpDiv.createEl('p', { text: `Current HP: ${hpData.currentHP}` });
		hpDiv.createEl('p', { text: `Temporary HP: ${hpData.tempHP}` });

		// Create buttons container for the adjustment buttons
		const buttonsContainer = hpDiv.createDiv({ cls: 'hp-buttons' });
		this.createAdjustmentButtons(buttonsContainer, hpData);

		// Replace the original block with the new content
		container.replaceWith(hpDiv); // Replace the original block
	}

	createAdjustmentButtons(container: HTMLElement, hpData: HPTrackerData) {
		const createButton = (text: string,
			amount: number,
			type: 'currentHP' | 'tempHP' = 'currentHP') => {
			const button = container.createEl('button', { text });
			button.onclick = () => {
				if (type === 'currentHP') {
					hpData.currentHP =
						Math.min(hpData.maxHP, hpData.currentHP + amount);
					if (hpData.currentHP < 0) {
						hpData.currentHP = 0;
					}
				} else if (type === 'tempHP') {
					hpData.tempHP = Math.max(0, hpData.tempHP + amount);
				}
				this.updateHPDisplay(hpData); // Update the display with new HP data
			};
		};

		// Create buttons for adjusting HP
		createButton('Heal 1 HP', 1, 'currentHP');
		createButton('Damage 1 HP', -1, 'currentHP');
		createButton('Add 1 Temp HP', 1, 'tempHP');
		createButton('Remove 1 Temp HP', -1, 'tempHP');
	}

	updateHPDisplay(hpData: HPTrackerData) {
		// Find the current tracker container
		const container = document.querySelector('.hp-tracker-container');
		if (container) {
			container.empty(); // Clear existing text
			container.createEl('h2', { text: 'HP Tracker' });
			container.createEl('p', { text: `Max HP: ${hpData.maxHP}` });
			container.createEl('p', { text: `Current HP: ${hpData.currentHP}` });
			container.createEl('p', { text: `Temporary HP: ${hpData.tempHP}` });

			// Recreate the button container
			const buttonsContainer = container.createDiv({ cls: 'hp-buttons' });
			this.createAdjustmentButtons(buttonsContainer, hpData);
		}
	}
}
