# Github Code Review + Semantic Conflicts

This chrome extension introduces information about semantic conflicts reported by code analysis tools to the Github pull request page.

_\*The analysis information is located on a separated database. This extension only modifies the UI to display the conflicts._

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Related repositories](#related-repositories)

## Installation

```bash
# Clone the repository
git clone https://github.com/Vinicius-resende-cin/react-chrome-ext.git

# Navigate to the project directory
cd react-chrome-ext

# Install dependencies
npm install
```

## Usage

1. First, build the extension with the command:

```bash
npm start
```

2. After that, follow the instructions on [this link](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) and select the `dist` folder to load the extension on your chrome compatible browser.

3. Now you can access a pull request page and the new tab will be available.

## Related repositories

- Github app (executes code analysis on pull requests): [basic-app](https://github.com/Vinicius-resende-cin/basic-app)
- Database server: [github-plugin-server](https://github.com/Vinicius-resende-cin/github-plugin-server)
