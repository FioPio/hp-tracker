import { Plugin } from 'obsidian';

interface HPTrackerData {
	maxHP: number;
	currentHP: number;
	tempHP: number;
}

export default class HPTrackerPlugin extends Plugin {
	// Store HP data in memory
	private hpData: HPTrackerData = {
		maxHP: 0,
		currentHP: 0,
		tempHP: 0
	};

	async onload() {
		this.registerMarkdownCodeBlockProcessor("hp-tracker", (source, el, ctx) => {
			// Parse and store the values in memory
			this.hpData = this.parseSource(source);
			this.renderHPTracker(el);
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
		return values;
	}

	createAdjustmentButtons(container: HTMLElement, amount: number, type: 'currentHP' | 'tempHP') {
		const button = container.createEl('button', { text: amount > 0 ? '+' : '-' });
		button.classList.add('hp-tracker-button'); // Add the new class
		button.onclick = () => {

			if (amount < 0) { // Only handle decreases
				if (this.hpData.tempHP > 0) {
					// If there are temporary HP, decrease them first
					this.hpData.tempHP += amount; // Decrease temporary HP
					if (this.hpData.tempHP < 0) {
						// If temp HP goes below zero, adjust current HP
						this.hpData.currentHP += this.hpData.tempHP; // tempHP is negative here, effectively reducing currentHP
						this.hpData.tempHP = 0; // Reset temp HP to zero
					}
				} else {
					// No temporary HP, decrease current HP
					this.hpData.currentHP += amount; // Decrease current HP
					// Clamp currentHP between 0 and maxHP
					this.hpData.currentHP = Math.max(0, Math.min(this.hpData.currentHP, this.hpData.maxHP));
				}
			} else {
				// For positive adjustments
				if (type === 'tempHP') {
					this.hpData.tempHP += amount; // Increase temporary HP
				} else if (this.hpData.currentHP < this.hpData.maxHP) {
					this.hpData.currentHP += amount; // Increase current HP
					this.hpData.currentHP = Math.min(this.hpData.currentHP, this.hpData.maxHP); // Clamp to maxHP
				}
			}

			// Re-render the tracker (reset the container content)
			this.renderHPTracker(container.parentElement?.parentElement as HTMLElement);
		};
		container.appendChild(button);
	}


	renderHPTracker(container: HTMLElement) {
		// Clear the container completely before rendering the tracker again
		container.empty();

		// Create a new div to hold the tracker
		const hpDiv = container.createDiv({ cls: 'hp-tracker-container' });
		hpDiv.createEl('h2', { text: 'HP Tracker', cls: 'hp-tracker-header' });

		// Calculate percentage HP
		const currentHPEfficiency = ((this.hpData.currentHP / this.hpData.maxHP) * 100).toFixed(1);
		const tempHPEfficiency = ((this.hpData.tempHP / this.hpData.maxHP) * 100).toFixed(1);
		const totalHPEfficiency = Math.min(100, ((this.hpData.currentHP + this.hpData.tempHP) / this.hpData.maxHP) * 100).toFixed(1);

		const percentageDiv = hpDiv.createDiv({ cls: 'hp-percentage' });
		percentageDiv.createEl('span', { text: `Current HP: ${currentHPEfficiency}%` });
		percentageDiv.createEl('span', { text: ` | Temporary HP: ${tempHPEfficiency}%`, cls: `hp-temp-text` });

		// Add a visual HP bar
		const progressBar = hpDiv.createDiv({ cls: 'hp-progress-bar' });

		// Create a combined progress div for Current HP
		const currentProgress = progressBar.createDiv({ cls: `hp-progress current ${this.getHPBarClass(Number(currentHPEfficiency))}` });
		currentProgress.style.width = `${currentHPEfficiency}%`; // Set width inline since it's dynamic

		// Create a div for Temporary HP that sits next to Current HP
		const tempProgress = progressBar.createDiv({ cls: `hp-progress temp` });
		tempProgress.style.width = `${tempHPEfficiency}%`; // Set width inline since it's dynamic

		// Create a div for Current HP adjustments
		const currentHPDiv = hpDiv.createDiv({ cls: 'hp-tracker-line' });
		currentHPDiv.createEl('span', { text: 'Current HP:' });

		// Create buttons for Current HP adjustments
		this.createAdjustmentButtons(currentHPDiv, -1, 'currentHP'); // Decrease current HP
		currentHPDiv.createEl('span', { text: ` ${this.hpData.currentHP} / ${this.hpData.maxHP}` });
		this.createAdjustmentButtons(currentHPDiv, 1, 'currentHP'); // Increase current HP

		// Create a div for Temporary HP adjustments
		const tempHPDiv = hpDiv.createDiv({ cls: 'hp-tracker-line' });
		tempHPDiv.createEl('span', { text: 'Temporary HP:' });
		tempHPDiv.createEl('span', { text: ` ${this.hpData.tempHP}` }); // Display temporary HP value

		// Move the button for Temporary HP adjustments to the right
		this.createAdjustmentButtons(tempHPDiv, 1, 'tempHP'); // Increase temp HP

		// Append the HP tracker div to the container
		container.appendChild(hpDiv);
	}

	// Define a method to get the CSS class based on the percentage of HP
	getHPBarClass(percentage: number): string {
		if (percentage > 90) {
			return 'hp-full-hp';
		} else if (percentage > 80) {
			return 'hp-very-healthy';
		} else if (percentage > 70) {
			return 'hp-healthy';
		} else if (percentage > 60) {
			return 'hp-moderate';
		} else if (percentage > 50) {
			return 'hp-medium-low';
		} else if (percentage > 40) {
			return 'hp-medium-low';
		} else if (percentage > 30) {
			return 'hp-low';
		} else if (percentage > 20) {
			return 'hp-very-low ';
		} else {
			return 'hp-critical';
		}
	}
}
