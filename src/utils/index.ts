// Utility functions for the CLI application

import { accessSync, constants, existsSync, statSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Check if a file exists and is readable
 */
export function fileExists(filePath: string): boolean {
  try {
    return existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export function isDirectory(path: string): boolean {
  try {
    return existsSync(path) && statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a path is writable directory
 */
export function isWritableDirectory(path: string): boolean {
  try {
    if (isDirectory(path) && accessSync(path, constants.W_OK)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Resolve a file path to absolute path
 */
export function resolvePath(filePath: string): string {
  return resolve(filePath);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from path
 */
export function getFileExtension(filePath: string): string {
  return filePath.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate output format
 */
export function isValidFormat(format: string): boolean {
  const validFormats = ['json', 'xml', 'yaml', 'csv', 'txt'];
  return validFormats.includes(format.toLowerCase());
}

/**
 * Recursively find all files with specific extension in a directory
 */
export function findFilesByExtension(directory: string, extension: string): string[] {
  const files: string[] = [];

  function searchDirectory(dir: string): void {
    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
          // Recursively search subdirectories
          searchDirectory(fullPath);
        } else if (stats.isFile()) {
          // Check if file has the desired extension
          if (getFileExtension(fullPath) === extension.toLowerCase().replace('.', '')) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${error}`);
    }
  }

  searchDirectory(directory);
  return files;
}

/**
 * Find all .bru files in a directory and its subdirectories
 */
export function findBruFiles(directory: string): string[] {
  return findFilesByExtension(directory, 'bru');
}
