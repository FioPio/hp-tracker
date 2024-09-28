# HP Tracker Plugin for Obsidian
## Overview

The HP Tracker Plugin for Obsidian allows users to efficiently track their character's hit points (HP) and temporary hit points (TP) in tabletop RPGs. With an intuitive interface, users can easily adjust their current and temporary HP using buttons, view their HP status visually, and maintain clarity in gameplay.
Features

    Current HP Tracking: Display and adjust current HP with visual progress bars.
    Temporary HP Management: Add or reduce temporary HP alongside current HP.
    Visual Progress Bars: Clearly see HP status with color-coded progress bars.
    User-Friendly Buttons: Easy-to-use buttons for increasing or decreasing HP.
    Responsive Design: Works seamlessly within Obsidian's markdown environment.

## Installation

    Download the plugin files (CSS, manifest, main.js).
    Place them in the .obsidian/plugins/hp-tracker directory of your Obsidian vault.
    Enable the plugin in the Obsidian settings under "Community Plugins."

## Usage

To use the HP Tracker, create a code block in your markdown notes with the following format:

~~~markdown
```hp-tracker
max-hp: <maxHP>
current-hp: <currentHP>
temporary-hp: <tempHP>
```
~~~

### Example

~~~markdown
```hp-tracker
max-hp: 100
current-hp: 75
temporary-hp: 25
```
~~~

After creating the code block, the HP Tracker will render with the specified values, showing the current HP, temporary HP, and their visual progress bars.
Adjusting HP

    Click the + button to increase current or temporary HP.
    Click the - button to decrease current or temporary HP.
    Temporary HP will be deducted first when reducing current HP.

## Visual Demonstration


![](res/hp-tracker-opt-2.gif)


## Disclaimer

Please note that the HP Tracker plugin does not save data between sessions. Any changes made will be lost when you leave the page. Additionally, only one HP Tracker instance is supported per page.

## Contribution

Feel free to contribute to the development of this plugin! Open an issue or submit a pull request on GitHub.
License

This project is licensed under the MIT License.
