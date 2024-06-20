# Changelog

## [Unreleased]
- Placeholder for changes in the next release.

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
