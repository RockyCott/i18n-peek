# i18n Peek Extension (VsCode)

The **i18n Peek** extension is designed to streamline the process of handling internationalization (i18n) in projects. By default, the extension reads JSON i18n files located in `src/assets/i18n`. However, developers have the flexibility to change this directory or fetch i18n files from a remote endpoint.

## Features

- **Hover Translation**: When hovering over translation keys in HTML or TypeScript files, a tooltip displays the corresponding translation from the i18n JSON files.
- **Custom i18n Directory**: Allows setting a custom directory for i18n files.
- **Remote i18n Fetching**: Supports fetching i18n files from a remote endpoint and storing them locally.
- **Text Search in i18n Files**: Search for a text string in i18n files and get corresponding translation keys.
- **Context Menu Integration**: New commands accessible via right-click on folders or within files.
- **Set custom i18n directory from context menu**: Sets a custom i18n directory based on the context menu selection.
- **Create i18n files**: Fetches and creates i18n files from a remote endpoint specified in the configuration.
- **Select custom i18n directory from global custom directories**: Allows selection of a custom i18n directory from the global custom directories. The global custom directories are stored in the user settings.


## Example JSON Structure (en.json)
It is recommended to structure your JSON files hierarchically for better organization:

```json
{
  "MODULES": {
    "LIQUIDADOR": {
      "TITLE_PRINCIPAL_SECTION": "Settlement list",
    }
  },
  "OTHER": {
    "EXAMPLE": {
      "KEY": "Value",
    }
  },
  "X": "..."
}

```

## Example Hover Translation

![i18n Peek Example](https://raw.githubusercontent.com/RockyCott/i18n-peek/master/assets/resultado.png)

## Usage

### Default Behavior

By default, the extension looks for i18n files in the `src/assets/i18n` directory of your project.

### Setting a Custom i18n Directory

1. Press `Ctrl+Shift+P` to open the Command Palette.
2. Type and select `i18n Peek: Set custom i18n directory`.
3. Choose between **Local** and **Remote**:

#### Local Directory

- After selecting **Local**, browse and select the directory containing your i18n JSON files.

#### Remote Endpoint

1. After selecting **Remote**, you will be prompted to enter the endpoint URL.
2. The extension will create a `.i18nPeek` directory in your workspace with two items:
   - `i18n-config.jsonc`: Configuration file for the remote i18n fetch settings.
   - `i18n/`: Directory where the fetched i18n JSON files will be stored.

### Text Search in i18n Files

1. Press `Ctrl+Shift+P` to open the Command Palette.
2. Type and select `i18n Peek: Search text in i18n files`.
3. Enter the text string you want to search for and press `Enter`.
4. The extension will search for the text in your i18n files and display the corresponding translation keys in a JSON document.

#### Example Search Result

- Search Text: `accept`

**Result (if the text is found in the i18n files):**


```json
{
  "MODULES.MESSAGES.BUTTONS.ACCEPT": "Accept",
  "MODULES.MESSAGES.BUTTONS.ACCEPTED": "Accepted",
  "MODULES.MESSAGES.BUTTONS.ACCEPTING": "Accepting",
  "MODULES.MESSAGES.BUTTONS.ACCEPTS": "Accepts",
}
```

## Context Menu Integration

Right-click on a folder or inside a file to access new i18n commands.

![i18n Peek Context Menu Example](https://raw.githubusercontent.com/RockyCott/i18n-peek/master/assets/context-menu.png)



### Configuration File (`i18n-config.jsonc`)

The configuration file allows you to define the endpoint, headers, method, and other settings for fetching i18n files. Below is an example template:

```jsonc
{
  // URL for fetching i18n data
  "url": "https://example.com/api/i18n",

  // HTTP method for the request (GET or POST) (default: GET)
  "method": "GET",

  "params": {
    "module": "home"
    },

  // Individual settings for each language request (required)
  "settings": {
    // min 1 setting required
    "1": {
      // Query parameters to be sent with the request (optional)
      "params": {},

      // HTTP headers to be sent with the request (optional)
      "headers": {
        "Content-Type": "application/json",
        "Next-Accept-Language": "es"
      },

      // Language to fetch with file name (recommended)
      "lang": "es",

      // Request body (optional)
      "body": {}
    },
    "2": {
      // Query parameters to be sent with the request (optional)
      "params": {},

      // HTTP headers to be sent with the request (optional)
      "headers": {
        "Content-Type": "application/json",
        "Next-Accept-Language": "en"
      },

      // Language to fetch with file name (recommended)
      "lang": "en",

      // Request body (optional)
      "body": {}
    }
    // Add more settings as needed
  },
  
  // Path within the response JSON where i18n data is located. Leave empty if the data is at the root level. (optional)
  "responsePath": "module",
  
  // Ignore SSL certificate errors (useful for self-signed certificates) (optional)
  "ignoreCertificateErrors": true
}
```
## Reloading i18n Files

- i18n files are fetched automatically upon modifying the configuration file.
- On startup, the extension checks and fetches the i18n files if remote fetching is configured.
  
## Handling i18n Keys with Dots (v0.0.4 and later)

Initially, the extension considered dots in keys as indicating hierarchical structure in JSON files. Now, it supports both hierarchical and flat structures. If a key contains dots, the extension will check for an exact match before treating the dots as path separators.

### Example
Given the following JSON structure:
```json
{
  "MODULES.MESSAGES.BUTTONS.ACCEPT": "Accept"
}
```
but recommend avoiding this kind of structure to prevent ambiguity and use the following instead:
```json
{
  "MODULES": {
    "MESSAGES": {
      "BUTTONS": {
        "ACCEPT": "Accept"
      }
    }
  }
}
```

---

**Thank you for using i18n Peek!** ❤️  