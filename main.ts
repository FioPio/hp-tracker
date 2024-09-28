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

			// Adjust the values directly in the memory (this.hpData)
			if (type === 'currentHP') {
				this.hpData.currentHP += amount;
				// Clamp currentHP between 0 and maxHP
				this.hpData.currentHP = Math.max(0, Math.min(this.hpData.currentHP, this.hpData.maxHP));
			} else if (type === 'tempHP') {
				this.hpData.tempHP = Math.max(0, this.hpData.tempHP + amount);
			}

			console.log('After adjustment:', this.hpData); // Debugging line

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
		hpDiv.createEl('h2', { text: 'HP Tracker', attr: { style: 'color: #ff4500;' } }); // Change the font color

		// Calculate percentage HP
		const currentHPEfficiency = ((this.hpData.currentHP / this.hpData.maxHP) * 100).toFixed(1);
		const percentageDiv = hpDiv.createDiv({ cls: 'hp-percentage' });
		percentageDiv.createEl('span', { text: `HP: ${currentHPEfficiency}%` });

		// Add a visual HP bar
		const progressBar = hpDiv.createDiv({ cls: 'hp-progress-bar' });
		const progress = progressBar.createDiv({ cls: 'hp-progress' });
		progress.style.width = `${currentHPEfficiency}%`;

		// Create a div for Current HP
		const currentHPDiv = hpDiv.createDiv({ cls: 'hp-tracker-line' });
		currentHPDiv.createEl('span', { text: 'Current HP:' });

		// Create buttons for Current HP adjustments
		this.createAdjustmentButtons(currentHPDiv, -1, 'currentHP'); // Decrease current HP
		currentHPDiv.createEl('span', { text: ` ${this.hpData.currentHP} / ${this.hpData.maxHP}` });
		this.createAdjustmentButtons(currentHPDiv, 1, 'currentHP'); // Increase current HP

		// Create a div for Temporary HP
		const tempHPDiv = hpDiv.createDiv({ cls: 'hp-tracker-line' });
		tempHPDiv.createEl('span', { text: 'Temporary HP:' });

		// Create buttons for Temporary HP adjustments
		this.createAdjustmentButtons(tempHPDiv, -1, 'tempHP'); // Decrease temp HP
		tempHPDiv.createEl('span', { text: ` ${this.hpData.tempHP}` }); // Display temporary HP value
		this.createAdjustmentButtons(tempHPDiv, 1, 'tempHP'); // Increase temp HP

		// Append the HP tracker div to the container
		container.appendChild(hpDiv);
	}
}
