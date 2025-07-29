import { BuildOptions } from '../types/index.js';
import { fileExists, isDirectory, isValidFormat, isWritableDirectory } from '../utils/index.js';
import { parseBruCollection } from '../utils/parser.js';
import { BruCollection } from '../types/index.js';
import { TemplateEngine } from '../utils/template-engine.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function buildCommand(options: BuildOptions): void {
  // Validate input dir exists
  if (!fileExists(options.input)) {
    console.error(`Error: Input directory '${options.input}' does not exist.`);
    process.exit(1);
  }
  if (!isDirectory(options.input)) {
    console.error(`Error: Input directory '${options.input}' is not a directory.`);
    process.exit(1);
  }

  if (options.verbose) {
    console.log(`Parsing Bruno collection in: ${options.input}`);
  }

  // Parse the entire collection structure
  const bruCollection = parseBruCollection(options.input, options.exclude || []);
  if (!bruCollection) {
    console.error(`Error: No valid .bru files found in '${options.input}'.`);
    process.exit(1);
  }

  // Count total files recursively
  const totalFiles = countFilesRecursively(bruCollection);

  if (totalFiles === 0) {
    console.log(`No .bru files found in ${options.input}`);
    return;
  }

  if (options.verbose) {
    console.log(`Collection: ${bruCollection.name}`);
    console.log(`Found ${totalFiles} .bru file${totalFiles === 1 ? '' : 's'} across ${countFoldersRecursively(bruCollection)} folder${countFoldersRecursively(bruCollection) === 1 ? '' : 's'}`);
    printCollectionStructure(bruCollection, 0, options.verbose);
  } else {
    console.log(`Found ${totalFiles} .bru file${totalFiles === 1 ? '' : 's'} to process in collection "${bruCollection.name}"`);
  }

  // Process the parsed collection according to the specified format
  console.log(`Processing collection to ${options.format} format...`);

  try {
    generateDocumentation(bruCollection, options);

    console.log(`Documentation saved to: ${options.output}`);
    console.log(`Successfully generated ${options.format} documentation with ${totalFiles} requests`);
  } catch (error) {
    console.error(`Error generating documentation: ${error}`);
    process.exit(1);
  }
}

function generateDocumentation(collection: BruCollection, options: BuildOptions): void {
  const templateEngine = new TemplateEngine();

  const [format, template] = options.format.split(':');

  // TODO - allow custom template directory
  // Load partials
  const templateDir = resolve(__dirname, '../../templates', format || 'html');
  const partialsDir = join(templateDir, 'partials');

  if (!fileExists(templateDir) || !isDirectory(templateDir)) {
    console.error(`Template directory '${templateDir}' does not exist or is not a directory.`);
    process.exit(1);
  }

  if (!fileExists(partialsDir) || !isDirectory(partialsDir)) {
    console.error(`Partials directory '${partialsDir}' does not exist or is not a directory.`);
    process.exit(1);
  }

  // Load all partials in partialsDir

  try {
    const partialFiles = readdirSync(partialsDir).filter(file => file.endsWith('.hbs'));
    partialFiles.forEach(file => {
      const partialName = file.replace('.hbs', '');
      const partialPath = join(partialsDir, file);
      if (statSync(partialPath).isFile()) {
        templateEngine.loadPartial(partialName, partialPath);
      }
    });
  } catch (error) {
    console.warn('Could not load partials, continuing without them...');
  }

  // Process collection data
  const templateData = templateEngine.processCollection(collection);

  // Load and render main template
  const templatePath = join(templateDir, template ? `${template}.hbs` : 'index.hbs');

  if (!fileExists(templatePath)) {
    console.error(`Template '${options.format}' does not exist.`);
    process.exit(1);
  }
  const output = templateEngine.render(templatePath, templateData);

  // Write output file
  let outputFile = options.output;
  if (isDirectory(outputFile)) {
    outputFile = join(outputFile, 'index.' + format);
  }

  writeFileSync(outputFile, output, 'utf-8');

  if (options.verbose) {
    console.log(`Generated HTML documentation: ${outputFile}`);
  }
}

// Helper function to count files recursively in a collection
function countFilesRecursively(collection: BruCollection): number {
  let count = 0;
  for (const folder of collection.folders) {
    count += countFilesInFolder(folder);
  }
  return count;
}

// Helper function to count files in a folder
function countFilesInFolder(folder: any): number {
  let count = folder.files?.length || 0;
  for (const subFolder of folder.folders || []) {
    count += countFilesInFolder(subFolder);
  }
  return count;
}

// Helper function to count folders recursively in a collection
function countFoldersRecursively(collection: BruCollection): number {
  let count = collection.folders.length;
  for (const folder of collection.folders) {
    count += countFoldersInFolder(folder);
  }
  return count;
}

// Helper function to count folders in a folder
function countFoldersInFolder(folder: any): number {
  let count = folder.folders?.length || 0;
  for (const subFolder of folder.folders || []) {
    count += countFoldersInFolder(subFolder);
  }
  return count;
}

// Helper function to print collection structure
function printCollectionStructure(collection: BruCollection, depth: number, verbose: boolean): void {
  const indent = '  '.repeat(depth);

  console.log(`${indent}📁 ${collection.name} (Collection)`);
  if (collection.auth && collection.auth !== 'none') {
    console.log(`${indent}  🔒 Auth: ${collection.auth}`);
  }

  // Print folders in the collection
  collection.folders.forEach((folder: any) => {
    printFolderStructure(folder, depth + 1, verbose);
  });
}

// Helper function to print folder structure
function printFolderStructure(folder: any, depth: number, verbose: boolean): void {
  const indent = '  '.repeat(depth);

  if ((folder.files?.length || 0) === 0 && (folder.folders?.length || 0) === 0) {
    return; // Skip empty folders
  }

  if (depth > 0) {
    console.log(`${indent}+ ${folder.name} (${folder.files?.length || 0} files)`);
  }

  // Print files in this folder
  (folder.files || []).forEach((file: any, index: number) => {
    console.log(`${indent}  - ${file.meta.name}`);
  });

  // Print subfolders recursively
  (folder.folders || []).forEach((subFolder: any) => {
    printFolderStructure(subFolder, depth + 1, verbose);
  });
}
