# Changelog

## [Unreleased]
### Planned
- Add the possibility to use the i18n loader provided by each app so that the extension can fetch data directly from there.

### Added
- **Relative Paths for Custom Directories**: Updated the extension to save custom directory paths as relative paths from the project root. This change allows for easier sharing of settings across different team members without path conflicts.
- **Compatibility with Transloco**: Although the extension primarily reads the i18n paths directly and is agnostic to specific Angular pipes like `| translate` or `| transloco`, it has been confirmed to work with Transloco due to its underlying design.


## [0.0.6] - 2024-06-20
### Fixed
- Corrected the initialization process to properly set the custom configuration. Now, if no configuration is set, it checks for the existence of the remote configuration file and sets the customConfig accordingly. If no remote configuration file is found, it defaults to local.

## [0.0.5] - 2024-06-19
### Added
- New commands:
  - `setDirFromContext`: Sets a custom i18n directory based on the context menu selection.
  - `openRemoteFile`: Opens the remote i18n configuration file (i18n-config.jsonc) for editing.
  - `createI18nFiles`: Fetches and creates i18n files from a remote endpoint specified in the configuration.
  - `selectCustomDirFromGlobalCustomDirs`: Allows selection of a custom i18n directory from the global custom directories.
  - `removeCustomDirFromGlobalCustomDirs`: Removes a custom i18n directory from the global custom directories.
- Added context menu options:
  - Right-click on a folder or inside a file to access new i18n commands.

![i18n Peek Context Menu Example](https://raw.githubusercontent.com/RockyCott/i18n-peek/master/assets/context-menu.png)

## [0.0.1] - 2024-06-18
### Added
- Initial release of i18n Peek Extension.
- Hover translation for i18n keys in HTML and TypeScript files.
- Ability to set custom i18n directory.
- Support for fetching i18n files from a remote endpoint.
- Text search in i18n files.