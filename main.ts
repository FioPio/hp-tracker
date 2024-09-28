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
			console.log("Markdown Post Processor Triggered");
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

		console.log('Parsed values:', values); // Debugging line
		return values;
	}

	createAdjustmentButtons(container: HTMLElement, amount: number, type: 'currentHP' | 'tempHP') {
		const button = container.createEl('button', { text: amount > 0 ? '+' : '-' });
		button.onclick = () => {
			console.log('Before adjustment:', this.hpData); // Debugging line

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

			console.log('After adjustment:', this.hpData); // Debugging line

			// Re-render the tracker (reset the container content)
			this.renderHPTracker(container.parentElement?.parentElement as HTMLElement);
		};

		// Style the button for better appearance
		button.style.margin = '0 5px';
		button.style.padding = '5px 10px';
		button.style.borderRadius = '5px';
		button.style.border = '1px solid #ccc';
		button.style.cursor = 'pointer';
		button.style.transition = 'background-color 0.3s ease';

		// Change button color on hover
		button.onmouseenter = () => {
			button.style.backgroundColor = '#e0e0e0';
		};
		button.onmouseleave = () => {
			button.style.backgroundColor = '';
		};

		container.appendChild(button);
	}


	renderHPTracker(container: HTMLElement) {
		// Clear the container completely before rendering the tracker again
		container.empty();

		// Create a new div to hold the tracker
		const hpDiv = container.createDiv({ cls: 'hp-tracker-container' });
		hpDiv.createEl('h2', { text: 'HP Tracker', attr: { style: 'color: #ff4500;' } });

		// Calculate percentage HP
		const currentHPEfficiency = ((this.hpData.currentHP / this.hpData.maxHP) * 100).toFixed(1);
		const tempHPEfficiency = ((this.hpData.tempHP / this.hpData.maxHP) * 100).toFixed(1);
		const totalHPEfficiency = Math.min(100, ((this.hpData.currentHP + this.hpData.tempHP) / this.hpData.maxHP) * 100).toFixed(1);

		const percentageDiv = hpDiv.createDiv({ cls: 'hp-percentage' });
		percentageDiv.createEl('span', { text: `Current HP: ${currentHPEfficiency}%` });
		percentageDiv.createEl('span', { text: ` | Temporary HP: ${tempHPEfficiency}%` });

		// Add a visual HP bar
		const progressBar = hpDiv.createDiv({ cls: 'hp-progress-bar' });

		// Create a combined progress div for Current HP
		const currentProgress = progressBar.createDiv({ cls: 'hp-progress current' });
		currentProgress.style.width = `${currentHPEfficiency}%`;
		currentProgress.style.backgroundColor = this.getHPBarColor(Number(currentHPEfficiency));

		// Create a div for Temporary HP that sits next to Current HP
		const tempProgress = progressBar.createDiv({ cls: 'hp-progress temp' });
		tempProgress.style.width = `${tempHPEfficiency}%`;
		tempProgress.style.backgroundColor = 'purple'; // Temporary HP bar color

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




	// Define a method to get the color based on the percentage of HP
	getHPBarColor(percentage: number): string {
		if (percentage > 75) {
			return '#4caf50'; // Green for high HP
		} else if (percentage > 50) {
			return '#ffc107'; // Yellow for medium-high HP
		} else if (percentage > 25) {
			return '#ff9800'; // Orange for medium-low HP
		} else {
			return '#f44336'; // Red for low HP
		}
	}
}
