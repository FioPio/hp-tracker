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
			this.renderHPTracker(el, this.hpData);
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
			this.updateHPDisplay(container, this.hpData);
		};
		container.appendChild(button);
	}

	renderHPTracker(container: HTMLElement, hpData: HPTrackerData) {
		// Clear the container completely
		container.empty();

		// Create a new div to hold the tracker
		const hpDiv = container.createDiv({ cls: 'hp-tracker-container' });
		hpDiv.createEl('h2', { text: 'HP Tracker', attr: { style: 'color: #ff4500;' } }); // Change the font color

		// Create a div for Current HP
		const currentHPDiv = hpDiv.createDiv({ cls: 'hp-tracker-line' });
		currentHPDiv.createEl('span', { text: 'Current HP:' });

		// Create buttons for Current HP adjustments
		this.createAdjustmentButtons(currentHPDiv, -1, 'currentHP'); // Decrease current HP
		const currentHPValue = currentHPDiv.createEl('span', { text: ` ${hpData.currentHP} / ${hpData.maxHP}` });
		const currentHPEfficiency = ((hpData.currentHP / hpData.maxHP) * 100).toFixed(1);
		currentHPDiv.createEl('span', { text: ` (${currentHPEfficiency}%)` });
		this.createAdjustmentButtons(currentHPDiv, 1, 'currentHP'); // Increase current HP

		// Create a div for Temporary HP
		const tempHPDiv = hpDiv.createDiv({ cls: 'hp-tracker-line' });
		tempHPDiv.createEl('span', { text: 'Temporary HP:' });

		// Create buttons for Temporary HP adjustments
		this.createAdjustmentButtons(tempHPDiv, -1, 'tempHP'); // Decrease temp HP
		tempHPDiv.createEl('span', { text: ` ${hpData.tempHP}` }); // Display temporary HP value
		this.createAdjustmentButtons(tempHPDiv, 1, 'tempHP'); // Increase temp HP

		// Append the HP tracker div to the container
		container.appendChild(hpDiv);
	}

	updateHPDisplay(container: HTMLElement, hpData: HPTrackerData) {
		// Update the displayed values without duplicating the layout
		const currentHPValue = container.querySelector('.hp-tracker-line:nth-of-type(1) span:nth-of-type(2)') as HTMLElement;
		const currentHPEfficiency = ((hpData.currentHP / hpData.maxHP) * 100).toFixed(1);
		if (currentHPValue) {
			currentHPValue.textContent = `${hpData.currentHP} / ${hpData.maxHP}`;
			const efficiencySpan = currentHPValue.nextElementSibling as HTMLElement;
			if (efficiencySpan) {
				efficiencySpan.textContent = ` (${currentHPEfficiency}%)`;
			}
		}

		const tempHPValue = container.querySelector('.hp-tracker-line:last-of-type span:last-of-type') as HTMLElement;
		if (tempHPValue) {
			tempHPValue.textContent = `${hpData.tempHP}`;
		}
	}
}
